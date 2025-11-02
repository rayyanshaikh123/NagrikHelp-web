"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export default function Sidebar({ role }: { role: "citizen" | "admin" }) {
  return (
    <aside className="hidden md:block w-64 border-r bg-sidebar text-sidebar-foreground min-h-[calc(100dvh-3.5rem)]">
      <nav className="p-4 space-y-1">
        {role === "citizen" ? (
          <>
            <SidebarLink href="/citizen#report" label="Report an Issue" />
            <SidebarLink href="/citizen#my-issues" label="My Issues" />
          </>
        ) : (
          <>
            <SidebarLink href="/admin" label="All Issues" />
            <SidebarLink href="/admin?status=pending" label="Pending" />
            <SidebarLink href="/admin?status=in-progress" label="In-Progress" />
            <SidebarLink href="/admin?status=resolved" label="Resolved" />
            <SidebarLink href="/admin/management" label="Admin Management" />
            <SidebarLink href="/admin/reports" label="Reports" />
            
          </>
        )}
      </nav>
    </aside>
  )
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  const isActive = typeof window !== "undefined" && window.location?.pathname === href
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      {label}
    </Link>
  )
}
