const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
	{
		files: ["**/*.{ts,tsx}"], // Include TypeScript files
		languageOptions: {
			parser: typescriptParser, // Use TypeScript parser
			ecmaVersion: "latest",
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin, // Enable TypeScript plugin
			"prettier": prettierPlugin,
		},
		rules: {
			...typescriptPlugin.configs.recommended.rules, // Use TypeScript recommended rules
			"prettier/prettier": "error", // Show Prettier issues as ESLint errors
		},
	},
];
