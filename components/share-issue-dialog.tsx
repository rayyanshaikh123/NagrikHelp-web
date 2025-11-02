"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Issue } from "@/services/issues"
// Replace fragile brand icon imports with stable generic icons
import { Share2, Link as LinkIcon, Mail, Phone, Globe, MessageCircle, Send, Copy } from "lucide-react"

interface Props { issue: Issue; open: boolean; onOpenChange: (v: boolean) => void }

export default function ShareIssueDialog({ issue, open, onOpenChange }: Props) {
  const { toast } = useToast()
  const [link, setLink] = useState("")

  useEffect(() => {
    if (issue?.shareToken && typeof window !== 'undefined') {
      setLink(`${window.location.origin}/share/${issue.shareToken}`)
    } else {
      setLink("")
    }
  }, [issue?.shareToken, open])

  async function copy() {
    if (!link) return
    try { await navigator.clipboard.writeText(link); toast({ title: "Link copied" }) } catch { toast({ title: "Copy failed" }) }
  }

  function systemShare() {
    if (!link) return
    if (navigator.share) {
      navigator.share({ title: issue.title, text: issue.description?.slice(0,100), url: link }).catch(()=>{})
    } else copy()
  }

  if (!open) return null

  const encoded = link ? encodeURIComponent(link) : ""
  const twitterUrl = link ? `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(issue.title || 'Issue')}` : undefined
  const facebookUrl = link ? `https://www.facebook.com/sharer/sharer.php?u=${encoded}` : undefined
  const linkedinUrl = link ? `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` : undefined
  const whatsappUrl = link ? `https://wa.me/?text=${encoded}` : undefined
  const emailHref = link ? `mailto:?subject=${encodeURIComponent('Issue: '+issue.title)}&body=${encoded}` : undefined
  const smsHref = link ? `sms:?&body=${encoded}` : undefined

  function openShare(url?: string) { if (url) { try { window.open(url,'_blank','noopener,noreferrer') } catch {} } }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-2">
            <Label>Shareable Link</Label>
            <div className="flex gap-2">
              <Input value={link} readOnly placeholder="Generating link..." className="text-xs" />
              <Button type="button" onClick={copy} variant="secondary" size="sm" disabled={!link}><Copy className="h-4 w-4" /></Button>
              <Button type="button" onClick={systemShare} variant="secondary" size="sm" disabled={!link}><Share2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid gap-3">
            <Label>Quick Share</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <Button type="button" variant="outline" size="sm" className="h-10 text-[11px]" disabled={!twitterUrl} onClick={()=>openShare(twitterUrl)}>X</Button>
              <Button type="button" variant="outline" size="sm" className="h-10 text-[11px]" disabled={!facebookUrl} onClick={()=>openShare(facebookUrl)}>FB</Button>
              <Button type="button" variant="outline" size="sm" className="h-10 text-[11px]" disabled={!linkedinUrl} onClick={()=>openShare(linkedinUrl)}>IN</Button>
              <Button type="button" variant="outline" size="sm" className="h-10 text-[11px]" disabled={!whatsappUrl} onClick={()=>openShare(whatsappUrl)}>WA</Button>
              <a aria-disabled={!emailHref} href={emailHref || '#'} onClick={e=>{ if(!emailHref) e.preventDefault() }} className={`inline-flex items-center justify-center border rounded-md h-10 text-[11px] ${!emailHref?'opacity-50 pointer-events-none':''}`}> <Mail className="h-4 w-4" /></a>
              <a aria-disabled={!smsHref} href={smsHref || '#'} onClick={e=>{ if(!smsHref) e.preventDefault() }} className={`inline-flex items-center justify-center border rounded-md h-10 text-[11px] ${!smsHref?'opacity-50 pointer-events-none':''}`}> <Phone className="h-4 w-4" /></a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" /> Public link</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Social</span>
            <span className="inline-flex items-center gap-1"><Send className="h-3 w-3" /> Email / SMS</span>
            <span className="inline-flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Copy</span>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
