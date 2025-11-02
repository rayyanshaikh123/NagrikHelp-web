"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import CitizenPageShell from "@/components/citizen-page-shell"
import useSWR from "swr"
import { getPublicIssues, type Issue } from "@/services/issues"
import IssueCard from "@/components/issue-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CATEGORY_LIST = [
  "All",
  "POTHOLE",
  "STREET_LIGHT",
  "GARBAGE",
  "WATER",
  "ROAD",
  "ELECTRICITY",
  "OTHER",
]

export default function PublicPostsPage() {
  const router = useRouter()
  const [category, setCategory] = useState<string>("All")
  const [visible, setVisible] = useState<number>(12)
  const [sortBy, setSortBy] = useState<string>("newest")
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("role")
    if (!token || !role) router.replace("/login")
    else if (role !== "citizen") router.replace("/admin")
  }, [router])

  const { data } = useSWR(["public-issues"], () => getPublicIssues())
  const issues = useMemo(() => (data || []).map((i) => ({ ...i, category: (i.category || "OTHER") })), [data])

  const filtered = useMemo(() => {
    const base = category === "All" ? issues : issues.filter((i) => i.category === category)
    if (sortBy === "votes") return [...base].sort((a, b) => (b.upVotes || 0) - (b.downVotes || 0) - ((a.upVotes || 0) - (a.downVotes || 0)))
    return [...base].sort((a, b) => b.createdAt - a.createdAt)
  }, [issues, category, sortBy])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible((v) => Math.min(v + 9, filtered.length))
      }
    })
    obs.observe(node)
    return () => obs.disconnect()
  }, [filtered.length])

  useEffect(() => {
    // reset visible when filter changes
    setVisible(12)
  }, [category])

  return (
    <CitizenPageShell
      title="Public Issues"
      description="Browse recently reported civic issues. Filter by category and open any card for full detail and activity."
      maxWidth="6xl"
      className="bg-transparent"
      sectionClassName="space-y-8"
      withDockSpacing
    >
      <Navbar />
        <div className="flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-800/50 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Category:</span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48 h-9 bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500 transition">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {CATEGORY_LIST.map((c) => (
                  <SelectItem key={c} value={c} className="text-[13px]">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9 bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-600 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500 transition">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="text-[13px]">Newest</SelectItem>
                <SelectItem value="votes" className="text-[13px]">Most votes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">Showing {Math.min(visible, filtered.length)} of {filtered.length}</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((issue) => (
            <IssueCard key={issue.id} issue={issue} mode="citizen" />
          ))}
        </div>
        <div ref={sentinelRef} />
        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100/60 dark:bg-neutral-800/40 p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">No issues found for this category.</div>
        )}
    </CitizenPageShell>
  )
}
