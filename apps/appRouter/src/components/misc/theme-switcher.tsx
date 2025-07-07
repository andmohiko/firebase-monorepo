/**
 * @file テーマスイッチャーコンポーネント
 * @description ダークモードとライトモードの表示と切り替えを行うコンポーネント
 */

'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'

export function ThemeSwitcher() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const willBeDarkMode = !isDarkMode
    setIsDarkMode(willBeDarkMode)
    if (willBeDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm">
        現在のモード:{' '}
        <span className="font-bold">
          {isDarkMode ? 'ダークモード' : 'ライトモード'}
        </span>
      </p>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full"
        aria-label={
          isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
        }
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
