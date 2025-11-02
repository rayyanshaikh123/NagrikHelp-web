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
    <main className={clsx('min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors', className)}>
      <section className={clsx('mx-auto px-6 py-8 space-y-10', mwClass, sectionClassName)}>
        {!hideHeader && (title || description || actions) && (
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 max-w-prose">
              {title && <h1 className="text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 dark:from-indigo-400 dark:via-sky-400 dark:to-cyan-300">{title}</h1>}
              {description && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
        )}
        {children}
      </section>
    </main>
  )
}
