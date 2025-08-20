import globals from "globals";
import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import babelParser from '@babel/eslint-parser';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        console: true,
      },
      ecmaVersion: 2020,
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
        },
      },
    },
    files: ["**/*.js"],
    ignores: ["node_modules/", "dist/", "__mocks__/"],
    rules: {
      'no-console': 'off',
      // Allow unused variables and parameters that start with an underscore
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_+', 'varsIgnorePattern': '^_+' }],
    },
  },
  pluginJs.configs.recommended,
  prettierConfig,
];
