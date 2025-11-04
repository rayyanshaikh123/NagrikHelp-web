"use client"

import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { getIssues, type Issue } from "@/services/issues"
import { getMonthlyResolvedReport, type MonthlyResolvedReport, downloadMonthlyResolvedPdf } from "@/services/admin"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useHeroToast } from "@/hooks/use-hero-toast"

export default function ReportsPage() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("role")
    if (!token || !role) router.replace("/login")
    else if (role !== "admin") router.replace("/citizen")
  }, [router])

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <section className="flex-1 p-6 space-y-8">
          <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-5 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground max-w-prose">Visualize issue distribution, creation trends, and generate monthly resolution reports.</p>
          </div>
          <ReportsContent />
        </section>
      </div>
    </main>
  )
}

function ReportsContent() {
  const { data } = useSWR(["all-issues"], () => getIssues())
  const issues: Issue[] = data || []

  const statusData = [
    { status: "Pending", count: issues.filter((i) => i.status === "pending").length },
    { status: "In-Progress", count: issues.filter((i) => i.status === "in-progress").length },
    { status: "Resolved", count: issues.filter((i) => i.status === "resolved").length },
  ]

  const lastNDays = 14
  const today = new Date()
  const days: string[] = [...Array(lastNDays).keys()]
    .map((d) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - (lastNDays - 1 - d)))
    .map((d) => d.toISOString().slice(0, 10))

  const creationsByDay: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]))
  for (const i of issues) {
    const day = new Date(i.createdAt).toISOString().slice(0, 10)
    if (creationsByDay[day] !== undefined) creationsByDay[day]++
  }
  const timelineData = days.map((d) => ({ day: d.slice(5), created: creationsByDay[d] }))

  // Monthly resolved report state
  const now = new Date()
  const [report, setReport] = useState<MonthlyResolvedReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1) // 1-12
  const [reportYear, setReportYear] = useState(now.getFullYear())
  const { success, error, info } = useHeroToast()

  async function generateReport() {
    try {
      setLoadingReport(true)
      const r = await getMonthlyResolvedReport(reportYear, reportMonth)
      setReport(r)
      // Auto trigger PDF download after successful generation
      await downloadMonthlyResolvedPdf(reportYear, reportMonth)
      success("Report generated", `Total resolved: ${r.totalResolved}. Downloading PDF…`)
    } catch (e) {
      console.error(e)
      error("Report generation failed", (e as any)?.message || "Unable to generate report")
    } finally {
      setLoadingReport(false)
    }
  }

  async function downloadPdf() {
    try {
      setLoadingReport(true)
      await downloadMonthlyResolvedPdf(reportYear, reportMonth)
      info("Downloading PDF…")
    } catch (e) {
      console.error(e)
      error("Download failed", (e as any)?.message || "Unable to download PDF")
    } finally {
      setLoadingReport(false)
    }
  }

  const dailyData = report ? report.daily.map(d => ({ date: d.date.slice(8), count: d.count })) : []

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm p-5">
        <h2 className="font-medium mb-3">Issues by Status</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="status" className="text-xs" />
            <YAxis allowDecimals={false} className="text-xs" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.4),transparent_60%)]" />
      </div>
      <div className="relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm p-5">
        <h2 className="font-medium mb-3">Issues Created (Last {lastNDays} Days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" />
            <YAxis allowDecimals={false} className="text-xs" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Line type="monotone" dataKey="created" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_70%_75%,rgba(34,197,94,0.4),transparent_60%)]" />
      </div>
      <div className="relative overflow-hidden rounded-xl border bg-card/60 backdrop-blur-sm p-5 lg:col-span-2 space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Month</label>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Year</label>
            <input
              type="number"
              className="border rounded-md px-3 py-2 w-28 text-sm bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
            />
          </div>
          <Button disabled={loadingReport} onClick={generateReport}>
            {loadingReport ? "Generating..." : "Generate Monthly Report"}
          </Button>
          {report && !loadingReport && (
            <Button variant="outline" onClick={downloadPdf}>Download PDF</Button>
          )}
          {report && (
            <div className="text-sm text-muted-foreground">
              Total Resolved: <span className="font-medium text-foreground">{report.totalResolved}</span>
            </div>
          )}
        </div>
        {report && (
          <div>
            <h2 className="font-medium mb-3">Resolved Issues (Daily)</h2>
            {dailyData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resolved issues this month.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.4),transparent_60%)]" />
      </div>
    </div>
  )
}
