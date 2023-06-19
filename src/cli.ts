#!/usr/bin/env node

import {Buffer} from 'node:buffer';
import {cp, mkdtemp, realpath, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {exit} from 'node:process';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

import {config} from 'dotenv';
import {execaNode} from 'execa';
import {z} from 'zod';

const {
	values: {'no-adblock': noAdblock},
} = parseArgs({
	options: {
		'no-adblock': {
			type: 'boolean',
			default: false,
		},
	},
});

const {
	parsed: {FIREFOX_PATH: firefoxPath},
} = z
	.object({
		parsed: z.object({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			FIREFOX_PATH: z.string().nonempty(),
		}),
	})
	.parse(
		config({
			path: new URL('../.env', import.meta.url),
		}),
	);

const osTemporaryDir = await realpath(tmpdir());
const profileDir = await mkdtemp(join(osTemporaryDir, 'ff-tmp-'));

// Disable telemetry and similar
await cp(
	new URL('../src/user.js', import.meta.url),
	join(profileDir, 'user.js'),
);

let xpiOutDir: string | undefined;

if (!noAdblock) {
	const versionRequest = await fetch(
		'https://addons.mozilla.org/api/v5/addons/addon/ublock-origin/versions/',
	);
	const versions = await z
		.promise(
			z.object({
				results: z.array(
					z.object({
						file: z.object({
							url: z.string(),
						}),
					}),
				),
			}),
		)
		.parse(versionRequest.json());

	const [latest] = versions.results;

	if (!latest) {
		throw new Error('Could not find latest version');
	}

	const xpiRequest = await fetch(latest.file.url);
	const xpi = await xpiRequest.arrayBuffer();

	xpiOutDir = join(profileDir, 'ublock.temp.xpi');
	await writeFile(xpiOutDir, Buffer.from(xpi));
}

const detachedPath = new URL('detached.js', import.meta.url);

const args = ['--tmp-dir', profileDir, '--firefox-path', firefoxPath];

if (xpiOutDir) {
	args.push('--xpi', xpiOutDir);
}

execaNode(fileURLToPath(detachedPath), args, {
	detached: true,
}).unref();

exit(0);
