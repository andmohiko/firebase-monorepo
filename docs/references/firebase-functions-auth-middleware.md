## はじめに

[株式会社メンヘラテクノロジー](https://www.menhera-technology.com/)でエンジニアをしている[andmohiko](https://twitter.com/andmohiko)です。

Firebase Functionsを使用している際に、APIエンドポイントが必要な場合は、Expressを使ってエンドポイントを作成することができます。
このとき、認証済みのユーザーのみがAPIを利用できるようにしたい場合があります。例えば、ログイン済みのユーザーだけが取得できるデータがあり、セキュリティ上の都合でFirestoreをclient権限で読み出しにいけないことがあるかもしれません。

今回は、その実装方法について説明します。

## Firebase Functionsとは

[Cloud Functions for Firebase](https://firebase.google.com/docs/functions?hl=ja)は、Firebaseが提供するサーバーレスコンピューティングサービスです。開発者はサーバーを管理することなく、特定のイベントに応じてバックエンドのロジックを実行でき、以下のような用途で利用されます。

1. HTTPリクエストの処理
Expressを使用してAPIエンドポイントを定義し、HTTPリクエストを処理することができます。これにより、フル機能のRESTful APIを構築することが可能です。

2. Firebaseのイベントトリガー
FirestoreやRealtime Databaseでのデータ変更、Firebase Authenticationでのユーザー登録など、Firebase内のさまざまなイベントに対して関数をトリガーすることができます。

3. 外部APIとの連携
Firebase Functionsを使用して、外部のAPIと連携するためのコードを実行することができます。これにより、サードパーティのサービスと簡単に統合することができます。

4. スケジューリング
定期的なタスクをスケジュールして実行することができます。例えば、毎日決まった時間にデータベースのバックアップを取るなどのタスクを自動化できます。

Cloud Functionsとの違いとしては、Firebase FunctionsはFirebaseの一部として設計されています。Firebase特有のトリガー（Firestoreのドキュメント変更、Firebase Authenticationのユーザー作成など）をサポートしており、Firebase Authentication、Firestore、Realtime Database、Firebase StorageなどのFirebaseプロダクトとの統合が簡単にできます。

今回は1のHTTPリクエストの処理の機能を使っていきます。

## Firebase FunctionsにAPIエンドポイントを生やす

FunctionsのプロジェクトにExpressをインストールします。

```
$ pnpm add express
```

Expressを動かすFunctionを追加します。

```ts:functions/src/router.ts
const router = require('express')()

export default router
```

```ts:functions/src/index.ts
import * as functions from 'firebase-functions'

import router from './router'

const express = require('express')
const app = express()

app.use(router)

exports.api = functions.https.onRequest(app)
```

## 認証情報を付与してAPIにリクエストを送る

APIにリクエストを送る際にFirebase Authenticationで取得できるトークンを付与してリクエストを送ります。

Firebase Authenticationでは、`currentUser`から`getIdToken`を呼ぶことでIDトークンを取得できます。このトークンを、リクエストを送る際にBearer tokenとして付与します。今回はHTTPクライアントとしてaxiosを使用しています。

```ts:axios.ts
export const getAuthToken = async () => {
  try {
    const user = auth.currentUser ? auth.currentUser : await getAuthUser()
    if (!user) {
      throw new Error('no login')
    }
    return user.getIdToken()
  } catch (error) {
    return error
  }
}

const setBearer = async () => {
  const token = await getAuthToken()
  axiosBase.defaults.headers.common.authorization = `Bearer ${token}`
}
```

## APIでトークンを検証する

次に、API側でこちらのトークンを検証します。

まずは、IDトークンを受け取れるように、Expressのリクエストの型を拡張します。

```ts:functions/src/types/express.d.ts
import type { DecodedIdToken } from 'firebase-admin/auth'

declare module 'express' {
  import type { Request } from 'express'

  export type LoggedInRequest = {
    currentUser: DecodedIdToken
  } & Request
}
```

続いて、こちらのトークンを検証するmiddlewareを実装します。

```ts:functions/src/api/auth.ts
import type { LoggedInRequest, NextFunction, Response } from 'express'

import { auth } from '~/lib/firebase'

exports.handle = async (
  req: LoggedInRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
      return next()
    }
    const token = (
      typeof authHeader === 'string' ? authHeader : authHeader[0]
    ).split(' ')[1]
    const decodedToken = await auth.verifyIdToken(token) // ここでIDトークンを検証する
    if (!decodedToken?.uid) {
      return next()
    }
    req.currentUser = decodedToken
    return next()
  } catch (_) {
    return next()
  }
}
```

## HTTPリクエストを受け取った際に認証状態をチェックする

さいごにこちらのmiddlewareを組み込んでいきます。

```ts:functions/src/router.ts
const router = require('express')()

// さきほど実装したmiddlewareを使用する
router.use(require('./api/auth').handle)

// テスト用のエンドポイントを生やしてみる
router.post(
  '/test',
  require('./api/test').handle,
)

export default router
```

これでテスト用のエンドポイントを書いてみます。

先ほど作成した`LoggedInRequest`型にはFirebase AuthenticationのcurrentUserが入っているため、[Custom Claim](https://firebase.google.com/docs/auth/admin/custom-claims?hl=ja)も使用することができます。

```ts:functions/src/api/test.ts
import type { LoggedInRequest, Response } from 'express'

exports.handle = async (req: LoggedInRequest, res: Response) => {
  try {
    const { currentUser } = req

    // IDトークンの検証に失敗していれば401を返すことができます。
    if (!currentUser.uid) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Custom Claimもチェックできます。
    if (!currentUser.adminRole) {
      return res.status(403).json({ error: 'Permission denied' })
    }

    // 以下APIの処理を行う
    return res.status(200).send({ message: 'Nice :D' })
```

これで認証済みのユーザーのみが叩けるエンドポイントを実装できました🎉

## さいごに

今回はFirebase Functionsを使用してExpressでAPIエンドポイントを作成し、認証済みのユーザーのみがアクセスできるようにする方法について説明しました。
Custom Claimも取得できるため、ユーザーの権限によって処理を分岐することもできます。
ぜひ、この方法を試してみて、よりセキュアなAPIエンドポイントを作成してみてください。