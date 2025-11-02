"use client"
// Redirect page replacing previous dashboard
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CitizenLegacyRedirect() {
  const router = useRouter()
  useEffect(()=>{
    // Always send citizens to public feed now
    router.replace('/citizen/public')
  }, [router])
  return null
}
