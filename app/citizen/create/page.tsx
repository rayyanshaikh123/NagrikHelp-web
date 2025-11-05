"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import ReportIssueForm from '@/components/report-issue-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CitizenPageShell from '@/components/citizen-page-shell'

export default function CitizenCreateIssuePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('demo-user-1')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
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

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <CitizenPageShell
      title="Report an Issue"
      description="Provide clear, concise details and an accurate location to help authorities prioritize and resolve the issue faster."
      maxWidth="5xl"
      sectionClassName="space-y-6"
      withDockSpacing
    >
      <Navbar />
      <Card className="border bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Submission Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ReportIssueForm userId={userId} />
        </CardContent>
      </Card>
    </CitizenPageShell>
  )
}
