"use client"
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchNotifications, markNotificationsRead, type NotificationItem } from '@/services/notifications'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConsumeUnread?: (count: number) => void
}

export function NotificationsDialog({ open, onOpenChange, onConsumeUnread }: Props) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [marking, setMarking] = useState(false)

  async function load() {
    setLoading(true)
    try { setItems(await fetchNotifications(unreadOnly)) } catch { /* noop */ } finally { setLoading(false) }
  }

  useEffect(()=>{ if(open) load() }, [open, unreadOnly])

  async function markAllRead() {
    const unreadIds = items.filter(i=>!i.read).map(i=>i.id)
    if (!unreadIds.length) return
    const consumed = unreadIds.length
    setMarking(true)
    try { await markNotificationsRead(unreadIds); await load(); onConsumeUnread?.(consumed) } finally { setMarking(false) }
  }

  // When dialog closes, treat visible unread as consumed (user saw them)
  useEffect(()=>{
    if(!open && items.length){
      const stillUnread = items.filter(i=>!i.read).length
      const consumed = 0 // we only mark explicit consumption on markAllRead
      if(consumed>0) onConsumeUnread?.(consumed)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <span>Notifications</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Switch id="unread-only" checked={unreadOnly} onCheckedChange={v=>setUnreadOnly(!!v)} />
                <Label htmlFor="unread-only" className="text-xs">Unread</Label>
              </div>
              <Button size="sm" variant="outline" onClick={markAllRead} disabled={marking || items.every(i=>i.read)}>
                {marking? 'Marking...' : 'Mark all read'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="border rounded-md h-80 overflow-hidden">
          <ScrollArea className="h-full p-2">
            {loading ? (
              <div className="text-xs text-muted-foreground p-4">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-xs text-muted-foreground p-4">No notifications</div>
            ) : (
              <ul className="space-y-2">
                {items.map(n => (
                  <li key={n.id} className={`p-3 border rounded-md text-xs flex flex-col gap-1 ${!n.read ? 'bg-muted/60' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[12px]">{n.type?.replace('ISSUE_','').replace('_',' ')}</span>
                        {!n.read ? <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">Unread</span> : <span className="text-[10px] text-muted-foreground">Read</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">ID: <span className="font-mono text-[10px]">{n.id}</span></span>
                      </div>
                    </div>
                    <div className="leading-snug whitespace-pre-wrap break-words">{n.message}</div>
                    {n.issueId && (
                      <a href={`/citizen/public/${n.issueId}`} className="text-primary hover:underline mt-1 w-fit">View Issue →</a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
