---
name: react-implementation
description: React / Next.js / Tanstack Start + TypeScriptでコンポーネントやページを実装する際のルール。.tsxファイルの作成・編集、コンポーネント設計、フォーム実装、スタイリング、エラーハンドリング、画像最適化に関するリクエスト時に参照すること。「コンポーネントを作って」「ページを追加して」「フォームを実装して」「UIを修正して」などのリクエストに対応する。
---

# React / Next.js 実装ルール

## 共通

- パスエイリアスは基本的には "@" を使用すること。ただし、tsconfigで "~" が設定されていれば、そちらに従うこと。

## コンポーネント設計

- 関数型コンポーネントのみ使用する。クラスコンポーネントは禁止
- コンポーネントは `const` で宣言する（`function` 宣言ではなく）
- Props の型定義には TypeScript の `type` を使用する
- JSX は宣言的に記述し、命令的なDOM操作を避ける

```tsx
type ExampleProps {
  title: string
  isActive: boolean
}

const Example = ({ title, isActive }: ExampleProps) => {
  return (
    <div className={isActive ? 'opacity-100' : 'opacity-50'}>
      <h1>{title}</h1>
    </div>
  )
}
```

## Next.js

- 予期しないエラーには Error Boundary を使用する
  - `error.tsx`: ルートセグメント単位のエラーハンドリング
  - `global-error.tsx`: アプリ全体のフォールバックUI

## 状態管理

- `useEffect` と `setState` の使用を最小限に抑える
- 可能な限り Server Components で解決し、Client Components への依存を減らす
- 状態が必要な場合でも、まず derived state（算出値）や URL パラメータで代替できないか検討する

## スタイリング

- Tailwind CSS を使用する
- モバイルファーストアプローチを採用する（`sm:` `md:` `lg:` で段階的にレスポンシブ対応）

## フォーム

- react-hook-form でフォーム状態を管理する
- Zod でバリデーションスキーマを定義し、react-hook-form の `resolver` に渡す
- エラーメッセージはユーザーに分かりやすく表示する

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
})

type FormValues = z.infer<typeof schema>

const ExampleForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'all',
  })

  const onSubmit = (data: FormValues) => { /* 送信処理 */ }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">送信</button>
    </form>
  )
}
```

## 画像最適化

- WebP フォーマットを使用する
- `width` / `height` を必ず指定する（レイアウトシフト防止）
- レイジーローディングを実装する（`next/image` の `loading="lazy"` またはデフォルト動作を活用）

## エラーハンドリング

- エラーは握りつぶさず、適切にハンドリングして分かりやすいレスポンスを返す
- 想定内のエラー（バリデーション等）はUI上でユーザーに伝える
- 想定外のエラーは Error Boundary でキャッチしフォールバックUIを表示する