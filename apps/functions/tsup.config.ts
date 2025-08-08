import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'lib',
  target: 'node18',
  format: ['cjs'],
  dts: false, // Firebase deploy では型定義は不要
  external: ['firebase-functions', 'firebase-admin'], // Cloud Functions が持つ依存
  clean: true,
  shims: true, // Node.js のグローバルAPI shimを使う場合
  esbuildOptions(options) {
    options.alias = {
      '@firebase-monorepo/common': '../../packages/common/src',
    }
  },
})
