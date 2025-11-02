import { API_BASE, authFetch } from "./auth"

export type IssueStatus = "pending" | "in-progress" | "resolved"
export type IssueCategory = "POTHOLE" | "GARBAGE" | "STREETLIGHT" | "WATER" | "OTHER"

export type Comment = {
  id: string
  issueId: string
  userId: string
  userName: string
  text: string
  createdAt: number
}

export type Issue = {
  id: string
  title: string
  description: string
  location: string
  photoUrl?: string
  imageBase64?: string
  category?: IssueCategory
  status: IssueStatus
  createdBy: string
  createdById?: string
  createdAt: number
  updatedAt: number
  upVotes?: number
  downVotes?: number
  userVote?: 'UP' | 'DOWN' | null
  commentsCount?: number
  recentComments?: Comment[]
  shareToken?: string
}

// Map backend enum (OPEN/PENDING, IN_PROGRESS, RESOLVED) to FE status strings
function mapStatusFromApi(s: string): IssueStatus {
  const v = s.toUpperCase().replace(/-/g, "_")
  if (v === "OPEN" || v === "PENDING") return "pending"
  if (v === "IN_PROGRESS") return "in-progress"
  if (v === "RESOLVED") return "resolved"
  return "pending"
}

function mapStatusToApi(s: IssueStatus): string {
  if (s === "pending") return "OPEN"
  if (s === "in-progress") return "IN_PROGRESS"
  if (s === "resolved") return "RESOLVED"
  return "OPEN"
}

function fromApi(i: any): Issue {
  let createdByName = ""
  let createdById: string | undefined = undefined
  if (i.createdBy) {
    if (typeof i.createdBy === 'string') createdByName = i.createdBy
    else {
      createdByName = i.createdBy.name || i.createdBy.email || i.createdBy.id || ""
      createdById = i.createdBy.id
    }
  } else if (i.createdByEmail) {
    createdByName = i.createdByEmail
  }
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    location: i.location,
    photoUrl: i.photoUrl || undefined,
    imageBase64: i.imageBase64 || undefined,
    category: i.category || undefined,
    status: mapStatusFromApi(i.status),
    createdBy: createdByName,
    createdById,
    createdAt: typeof i.createdAt === "number" ? i.createdAt : new Date(i.createdAt).getTime(),
    updatedAt: i.updatedAt ?? (i.createdAt ? new Date(i.createdAt).getTime() : Date.now()),
    upVotes: i.upVotes ?? 0,
    downVotes: i.downVotes ?? 0,
    userVote: i.userVote ?? null,
    commentsCount: i.commentsCount ?? 0,
    recentComments: (i.recentComments || []).map((c: any) => ({
      id: c.id,
      issueId: c.issueId,
      userId: c.userId,
      userName: c.userName,
      text: c.text,
      createdAt: c.createdAt,
    })),
    shareToken: i.shareToken || undefined,
  }
}

// Helper to decide fetch function (public vs auth) for endpoints that can return user context
function flexFetch(url: string, init?: RequestInit) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (token) return authFetch(url, init)
  } catch {}
  return fetch(url, init)
}

export async function getIssues(): Promise<Issue[]> {
  const res = await authFetch(`${API_BASE}/api/admin/issues`)
  if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`)
  const data = await res.json()
  return (data as any[]).map(fromApi)
}

export async function getIssuesByUser(_userId: string): Promise<Issue[]> {
  const res = await authFetch(`${API_BASE}/api/citizen/issues`)
  if (!res.ok) throw new Error(`Failed to fetch my issues: ${res.status}`)
  const data = await res.json()
  return (data as any[]).map(fromApi)
}

export async function createIssue(input: {
  title: string
  description: string
  location: string
  category?: IssueCategory
  imageBase64?: string
}): Promise<Issue> {
  const { title, description, location, category, imageBase64 } = input
  // Use Phase 2 endpoint
  const res = await authFetch(`${API_BASE}/api/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, location, category, imageBase64 }),
  })
  if (!res.ok) throw new Error(`Failed to create issue: ${res.status}`)
  const data = await res.json()
  return fromApi(data)
}

