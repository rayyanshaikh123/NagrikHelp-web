"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import ReportIssueForm from '@/components/report-issue-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CitizenPageShell from '@/components/citizen-page-shell'

export default function CitizenCreateIssuePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('role')
    if (!token || !role) {
      router.replace('/login')
      return
    }
    if (role !== 'citizen') {
      router.replace('/admin')
      return
    }
    setUserId(localStorage.getItem('userId') || 'demo-user-1')
  }, [router])

  return (
    <CitizenPageShell
      title="Report an Issue"
      description="Provide clear, concise details and an accurate location to help authorities prioritize and resolve the issue faster."
      maxWidth="5xl"
      sectionClassName="space-y-6"
      withDockSpacing
    >
      <Navbar />
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-100">Submission Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ReportIssueForm userId={userId} />
        </CardContent>
      </Card>
    </CitizenPageShell>
  )
}
