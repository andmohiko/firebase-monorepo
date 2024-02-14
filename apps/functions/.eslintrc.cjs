module.exports = {
  root: true,
  extends: ['../../.eslintrc.cjs'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
      typescript: {
        config: 'tsconfig.json',
        project: './apps/functions',
        alwaysTryTypes: true,
      },
    },
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '**/*.js',
  ],
}
