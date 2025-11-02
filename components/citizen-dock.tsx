"use client"
import { Dock } from '@/components/dock'
import { usePathname } from 'next/navigation'
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc'

export function CitizenDock({ className }: { className?: string }) {
  const pathname = usePathname()
  let activeLabel: string = 'Home'
  if (pathname.startsWith('/citizen/create')) activeLabel = 'Create'
  else if (pathname.startsWith('/citizen/profile')) activeLabel = 'Profile'
  else if (pathname.startsWith('/citizen/settings')) activeLabel = 'Settings'
  else if (pathname.startsWith('/citizen/public')) activeLabel = 'Home'

  const items = [
    { icon: <VscHome />, label: 'Home', href: '/citizen/public' },
    { icon: <VscArchive />, label: 'Create', href: '/citizen/create' },
    { icon: <VscAccount />, label: 'Profile', href: '/citizen/profile' },
    { icon: <VscSettingsGear />, label: 'Settings', href: '/citizen/settings' },
  ]

  return <div className={className}><Dock items={items} activeLabel={activeLabel} panelHeight={68} baseItemSize={46} magnification={85} /></div>
}

export default CitizenDock
