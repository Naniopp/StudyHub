import js from '@eslint/js';
import globals from 'globals';
export default [{ ignores: ['node_modules'] }, js.configs.recommended, { files: ['src/**/*.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node, ...globals.es2021 } }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } }];
