"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const HeroToastProviderInner = dynamic(() => import("./hero-toast-provider-inner"), {
  ssr: false,
})

export function HeroToastProvider() {
  const [mounted, setMounted] = useState(false)
  const [placement, setPlacement] = useState<"top-center" | "bottom-right">("bottom-right")
  const [toastOffset, setToastOffset] = useState(0)

  useEffect(() => {
    setMounted(true)
    
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

  if (!mounted) return null

  return <HeroToastProviderInner placement={placement} toastOffset={toastOffset} />
}
