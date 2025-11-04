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
        <Card key={s.label} className="relative overflow-hidden border bg-card/60 backdrop-blur-sm rounded-xl">
          <CardContent className="p-5 flex flex-col gap-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{s.label}</div>
            <div className="text-3xl font-semibold">{s.value}</div>
            <div className="absolute inset-px rounded-[11px] pointer-events-none opacity-[0.15] bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.4),transparent_60%)]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
