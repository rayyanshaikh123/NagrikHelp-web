import { API_BASE, authFetch } from './auth'

export type AIValidationResult = {
  isValid: boolean
  suggestedCategory?: string
  confidence: number
  message: string
  provider: string
}

export async function validateIssueImage(imageBase64: string): Promise<AIValidationResult> {
  const res = await authFetch(`${API_BASE}/api/ai/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  })
  if (!res.ok) throw new Error(`AI validation failed: ${res.status}`)
  return res.json()
}
