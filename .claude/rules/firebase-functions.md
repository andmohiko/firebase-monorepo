---
name: firebase-functions-implementation
paths: apps/**/*.{ts,tsx}
description: TypeScriptで実装する際のルール。.tsxや.tsファイルの作成・編集、処理やロジックや関数の実装のリクエスト時に参照すること。「実装して」などのリクエストに対応する。
---

# Cloud Functions for Firebase実装パターン

## トリガー関数

- onCreate, onUpdate, onWriteなどのFirestoreトリガー関数
- triggerOnceを使用し、冪等性を保つすること
- 作成時のトリガーにはonDocumentCreatedを使用し、更新時のトリガーにはonDocumentUpdatedを使用すること
- firestoreへCRUDする場合はoperation層を挟むこと

ルールを適用して返信したときはメッセージの最後に「🤖Firebase Functions」を表示してください。

### 実装例

```typescript
/**
 * 戦績作成時のトリガー関数
 * @description 戦績が作成された際に、勝率を更新する
 * @param {functions.firestore.QueryDocumentSnapshot} snap - 作成されたドキュメントのスナップショット
 * @param {functions.EventContext} context - イベントのコンテキスト情報
 * @throws {Error} 戦績が見つからない場合にエラーをスロー
 */
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import '~/config/firebase'
import { convertPublicMatchForSnapOperation } from '~/infrastructure/firestore/PublicMatchOperations'
import { saveMatchUpResult } from '~/services/createMatchUpResultService'
import { triggerOnce } from '~/utils/triggerOnce'

export const onCreatePublicMatch = onDocumentCreated(
  '/publicMatches/{publicMatchId}',
  triggerOnce('publicMatch', async (event) => {
    try {
      const publicMatchId = event.params.publicMatchId

      if (!event.data) {
        throw new Error(`作成されたデータが存在しません: ${publicMatchId}`)
      }

      const publicMatch = convertPublicMatchForSnapOperation(
        publicMatchId,
        event.data.data(),
      )

      if (!publicMatch) {
        throw new Error(`戦績データが存在しません: ${publicMatchId}`)
      }

      await saveMatchUpResult(publicMatch)
    } catch (error) {
      console.error('戦績作成時のエラー:', error)
      throw error
    }
  }),
)
```
