---
name: firestore-implementation
paths: apps/**/*.{ts,tsx}
description: Firestoreを使用するReact + TypeScriptプロジェクトにおける実装パターンのスキル。エンティティの型定義（Entity / CreateDto / UpdateDto）、Firestore CRUD操作（Operations層）、Reactカスタムフック（Hooks層）の作成時に必ず参照すること。新しいエンティティの追加、Firestoreへのデータ読み書き、リアルタイム購読、ページネーション、ミューテーションフックの実装時にトリガーされる。「Firestoreの型を作って」「CRUDを実装して」「データ取得フックを作って」「新しいコレクションを追加して」などのリクエストに対応する。
---

# Firestore実装パターン

React / Next.js / Tanstack Start + TypeScript + Cloud Firestoreプロジェクトにおける、型定義・DB操作・カスタムフックの実装ルール。
ルールを適用して返信したときはメッセージの最後に「🔥Firestore」を表示してください。

## アーキテクチャ

4層構造を守ること。レイヤーを飛び越えたアクセスは禁止。

```
UI Layer (React Components)
    ↓
Hooks Layer (Custom Hooks)
    ↓
Operations Layer (Firestore Operations)
    ↓
Types Layer (Entity Types & DTOs)
    ↓
Firestore
```

| レイヤー | 責務 | 配置先 |
|---------|------|--------|
| Entity Types | データ型定義、DTO定義 | `packages/common/src/entities/` |
| Operations | Firestore CRUD操作 | `apps/web/src/infrastructure/firestore/` |
| Hooks | React統合、状態管理 | `apps/web/src/hooks/` または `apps/web/src/features/*/hooks/` |
| Components | UI表示 | `apps/web/src/features/*/components/` |

---

## 1. 型定義のルール

各エンティティに対して必ず **3種類の型** を定義する。

### 1.1 Entity型（Firestoreから取得したデータ）

- タイムスタンプは `Date` 型（取得時に変換済み）
- IDフィールドを含む

### 1.2 CreateDto（新規作成用）

- IDとタイムスタンプを `Omit` で除外し、タイムスタンプは `FieldValue` 型で再定義
- `serverTimestamp()` を使用するため

### 1.3 UpdateDto（更新用）

- 更新可能なフィールドのみ定義
- `updatedAt: FieldValue` は必須、その他は用途に応じてオプショナル

### 1.4 firebase-adminを使用する場合

- FieldValue型はfirebaseライブラリとfirebase-adminライブラリで定義が異なります。
- そのため、firebase-adminを使ったCRUDを行う場合は、Dtoの型定義を分けるべきです。
  - Create{エンティティ名}DtoFromAdmin のようなsuffixをつけることで型定義を作成しましょう。
  - firebase-adminを使った型定義も packages/common に記述すること。

### テンプレート

```typescript
import type { FieldValue } from 'firebase/firestore'

// コレクション名を定数で定義
export const exampleCollection = 'examples' as const

// ID型のエイリアス
export type ExampleId = string // またはブランド型

// Entity型
export type Example = {
  exampleId: ExampleId
  createdAt: Date
  updatedAt: Date
  // ...その他フィールド
}

// 作成用DTO
export type CreateExampleDto = Omit<
  Example,
  'exampleId' | 'createdAt' | 'updatedAt'
> & {
  createdAt: FieldValue
  updatedAt: FieldValue
}

// 更新用DTO（フィールドをオプショナルにする場合）
export type UpdateExampleDto = {
  fieldA?: Example['fieldA']
  fieldB?: Example['fieldB']
  updatedAt: FieldValue // 必須
}
```

### 型定義チェックリスト

- [ ] コレクション名を `as const` で定数定義しているか
- [ ] ID型にエイリアスを使用しているか
- [ ] Entity型のタイムスタンプは `Date` 型か
- [ ] DTO型のタイムスタンプは `FieldValue` 型か
- [ ] CreateDtoでIDとタイムスタンプを除外しているか
- [ ] UpdateDtoで `updatedAt` を必須にしているか

---

## 2. Operations層の実装パターン

Firestoreへの直接アクセスをカプセル化する層。エラーハンドリングは行わず上位層に委譲する。

### 2.1 命名規則

