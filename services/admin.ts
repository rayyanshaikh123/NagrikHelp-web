import { API_BASE, authFetch } from "./auth"

export type MonthlyResolvedReport = {
  year: number
  month: number
  totalResolved: number
  daily: { date: string; count: number }[]
}

export async function createAdmin(input: {
  name: string
  email: string
  password: string
  phone?: string
}) {
  const res = await authFetch(`${API_BASE}/api/admin/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`Failed to create admin: ${res.status}`)
  return res.json()
}

export async function getMonthlyResolvedReport(year: number, month: number): Promise<MonthlyResolvedReport> {
  const res = await authFetch(`${API_BASE}/api/admin/reports/monthly-resolved?year=${year}&month=${month}`)
  if (!res.ok) throw new Error(`Failed to fetch monthly report: ${res.status}`)
  return res.json()
}

export async function downloadMonthlyResolvedPdf(year: number, month: number): Promise<void> {
  const res = await authFetch(`${API_BASE}/api/admin/reports/monthly-resolved.pdf?year=${year}&month=${month}`)
  if (!res.ok) throw new Error(`Failed to download pdf: ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `monthly-issue-report-${year}-${String(month).padStart(2,'0')}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
