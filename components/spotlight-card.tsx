"use client"
import React, { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string // rgba or css color used in radial gradient
  fadeDurationMs?: number
}

/*
 * SpotlightCard – lightweight mouse-follow radial spotlight.
 * Plain monochrome friendly: default subtle light overlay.
 */
export default function SpotlightCard({
  children,
  className,
  spotlightColor = 'var(--primary)', // changed default to theme primary
  fadeDurationMs = 220,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  // Simple throttling to avoid excessive style writes
  const throttleRef = useRef(0)
  const handleMove = useCallback((e: React.MouseEvent) => {
    const now = performance.now()
    if (now - throttleRef.current < 16) return // ~60fps cap
    throttleRef.current = now
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty('--spot-x', `${x}px`)
    el.style.setProperty('--spot-y', `${y}px`)
  }, [])

  const centerSpot = () => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${rect.width / 2}px`)
    el.style.setProperty('--spot-y', `${rect.height / 2}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => { centerSpot(); setActive(true) }}
      onMouseLeave={() => setActive(false)}
      className={cn(
        'relative group rounded-xl overflow-hidden transition-colors',
        'after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-opacity after:z-10',
        // Enlarged spotlight: broader bright core (0-20%), smooth fade to 70%
        'after:[background:radial-gradient(circle_at_var(--spot-x)_var(--spot-y),var(--spotlight-color)_0%,var(--spotlight-color)_20%,transparent_70%)]',
        active && 'after:opacity-70',
        className
      )}
      style={{ ['--spotlight-color' as any]: spotlightColor, transitionDuration: `${fadeDurationMs}ms`, '--spot-x': '50%', '--spot-y': '50%' } as any}
    >
      {/* Content below spotlight */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  )
}
