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

export default function ReportsPage() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("role")
    if (!token || !role) router.replace("/login")
    else if (role !== "admin") router.replace("/citizen")
  }, [router])

  return (
    <main className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <section className="flex-1 p-6 space-y-10">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 dark:from-indigo-400 dark:via-sky-400 dark:to-cyan-300">Reports & Analytics</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-prose">Visualize issue distribution, creation trends, and generate monthly resolution reports.</p>
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

  async function generateReport() {
    try {
      setLoadingReport(true)
      const r = await getMonthlyResolvedReport(reportYear, reportMonth)
      setReport(r)
      // Auto trigger PDF download after successful generation
      await downloadMonthlyResolvedPdf(reportYear, reportMonth)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingReport(false)
    }
  }

  async function downloadPdf() {
    try {
      setLoadingReport(true)
      await downloadMonthlyResolvedPdf(reportYear, reportMonth)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingReport(false)
    }
  }

  const dailyData = report ? report.daily.map(d => ({ date: d.date.slice(8), count: d.count })) : []

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur p-5">
        <h2 className="font-medium mb-2 text-slate-800 dark:text-slate-100">Issues by Status</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.7),transparent_60%)]" />
      </div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur p-5">
        <h2 className="font-medium mb-2 text-slate-800 dark:text-slate-100">Issues Created (Last {lastNDays} Days)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="created" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_70%_75%,rgba(34,197,94,0.5),transparent_60%)]" />
      </div>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur p-5 lg:col-span-2 space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              className="border rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/40"
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-28 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/40"
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
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Resolved: <span className="font-medium text-foreground">{report.totalResolved}</span>
            </div>
          )}
        </div>
        {report && (
          <div>
            <h2 className="font-medium mb-2 text-slate-800 dark:text-slate-100">Resolved Issues (Daily)</h2>
            {dailyData.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No resolved issues this month.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
        <div className="absolute inset-px rounded-[15px] pointer-events-none opacity-[0.05] bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.6),transparent_60%)]" />
      </div>
    </div>
  )
}
