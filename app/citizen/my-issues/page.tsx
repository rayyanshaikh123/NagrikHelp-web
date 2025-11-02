"use client"
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import GlassPanel from '@/components/glass-panel'
import CitizenMyIssues from '@/components/citizen-my-issues'
import CitizenPageShell from '@/components/citizen-page-shell'

export default function CitizenMyIssuesPage() {
  const router = useRouter()
  useEffect(()=>{
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('role')
    if(!token || !role) router.replace('/login')
    else if (role !== 'citizen') router.replace('/admin')
  }, [router])
  const userId = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || 'demo-user-1' : 'demo-user-1'), [])
  return (
    <CitizenPageShell
      title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">My Issues</span>}
      description="Manage and monitor all the civic issues you have reported."
      maxWidth="7xl"
      sectionClassName="pb-32 space-y-8"
      withDockSpacing
    >
      <Navbar />
      <GlassPanel level={2} className="p-6">
        <CitizenMyIssues userId={userId} />
      </GlassPanel>
    </CitizenPageShell>
  )
}
