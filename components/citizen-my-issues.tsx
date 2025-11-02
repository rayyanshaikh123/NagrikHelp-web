"use client"
import useSWR from 'swr'
import { getIssuesByUser } from '@/services/issues'
import IssueCard from '@/components/issue-card'
import DashboardStats from '@/components/dashboard-stats'

export function CitizenMyIssues({ userId, compact = false }: { userId: string; compact?: boolean }) {
  const { data } = useSWR(["my-issues", userId], () => getIssuesByUser(userId))
  const issues = data || []
  return (
    <div className="space-y-4">
      {!compact ? <h2 className="text-lg font-medium">My Issues</h2> : null}
      <DashboardStats issues={issues} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-stretch">
        {issues.map((issue) => (
          <div key={issue.id} className="w-full h-full">
            <IssueCard issue={issue} mode="citizen" ownerMode />
          </div>
        ))}
      </div>
      {issues.length === 0 && (
        <p className="text-sm text-muted-foreground">No issues yet. Use Create to report your first issue.</p>
      )}
    </div>
  )
}
export default CitizenMyIssues
