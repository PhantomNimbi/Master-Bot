/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	extends: [
		'@master-bot/eslint-config/base',
		'@master-bot/eslint-config/nextjs',
		'@master-bot/eslint-config/react'
	]
};
