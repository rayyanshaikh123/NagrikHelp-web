"use client"

import { useTheme } from "next-themes"
import ClickSpark from './ClickSpark'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/components/ui/use-mobile'

interface ThemeClickSparkProps {
  children: React.ReactNode
}

export function ThemeClickSpark({ children }: ThemeClickSparkProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  // Determine the current theme
  const currentTheme = resolvedTheme || theme || 'light'
  
  // Set spark color based on theme
  const sparkColor = currentTheme === 'dark' ? '#ffffff' : '#000000'

  // Only enable click sparks on small screens (cursor disabled). On desktop, render children as-is.
  return isMobile ? (
    <ClickSpark
      sparkColor={sparkColor}
      sparkSize={6}
      sparkRadius={25}
      sparkCount={8}
      duration={600}
      easing="ease-out"
      extraScale={1.0}
    >
      {children}
    </ClickSpark>
  ) : (
    <>{children}</>
  )
}
