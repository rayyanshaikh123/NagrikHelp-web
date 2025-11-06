export type BackendRole = "CITIZEN" | "ADMIN" | "SUPER_ADMIN"

export type AuthResponse = {
  token: string
  role: BackendRole
  name: string
  email: string
  phone?: string
  phoneVerified?: boolean
}
export type TwoFactorResponse = {
  twoFactorRequired?: boolean
  phone?: string
}

// Default to production Render URL when NEXT_PUBLIC_API_BASE_URL is not set.
// You can override this by setting NEXT_PUBLIC_API_BASE_URL in your environment.
// Resolve API base URL:
// 1) Use explicit NEXT_PUBLIC_API_BASE_URL when provided (recommended)
// 2) When running in the browser on localhost, prefer the local backend at http://localhost:8081
// 3) Otherwise fall back to the production Render URL
let _apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
try {
  if (!_apiBase && typeof window !== "undefined") {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1") {
      _apiBase = "http://localhost:8081"
    }
  }
} catch {}
export const API_BASE = _apiBase || "https://nagrikhelp-backend-u8gj.onrender.com"

async function handleHttpError(resp: Response): Promise<never> {
  // Try to parse JSON body for useful error messages, fall back to status text
  let body: any = null
  try {
    body = await resp.json()
  } catch {
    // ignore parse errors
  }
  const msg = body?.message || body?.errors || `${resp.status} ${resp.statusText}`
  const err = new Error(typeof msg === "string" ? `Request failed: ${msg}` : `Request failed: ${resp.status} ${resp.statusText}`)
  ;(err as any).status = resp.status
  ;(err as any).body = body
  throw err
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) await handleHttpError(res)
  return (await res.json()) as AuthResponse
}

export async function register(input: {
  name: string
  email: string
  password: string
  phone?: string
}): Promise<AuthResponse> {
  // input may include consent flags
  type R = typeof input & { emailConsent?: boolean; smsConsent?: boolean }
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) await handleHttpError(res)
  return (await res.json()) as AuthResponse
}

export async function googleSignIn(input: { idToken: string; emailConsent?: boolean; smsConsent?: boolean; phone?: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) await handleHttpError(res)
  return (await res.json()) as AuthResponse
}

export async function googleSignup(input: { idToken: string; emailConsent?: boolean; smsConsent?: boolean; phone?: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/google/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) await handleHttpError(res)
  return (await res.json()) as AuthResponse
}

export async function verifyPhone(input: { phone: string; code: string }) {
  const res = await fetch(`${API_BASE}/api/auth/verify-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) await handleHttpError(res)
  return (await res.json())
}

export async function verifyLoginOtp(input: { phone: string; code: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/verify-login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) await handleHttpError(res)
  return (await res.json()) as AuthResponse
}

export async function resendOtp(input: { phone: string }) {
  const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (res.ok) {
    return (await res.json())
  }
  // handle rate-limit specially so callers can show cooldown
  if (res.status === 429) {
    // try to parse body for retryAfter, fallback to Retry-After header
    let body: any = null
    try {
      body = await res.json()
    } catch {}
    const header = res.headers.get('Retry-After')
    const retryAfter = (body && body.retryAfter) || (header ? Number(header) : undefined)
    return { ok: false, retryAfter }
  }
  await handleHttpError(res)
  return null
}

export function mapRoleToFrontend(role: BackendRole): "citizen" | "admin" {
  return role === "ADMIN" || role === "SUPER_ADMIN" ? "admin" : "citizen"
}

export function persistAuth(auth: AuthResponse) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (auth.token) window.localStorage.setItem("authToken", auth.token)
      window.localStorage.setItem("role", mapRoleToFrontend(auth.role))
      window.localStorage.setItem("backendRole", auth.role)
      window.localStorage.setItem("name", auth.name)
      window.localStorage.setItem("email", auth.email)
      if (auth.phone) window.localStorage.setItem("phone", auth.phone)
      if (typeof auth.phoneVerified !== 'undefined') window.localStorage.setItem("phoneVerified", String(auth.phoneVerified))
      // Use email as a stable userId for demo data linkage
      window.localStorage.setItem("userId", auth.email)
    }
  } catch {}
}

export function logout() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("authToken")
      window.localStorage.removeItem("role")
      window.localStorage.removeItem("backendRole")
      window.localStorage.removeItem("name")
      window.localStorage.removeItem("email")
      // keep demo issues linkage optional
      // window.localStorage.removeItem("userId")
    }
  } catch {}
}

export function getAuthToken(): string | null {
  try {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem("authToken")
  } catch {
    return null
  }
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAuthToken()
  const headers = new Headers(init.headers || {})
  if (token) headers.set("Authorization", `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}