"use client"
import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3
  interactive?: boolean
}

// Futuristic glass panel with layered gradient & border accents
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel({
  className,
  children,
  level = 1,
  interactive = false,
  ...rest
}, ref) {
  const depth = {
    1: 'bg-white/50 dark:bg-slate-900/40',
    2: 'bg-white/40 dark:bg-slate-900/35',
    3: 'bg-white/30 dark:bg-slate-900/25'
  }[level]
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl border border-white/20 dark:border-slate-700/40 backdrop-blur-md p-4 overflow-hidden',
        depth,
        'before:absolute before:inset-0 before:pointer-events-none before:bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.25),transparent_60%)] before:opacity-70',
        interactive && 'transition hover:border-sky-400/60 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.4),0_0_20px_-4px_rgba(56,189,248,0.5)]',
        className
      )}
      {...rest}
    >
      <div className="relative z-10">{children}</div>
      <div className="pointer-events-none absolute -inset-px rounded-2xl border border-white/20 dark:border-slate-800/40 mix-blend-overlay" />
    </div>
  )
})

export default GlassPanel
