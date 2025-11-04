"use client"

import { ToastProvider } from "@heroui/toast"

export default function HeroToastProviderInner({
  placement,
  toastOffset,
}: {
  placement: "top-center" | "bottom-right"
  toastOffset: number
}) {
  return <ToastProvider placement={placement} toastOffset={toastOffset} />
}