| 操作 | 命名パターン | 戻り値 |
|------|-------------|--------|
| 取得 | `fetch{Entity}Operation` | `Promise<Entity \| null>` or `Promise<Array<Entity>>` |
| 購読 | `subscribe{Entity}Operation` | `Unsubscribe` |
| 作成 | `create{Entity}Operation` | `Promise<void>` |
| 更新 | `update{Entity}Operation` | `Promise<void>` |
| 削除 | `delete{Entity}Operation` | `Promise<void>` |
| 存在チェック | `isExists{Entity}Operation` | `Promise<boolean>` |

### 2.2 日付変換

Firestoreの `Timestamp` を `Date` に変換するユーティリティを必ず使用する。

```typescript
const dateColumns = ['createdAt', 'updatedAt'] as const satisfies Array<string>

const entity = {
  entityId: snapshot.id,
  ...convertDate(data, dateColumns),
} as Entity
```

`convertDate` の実装（`apps/web/src/utils/convertDate.ts`）:

```typescript
import type { Timestamp } from 'firebase/firestore'

export const convertDate = <T extends Record<string, unknown>>(
  data: T,
  dateColumns: ReadonlyArray<string>,
): T => {
  const result = { ...data }
  dateColumns.forEach((column) => {
    if (result[column] && typeof result[column] === 'object') {
      result[column] = (result[column] as Timestamp).toDate()
    }
  })
  return result
}
```

### 2.3 基本CRUD テンプレート

```typescript
import type { CreateExampleDto, Example, ExampleId, UpdateExampleDto } from '@repo/common'
import { exampleCollection } from '@repo/common'
import type { Unsubscribe } from 'firebase/firestore'
import {
  collection, doc, getDoc, getDocs, onSnapshot,
  query, setDoc, updateDoc, deleteDoc, where, limit,
} from 'firebase/firestore'
import { db } from '~/lib/firebase'
import { convertDate } from '~/utils/convertDate'

const dateColumns = ['createdAt', 'updatedAt'] as const satisfies Array<string>

// クエリによる取得
export const fetchExampleByFieldOperation = async (
  fieldValue: string,
): Promise<Example | null> => {
  const snapshot = await getDocs(
    query(collection(db, exampleCollection), where('field', '==', fieldValue), limit(1)),
  )
  if (snapshot.size === 0) return null
  const data = snapshot.docs[0].data()
  return { exampleId: snapshot.docs[0].id, ...convertDate(data, dateColumns) } as Example
}

// リアルタイム購読
export const subscribeExampleOperation = (
  exampleId: string,
  setter: (example: Example | null | undefined) => void,
): Unsubscribe => {
  return onSnapshot(doc(db, exampleCollection, exampleId), (snapshot) => {
    const data = snapshot.data()
    if (!data) { setter(null); return }
    setter({ exampleId: snapshot.id, ...convertDate(data, dateColumns) } as Example)
  })
}

// 作成（IDを指定する場合は setDoc）
export const createExampleOperation = async (
  exampleId: ExampleId,
  dto: CreateExampleDto,
): Promise<void> => {
  await setDoc(doc(db, exampleCollection, exampleId), dto)
}

// 作成（自動ID生成の場合は addDoc）
// await addDoc(collection(db, exampleCollection), dto)

// 更新
export const updateExampleOperation = async (
  exampleId: ExampleId,
  dto: UpdateExampleDto,
): Promise<void> => {
  await updateDoc(doc(db, exampleCollection, exampleId), dto)
}

// 削除
export const deleteExampleOperation = async (
  exampleId: ExampleId,
): Promise<void> => {
  await deleteDoc(doc(db, exampleCollection, exampleId))
}
```

### 2.4 ページネーション テンプレート

カーソルベースのページネーションを使用する。

```typescript
import type { DocumentSnapshot } from 'firebase/firestore'
import { orderBy, startAfter } from 'firebase/firestore'

export const PAGE_SIZE = 50

export type FetchResultWithPagination<T> = {
  items: Array<T>
  lastDoc: DocumentSnapshot | null
  hasMore: boolean
}

export const fetchExamplesOperation = async (
  userId: string,
  pageSize: number,
  lastDocument: DocumentSnapshot | null,
): Promise<FetchResultWithPagination<Example>> => {
  const baseConstraints = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ]
  const constraints = lastDocument
    ? [...baseConstraints, startAfter(lastDocument), limit(pageSize)]
    : [...baseConstraints, limit(pageSize)]

  const snapshot = await getDocs(query(collection(db, exampleCollection), ...constraints))
  const items = snapshot.docs.map((d) => ({
    exampleId: d.id,
    ...convertDate(d.data(), dateColumns),
  } as Example))
  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
  const hasMore = snapshot.docs.length === pageSize

  return { items, lastDoc, hasMore }
}
```