export async function updateIssue(id: string, patch: Partial<Issue>): Promise<Issue | undefined> {
  const body: any = {}
  if (patch.status) body.status = mapStatusToApi(patch.status)
  const res = await authFetch(`${API_BASE}/api/admin/issues/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`Failed to update issue: ${res.status}`)
  const data = await res.json()
  return fromApi(data)
}

export async function getPublicIssues(): Promise<Issue[]> {
  const res = await flexFetch(`${API_BASE}/api/issues`)
  if (!res.ok) throw new Error(`Failed to fetch public issues: ${res.status}`)
  const data = await res.json()
  return (data as any[]).map(fromApi)
}

export async function getPublicIssue(id: string): Promise<Issue> {
  const res = await flexFetch(`${API_BASE}/api/issues/${id}`)
  if (!res.ok) throw new Error(`Failed to fetch issue: ${res.status}`)
  const data = await res.json()
  return fromApi(data)
}

// Voting -------------------------------------------------
export async function voteIssue(id: string, value: 'UP' | 'DOWN'): Promise<{ upVotes: number; downVotes: number; userVote: 'UP' | 'DOWN' | null }> {
  const res = await authFetch(`${API_BASE}/api/issues/${id}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  if (!res.ok) throw new Error(`Vote failed: ${res.status}`)
  const data = await res.json()
  return { upVotes: data.upVotes, downVotes: data.downVotes, userVote: data.userVote }
}

// Comments ----------------------------------------------
export async function createComment(issueId: string, text: string): Promise<Comment> {
  const res = await authFetch(`${API_BASE}/api/issues/${issueId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error(`Create comment failed: ${res.status}`)
  const data = await res.json()
  return {
    id: data.id,
    issueId: data.issueId,
    userId: data.userId,
    userName: data.userName,
    text: data.text,
    createdAt: data.createdAt,
  }
}

export async function getComments(issueId: string, page = 0, size = 20): Promise<{ items: Comment[]; total: number; page: number; size: number }> {
  const res = await flexFetch(`${API_BASE}/api/issues/${issueId}/comments?page=${page}&size=${size}`)
  if (!res.ok) throw new Error(`Fetch comments failed: ${res.status}`)
  const data = await res.json()
  return {
    items: (data.items || []).map((c: any) => ({
      id: c.id,
      issueId: c.issueId,
      userId: c.userId,
      userName: c.userName,
      text: c.text,
      createdAt: c.createdAt,
    })),
    total: data.total,
    page: data.page,
    size: data.size,
  }
}

export async function updateCitizenIssue(id: string, patch: Partial<{ title: string; description: string; location: string; category: IssueCategory; imageBase64: string }>): Promise<Issue> {
  const res = await authFetch(`${API_BASE}/api/citizen/issues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`Failed to update issue: ${res.status}`)
  const data = await res.json()
  return fromApi(data)
}

export async function deleteCitizenIssue(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/api/citizen/issues/${id}`, { method: 'DELETE' })
  if (res.status === 204) return
  if (res.status === 404) throw new Error('Issue not found')
  if (!res.ok) throw new Error(`Failed to delete issue: ${res.status}`)
}

export async function followIssueByShareToken(token: string, input: { phone?: string; email?: string; webhookUrl?: string }) {
  const body: any = {}
  if (input.phone) body.phone = input.phone
  if (input.email) body.email = input.email
  if (input.webhookUrl) body.webhookUrl = input.webhookUrl
  const res = await fetch(`${API_BASE}/api/public/issues/${token}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Follow failed: ${res.status}`)
  return fromApi(await res.json())
}

export async function unfollowIssueByShareToken(token: string, input: { phone?: string; email?: string; webhookUrl?: string }) {
  const body: any = {}
  if (input.phone) body.phone = input.phone
  if (input.email) body.email = input.email
  if (input.webhookUrl) body.webhookUrl = input.webhookUrl
  const res = await fetch(`${API_BASE}/api/public/issues/${token}/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Unfollow failed: ${res.status}`)
  return fromApi(await res.json())
}

export async function getSharedIssue(token: string): Promise<Issue> {
  const res = await fetch(`${API_BASE}/api/public/issues/${token}`)
  if (!res.ok) throw new Error(`Shared issue not found: ${res.status}`)
  const data = await res.json()
  // PublicIssueResponse returns limited fields; adapt to Issue shape
  return {
    id: token, // synthetic id for UI
    title: data.title,
    description: data.description,
    location: data.location,
    photoUrl: undefined,
    imageBase64: data.imageBase64,
    category: data.category,
    status: mapStatusFromApi(data.status),
    createdBy: '',
    createdAt: data.createdAt,
    updatedAt: data.createdAt,
    upVotes: data.upvoteCount,
    downVotes: 0,
    userVote: null,
    commentsCount: 0,
    recentComments: [],
    shareToken: token,
  }
}
