"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { logout as authLogout, getAuthToken } from "@/services/auth"
import { Bell } from "lucide-react"
import { NotificationsDialog } from "@/components/notifications-dialog"
import { fetchUnreadCount } from "@/services/notifications"
import { useToast } from "@/hooks/use-toast"
import { useNotificationStream } from "@/hooks/use-notification-stream"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null)
  const [backendRole, setBackendRole] = useState<string | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    setRole(localStorage.getItem("role"))
    setBackendRole(localStorage.getItem("backendRole"))
  }, [])

  const isCitizen = backendRole === 'CITIZEN'

  // SSE integration (citizen only)
  const sse = useNotificationStream({
    enabled: isCitizen,
    getToken: () => getAuthToken(),
    onNotification: (n) => {
      setUnreadCount(c => c + 1)
      toast({ title: 'New notification', description: n.message })
    },
    onStatusChange: ({ live }) => {
      if (live) {
        fetchUnreadCount().then(c => setUnreadCount(c)).catch(() => { })
      }
    }
  })

  // Fallback polling only if citizen & SSE not live
  useEffect(() => {
    if (!isCitizen) return
    let id: any
    let cancelled = false
    async function pollOnce() {
      try { const c = await fetchUnreadCount(); if (!cancelled) setUnreadCount(c) } catch { }
    }
    if (!sse.live) {
      pollOnce()
      id = setInterval(pollOnce, 30000)
    }
    return () => { cancelled = true; if (id) clearInterval(id) }
  }, [isCitizen, sse.live])

  // Provide callback to dialog to decrement unread count when items opened
  function handleConsumed(unreadDelta: number) {
    if (unreadDelta > 0) setUnreadCount(c => Math.max(0, c - unreadDelta))
  }

  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-end gap-3">
          <ThemeToggle />
          <div className="relative">
            <Button size="sm" variant="ghost" onClick={()=>setNotifOpen(true)} aria-label="Notifications">
              <Bell />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-600 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          {role ? (
            <>
              <span className="text-[11px] px-2 py-1 rounded-md bg-muted border border-border/50 tracking-wide">
                {backendRole || role}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  authLogout()
                  try { localStorage.removeItem("userId") } catch {}
                  window.location.href = "/"
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">Not authenticated</div>
          )}
        </div>
      </header>
      {isCitizen && (
        <NotificationsDialog open={notifOpen} onOpenChange={(v) => setNotifOpen(v)} onConsumeUnread={handleConsumed} />
      )}
    </>
  )
}
