import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import astro from 'eslint-plugin-astro';
import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import solid from 'eslint-plugin-solid';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist/', '.astro/', 'node_modules/']),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'import-x': importX, perfectionist },
    rules: {
      'perfectionist/sort-modules': [
        'error',
        {
          type: 'unsorted',
          groups: [
            ['class', 'export-class', 'declare-class', 'export-declare-class'],
            [
              'function',
              'export-function',
              'async-function',
              'export-async-function',
              'declare-function',
            ],
            ['type', 'export-type', 'declare-type'],
            ['interface', 'export-interface', 'declare-interface'],
          ],
        },
      ],
      'import-x/extensions': ['error', 'always', { ignorePackages: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../**'],
              message: 'Import from another folder with the #src/ alias.',
            },
          ],
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-console': 'error',
      eqeqeq: 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
    },
  },

  {
    files: ['**/*.tsx'],
    ...solid.configs['v2-strict'],
  },

  {
    files: ['src/logging/console.sink.ts'],
    rules: { 'no-console': 'off' },
  },

  astro.configs['flat/recommended'],
  astro.configs['flat/jsx-a11y-strict'],

  {
    files: ['**/*.astro', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
  },

  prettier,
);
