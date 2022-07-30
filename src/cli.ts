import {spawn} from 'node:child_process';
import {execPath} from 'node:process';
import {fileURLToPath} from 'node:url';

spawn(execPath, [fileURLToPath(new URL('detached.js', import.meta.url))], {
	detached: true,
	stdio: 'ignore',
}).unref();
