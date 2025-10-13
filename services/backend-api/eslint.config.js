const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = tseslint.config(
  // Ignore patterns - must come first
  {
    ignores: [
      'node_modules/',
      'dist/',
      '**/dist/',
      'src/dist/',
      'build/',
      'coverage/',
      '*.config.js',
      'prisma/generated/',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  
  // Base ESLint recommended rules
  eslint.configs.recommended,
  
  // TypeScript ESLint recommended rules (without type checking)
  ...tseslint.configs.recommended,
  
  // Prettier config to disable conflicting rules
  prettierConfig,
  
  // Main TypeScript configuration with type checking
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.js', '**/*.mjs', '**/*.cjs', 'dist/**', '**/dist/**'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'prettier': prettierPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
  
  // Test files configuration
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  }
);
