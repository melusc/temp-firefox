import {rm} from 'node:fs/promises';
import {setTimeout} from 'node:timers/promises';
import {parseArgs} from 'node:util';

import {execa} from 'execa';

const {
	values: {'tmp-dir': temporaryDir, 'firefox-path': firefoxPath, xpi},
} = parseArgs({
	options: {
		'tmp-dir': {
			type: 'string',
		},
		'firefox-path': {
			type: 'string',
		},
		xpi: {
			type: 'string',
		},
	},
});

await execa(
	firefoxPath!,
	['-profile', temporaryDir!, '-no-remote', '-new-instance', xpi!],
	{
		stdio: 'inherit',
	},
);

async function exponentialBackoff(fn: () => Promise<void>) {
	for (let i = 0; i < 5; ++i) {
		try {
			// eslint-disable-next-line no-await-in-loop
			await fn();
			return;
		} catch {
			// prettier-ignore
			// eslint-disable-next-line no-await-in-loop
			await setTimeout((2 ** i) * 1000);
		}
	}

	// At this point it's not going to work.
	// Just don't delete the directory
}

await setTimeout(10e3);

await exponentialBackoff(async () => rm(temporaryDir!, {recursive: true}));
