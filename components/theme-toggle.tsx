"use client"

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(()=> setMounted(true),[])
  const mode = (theme === 'system' ? resolvedTheme : theme) || 'light'
  return (
    <button
      type="button"
      onClick={() => setTheme(mode === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
        'bg-secondary hover:bg-accent text-foreground'
      )}
    >
      <Sun className={cn('h-4 w-4 transition-all', mode === 'dark' && 'scale-0 rotate-90 opacity-0')} />
      <Moon className={cn('absolute h-4 w-4 transition-all', mode === 'light' && 'scale-0 -rotate-90 opacity-0')} />
      {!mounted && <span className="sr-only">Toggle theme</span>}
    </button>
  )
}
export default ThemeToggle
