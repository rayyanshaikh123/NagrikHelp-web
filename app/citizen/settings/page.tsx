"use client"
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import GlassPanel from '@/components/glass-panel'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { API_BASE } from '@/services/auth'
import { useToast } from '@/hooks/use-toast'
import CitizenPageShell from '@/components/citizen-page-shell'

export default function CitizenSettingsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  useEffect(()=>{
    const token = localStorage.getItem('authToken')
    const role = localStorage.getItem('role')
    if(!token || !role) router.replace('/login')
    else if (role !== 'citizen') router.replace('/admin')
    try {
      setName(localStorage.getItem('name') || '')
      setEmail(localStorage.getItem('email') || '')
    } catch {}
  }, [router])
  const userId = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('userId') || 'demo-user-1' : 'demo-user-1'), [])
  const { toast } = useToast()

  async function deleteAccount() {
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`${API_BASE}/api/account`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (res.status === 204) {
        // Clear local auth data
        localStorage.removeItem('authToken')
        localStorage.removeItem('role')
        localStorage.removeItem('name')
        localStorage.removeItem('email')
        localStorage.removeItem('userId')
        toast({ title: 'Account deleted', description: 'Your account and related data were removed.' })
        window.location.href = '/register'
      } else if (res.status === 401) {
        toast({ title: 'Unauthorized', description: 'Please login again.' })
      } else if (res.status === 404) {
        toast({ title: 'Not found', description: 'Account already removed.' })
      } else {
        toast({ title: 'Delete failed', description: 'Unexpected response: ' + res.status })
      }
    } catch (e:any) {
      toast({ title: 'Delete failed', description: e?.message || 'Request error' })
    }
  }

  return (
    <CitizenPageShell
      title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">Settings</span>}
      description="Manage civic participation preferences. (Pure UI – wiring not implemented.)"
      maxWidth="4xl"
      sectionClassName="pb-32 space-y-10"
      withDockSpacing
    >
      <Navbar />
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-6 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-800/60 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">Account</h2>
          <span className="inline-flex items-center rounded-full border border-indigo-300 dark:border-indigo-800 bg-indigo-100 dark:bg-indigo-900/40 px-3 py-1 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">CITIZEN</span>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">User ID</span><span className="font-medium text-slate-800 dark:text-slate-100 max-w-[60%] truncate" title={userId}>{userId}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Name</span><span className="font-medium text-slate-800 dark:text-slate-100 max-w-[60%] truncate" title={name}>{name || '-'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Email</span><span className="font-medium text-slate-800 dark:text-slate-100 max-w-[60%] truncate" title={email}>{email || '-'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Role</span><span className="font-medium text-slate-800 dark:text-slate-100">Citizen</span></div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Profile editing and notification settings coming soon.</p>
      </div>

      <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-800/80 p-6 space-y-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Delete your account and owned issues. Comments may remain anonymized. This action is destructive and cannot be reversed.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your user record, your reported issues, votes and notifications. Comments you wrote may persist without attribution. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={deleteAccount}>Confirm Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CitizenPageShell>
  )
}
