"use client"

// Deprecated debug button — kept as a noop so imports won't break in older branches.
export default function DebugWelcomeButton(): null {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[debug-welcome] noop component mounted (debug button removed)')
  }
  return null
}
