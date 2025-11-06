"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import * as authService from "@/services/auth"
import { useToast } from "@/hooks/use-toast"
// use auth.googleSignIn below

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [emailConsent] = useState(true)
  const [smsConsent] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      // Basic frontend validations
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      if (!emailValid) {
        setError('Please enter a valid email address.')
        setLoading(false)
        return
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.')
        setLoading(false)
        return
      }
      const authResp = await authService.login({ email, password })
      if (!authResp || !authResp.token) {
        setError('Login failed: invalid credentials or user does not exist.')
        setLoading(false)
        return
      }
      authService.persistAuth(authResp)
      toast({ title: "Signed in", description: `Welcome back, ${authResp.name}` })
      const role = authService.mapRoleToFrontend(authResp.role)
      router.replace(role === "admin" ? "/admin" : "/citizen/public")
    } catch (e: any) {
      // Handle common API error statuses if available
      if (e?.status === 401 || /401/.test(String(e?.message))) {
        setError('Invalid email or password.')
      } else if (e?.status === 404) {
        setError('User not found.')
      } else {
        setError(e?.message || "Login failed")
        toast({ title: "Sign in failed", description: e?.message || "Invalid credentials", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  // (OTP/resend flows removed — reverting to single-step login behavior)

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
              const authResp = await authService.googleSignIn({ idToken: resp.credential, emailConsent, smsConsent })
              authService.persistAuth(authResp)
              toast({ title: 'Signed in with Google', description: `Welcome ${authResp.name}` })
              const role = authService.mapRoleToFrontend(authResp.role)
              router.replace(role === 'admin' ? '/admin' : '/citizen/public')
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
  }, [router, emailConsent, smsConsent])

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: Login form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm">
            <Card>
              <CardContent className="p-6 grid gap-4">
                <h2 className="text-lg font-semibold">Sign in to NagrikHelp</h2>
                <p className="text-sm text-muted-foreground">Access your dashboard, report issues, and manage responses.</p>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button onClick={onSubmit} disabled={loading || !email || !password}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <div ref={googleButtonRef} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  Don&apos;t have an account? <Link className="underline underline-offset-2" href="/register">Register</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: Project information */}
        <aside className="flex items-center">
          <div className="w-full">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">About NagrikHelp</h3>
                <p className="text-sm text-muted-foreground">NagrikHelp is a civic-tech app to allow citizens to report local issues, track progress, and collaborate with municipal teams. It uses modular AI services to analyze reports and suggest categories to help triage incoming issues.</p>

                <div>
                  <h4 className="text-sm font-medium">Key features</h4>
                  <ul className="mt-2 ml-4 list-disc text-sm text-muted-foreground">
                    <li>Report and track civic issues (potholes, waste, signage)</li>
                    <li>AI-assisted issue classification and suggestions</li>
                    <li>Role-based dashboards for administrators and citizens</li>
                    <li>Notifications and reporting tools</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-muted-foreground/10">
                  <p className="text-sm">Developer resources</p>
                  <ul className="mt-2 ml-4 list-none text-sm space-y-1">
                    <li><Link href="/" className="underline">Project home</Link></li>
                    <li><a href="/AI_SETUP_FRONTEND.md" className="underline">AI setup & environment</a></li>
                    <li><Link href="/test-loading" className="underline">Test loading screen</Link></li>
                    <li><a href="https://github.com/rayyanshaikh123/NagrikHelp-web" className="underline" target="_blank" rel="noreferrer">Source on GitHub</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  )
}
