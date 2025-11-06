"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import * as authService from "@/services/auth"
import { useToast } from "@/hooks/use-toast"
// use namespaced import to avoid named-export resolution issues
// call via `auth.googleSignIn` etc.
// (keeps tree-shaking friendly while avoiding runtime import mismatch)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AuthResponse } from "@/services/auth"
// functions used from auth namespace: auth.register, auth.persistAuth, auth.mapRoleToFrontend, auth.googleSignIn, auth.verifyPhone, auth.resendOtp
import { useEffect, useRef } from "react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [emailConsent, setEmailConsent] = useState(true)
  const [smsConsent, setSmsConsent] = useState(false)
  const [otpNeeded, setOtpNeeded] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const resendTimerRef = useRef<number | null>(null)

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
  const resp = await authService.register({ name, email, password, phone: phone || undefined, emailConsent, smsConsent })
  authService.persistAuth(resp)
      // persist phone locally so profile can display it
      try { if (phone && phone.trim().length > 0) localStorage.setItem('phone', phone) } catch {}
  toast({ title: "Account created", description: `Welcome ${resp.name}` })
      // If SMS consent requested and phone was provided, show OTP input
      if (smsConsent && phone && phone.trim().length > 0) {
        setOtpNeeded(true)
        toast({ title: "OTP sent", description: `A verification code was sent to ${phone}` })
        // user should receive OTP from backend
        return
      }
  const role = authService.mapRoleToFrontend(resp.role)
    router.replace(role === "admin" ? "/admin" : "/citizen")
    } catch (e: any) {
      setError(e?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  async function onVerifyOtp() {
    setError(null)
    try {
  await authService.verifyPhone({ phone, code: otpCode })
      toast({ title: "Phone verified", description: "Your phone number has been verified." })
      router.replace("/citizen")
    } catch (e: any) {
      setError(e?.message || "OTP verify failed")
      toast({ title: "OTP verification failed", description: e?.message || "Invalid code", variant: "destructive" })
    }
  }

  async function onResendOtp() {
    setError(null)
    try {
  const resp: any = await authService.resendOtp({ phone })
      if (resp && resp.ok === false && resp.retryAfter) {
        const seconds = Number(resp.retryAfter) || 60
        setResendCooldown(seconds)
        toast({ title: "Too many requests", description: `Please wait ${seconds}s before retrying`, variant: "destructive" })
        return
      }
      toast({ title: "OTP resent", description: `A new code was sent to ${phone}` })
    } catch (e: any) {
      setError(e?.message || "Resend failed")
      toast({ title: "Resend failed", description: e?.message || "Unable to resend code", variant: "destructive" })
    }
  }

  // countdown effect for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) {
      if (resendTimerRef.current) {
        window.clearInterval(resendTimerRef.current)
        resendTimerRef.current = null
      }
      return
    }
    // start interval
    if (!resendTimerRef.current) {
      resendTimerRef.current = window.setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            if (resendTimerRef.current) {
              window.clearInterval(resendTimerRef.current)
              resendTimerRef.current = null
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (resendTimerRef.current) {
        window.clearInterval(resendTimerRef.current)
        resendTimerRef.current = null
      }
    }
  }, [resendCooldown])

  // Google sign-in button init
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      // @ts-ignore
      if (window.google && googleButtonRef.current) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp: any) => {
            try {
              const authResp = await authService.googleSignIn({ idToken: resp.credential, emailConsent, smsConsent, phone: phone || undefined })
              authService.persistAuth(authResp)
              try { if (phone && phone.trim().length > 0) localStorage.setItem('phone', phone) } catch {}
              toast({ title: 'Signed in with Google', description: `Welcome ${authResp.name}` })
              const role = authService.mapRoleToFrontend(authResp.role)
              router.replace(role === 'admin' ? '/admin' : '/citizen')
            } catch (err: any) {
              setError(err?.message || 'Google sign-in failed')
              toast({ title: 'Google sign-in failed', description: err?.message || 'Unable to sign in', variant: 'destructive' })
            }
          }
        })
        // @ts-ignore
        window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large' })
      }
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [emailConsent, smsConsent, phone, router])

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="p-6 grid gap-4">
            {/* Role is fixed to Citizen */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value="Citizen" readOnly disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-555-5555" />
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
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button onClick={onSubmit} disabled={loading || !name || !email || !password}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <div ref={googleButtonRef} />
            {otpNeeded ? (
              <div className="mt-4">
                <Label htmlFor="otp">Enter OTP sent to {phone}</Label>
                <Input id="otp" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" />
                <div className="flex gap-2 mt-2">
                  <Button onClick={onVerifyOtp}>Verify phone</Button>
                  <Button variant="outline" onClick={onResendOtp} disabled={resendCooldown > 0}>
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}
                  </Button>
                </div>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Already have an account? <Link className="underline underline-offset-2" href="/login">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
