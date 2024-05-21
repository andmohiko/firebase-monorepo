module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {},
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    // 詳細: https://typescript-eslint.io/rules/consistent-type-definitions/
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    // 詳細: @typescript-eslint/naming-convention
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['strictCamelCase', 'StrictPascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'parameter',
        format: ['strictCamelCase'],
      },
      {
        selector: 'class',
        format: ['StrictPascalCase'],
        custom: {
          regex: 'send|start|find',
          match: false,
        },
      },
      {
        selector: 'typeLike',
        format: ['StrictPascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['StrictPascalCase'],
      },
      // 変数名のprefixの規則
      {
        selector: 'variable',
        types: ['boolean'],
        // prefix以降がPascalCaseである必要がある。検証の解決順はprefix -> format
        format: ['PascalCase'],
        prefix: ['is', 'can', 'should', 'has', 'did', 'will'],
      },
    ],
    // 詳細: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/array-type.md
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'generic',
      },
    ],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        warnOnUnassignedImports: true,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: ['../'],
      },
    ],
    // 詳細: https://eslint.org/docs/latest/rules/curly
    curly: ['error', 'all'],
    // 詳細: https://eslint.org/docs/latest/rules/object-shorthand
    'object-shorthand': ['error', 'always'],
    // 詳細: https://eslint.org/docs/latest/rules/no-nested-ternary
    'no-nested-ternary': 'error',
    // 詳細: https://eslint.org/docs/latest/rules/no-console
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
}
