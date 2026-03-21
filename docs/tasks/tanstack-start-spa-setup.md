# TanStack Start SPAモード 実装計画書

## 概要
Firebase MonorepoテンプレートにTanStack Start SPAモードを追加し、Viteベースの高性能SPAアプリケーションを構築可能にする。

## 背景
- 現在のモノレポ構成には Next.js (Page Router/App Router) が含まれている
- TanStack Start SPAモードを追加することで、より軽量でモダンなSPA開発オプションを提供
- Viteの高速なビルドとHMRを活用

## 技術選定理由

### TanStack Start を選ぶ理由
1. **モダンなルーティング**: TanStack Routerによる型安全なルーティング
2. **パフォーマンス**: Viteベースの高速なビルド・開発環境
3. **柔軟性**: SPAモード、SSR、選択的SSRなど複数のレンダリング戦略に対応
4. **エコシステム**: TanStack Query、TanStack Storeなどとの優れた統合

### SPAモードの利点
- サーバーサイドレンダリングが不要な管理画面などに最適
- CDNでの静的ホスティングが可能
- Firebase Hostingとの相性が良い

## 実装手順

### 1. TanStack Start アプリケーションの作成
```bash
cd apps/
pnpm create @tanstack/start@latest tanstack-start --package-manager pnpm --toolchain biome --add-ons tanstack-query,tailwind,shadcn
```

選択するオプション:
- Package Manager: pnpm
- TypeScript: Yes
- Toolchain: Biome (プロジェクト全体で使用)
- Add-ons:
  - tanstack-query (状態管理とデータフェッチング)
  - tailwind (スタイリング - プロジェクト全体で統一)
  - shadcn (UIコンポーネントライブラリ - プロジェクト全体で統一)

### 2. ディレクトリ構造
```
apps/
├── tanstack-start/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── __root.tsx
│   │   │   └── index.tsx
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── layout/
│   │   ├── lib/
│   │   │   ├── firebase.ts
│   │   │   └── utils.ts    # cn() helper for tailwind
│   │   ├── styles/
│   │   │   └── globals.css  # Tailwind imports
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── components.json      # shadcn/ui config
│   └── package.json
```

### 3. Vite設定でSPAモードを有効化

`apps/tanstack-start/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/start/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tanstackStart({
      spa: {
        enabled: true,
        // オプション: SPAシェルのパスをカスタマイズ
        maskPath: '/app'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@firebase-monorepo/common': path.resolve(__dirname, '../../packages/common/src')
    }
  }
})
```

### 4. モノレポ統合

#### package.json の更新
`apps/tanstack-start/package.json`:
```json
{
  "name": "@firebase-monorepo/tanstack-start",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "check": "biome check ./src",
    "format": "biome format --write ./src"
  },
  "dependencies": {
    "@firebase-monorepo/common": "workspace:*",
    "@tanstack/react-router": "latest",
    "@tanstack/start": "latest",
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

#### ルートpackage.jsonのスクリプト追加
```json
{
  "scripts": {
    "tanstack-start:dev": "pnpm --filter @firebase-monorepo/tanstack-start dev",
    "tanstack-start:build": "pnpm --filter @firebase-monorepo/tanstack-start build"
  }
}
```

### 5. 共通パッケージとの連携

`apps/tanstack-start/src/lib/firebase.ts`:
```typescript
import { firebaseConfig } from '@firebase-monorepo/common'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### 6. 基本的なルート構成

`apps/tanstack-start/src/routes/__root.tsx`:
```tsx
import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  )
})
```

### 7. デプロイ設定

#### Firebase Hosting設定
`firebase.json` に追加:
```json
{
  "hosting": [
    {
      "target": "tanstack-start",
      "public": "apps/tanstack-start/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

#### Vercel設定（オプション）
`vercel.json`:
```json
{
  "buildCommand": "pnpm tanstack-start:build",
  "outputDirectory": "apps/tanstack-start/dist",
  "framework": null
}
```

## テスト計画

1. **開発サーバー起動確認**
   - `pnpm tanstack-start:dev` でサーバーが起動
   - HMRが動作

2. **ビルド確認**
   - `pnpm tanstack-start:build` でビルド成功
   - distフォルダにSPA用ファイルが生成

3. **ルーティング確認**
   - クライアントサイドルーティングが動作
   - リロード時も正しいページが表示

4. **共通パッケージ連携確認**
   - @firebase-monorepo/common の型定義が利用可能
   - Firebase設定が正しく読み込まれる

## 成功指標

- [ ] TanStack Start SPAモードでアプリケーションが起動
- [ ] Viteによる高速なHMRが動作
- [ ] モノレポの他パッケージと連携可能
- [ ] TypeScriptの型チェックが通る
- [ ] Biomeによるlint/formatが動作
- [ ] ビルド成果物がFirebase Hostingにデプロイ可能

## リスクと対策

| リスク | 対策 |
|-------|------|
| パッケージバージョンの競合 | pnpm workspace機能で依存関係を管理 |
| ビルドサイズの増大 | Viteのcode splittingを活用 |
| 型定義の不整合 | 共通のtsconfig.jsonを継承 |

## タイムライン

1. **Phase 1** (現在): 基本セットアップ
   - TanStack Startアプリケーション作成
   - SPAモード設定
   - モノレポ統合

2. **Phase 2**: 機能実装
   - 認証機能の実装
   - Firestore連携
   - 基本的なUIコンポーネント

3. **Phase 3**: デプロイ
   - Firebase Hosting設定
   - CI/CD設定
   - ドキュメント更新

## 参考資料

- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [TanStack Router SPA Mode](https://tanstack.com/router/latest/docs/framework/react/guide/spa-mode)
- [Vite Configuration](https://vitejs.dev/config/)
- [Firebase Hosting SPA Configuration](https://firebase.google.com/docs/hosting/full-config#rewrites)