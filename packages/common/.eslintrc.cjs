module.exports = {
  root: true,
  extends: ['@dials2/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    next: {
      rootDir: './packages/common',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
      typescript: {
        config: 'tsconfig.json',
        project: './packages/common',
        alwaysTryTypes: true,
      },
    },
  },
}
