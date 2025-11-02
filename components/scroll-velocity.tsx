"use client"
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Landmark, Building2, ShieldCheck } from 'lucide-react'

interface ScrollVelocityProps {
  texts: string[]
  className?: string
  baseSpeed?: number // px / s baseline
  maxBoost?: number  // multiplier when fast scrolling
  iconEvery?: number // insert icon after every N items
}

// Simple Ashoka Chakra SVG (stylized) as inline component
function AshokaChakra({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
      {[...Array(24)].map((_, i) => {
        const a = (i / 24) * Math.PI * 2
        const x1 = 32 + Math.sin(a) * 4
        const y1 = 32 + Math.cos(a) * 4
        const x2 = 32 + Math.sin(a) * 26
        const y2 = 32 + Math.cos(a) * 26
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1} />
      })}
      <circle cx="32" cy="32" r="5" fill="currentColor" />
    </svg>
  )
}

const GOV_ICONS = [AshokaChakra, Landmark, Building2, ShieldCheck]

export default function ScrollVelocity({
  texts,
  className,
  baseSpeed = 40,
  maxBoost = 4,
  iconEvery = 2,
}: ScrollVelocityProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState(0)
  const velocityRef = useRef(0)
  const lastScrollY = useRef(0)
  const lastT = useRef<number>(0)

  // Measure scroll velocity
  useEffect(() => {
    function onScroll() {
      const now = performance.now()
      const y = window.scrollY
      if (lastT.current) {
        const dy = y - lastScrollY.current
        const dt = now - lastT.current || 16
        const v = dy / dt // px per ms
        // Low-pass filter for smoothness
        velocityRef.current = velocityRef.current * 0.85 + v * 0.15
      }
      lastScrollY.current = y
      lastT.current = now
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animation loop
  useEffect(() => {
    let frame: number
    function loop() {
      const v = Math.min(Math.max(Math.abs(velocityRef.current) * 1000, 0), baseSpeed * maxBoost)
      // Direction: positive scroll (down) moves marquee left
      const dir = velocityRef.current >= 0 ? 1 : -1
      setOffset(o => (o + (baseSpeed + v) * dir * (1/60)) % 2000)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [baseSpeed, maxBoost])

  // Build repeated content for seamless loop
  const sequence: React.ReactNode[] = []
  let iconIndex = 0
  texts.forEach((t, i) => {
    sequence.push(
      <span key={`t-${i}`} className="px-6 text-sm font-medium tracking-wide text-foreground/80 whitespace-nowrap">
        {t}
      </span>
    )
    if ((i+1) % iconEvery === 0) {
      const IconComp = GOV_ICONS[iconIndex % GOV_ICONS.length]
      sequence.push(
        <span key={`ic-${i}`} className="flex items-center justify-center text-primary/70 px-4">
          <IconComp className="h-6 w-6" />
        </span>
      )
      iconIndex++
    }
  })
  // Duplicate to allow wrap
  const content = [...sequence, ...sequence]

  return (
    <div className={cn("relative w-full overflow-hidden select-none", className)} aria-hidden>
      <div
        ref={trackRef}
        className="flex w-max items-center"
        style={{ transform: `translateX(${ -offset }px)` }}
      >
        {content}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/60 to-transparent" />
    </div>
  )
}
