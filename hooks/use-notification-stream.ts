"use client"
import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '@/services/auth'

export interface NotificationEvent {
  id: string
  issueId?: string | null
  type: string
  message: string
  createdAt: number
  read: boolean
}

interface Options {
  enabled: boolean
  getToken: () => string | null
  onNotification?: (n: NotificationEvent) => void
  onStatusChange?: (s: { live: boolean; failures: number }) => void
  heartbeatMs?: number
  idleTimeoutMs?: number
}

// SSE based notification stream with auto-reconnect + cooldown fallback
export function useNotificationStream(opts: Options) {
  const { enabled, getToken, onNotification, onStatusChange, heartbeatMs = 25000, idleTimeoutMs = 60000 } = opts
  const [live, setLive] = useState(false)
  const [failures, setFailures] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [lastEventTs, setLastEventTs] = useState<number | null>(null)

  const esRef = useRef<EventSource | null>(null)
  const hbTimer = useRef<any>()
  const idleTimer = useRef<any>()
  const reconnectTimer = useRef<any>()

  function cleanup() {
    if (hbTimer.current) clearInterval(hbTimer.current)
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    if (esRef.current) { esRef.current.close(); esRef.current = null }
  }

  function scheduleIdleGuard() {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      // No events within idle window -> force reconnect
      forceReconnect()
    }, idleTimeoutMs)
  }

  function forceReconnect() {
    cleanup()
    setLive(false)
    connect(true)
  }

  function connect(isRetry = false) {
    if (!enabled) { cleanup(); return }
    if (cooldownUntil && Date.now() < cooldownUntil) return
    const token = getToken()
    if (!token) return

    try {
      const base = (API_BASE || (typeof window !== 'undefined' ? window.location.origin : ''))
      const url = `${base}/api/citizen/notifications/stream?token=${encodeURIComponent(token)}`
      const es = new EventSource(url)
      esRef.current = es

      es.onopen = () => {
        setLive(true)
        setLastEventTs(Date.now())
        if (isRetry === true) {
          // successful reconnect -> reset failures
          setFailures(0)
        }
        scheduleIdleGuard()
        if (onStatusChange) onStatusChange({ live: true, failures })
      }

      es.onmessage = (ev) => {
        // unnamed events (fallback) treat as heartbeat
        setLastEventTs(Date.now())
        scheduleIdleGuard()
      }

      es.addEventListener('ping', () => {
        setLastEventTs(Date.now())
        scheduleIdleGuard()
      })

      es.addEventListener('notification', (ev: MessageEvent) => {
        try {
          const data: NotificationEvent = JSON.parse(ev.data)
          setLastEventTs(Date.now())
          scheduleIdleGuard()
          if (onNotification) onNotification(data)
        } catch { /* ignore parse */ }
      })

      es.onerror = () => {
        // Connection lost
        cleanup()
        setLive(false)
        setFailures(f => {
          const next = f + 1
          if (onStatusChange) onStatusChange({ live: false, failures: next })
          // Backoff sequence 1s,3s,5s,10s
          let delay = 1000
          if (next === 2) delay = 3000
          else if (next === 3) delay = 5000
          else if (next >= 4) delay = 10000
          if (next > 3) {
            // After 4+ consecutive failures, enter 5 min cooldown and allow polling fallback
            setCooldownUntil(Date.now() + 5 * 60 * 1000)
          } else {
            reconnectTimer.current = setTimeout(() => connect(true), delay)
          }
          return next
        })
      }

      // Heartbeat (client side) - we just send no-op by re-evaluating idle guard
      hbTimer.current = setInterval(() => {
        // if no events for idleTimeoutMs already, forceReconnect will be scheduled
        if (lastEventTs && Date.now() - lastEventTs > idleTimeoutMs) {
          forceReconnect()
        }
      }, heartbeatMs)

    } catch (e) {
      // immediate failure -> schedule retry
      setFailures(f => f + 1)
      reconnectTimer.current = setTimeout(() => connect(true), 2000)
    }
  }

  useEffect(() => {
    connect(false)
    return () => cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // If cooldown expires, attempt reconnect
  useEffect(() => {
    if (cooldownUntil) {
      const timer = setInterval(() => {
        if (cooldownUntil && Date.now() >= cooldownUntil) {
          setCooldownUntil(null)
          setFailures(0)
          connect(true)
        }
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [cooldownUntil])

  return { live, failures, cooldown: !!cooldownUntil }
}