### 2.5 注意点

- Operations層はエンティティへの操作を抽象化する層です。
- そのため、特定のフィールドや値を更新するためだけのOperation関数は作成してはいけません。
- 更新したいフィールドがあれば、Operations層を呼ぶ際にdtoを作成し、Operation関数には「エンティティを更新する」という抽象化した役割だけを与えましょう。

---

## 3. カスタムフック（Hooks層）の実装パターン

Operations層をReactコンポーネントから使いやすい形に変換する層。状態管理・エラーハンドリング・認証チェックを担当する。

### 3.1 命名規則

| 用途 | 命名パターン |
|------|-------------|
| データ取得 | `use{EntityName}` (例: `useExamples`) |
| ミューテーション | `use{Action}{EntityName}Mutation` (例: `useCreateExampleMutation`) |

### 3.2 データ取得フック テンプレート

戻り値の型を必ず `export type` で定義する。

```typescript
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFirebaseAuthContext } from '~/providers/FirebaseAuthProvider'
import { useToast } from '~/hooks/useToast'
import { errorMessage } from '~/utils/errorMessage'

export type UseExamplesReturn = {
  items: Array<Example>
  error: string | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
}

export const useExamples = (): UseExamplesReturn => {
  const { uid } = useFirebaseAuthContext()
  const { showErrorToast } = useToast()

  const [firstPageItems, setFirstPageItems] = useState<Array<Example>>([])
  const [additionalItems, setAdditionalItems] = useState<Array<Example>>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 最初のページをリアルタイム購読
  useEffect(() => {
    if (!uid) return
    setIsLoading(true)
    try {
      const unsubscribe = subscribeExamplesOperation(uid, PAGE_SIZE, (items) => {
        setFirstPageItems(items)
        setIsLoading(false)
      })
      return () => unsubscribe() // クリーンアップ必須
    } catch (e) {
      setError(errorMessage(e))
      showErrorToast('データの取得に失敗しました')
      setIsLoading(false)
    }
  }, [uid, showErrorToast])

  // ... ページネーション・無限スクロールのロジック

  return { items: [...firstPageItems, ...additionalItems], error, isLoading, isLoadingMore, hasMore, loadMore }
}
```

### 3.3 ミューテーションフック テンプレート

```typescript
export const useCreateExampleMutation = () => {
  const { uid } = useFirebaseAuthContext()

  const createExample = async (data: CreateExampleInput) => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    await createExampleOperation({
      createdAt: serverTimestamp,
      updatedAt: serverTimestamp,
      userId: uid,
      // ... データ変換（表示用 → 保存用）
    })
  }

  return { createExample }
}
```

### 3.4 フック実装のチェックリスト

- [ ] 戻り値の型を `export type` で定義しているか
- [ ] `useFirebaseAuthContext()` で認証情報を取得しているか
- [ ] エラーを `catch` して `errorMessage()` で変換し、トースト通知しているか
- [ ] リアルタイム購読の `useEffect` で `unsubscribe` をクリーンアップしているか
- [ ] ミューテーションで認証チェック（`!uid`）を先頭で行っているか

---

## 4. コーディング規約

- `any` 型は使用禁止。戻り値の型は明示的に定義する
- コレクション名は小文字キャメルケース（例: `publicMatches`）
- 型名はパスカルケース（例: `PublicMatch`）
- 関数名はキャメルケース（例: `createPublicMatchOperation`）
- ページサイズ等のマジックナンバーは定数で定義する
- 関数にはJSDocコメント、複雑なロジックには日本語コメントを記載する

## 5. Firebase初期化

`apps/web/src/lib/firebase.ts` に集約する。

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, serverTimestamp as getServerTimeStamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const config = { /* 環境変数から取得 */ }
const firebaseApp = initializeApp(config)
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const serverTimestamp = getServerTimeStamp()
const storage = getStorage(firebaseApp)

