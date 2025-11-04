"use client"

import { ToastProvider } from "@heroui/toast"
import { useEffect, useState } from "react"

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

  return <ToastProvider placement={placement} toastOffset={toastOffset} />
}
