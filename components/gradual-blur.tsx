"use client"
// Component added by Ansh - adapted for project
import React from 'react'
import { cn } from '@/lib/utils'

interface GradualBlurProps {
  target?: 'parent'
  position?: 'bottom' | 'top'
  height?: string
  strength?: number
  divCount?: number
  curve?: 'bezier' | 'linear'
  exponential?: boolean
  opacity?: number
  className?: string
}

// Renders layered gradient + blur bands to fade out overflowing scroll content (top or bottom)
export default function GradualBlur({
  target = 'parent',
  position = 'bottom',
  height = '6rem',
  strength = 2,
  divCount = 5,
  curve = 'bezier',
  exponential = true,
  opacity = 1,
  className,
}: GradualBlurProps) {
  const layers = Array.from({ length: divCount })
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 select-none',
        position === 'bottom' ? 'bottom-0' : 'top-0 rotate-180',
        className
      )}
      style={{ height }}
    >
      {layers.map((_, i) => {
        const ratio = (i + 1) / divCount
        const prog = exponential ? Math.pow(ratio, 1.65) : ratio
        const blur = prog * strength * 10 // px
        const layerOpacity = opacity * (curve === 'bezier' ? cubicBezier(prog) : prog) * 0.9
        return (
          <div
            key={i}
            className="absolute inset-x-0"
            style={{
              bottom: `${(ratio - 1) * 100}%`,
              height: '120%',
              filter: `blur(${blur.toFixed(2)}px)` ,
              opacity: layerOpacity,
              background: 'linear-gradient(to top, var(--blur-edge-color, rgba(15,23,42,1)) 5%, transparent 70%)',
              mixBlendMode: 'normal',
            }}
          />
        )
      })}
    </div>
  )
}

function cubicBezier(t: number) {
  // Approximate ease-out (cubic-bezier(.16,.84,.44,1))
  const p0 = 0, p1 = 0.84, p2 = 0.44, p3 = 1
  // De Casteljau for y given t (we treat control points only on y axis)
  const a = lerp(p0, p1, t)
  const b = lerp(p1, p2, t)
  const c = lerp(p2, p3, t)
  const d = lerp(a, b, t)
  const e = lerp(b, c, t)
  return lerp(d, e, t)
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