if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export { auth, db, serverTimestamp, storage }
```

## 6. セキュリティ・パフォーマンス

- Firestore Security Rules で認証チェック・スキーマバリデーション・所有権チェックを必ず実装する
- リアルタイム購読は最小限にし、不要になったら解除する
- 複合クエリにはインデックスを設定し `firestore.indexes.json` で管理する
- ページネーションを実装し、大量データの一括取得を避ける

### 6.1 セキュリティルールの実装ルール

- client側からCRUDするコレクションについては必ず記述すること
- 過剰な権限はつけないこと
- 認証済みのユーザーのみアクセスしていいコレクションには認証状態のチェックを入れること
- createとupdateのruleは、ドキュメントの所有者、ドキュメントのスキーマ（すべてのフィールドの型と、フィールドに過不足がないこと）を確認すること
- コレクションのスキーマの検証の実装方針
  - 保守性のため、関数として切り出して実装する
  - フィールドサイズも検証することで、フィールドの過不足を確認する
  - すべてのフィールドの存在確認と型を確認する
- サブコレクションにアクセスする際は、親ドキュメントの所有者の確認も含めることで、ユーザーのドキュメントに他人がアクセスできないようにすること

#### 実装例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function requestData() {
      return request.resource.data;
    }
    function resourceData() {
      return resource.data;
    }
    function isSignedIn() {
      return request.auth.uid != null;
    }
    function isUser(userId) {
      return request.auth.uid == userId;
    }

    function isValidProfileSchema(requestData) {
      return requestData.size() == 14
        && 'createdAt' in requestData && requestData.createdAt is timestamp
        && 'displayName' in requestData && requestData.displayName is string
        && 'friendCode' in requestData && requestData.friendCode is string
        && 'isPrivateProfile' in requestData && requestData.isPrivateProfile is bool
        && 'mainFighterIds' in requestData && requestData.mainFighterIds is list
        && 'mainPlayingTime' in requestData && requestData.mainPlayingTime is string
        && 'ogpImageUrl' in requestData && (requestData.ogpImageUrl is string || requestData.ogpImageUrl == null)
        && 'profileImageUrl' in requestData && requestData.profileImageUrl is string
        && 'selfIntroduction' in requestData && requestData.selfIntroduction is string
        && 'smashMateMaxRating' in requestData && (requestData.smashMateMaxRating is number || requestData.smashMateMaxRating == null)
        && 'updatedAt' in requestData && requestData.updatedAt is timestamp
        && 'username' in requestData && requestData.username is string
        && 'voiceChat' in requestData && requestData.voiceChat is map
        && 'xId' in requestData && requestData.xId is string;
    }

    function isValidPublicMatchSchema(requestData) {
      return requestData.size() == 12
        && 'createdAt' in requestData && requestData.createdAt is timestamp
        && 'isContinuedMatch' in requestData && requestData.isContinuedMatch is bool
        && 'isElite' in requestData && requestData.isElite is bool
        && 'globalSmashPower' in requestData && (requestData.globalSmashPower is number || requestData.globalSmashPower == null)
        && 'myFighterId' in requestData && requestData.myFighterId is string
        && 'myFighterName' in requestData && requestData.myFighterName is string
        && 'opponentFighterId' in requestData && requestData.opponentFighterId is string
        && 'opponentFighterName' in requestData && requestData.opponentFighterName is string
        && 'result' in requestData && requestData.result is string
        && 'stage' in requestData && (requestData.stage is string || requestData.stage == null)
        && 'updatedAt' in requestData && requestData.updatedAt is timestamp
        && 'userId' in requestData && requestData.userId is string;
    }

    function isValidUserSchema(requestData) {
      return requestData.size() == 3
        && 'createdAt' in requestData && requestData.createdAt is timestamp
        && 'email' in requestData && requestData.email is string
        && 'updatedAt' in requestData && requestData.updatedAt is timestamp;
    }

    match /profiles/{profileId} {
      allow read;
      allow create: if isSignedIn() && isUser(profileId) && isValidProfileSchema(requestData());
      allow update: if isSignedIn() && isUser(profileId) && isValidProfileSchema(requestData());
    }

    match /publicMatches/{publicMatchId} {
      allow read;
      allow create: if isSignedIn() && isUser(requestData().userId) && isValidPublicMatchSchema(requestData());
      allow update: if isSignedIn() && isUser(requestData().userId) && isValidPublicMatchSchema(requestData());
      allow delete: if isSignedIn() && isUser(resourceData().userId);
    }

    match /users/{userId} {
      allow read;
      allow create: if isSignedIn() && isUser(userId) && isValidUserSchema(requestData());
      allow update: if isSignedIn() && isUser(userId) && isValidUserSchema(requestData());

      match /matchUpResults/{matchUpResultId} {
        allow read: if isSignedIn() && isUser(userId);
      }
    }
  }
}
```