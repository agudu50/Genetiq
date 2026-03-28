import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: typescriptParser,
			ecmaVersion: "latest",
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin,
			"prettier": prettierPlugin,
		},
		rules: {
			...typescriptPlugin.configs.recommended.rules,
			"prettier/prettier": "error",
		},
	},
];
