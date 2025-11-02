"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { login as loginApi, persistAuth, mapRoleToFrontend } from "@/services/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      const auth = await loginApi({ email, password })
      persistAuth(auth)
      const role = mapRoleToFrontend(auth.role)
      router.replace(role === "admin" ? "/admin" : "/citizen/public")
    } catch (e: any) {
      setError(e?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="p-6 grid gap-4">
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
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account? <Link className="underline underline-offset-2" href="/register">Register</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
