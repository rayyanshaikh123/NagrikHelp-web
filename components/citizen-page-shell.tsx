"use client"
import React from "react"
import clsx from "clsx"

/**
 * CitizenPageShell
 * A lightweight layout helper to standardize citizen-facing page structure & visual language.
 * Inspired by the issue details page (two-tone background + spacious container + bold heading).
 *
 * Responsibilities:
 * - Provides consistent max-width container + padding
 * - Renders optional header (title / description / actions)
 * - Normalizes vertical rhythm & spacing
 * - Allows per-page width & background overrides
 */
export interface CitizenPageShellProps {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  /** Tailwind max-w size without the prefix (e.g. 6xl) */
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl'
  /** Add an id to main for a11y skip-links */
  id?: string
  /** Extra classNames for outer <main> */
  className?: string
  /** Extra classNames for inner section wrapper */
  sectionClassName?: string
  /** Whether to hide the header block entirely */
  hideHeader?: boolean
  /** Custom header node (overrides title/description/actions auto layout) */
  headerOverride?: React.ReactNode
  /** Compact spacing (smaller top/bottom padding) */
  compact?: boolean
  /** Extra bottom padding to clear floating dock (default true) */
  withDockSpacing?: boolean
}

export function CitizenPageShell({
  title,
  description,
  actions,
  children,
  maxWidth = '6xl',
  id,
  className,
  sectionClassName,
  hideHeader,
  headerOverride,
  compact,
  withDockSpacing = true,
}: CitizenPageShellProps) {
  return (
    <main
      id={id}
      className={clsx(
        "min-h-dvh flex flex-col bg-background text-foreground",
        className
      )}
    >
      <section
        className={clsx(
          `mx-auto max-w-${maxWidth} w-full px-6`,
          compact ? 'py-6 space-y-6' : 'py-10 space-y-8',
          withDockSpacing && 'pb-20 md:pb-24',
          sectionClassName
        )}
      >
        {!hideHeader && (headerOverride || (
          (title || description || actions) && (
            <header className={clsx("flex flex-col gap-3", actions && 'lg:flex-row lg:items-start lg:justify-between')}>              
              <div className="space-y-2 max-w-prose">
                {title && (
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>
              )}
            </header>
          )
        ))}
        {children}
      </section>
    </main>
  )
}

export default CitizenPageShell
