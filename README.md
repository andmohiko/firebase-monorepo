<!-- @format -->

# Firebase Monorepo

この README では、開発環境手順等にのみ言及します.

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

## その他の CLI

TODO:
