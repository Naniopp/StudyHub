import js from '@eslint/js';
import globals from 'globals';
export default [{ ignores: ['dist'] }, js.configs.recommended, { files: ['src/**/*.{js,jsx}'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.es2021, React: 'readonly' }, parserOptions: { ecmaFeatures: { jsx: true } } }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^[A-Z_]', varsIgnorePattern: '^[A-Z]' }], 'no-empty': ['error', { allowEmptyCatch: true }] } }];
