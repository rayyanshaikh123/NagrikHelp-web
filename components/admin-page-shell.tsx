"use client"
import React from 'react'
import clsx from 'clsx'

export interface AdminPageShellProps {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full'
  sectionClassName?: string
  className?: string
  hideHeader?: boolean
}

export default function AdminPageShell({
  title,
  description,
  actions,
  children,
  maxWidth = '7xl',
  sectionClassName,
  className,
  hideHeader
}: AdminPageShellProps) {
  const mwClass = maxWidth === 'full' ? 'max-w-none' : `max-w-${maxWidth}`
  return (
    <main className={clsx('min-h-dvh bg-background transition-colors', className)}>
      <section className={clsx('mx-auto px-6 py-8 space-y-8', mwClass, sectionClassName)}>
        {!hideHeader && (title || description || actions) && (
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2 max-w-prose">
              {title && <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>}
              {description && <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
        )}
        {children}
      </section>
    </main>
  )
}
