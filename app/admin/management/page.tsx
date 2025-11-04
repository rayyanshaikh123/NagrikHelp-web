"use client"

import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreateAdminForm from "@/components/create-admin-form"

export default function AdminManagementPage() {
  const router = useRouter()
  const [backendRole, setBackendRole] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const r = localStorage.getItem("role")
    const br = localStorage.getItem("backendRole")
    setRole(r)
    setBackendRole(br)
    if (!token || !r) router.replace("/login")
    else if (r !== "admin") router.replace("/citizen")
  }, [router])

  const isSuper = backendRole === "SUPER_ADMIN"

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <section className="flex-1 p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Admin Management</h1>
            <p className="text-sm text-muted-foreground">Manage administrator accounts and permissions.</p>
          </div>
          {!isSuper ? (
            <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-6">
              <p className="text-sm text-muted-foreground">Only Super Admins can manage admins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-6">
                <CreateAdminForm />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
