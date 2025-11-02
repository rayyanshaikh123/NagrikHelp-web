import { authFetch } from './auth'
import { API_BASE } from './auth'

export type NotificationItem = {
  id: string
  issueId?: string
  type: string
  message: string
  createdAt: number
  read: boolean
}

export async function fetchNotifications(unreadOnly = false): Promise<NotificationItem[]> {
  const res = await authFetch(`${API_BASE}/api/citizen/notifications?unreadOnly=${unreadOnly}`)
  if (!res.ok) throw new Error('Failed notifications fetch')
  return await res.json()
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await authFetch(`${API_BASE}/api/citizen/notifications/unread-count`)
  if (!res.ok) return 0
  const data = await res.json()
  return data.unread ?? 0
}

export async function markNotificationsRead(ids: string[]): Promise<number> {
  if (!ids.length) return 0
  const res = await authFetch(`${API_BASE}/api/citizen/notifications/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids)
  })
  if (!res.ok) throw new Error('Failed to mark read')
  const data = await res.json()
  return data.updated ?? 0
}
