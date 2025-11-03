"use client"

import React, { useEffect } from 'react'

interface BlurTextProps {
  text: string
  delay?: number
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom' | 'left' | 'right'
  onAnimationComplete?: () => void
  className?: string
}

export default function BlurText({
  text,
  delay = 150,
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
  className = '',
}: BlurTextProps) {
  const segments = animateBy === 'words' ? text.split(' ') : text.split('')

  useEffect(() => {
    const totalDelay = segments.length * delay + 800
    const timer = setTimeout(() => {
      onAnimationComplete?.()
    }, totalDelay)

    return () => clearTimeout(timer)
  }, [segments.length, delay, onAnimationComplete])

  return (
    <div className={`inline-block ${className}`}>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          className="inline-block blur-text-animate"
          style={{
            animationDelay: `${index * delay}ms`,
          }}
        >
          {segment}
          {animateBy === 'words' && index < segments.length - 1 && '\u00A0'}
        </span>
      ))}
    </div>
  )
}
