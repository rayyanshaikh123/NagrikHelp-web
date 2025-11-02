"use client"
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ChromaGridItem {
  image: string
  title: string
  subtitle?: string
  handle?: string
  borderColor?: string
  gradient?: string
  url?: string
}

interface ChromaGridProps {
  items: ChromaGridItem[]
  radius?: number        // pixel radius of circular layout
  damping?: number       // motion damping 0..1
  fadeOut?: number       // background fade overlay strength 0..1
  ease?: string          // easing preset (currently cosmetic)
  className?: string
}

/*
  Lightweight interactive chroma grid.
  - Positions items on a circle (or spiral slight offset) with CSS transforms.
  - Pointer movement creates a parallax tilt & orbit shift.
  - Neutral friendly: gradients supplied per-item; fallback grayscale gradient.
  No framer-motion; pure rAF + style updates.
*/
export default function ChromaGrid({
  items,
  radius = 280,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  className,
}: ChromaGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const frame = useRef<number>()

  useEffect(() => { setMounted(true); return () => cancelAnimationFrame(frame.current!) }, [])

  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      target.current.x = (e.clientX - cx) / rect.width // -0.5..0.5 ish
      target.current.y = (e.clientY - cy) / rect.height
    }
    function onLeave() { target.current.x = 0; target.current.y = 0 }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => { window.removeEventListener('pointermove', onPointer); window.removeEventListener('pointerleave', onLeave) }
  }, [])

  useEffect(() => {
    function loop() {
      current.current.x += (target.current.x - current.current.x) * damping
      current.current.y += (target.current.y - current.current.y) * damping
      const node = containerRef.current
      if (node) {
        node.style.setProperty('--tiltX', (current.current.y * 8).toFixed(3) + 'deg')
        node.style.setProperty('--tiltY', (current.current.x * -12).toFixed(3) + 'deg')
        node.style.setProperty('--shiftX', (current.current.x * 40).toFixed(3) + 'px')
        node.style.setProperty('--shiftY', (current.current.y * 40).toFixed(3) + 'px')
      }
      frame.current = requestAnimationFrame(loop)
    }
    frame.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame.current!)
  }, [damping])

  const angleStep = (Math.PI * 2) / Math.max(1, items.length)

  return (
    <div ref={containerRef} className={cn('relative h-full w-full perspective-[1600px]', className)}>
      <div className="absolute inset-0 origin-center" style={{ transform: 'translateZ(0)' }}>
        {items.map((item, i) => {
          const angle = i * angleStep
          const r = radius * (0.92 + (i % 3) * 0.025) // slight variation
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          const style: React.CSSProperties = {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--i': i,
            borderColor: item.borderColor || '#ccc',
            background: item.gradient || 'linear-gradient(135deg,#262626,#111)',
          } as any
          return (
            <a
              key={i}
              href={item.url || '#'}
              className={cn(
                'group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'rounded-xl border bg-neutral-900/20 backdrop-blur-sm text-xs text-neutral-200 w-48 p-3 flex flex-col gap-2',
                'transition-colors hover:border-primary/60 hover:text-foreground'
              )}
              style={{
                ...style,
                transform: `translate(calc(var(--x) + var(--shiftX)), calc(var(--y) + var(--shiftY))) perspective(1200px) rotateX(var(--tiltX)) rotateY(var(--tiltY))`,
              }}
              target={item.url ? '_blank' : undefined}
              rel="noreferrer"
            >
              <div className="relative h-20 w-full overflow-hidden rounded-lg border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="space-y-0.5">
                <div className="font-medium leading-snug text-foreground/90 truncate">{item.title}</div>
                {item.subtitle ? <div className="text-[11px] text-muted-foreground truncate">{item.subtitle}</div> : null}
                {item.handle ? <div className="text-[10px] text-muted-foreground/70 font-mono truncate">{item.handle}</div> : null}
              </div>
            </a>
          )
        })}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-full opacity-[0.07] [background:radial-gradient(circle_at_center,rgba(0,0,0,0.8),transparent_70%)] dark:[background:radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_65%)]" />
      {mounted ? null : <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">Loading grid…</div>}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at center, rgba(0,0,0,${fadeOut * 0.6}), transparent 70%)` }} />
    </div>
  )
}
