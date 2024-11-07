import config from '@lusc/eslint-config';

export default [
	...config,
	{
		rules: {
			// They're experimental, good enough for me
			'n/no-unsupported-features/node-builtins': 'off',
		},
	},
];
