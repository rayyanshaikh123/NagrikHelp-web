"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Issue } from "@/services/issues"

export default function DashboardStats({ issues }: { issues: Issue[] }) {
  const pending = issues.filter((i) => i.status === "pending").length
  const inProgress = issues.filter((i) => i.status === "in-progress").length
  const resolved = issues.filter((i) => i.status === "resolved").length

  const stats = [
    { label: "Pending", value: pending },
    { label: "In-Progress", value: inProgress },
    { label: "Resolved", value: resolved },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {stats.map((s) => (
        <Card key={s.label} className="relative overflow-hidden border border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur rounded-xl">
          <CardContent className="p-5 flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
            <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{s.value}</div>
            <div className="absolute inset-px rounded-[11px] pointer-events-none opacity-[0.25] dark:opacity-[0.15] bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.35),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.6),transparent_60%)]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
