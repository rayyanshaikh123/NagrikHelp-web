"use client"
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface DockItem {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  href?: string
}

interface DockProps {
  items: DockItem[]
  panelHeight?: number
  baseItemSize?: number
  magnification?: number // percentage increase of center item
  className?: string
  activeLabel?: string
}

// Lightweight Mac-like dock (pure CSS + a little JS). No framer-motion.
export function Dock({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
  className,
  activeLabel
}: DockProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [mouseX, setMouseX] = useState<number | null>(null)

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!ref.current) return
      const bounds = ref.current.getBoundingClientRect()
      setMouseX(e.clientX - bounds.left)
    }
    function handleLeave() { setMouseX(null) }
    const node = ref.current
    node?.addEventListener('mousemove', handleMove)
    node?.addEventListener('mouseleave', handleLeave)
    return () => {
      node?.removeEventListener('mousemove', handleMove)
      node?.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-2 z-40 flex justify-center px-4',
        className
      )}
    >
      <div
        ref={ref}
        style={{ height: panelHeight }}
        className="relative flex items-end gap-3 rounded-2xl border border-white/15 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_30px_-8px_rgba(0,0,0,0.4)]"
      >
        {items.map((item, idx) => {
          const size = calcSize(idx, ref.current, mouseX, baseItemSize, magnification)
          const isActive = activeLabel && activeLabel === item.label
          const content = (
            <button
              key={idx}
              onClick={() => {
                if (item.href) window.location.href = item.href
                else item.onClick?.()
              }}
              style={{ width: size, height: size }}
              className={cn(
                'group relative grid place-items-center rounded-full transition-all duration-150 will-change-transform',
                'bg-gradient-to-br from-sky-400/20 via-cyan-300/10 to-emerald-400/20 text-sky-300 border border-sky-400/30',
                'hover:shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_0_18px_-2px_rgba(56,189,248,0.7)]',
                isActive && 'ring-2 ring-sky-400/60'
              )}
              aria-label={item.label}
            >
              <span className="text-[0px] opacity-80 group-hover:opacity-100" style={{ fontSize: Math.max(16, size * 0.42) }}>
                {item.icon}
              </span>
              <span className="pointer-events-none absolute -top-6 scale-90 opacity-0 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-100 shadow-sm backdrop-blur transition group-hover:scale-100 group-hover:opacity-100 dark:bg-slate-100/90 dark:text-slate-900">
                {item.label}
              </span>
            </button>
          )
          return content
        })}
      </div>
    </div>
  )
}

function calcSize(idx: number, container: HTMLDivElement | null, mouseX: number | null, base: number, mag: number) {
  if (!container || mouseX == null) return base
  const children = Array.from(container.children) as HTMLElement[]
  const el = children[idx]
  if (!el) return base
  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2 - container.getBoundingClientRect().left
  const dist = Math.abs(mouseX - centerX)
  const influence = 140 // px radius of influence
  if (dist > influence) return base
  const ratio = 1 - dist / influence
  const maxAdd = (base * (mag / 100)) - base
  return Math.round(base + maxAdd * ratio)
}

export default Dock
