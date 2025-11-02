"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR, { useSWRConfig } from "swr"
import { getPublicIssue, type Issue, voteIssue, createComment, getComments } from "@/services/issues"
import dynamic from "next/dynamic"
import { API_BASE } from "@/services/auth"

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false })
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false })
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false })
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false })

function locationToLatLng(loc: string, base: [number, number] = [20.5937, 78.9629]): [number, number] {
  let h1 = 0, h2 = 0
  for (let i = 0; i < loc.length; i++) { const c = loc.charCodeAt(i); h1 = (h1 * 31 + c) % 1000; h2 = (h2 * 17 + c) % 1000 }
  const lat = base[0] + ((h1 / 1000) * 6 - 3)
  const lng = base[1] + ((h2 / 1000) * 6 - 3)
  return [lat, lng]
}

export default function PublicIssueDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("role")
    if (!token || !role) router.replace("/login")
    else if (role !== "citizen") router.replace("/admin")
  }, [router])

  const { data } = useSWR(id ? ["public-issue", id] : null, () => getPublicIssue(id as string))
  const issue: Issue | undefined = data

  const { mutate: globalMutate } = useSWRConfig()
  const [voteLoading, setVoteLoading] = useState(false)

  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<{ id: string; userName: string; text: string; createdAt: number }[]>([])
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [loadingComments, setLoadingComments] = useState(false)
  const [postingComment, setPostingComment] = useState(false)

  const leafletConfiguredRef = useRef(false)
  useEffect(() => {
    if (typeof window === 'undefined' || leafletConfiguredRef.current) return
    import('leaflet').then((L) => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
      })
      leafletConfiguredRef.current = true
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (issue) {
      const initial = (issue.recentComments || []).map((c) => ({ id: c.id, userName: c.userName, text: c.text, createdAt: c.createdAt }))
      setComments(initial)
      setCommentsTotal(issue.commentsCount || initial.length)
    }
  }, [issue])

  async function loadMore() {
    if (!issue) return
    if (comments.length >= commentsTotal) return
    setLoadingComments(true)
    try {
      const nextPage = page
      const res = await getComments(issue.id, nextPage, pageSize)
      if (nextPage === 0) {
        setComments(res.items.map((c) => ({ id: c.id, userName: c.userName, text: c.text, createdAt: c.createdAt })))
      } else {
        setComments((prev) => [...prev, ...res.items.map((c) => ({ id: c.id, userName: c.userName, text: c.text, createdAt: c.createdAt }))])
      }
      setCommentsTotal(res.total)
      setPage(nextPage + 1)
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    if (issue && comments.length < (issue.commentsCount || 0)) {
      setPage(1)
    }
  }, [issue, comments.length])

  async function handleVote(v: 'UP' | 'DOWN') {
    if (!issue || voteLoading) return
    setVoteLoading(true)
    try {
      const result = await voteIssue(issue.id, v)
      globalMutate(["public-issue", issue.id], (prev: any) => prev ? { ...prev, upVotes: result.upVotes, downVotes: result.downVotes, userVote: result.userVote } : prev, false)
      globalMutate(["public-issues"], (prev: any) => Array.isArray(prev) ? prev.map((it) => it.id === issue.id ? { ...it, upVotes: result.upVotes, downVotes: result.downVotes, userVote: result.userVote } : it) : prev, false)
    } catch {/* ignore */} finally {
      setVoteLoading(false)
    }
  }

  async function submitComment() {
    if (!issue || !commentText.trim() || postingComment) return
    setPostingComment(true)
    try {
      const created = await createComment(issue.id, commentText.trim())
      setComments((prev) => [{ id: created.id, userName: created.userName, text: created.text, createdAt: created.createdAt }, ...prev])
      setCommentsTotal((t) => t + 1)
      setCommentText("")
      globalMutate(["public-issue", issue.id], (prev: any) => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev, false)
      globalMutate(["public-issues"], (prev: any) => Array.isArray(prev) ? prev.map((it) => it.id === issue.id ? { ...it, commentsCount: (it.commentsCount || 0) + 1 } : it) : prev, false)
    } catch {/* ignore */} finally {
      setPostingComment(false)
    }
  }

  useEffect(() => {
    if (!issue?.id) return
    let closed = false
    const src = new EventSource(`${API_BASE}/api/issues/${issue.id}/stream`)

    function safeParse(data: string) {
      try { return JSON.parse(data) } catch { return null }
    }

    src.addEventListener("vote", (evt) => {
      if (closed) return
      const payload = safeParse((evt as MessageEvent).data)
      if (!payload || payload.issueId !== issue.id) return
      globalMutate(["public-issue", issue.id], (prev: any) => prev ? { ...prev, upVotes: payload.upVotes, downVotes: payload.downVotes } : prev, false)
      globalMutate(["public-issues"], (prev: any) => Array.isArray(prev) ? prev.map((it) => it.id === issue.id ? { ...it, upVotes: payload.upVotes, downVotes: payload.downVotes } : it) : prev, false)
    })

    src.addEventListener("comment", (evt) => {
      if (closed) return
      const payload = safeParse((evt as MessageEvent).data)
      if (!payload || payload.issueId !== issue.id) return
      const c = payload.comment
      if (!c) return
      setComments((prev) => prev.find((pc) => pc.id === c.id) ? prev : [{ id: c.id, userName: c.userName, text: c.text, createdAt: c.createdAt }, ...prev])
      setCommentsTotal(payload.commentsCount || ((prev) => prev + 1))
      globalMutate(["public-issue", issue.id], (prev: any) => prev ? { ...prev, commentsCount: payload.commentsCount } : prev, false)
      globalMutate(["public-issues"], (prev: any) => Array.isArray(prev) ? prev.map((it) => it.id === issue.id ? { ...it, commentsCount: payload.commentsCount } : it) : prev, false)
    })

    src.onerror = () => {
      // Allow browser to attempt reconnect automatically. If it closes, we clean up.
    }

    return () => { closed = true; src.close() }
  }, [issue?.id, globalMutate])

  const up = issue?.upVotes ?? 0
  const down = issue?.downVotes ?? 0
  const userVote = issue?.userVote as ('UP' | 'DOWN' | null)

  const center = useMemo(() => (issue ? locationToLatLng(issue.location || "") : [20.5937, 78.9629] as [number, number]), [issue])

  if (!issue) {
    return (
      <main className="min-h-dvh">
        <Navbar />
        <section className="mx-auto max-w-4xl p-6">
          <div className="text-sm text-muted-foreground">Loading issue...</div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <Navbar />
  <section className="mx-auto max-w-6xl p-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left column: media + map */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {issue.imageBase64 || issue.photoUrl ? (
            <img
              src={(issue.imageBase64 || issue.photoUrl) || "/placeholder.svg"}
              alt="Issue"
              className="w-full h-60 object-cover"
            />
          ) : (
            <div className="w-full h-60 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              No image provided
            </div>
          )}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Reported: {new Date(issue.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              By: {issue.createdBy || "Unknown"}
            </div>
          </div>
        </div>

        <div className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="p-2">
            <div className="font-medium mb-2 text-slate-800 dark:text-slate-100">Location</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {issue.location || "Not provided"}
            </div>
            <div className="h-48 w-full overflow-hidden rounded-md">
              <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={center}>
                  <Popup>{issue.location}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Right column: main details and actions */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{issue.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              {issue.category ? (
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-sm">
                  {issue.category}
                </span>
              ) : null}

              <span
                role="status"
                aria-label={`Status: ${issue.status}`}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  issue.status === 'resolved'
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                    : issue.status === 'in-progress'
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                }`}
              >
                {issue.status === 'resolved'
                  ? 'Resolved'
                  : issue.status === 'in-progress'
                  ? 'In Progress'
                  : 'Pending'}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Issue ID: {issue.id}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={userVote === "UP" ? "default" : "secondary"}
                onClick={() => handleVote("UP")}
                disabled={voteLoading}
              >
                Upvote
              </Button>
              <Button
                size="sm"
                variant={userVote === "DOWN" ? "default" : "secondary"}
                onClick={() => handleVote("DOWN")}
                disabled={voteLoading}
              >
                Downvote
              </Button>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Votes: <span className="font-medium text-slate-900 dark:text-white">{up - down}</span>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="font-medium text-slate-800 dark:text-slate-100">Description</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-4 space-y-3">
            <div className="font-medium text-slate-800 dark:text-slate-100">
              Comments ({commentsTotal})
            </div>
            <div className="space-y-2">
              {comments.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No comments yet.
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-700/40"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {c.userName} • {new Date(c.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-800 dark:text-slate-100">{c.text}</div>
                  </div>
                ))
              )}
            </div>

            {comments.length < commentsTotal && (
              <Button size="sm" onClick={loadMore} disabled={loadingComments}>
                Load more
              </Button>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment"
                className="dark:bg-slate-900 dark:text-white"
              />
              <Button size="sm" onClick={submitComment} disabled={postingComment}>
                Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</main>

  )
}
