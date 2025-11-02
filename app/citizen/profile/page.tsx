"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CitizenMyIssues from '@/components/citizen-my-issues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import CitizenPageShell from '@/components/citizen-page-shell'

export default function CitizenProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('role')
    if (!token || !role) router.replace('/login')
    else if (role !== 'citizen') router.replace('/admin')
    try {
      setName(localStorage.getItem('name') || '')
      setEmail(localStorage.getItem('email') || '')
    } catch {}
  }, [router])

  const userId = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || 'demo-user-1' : 'demo-user-1'), [])

  return (
    <CitizenPageShell
      title="Profile"
      description="Manage account details and review your submitted civic issues."
      maxWidth="5xl"
      sectionClassName="pb-32 space-y-10"
      className="bg-neutral-50 dark:bg-neutral-900/95"
      withDockSpacing
    >
      <Navbar />
      <div className="space-y-10">
          {/* Profile summary */}
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <Avatar className="size-14 border border-neutral-300 dark:border-neutral-600">
                  <AvatarImage src="/logo/people-together.png" alt={name || 'User'} />
                  <AvatarFallback>{(name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span>Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4 text-sm">
              <div className="grid gap-2">
                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Name</span><span className="font-medium text-neutral-800 dark:text-neutral-100 max-w-[55%] truncate" title={name}>{name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Email</span><span className="font-medium text-neutral-800 dark:text-neutral-100 max-w-[55%] truncate" title={email}>{email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Role</span><span className="font-medium text-neutral-800 dark:text-neutral-100">Citizen</span></div>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">Upcoming: profile editing, notification preferences, data export, and role-based insights.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm" variant="secondary"><Link href="/citizen/my-issues">My Issues</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/citizen/create">Report Issue</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href="/citizen/public">Public Feed</Link></Button>
              </div>
            </CardContent>
          </Card>
          {/* Issues list below in full width */}
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-100">My Issues</CardTitle>
              <Button asChild size="sm" variant="secondary"><Link href="/citizen/create">+ New</Link></Button>
            </CardHeader>
            <CardContent className="pt-0">
              <CitizenMyIssues userId={userId} />
            </CardContent>
          </Card>
      </div>
    </CitizenPageShell>
  )
}
