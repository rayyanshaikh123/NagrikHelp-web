"use client"
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export function ThemeHotkey() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = String(e?.key ?? '').toLowerCase()
      if (key !== 't' || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (!target) return
      const tag = target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      e.preventDefault()
      const mode = (theme === 'system' ? resolvedTheme : theme) || 'light'
      setTheme(mode === 'dark' ? 'light' : 'dark')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theme, resolvedTheme, setTheme])
  return null
}
export default ThemeHotkey