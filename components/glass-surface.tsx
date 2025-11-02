"use client"
import React from 'react'
import { cn } from '@/lib/utils'

interface GlassSurfaceProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  className?: string
  children?: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

/*
 * Neutral glass panel (monochrome) – reintroduces blur only where explicitly used.
 */
export default function GlassSurface({
  width,
  height,
  borderRadius = 24,
  className,
  children,
  as: Tag = 'div'
}: GlassSurfaceProps) {
  return (
    <Tag
      className={cn(
        'relative overflow-hidden border border-border/60 bg-background/55 backdrop-blur-md shadow-sm',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-white/10 dark:before:from-white/10 dark:before:to-white/5 before:pointer-events-none',
        className
      )}
      style={{ width, height, borderRadius }}
    >
      <div className="relative z-10">{children}</div>
    </Tag>
  )
}
