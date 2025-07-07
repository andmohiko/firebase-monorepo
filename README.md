<!-- @format -->

# Firebase Monorepo

## 技術構成

- フロントエンド
  - フレームワーク：Next.js Page Router
  - 言語：TypeScript
  - コンポーネントライブラリ：Mantine
- サーバーサイド
  - Cloud Functions for Firebase
  - 言語：TypeScript
  - APIフレームワーク：Express
- データベース
  - Firestore
- インフラ
  - フロントエンド：Vercel
  - サーバーサイド：Cloud Functions for Firebase
  - 日時バッチ：Cloud Scheduler
- 開発ツール
  - pnpm
  - Biome

## ドキュメント

- プロジェクト概要：README.md
- データベース設計：firestore-design.md

## パッケージ構成

本プロジェクトでは [Turborepo](https://turbo.build/repo/docs) によるマルチレポ構成を採用しています.

| type | name                                              | description 　　　　　　 | default port |
| ---- | ------------------------------------------------- | ------------------------ | ------------ |
| app  | [@firebase-monorepo/console](./apps/console/)     | 管理画面                 | ---          |
| app  | [@firebase-monorepo/web](./apps/web/)             | Web アプリ本体           | ---          |
| app  | [@firebase-monorepo/functions](./apps/functions/) | Cloud Functions          | ---          |
| pkg  | [@firebase-monorepo/common](./packages/common/)   | 共通で使用する型定義など | ---          |

## 環境構築

### 事前準備

##### 1. 指定バージョンの node をセットする

プロジェクトの node のバージョンを [こちら](./.node-version) に記載されるバージョンに固定します.

nodenv などのお好みのバージョン管理ツールで指定してくだい.

##### 2. pnpm をインストールする

```sh
$ npm i -g pnpm

$ pnpm -v
8.10.2 # ここが 8.10 以上であればOK
```

##### 3. 環境変数を準備する

TODO:

### ローカルサーバーの立ち上げ

すべてのパッケージの依存関係をインストールします.

```sh
$ pnpm install
```

すべてのアプリケーションでローカルサーバーを起動します.

```sh
$ pnpm dev
```

## デプロイ手順

### フロントエンド

VercelのCIによる自動デプロイが走ります。
Pull Requestごとにデプロイされ、プレビュー環境も作成されます。

ビルドが通ることを手元で確認する際は次のコマンドを実行してください。

```sh
$ pnpm web build
```

### サーバーサイド

Firebase CLIを使ってデプロイすることができます。

```sh
firebase deploy --only functions
```

### インフラ

Firestoreの設定もFirebase CLIを使ってデプロイすることができます。

```sh
firebase deploy --only firestore
```

## その他の CLI

### lintとformat

```sh
# lintエラーを表示
$ pnpm check

# lintエラーを自動修正
$ pnpm format
```