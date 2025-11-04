/**
 * HeroUI Toast Integration Guide
 * 
 * The HeroUI toast system has been integrated with responsive placement:
 * - Mobile (< 768px): top-center with 60px offset
 * - Desktop (≥ 768px): bottom-right with 0px offset
 * 
 * Usage Examples:
 * 
 * 1. Using the custom hook (Recommended):
 * ```tsx
 * import { useHeroToast } from "@/hooks/use-hero-toast"
 * 
 * function MyComponent() {
 *   const { toast, success, error, warning, info } = useHeroToast()
 * 
 *   // Simple success toast
 *   success("Success!", "Your action completed successfully")
 * 
 *   // Error toast
 *   error("Error occurred", "Please try again")
 * 
 *   // Custom toast with options
 *   toast({
 *     title: "Custom Toast",
 *     description: "With custom options",
 *     color: "primary",
 *     variant: "bordered",
 *     radius: "lg",
 *     timeout: 5000,
 *     shouldShowTimeoutProgress: true,
 *   })
 * }
 * ```
 * 
 * 2. Using addToast directly:
 * ```tsx
 * import { addToast } from "@heroui/toast"
 * 
 * function MyComponent() {
 *   const handleClick = () => {
 *     addToast({
 *       title: "Toast Title",
 *       description: "Toast Description",
 *       color: "success",
 *     })
 *   }
 * }
 * ```
 * 
 * Available Colors:
 * - default, primary, secondary, success, warning, danger
 * 
 * Available Variants:
 * - solid, bordered, flat
 * 
 * Available Radius:
 * - none, sm, md, lg, full
 * 
 * Advanced Features:
 * - Promise handling: Show loading state until promise resolves
 * - Custom icons: Pass custom React elements as icons
 * - End content: Add buttons or other elements to the toast
 * - Timeout progress: Visual indicator of how long until toast dismisses
 */

export {}
