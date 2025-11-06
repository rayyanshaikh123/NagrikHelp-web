"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CitizenMyIssues from '@/components/citizen-my-issues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import CitizenPageShell from '@/components/citizen-page-shell'
import { API_BASE, authFetch } from '@/services/auth'
import * as authService from '@/services/auth'
import { useToast } from '@/hooks/use-toast'

export default function CitizenProfilePage() {
  const router = useRouter()
  const [name, setName] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && window.localStorage.getItem('name')) || '' } catch { return '' }
  })
  const [email, setEmail] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && window.localStorage.getItem('email')) || '' } catch { return '' }
  })
  const [userId, setUserId] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && window.localStorage.getItem('userId')) || 'demo-user-1' } catch { return 'demo-user-1' }
  })
  const [phone, setPhone] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && window.localStorage.getItem('phone')) || '' } catch { return '' }
  })
  const [emailConsent, setEmailConsent] = useState<boolean>(() => {
    try { const v = (typeof window !== 'undefined' && window.localStorage.getItem('emailConsent')); return v == null ? true : v === 'true' } catch { return true }
  })
  const [smsConsent, setSmsConsent] = useState<boolean>(() => {
    try { const v = (typeof window !== 'undefined' && window.localStorage.getItem('smsConsent')); return v == null ? false : v === 'true' } catch { return false }
  })
  const [editing, setEditing] = useState(false)
  const [otpNeeded, setOtpNeeded] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const resendTimerRef = useRef<number | null>(null)
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('role')
    if (!token || !role) router.replace('/login')
    else if (role !== 'citizen') router.replace('/admin')
    // fetch canonical profile from backend
    (async () => {
      setFetchError(null)
      setLoadingProfile(true)
      try {
        // diagnostic: log API_BASE and whether auth token exists
        try { console.debug('[Profile] API_BASE=', API_BASE, 'authTokenPresent=', !!localStorage.getItem('authToken')) } catch {}
        const resp = await authFetch(`${API_BASE}/api/account/me`)
        if (!resp.ok) {
          let text = ''
          try { text = await resp.text() } catch {}
          try { console.debug('[Profile] /api/account/me non-ok', resp.status, text) } catch {}
          const msg = text || `${resp.status} ${resp.statusText}`
          setFetchError(`Profile fetch failed: ${msg}`)
          // fallback to local storage if unauthenticated or error
          setName(localStorage.getItem('name') || '')
          setEmail(localStorage.getItem('email') || '')
          setUserId(localStorage.getItem('userId') || 'demo-user-1')
          setPhone(localStorage.getItem('phone') || '')
          setLoadingProfile(false)
          return
        }
  const data = await resp.json()
  try { console.debug('[Profile] /api/account/me response', data) } catch {}
        setName(data.name || localStorage.getItem('name') || '')
        setEmail(data.email || localStorage.getItem('email') || '')
        setPhone(data.phone || localStorage.getItem('phone') || '')
        setEmailConsent(data.emailConsent ?? true)
        setSmsConsent(data.smsConsent ?? false)
        setUserId(data.email || localStorage.getItem('userId') || 'demo-user-1')
      } catch (e: any) {
        setFetchError(String(e?.message || e || 'Unknown error'))
        try {
          setName(localStorage.getItem('name') || '')
          setEmail(localStorage.getItem('email') || '')
          setUserId(localStorage.getItem('userId') || 'demo-user-1')
          setPhone(localStorage.getItem('phone') || '')
        } catch {}
      } finally {
        setLoadingProfile(false)
      }
    })()
  }, [router])

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return null
  }

  return (
    <CitizenPageShell
      title="Profile"
      description="Manage account details and review your submitted civic issues."
      maxWidth="5xl"
      sectionClassName="space-y-8"
      withDockSpacing
    >
      <Navbar />
      <div className="space-y-6">
          {/* Profile summary */}
          <Card className="border bg-card/60 backdrop-blur-sm shadow-sm flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-3">
                <Avatar className="size-14 border">
                  <AvatarImage src="/logo/people-together.png" alt={name || 'User'} />
                  <AvatarFallback>{(name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4 text-sm">
              <div className="grid gap-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium max-w-[55%] truncate" title={name}>{name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium max-w-[55%] truncate" title={email}>{email || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium max-w-[55%] truncate" title={phone}>{phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email notifications</span><span className="font-medium">{emailConsent ? 'Enabled' : 'Disabled'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SMS notifications</span><span className="font-medium">{smsConsent ? 'Enabled' : 'Disabled'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium">Citizen</span></div>
              </div>
                <p className="text-xs leading-relaxed text-muted-foreground">Manage notification preferences and phone verification here.</p>
                {loadingProfile ? <p className="text-sm text-muted-foreground">Loading profile...</p> : null}
                {fetchError ? (
                  <div className="p-3 rounded border border-red-200 bg-red-50">
                    <div className="text-sm text-red-700">{fetchError}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => {
                        // retry by reloading the page
                        window.location.reload()
                      }}>Retry</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        try { authService.logout() } catch {}
                        router.replace('/login')
                      }}>Sign out / Re-login</Button>
                    </div>
                  </div>
                ) : null}
                {!editing ? (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => setEditing(true)}>Edit profile</Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={phone || ''} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-555-5555" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} />
                        <span className="text-sm">Allow email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} />
                        <span className="text-sm">Allow SMS notifications</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={async () => {
                        // save profile with basic client-side validation
                        try {
                          const phoneRegex = /^\+\d{7,15}$/
                          if (phone && phone.trim().length > 0 && !phoneRegex.test(phone.trim())) {
                            toast({ title: 'Invalid phone', description: 'Phone must be in international format, e.g. +15551234567', variant: 'destructive' })
                            return
                          }
                          const body = { phone: phone || null, emailConsent, smsConsent }
                          const res = await authFetch(`${API_BASE}/api/account/me`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                          if (!res.ok) {
                            const text = await res.text()
                            toast({ title: 'Save failed', description: text || 'Unable to save profile', variant: 'destructive' })
                            return
                          }
                          const data = await res.json()
                          setName(data.name || name)
                          setEmail(data.email || email)
                          setPhone(data.phone || phone)
                          setEmailConsent(data.emailConsent ?? emailConsent)
                          setSmsConsent(data.smsConsent ?? smsConsent)
                          try { if (data.phone) localStorage.setItem('phone', data.phone) } catch {}
                          // if phone exists but not verified, server likely sent OTP
                          if (data.phone && !data.phoneVerified) {
                            setOtpNeeded(true)
                            toast({ title: 'OTP sent', description: `A verification code was sent to ${data.phone}` })
                          } else {
                            setEditing(false)
                            toast({ title: 'Profile saved', description: 'Your account was updated.' })
                          }
                        } catch (err: any) {
                          toast({ title: 'Save failed', description: err?.message || 'Unable to save profile', variant: 'destructive' })
                        }
                      }}>Save</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
                {otpNeeded ? (
                  <div className="mt-4">
                    <Label htmlFor="otp">Enter OTP sent to {phone}</Label>
                    <Input id="otp" className="mt-1" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={async () => {
                        try {
                          await authService.verifyPhone({ phone, code: otpCode })
                          toast({ title: 'Phone verified', description: 'Your phone number has been verified.' })
                          setOtpNeeded(false)
                          // refresh profile
                          const resp = await authFetch(`${API_BASE}/api/account/me`)
                          if (resp.ok) {
                            const d = await resp.json()
                            setPhone(d.phone || phone)
                            setSmsConsent(d.smsConsent ?? smsConsent)
                          }
                        } catch (e: any) {
                          toast({ title: 'OTP verification failed', description: e?.message || 'Invalid code', variant: 'destructive' })
                        }
                      }}>Verify phone</Button>
                      <Button variant="outline" onClick={async () => {
                        try {
                          const r = await authService.resendOtp({ phone })
                          if (r && r.ok === false && r.retryAfter) {
                            const seconds = Number(r.retryAfter) || 60
                            setResendCooldown(seconds)
                            toast({ title: 'Too many requests', description: `Please wait ${seconds}s before retrying`, variant: 'destructive' })
                            return
                          }
                          toast({ title: 'OTP resent', description: `A new code was sent to ${phone}` })
                        } catch (e: any) {
                          toast({ title: 'Resend failed', description: e?.message || 'Unable to resend code', variant: 'destructive' })
                        }
                      }} disabled={resendCooldown > 0}>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}</Button>
                    </div>
                  </div>
                ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm" variant="secondary"><Link href="/citizen/my-issues">My Issues</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/citizen/create">Report Issue</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/citizen/public">Public Feed</Link></Button>
              </div>
            </CardContent>
          </Card>
          {/* Issues list below in full width */}
          <Card className="border bg-card/60 backdrop-blur-sm shadow-sm flex flex-col">
            <CardHeader className="pb-4 flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg font-medium">My Issues</CardTitle>
              <Button asChild size="sm" variant="secondary"><Link href="/citizen/create">+ New</Link></Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CitizenMyIssues userId={userId} />
            </CardContent>
          </Card>
      </div>
    </CitizenPageShell>
  )
}
