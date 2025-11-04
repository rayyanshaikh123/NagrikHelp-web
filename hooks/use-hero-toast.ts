import { addToast } from "@heroui/toast"

type ToastOptions = {
  title: string
  description?: string
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  variant?: "solid" | "bordered" | "flat"
  radius?: "none" | "sm" | "md" | "lg" | "full"
  hideIcon?: boolean
  timeout?: number
  shouldShowTimeoutProgress?: boolean
  endContent?: React.ReactNode
  icon?: React.ReactNode
  promise?: Promise<any>
}

export function useHeroToast() {
  const toast = (options: ToastOptions) => {
    return addToast({
      title: options.title,
      description: options.description,
      color: options.color || "default",
      variant: options.variant || "solid",
      radius: options.radius || "lg",
      hideIcon: options.hideIcon,
      timeout: options.timeout,
      shouldShowTimeoutProgress: options.shouldShowTimeoutProgress,
      endContent: options.endContent,
      icon: options.icon,
      promise: options.promise,
    })
  }

  return {
    toast,
    success: (title: string, description?: string) =>
      toast({ title, description, color: "success" }),
    error: (title: string, description?: string) =>
      toast({ title, description, color: "danger" }),
    warning: (title: string, description?: string) =>
      toast({ title, description, color: "warning" }),
    info: (title: string, description?: string) =>
      toast({ title, description, color: "primary" }),
  }
}
