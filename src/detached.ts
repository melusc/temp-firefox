#!/usr/bin/env node

import {cp, mkdtemp, readFile, realpath, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import {parse} from 'dotenv';
import {execa} from 'execa';

const config = parse<{FIREFOX_FILE: string}>(
	await readFile(new URL('../.env', import.meta.url)),
);

const osTemporaryDir = await realpath(tmpdir());
const profileDir = await mkdtemp(join(osTemporaryDir, 'ff-tmp-'));

// Disable telemetry and similar
await cp(
	new URL('../src/user.js', import.meta.url),
	join(profileDir, 'user.js'),
);

await execa(config.FIREFOX_FILE, [
	'-profile',
	profileDir,
	'-no-remote',
	'-new-instance',
]);

await rm(profileDir, {recursive: true});
