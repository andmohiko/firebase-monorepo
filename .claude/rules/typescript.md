---
name: typescript-implementation
paths: apps/**/*.ts, tests/**/*.test.ts
description: TypeScriptで実装する際のルール。.tsxや.tsファイルの作成・編集、処理やロジックや関数の実装のリクエスト時に参照すること。「実装して」などのリクエストに対応する。
---

# TypeScript 実装ルール

- 関数の引数と返り値の型を必ず書くこと
- パスエイリアスは基本的には "@" を使用すること。ただし、tsconfigで "~" が設定されていれば、そちらに従うこと。
- ルールを適用して返信したときはメッセージの最後に「🔷TS」を表示してください。