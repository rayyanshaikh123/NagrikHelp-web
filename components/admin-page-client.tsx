"use client"

import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import IssueCard from "@/components/issue-card"
import DashboardStats from "@/components/dashboard-stats"
import useSWR from "swr"
import { getIssues, type Issue, updateIssue } from "@/services/issues"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdminMap from "@/components/admin-map"

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null
    if (!token || !role) router.replace("/login")
    else if (role !== "admin") router.replace("/citizen")
  }, [router])

  const { data: allIssues, mutate } = useSWR(["all-issues"], () => getIssues())
  const issues: Issue[] = allIssues || []
  const searchParams = useSearchParams()
  const statusParam = (searchParams?.get("status") || "all").toLowerCase()
  const filter = ["pending", "in-progress", "resolved"].includes(statusParam) ? statusParam : (statusParam === "all" ? "all" : "all")
  const filtered = filter === "all" ? issues : issues.filter(i => i.status === filter)

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <section className="flex-1 p-6 space-y-8">
          <div className="space-y-4">
            <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-5">
              <h2 className="text-lg font-semibold tracking-tight">Admin Dashboard</h2>
              <p className="text-xs text-muted-foreground mb-4">Moderate and track civic issues, update statuses, and view spatial distribution.</p>
              <div className="rounded-lg overflow-hidden border bg-muted/40">
                <AdminMap height={380} issues={filtered} />
              </div>
            </div>
          </div>
          <AdminIssues issues={issues} filtered={filtered} onUpdate={async (id, patch) => { await updateIssue(id, patch); mutate() }} />
        </section>
      </div>
    </main>
  )
}

function AdminIssues({ issues, filtered, onUpdate }: { issues: Issue[]; filtered: Issue[]; onUpdate: (id: string, patch: Partial<Issue>) => Promise<void> }) {
  const counts = {
    all: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    "in-progress": issues.filter((i) => i.status === "in-progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  }

  async function handleUpdate(id: string, patch: Partial<Issue>) { await onUpdate(id, patch) }

  return (
    <div className="space-y-6">
      <DashboardStats issues={issues} />
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card/60 backdrop-blur-sm px-4 py-3 text-sm">
        <span className="text-muted-foreground">Filter:</span>
        <FilterLink label="All" count={counts.all} target="all" />
        <FilterLink label="Pending" count={counts.pending} target="pending" />
        <FilterLink label="In-Progress" count={counts["in-progress"]} target="in-progress" />
        <FilterLink label="Resolved" count={counts.resolved} target="resolved" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((issue) => (
          <IssueCard key={issue.id} issue={issue} mode="admin" onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  )
}

function FilterLink({ label, count, target }: { label: string; count: number; target: string }) {
  const href = `?status=${target}`
  return (
    <a
      href={href}
      className="px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition text-xs font-medium"
    >
      {label} <span className="opacity-60">({count})</span>
    </a>
  )
}
