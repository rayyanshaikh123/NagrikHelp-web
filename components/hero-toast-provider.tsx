"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Load the provider from heroui on the client only; fallback to a noop if the export changes
const HerouiToastProvider = dynamic(async () => {
  try {
    const mod = await import("@heroui/toast")
    // Prefer named export; fallback to default if ever changed upstream
    // @ts-ignore - runtime guard
    return mod.ToastProvider ?? mod.default ?? (() => null)
  } catch {
    return () => null
  }
}, { ssr: false })

export function HeroToastProvider() {
  const [placement, setPlacement] = useState<"top-center" | "bottom-right">("bottom-right")
  const [toastOffset, setToastOffset] = useState(0)

  useEffect(() => {
    const updatePlacement = () => {
      const isMobile = window.innerWidth < 768 // md breakpoint
      setPlacement(isMobile ? "top-center" : "bottom-right")
      setToastOffset(isMobile ? 60 : 0)
    }

    // Set initial placement
    updatePlacement()

    // Update on resize
    window.addEventListener("resize", updatePlacement)
    return () => window.removeEventListener("resize", updatePlacement)
  }, [])

  return (
    <div className="fixed z-[100]">
      {/* Use the dynamically-resolved provider to avoid runtime import shape issues */}
      <HerouiToastProvider placement={placement} toastOffset={toastOffset} />
    </div>
  )
}
