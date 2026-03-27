# 開発ルール

## 共通ルール

日本語で対応すること

## セッション開始時の手順

[spec.md](/docs/spec.md) を読み込むこと。読んだら「📛spec.mdを読みました。」と表示すること

## モジュール構成

- apps/functions - Cloud Functions for Firebaseのディレクトリ。サーバー側で実行したい処理を実装する
- apps/web - Webアプリのフロントエンド。Tanstack StartのSPAモードで実装している
- packages/common - appsで使用する共通の型定義を実装する

## web開発ルール

作業の最後にビルドが通ることを確認すること

```bash
$ pnpm web build
```

## functions開発ルール

作業の最後にビルドが通ることを確認すること

```bash
$ pnpm functions pre-build
```

## Import パスエイリアス

- パスエイリアスは `@/` を使用すること（例: `@/components/ui/button`）
- `#/` は使用禁止。`package.json` の `imports` フィールドで `@/*` のみ定義されている
