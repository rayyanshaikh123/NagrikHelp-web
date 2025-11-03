"use client"

// Deprecated: this overlay welcome used to be shown on the root route.
// We replaced it with a dedicated `/welcome` page to avoid duplicate
// welcome flows. Keep a noop component here for backwards compatibility
// (so imports won't crash) but it intentionally renders nothing.

export default function WelcomeSplash(): null {
  if (typeof window !== 'undefined') {
    // Helpful debug log if someone still mounts this component
    // (keeps noise minimal in production)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[welcome-splash] deprecated noop component mounted')
    }
  }
  return null
}
