"use client"
import React from 'react'
import CitizenDock from '@/components/citizen-dock'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      {/* Simple subtle pattern (no animation) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle_at_25%_20%,_currentColor_2px,_transparent_2px)] [mask-image:radial-gradient(circle_at_center,black,transparent_65%)]" />
      <div className="relative z-10 ">{children}</div>
      <CitizenDock className="pointer-events-none [*]:pointer-events-auto" />
    </div>
  )
}
