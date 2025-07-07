/**
 * @file メインページ
 * @description アプリケーションのトップページを実装します。
 */

import { ThemeSwitcher } from '~/components/misc/theme-switcher'

export default function Home() {
  return (
    <div className="rounded-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <ThemeSwitcher />
      </div>
    </div>
  )
}
