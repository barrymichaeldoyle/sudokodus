import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    rules: {
      curly: ['error', 'all'],
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // We're using TypeScript
      '@typescript-eslint/explicit-module-boundary-types':
        'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // This is important to avoid conflicts with import/order
        },
      ],
      'import/first': 'error', // Ensure all imports are at the top of the file
      'import/newline-after-import': 'error', // Ensure there's a newline after import statements
      'import/no-duplicates': 'error', // Prevent duplicate imports
      'func-style': [
        'error',
        'declaration',
        { allowArrowFunctions: false },
      ],
      // Tailwind CSS rules
      'react/no-unknown-property': [
        'error',
        { ignore: ['className'] },
      ],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: true,
          reservedFirst: true,
        },
      ],
      'react/jsx-uses-react': 'off',
      'no-unused-vars': 'off',
    },
  },
];
