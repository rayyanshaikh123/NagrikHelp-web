"use client"
import React from 'react'

interface Props {
  children: React.ReactNode
  baseIntensity?: number
  hoverIntensity?: number
  enableHover?: boolean
  className?: string
}

/**
 * Minimal FuzzyText implementation inspired by the posted snippet.
 * Uses layered text shadows to create a soft fuzzy look. Lightweight and safe.
 */
export default function FuzzyText({ children, baseIntensity = 0.28, hoverIntensity = 0.45, enableHover = false, className }: Props) {
  const base = Math.max(0, Math.min(1, baseIntensity))
  const hover = Math.max(0, Math.min(1, hoverIntensity))

  // background (blur) layer style
  const blurRadius = 12 * base // px
  const blurOpacity = 0.9 * base

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    lineHeight: 1,
  }

  const blurredStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'inline-block',
    color: 'white',
    filter: `blur(${blurRadius}px)`,
    opacity: blurOpacity,
    transform: 'translateZ(0)',
    pointerEvents: 'none',
    WebkitFilter: `blur(${blurRadius}px)`,
    // slightly enlarge the blurred layer for a softer halo
    transformOrigin: 'center',
  }

  const frontStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    color: 'white',
    textShadow: `0 1px 0 rgba(0,0,0,${0.6 * base}), 0 2px 8px rgba(0,0,0,${0.4 * base})`,
    pointerEvents: 'auto',
  }

  const hoverProps = enableHover ? {
    transition: 'filter 180ms ease, opacity 180ms ease, transform 180ms ease'
  } : {}

  return (
    <span className={className} style={{ ...containerStyle, ...hoverProps }}>
      <span aria-hidden style={{ ...blurredStyle, ...hoverProps }}>{children}</span>
      <span style={frontStyle}>{children}</span>
    </span>
  )
}
