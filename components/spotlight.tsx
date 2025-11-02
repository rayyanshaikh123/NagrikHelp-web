"use client"

export function Spotlight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(600px 300px at 20% 10%, hsl(var(--color-brand) / 0.25), transparent 60%), radial-gradient(500px 250px at 80% 0%, hsl(var(--color-accent) / 0.18), transparent 60%)",
      }}
    />
  )
}
