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
        toast({
          title: 'Account deleted',
          description: 'Your account and related data were removed.'
        })
        window.location.href = '/register'
      } else if (res.status === 401) {
        toast({
          title: 'Unauthorized',
          description: 'Please login again.',
          variant: 'destructive'
        })
      } else if (res.status === 404) {
        toast({
          title: 'Not found',
          description: 'Account already removed.'
        })
      } else {
        toast({
          title: 'Delete failed',
          description: 'Unexpected response: ' + res.status,
          variant: 'destructive'
        })
      }
    } catch (e:any) {
      toast({
        title: 'Delete failed',
        description: e?.message || 'Request error',
        variant: 'destructive'
      })
    }
  }

  return (
    <CitizenPageShell
      title="Settings"
      description="Manage civic participation preferences. (Pure UI – wiring not implemented.)"
      maxWidth="4xl"
      sectionClassName="space-y-8"
      withDockSpacing
    >
      <Navbar />
      <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Account</h2>
          <span className="inline-flex items-center rounded-full border bg-primary/10 px-3 py-1 text-xs font-medium text-primary">CITIZEN</span>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="font-medium max-w-[60%] truncate" title={userId}>{userId}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium max-w-[60%] truncate" title={name}>{name || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium max-w-[60%] truncate" title={email}>{email || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium">Citizen</span></div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">Profile editing and notification settings coming soon.</p>
      </div>

      <div className="rounded-xl border border-destructive/50 bg-card/60 backdrop-blur-sm p-6 space-y-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground">Delete your account and owned issues. Comments may remain anonymized. This action is destructive and cannot be reversed.</p>
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
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={deleteAccount}>Confirm Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CitizenPageShell>
  )
}
