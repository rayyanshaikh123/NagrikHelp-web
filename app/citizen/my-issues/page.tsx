"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import GlassPanel from '@/components/glass-panel'
import CitizenMyIssues from '@/components/citizen-my-issues'
import CitizenPageShell from '@/components/citizen-page-shell'

export default function CitizenMyIssuesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('demo-user-1')
  const [mounted, setMounted] = useState(false)
  
  useEffect(()=>{
    setMounted(true)
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('role')
    if(!token || !role) router.replace('/login')
    else if (role !== 'citizen') router.replace('/admin')
    setUserId(localStorage.getItem('userId') || 'demo-user-1')
  }, [router])
  
  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }
  
  return (
    <CitizenPageShell
      title="My Issues"
      description="Manage and monitor all the civic issues you have reported."
      maxWidth="7xl"
      sectionClassName="space-y-6"
      withDockSpacing
    >
      <Navbar />
      <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-6 shadow-sm">
        <CitizenMyIssues userId={userId} />
      </div>
    </CitizenPageShell>
  )
}
