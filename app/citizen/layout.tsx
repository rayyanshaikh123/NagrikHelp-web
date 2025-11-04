"use client"
import React from 'react'
import CitizenDock from '@/components/citizen-dock'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      {/* Subtle gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/95 to-muted/20" />
      {/* Subtle dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_25%_20%,_currentColor_2px,_transparent_2px)] bg-[length:32px_32px]" />
      <div className="relative z-10">{children}</div>
      <CitizenDock className="pointer-events-none [*]:pointer-events-auto" />
    </div>
  )
}
