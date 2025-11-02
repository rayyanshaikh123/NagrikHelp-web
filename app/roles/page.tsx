"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RoleCard } from "@/components/role-card"

export default function RolesPage() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    setRole(typeof window !== "undefined" ? localStorage.getItem("role") : null)
  }, [])

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-14">
      <header className="mb-10 space-y-3">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold tracking-tight">Select a Role</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-prose">Choose how you want to explore NagrikHelp. Citizens submit & track issues. Admins manage the civic resolution workflow.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <RoleCard
          title="Citizen"
          description="Submit location‑aware issues, attach photos, vote & follow progress."
          avatarSrc="/logo/people-together.png"
          avatarFallback="C"
          layout="vertical"
          onSelect={() => router.push('/citizen')}
        />
        <RoleCard
          title="Admin"
          description="Review new reports, update statuses, and ensure timely resolution."
          avatarSrc="/logo/administrator.png"
          avatarFallback="A"
          layout="vertical"
          onSelect={() => router.push('/admin')}
        />
      </div>

      <div className="mt-10">
        <Button variant="ghost" onClick={() => router.push('/')}>← Back to Home</Button>
      </div>
    </main>
  )
}
