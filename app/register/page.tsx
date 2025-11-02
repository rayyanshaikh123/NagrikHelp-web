"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { register as registerApi, persistAuth, mapRoleToFrontend } from "@/services/auth"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      const auth = await registerApi({ name, email, password, phone: phone || undefined })
      persistAuth(auth)
      const role = mapRoleToFrontend(auth.role)
      router.replace(role === "admin" ? "/admin" : "/citizen")
    } catch (e: any) {
      setError(e?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

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
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button onClick={onSubmit} disabled={loading || !name || !email || !password}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Already have an account? <Link className="underline underline-offset-2" href="/login">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
