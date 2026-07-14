import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginTS from '@typescript-eslint/eslint-plugin';
import parserTS from '@typescript-eslint/parser';

/**
 * 🎯 basic eslint configuration
 * @type {import("eslint").Linter.FlatConfig[]}
 */
export default [
    {
        ignores: [
          'dist/**',
          'coverage/**',
          'node_modules/**'
        ],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: parserTS,
            parserOptions: {
                project: './tsconfig.eslint.json', // avoid tslint errors
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': eslintPluginTS,
            prettier: eslintPluginPrettier,
        },
        rules: {
            'no-console': 'error',
            'prettier/prettier': ['error'],
            indent: ['error', 4, { SwitchCase: 1 }],
            '@typescript-eslint/no-unused-vars': ['warn'],
            // custom rules
            'object-shorthand': ['error', 'always'],
        },
    },
];
