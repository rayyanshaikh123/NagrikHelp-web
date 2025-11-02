"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"

export default function FollowModal({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (data: { email?: string; phone?: string }) => Promise<void> }) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)
    try {
      await onSubmit({ email: email || undefined, phone: phone || undefined })
      onOpenChange(false)
    } catch (e) {
      // swallow; caller shows toast
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Follow issue</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Label>Email (optional)</Label>
          <Input value={email} onChange={(e:any)=>setEmail(e.target.value)} placeholder="you@example.com" />
          <Label>Phone (optional)</Label>
          <Input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+91..." />
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={()=>onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving? 'Saving...' : 'Follow'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
