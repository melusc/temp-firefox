import {rm} from 'node:fs/promises';
import {setTimeout} from 'node:timers/promises';

import {execa} from 'execa';

import type Logger from './log.js';

export async function run(
	firefoxPath: string,
	temporaryDir: string,
	xpi: string | undefined,
	logger: Logger,
) {
	logger.log('Starting Firefox');

	await execa(
		firefoxPath,
		[
			'-profile',
			temporaryDir,
			'-no-remote',
			'-new-instance',
			...(xpi ? [xpi] : []),
		],
		{
			detached: true,
		},
	);

	logger.log('Firefox has closed');

	async function exponentialBackoff(fn: () => Promise<void>) {
		for (let i = 0; i < 5; ++i) {
			try {
				logger.log('Calling function');
				// eslint-disable-next-line no-await-in-loop
				await fn();
				logger.log('Function call success on try %s', i);
				return;
			} catch {
				// prettier-ignore
				const delay = (2 ** i) * 1000;

				logger.log('Backing off for %ss', delay);

				// eslint-disable-next-line no-await-in-loop
				await setTimeout(delay);
			}
		}

		// At this point it's not going to work.
		// Just don't delete the directory
	}

	logger.log('Starting exponential backoff');
	await exponentialBackoff(async () => rm(temporaryDir, {recursive: true}));
	logger.log('Finished exponential backoff');

	logger.done();
}
