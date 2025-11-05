import { NextRequest } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

// Helper functions
function stripDataUrl(dataUrl: string) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  return { base64 }
}

// Map AI categories to our IssueCategory types
function mapAiCategoryToIssueCategory(aiCategory: string): string {
  const mapping: Record<string, string> = {
    'POTHOLE': 'POTHOLE',
    'GARBAGE': 'GARBAGE',
    'STREETLIGHT': 'STREETLIGHT',
    'WATER': 'WATER',
    'ELECTRICITY': 'OTHER',
    'OTHER': 'OTHER'
  }
  return mapping[aiCategory] || 'OTHER'
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  try {
    const body = await req.json()
    if (!body?.imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 required' }), { status: 400 })
    }

    const { base64 } = stripDataUrl(body.imageBase64)
    const imageBuf = Buffer.from(base64, 'base64')

    if (imageBuf.length > 2_000_000) {
      return new Response(JSON.stringify({ error: 'Image too large' }), { status: 413 })
    }

    // In-memory cache
    const globalAny = global as any
    if (!globalAny.__ai_cache) globalAny.__ai_cache = new Map<string, any>()
    const cache: Map<string, any> = globalAny.__ai_cache
    const hash = crypto.createHash('sha256').update(imageBuf).digest('hex')

    const cacheHit = cache.get(hash)
    if (cacheHit && cacheHit.expires > Date.now()) {
      return new Response(JSON.stringify(cacheHit.data), { status: 200 })
    }

    let success = false
    const attempts: any[] = []
    let finalResult: any = null

    // Use globalThis to access environment variables
    const LOCAL_URL = ((globalThis as any).process?.env?.LOCAL_VISION_URL as string | undefined)?.trim()
    const LOCAL_TIMEOUT_MS = Number((globalThis as any).process?.env?.LOCAL_VISION_TIMEOUT_MS) || 30000
    
    // 1) Try local vision server's /validate endpoint (new multi-model pipeline)
    if (LOCAL_URL && LOCAL_URL.length > 0) {
      const t0 = Date.now()
      try {
        const ac = new AbortController()
        const to = setTimeout(() => ac.abort(), LOCAL_TIMEOUT_MS)
        
        const resp = await fetch(`${LOCAL_URL.replace(/\/$/, '')}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: body.imageBase64,
            description: body.description || ''
          }),
          signal: ac.signal,
        })
        
        clearTimeout(to)
        
        if (resp.ok) {
          const data = await resp.json()
          
          // Transform response to match frontend expectations
          const mappedCategory = mapAiCategoryToIssueCategory(data.category)
          
          finalResult = {
            isValid: data.isIssue,
            suggestedCategory: mappedCategory,
            confidence: data.confidence,
            message: data.message,
            rawLabels: data.rawLabels || [],
            latencyMs: Date.now() - start,
            bbox: data.bbox,
            modelUsed: data.modelUsed,
            debug: data.debug
          }
          
          success = true
          attempts.push({ 
            source: 'local-validation-server', 
            ok: true, 
            ms: Date.now() - t0, 
            status: resp.status 
          })
        } else {
          const text = await resp.text()
          attempts.push({ 
            source: 'local-validation-server', 
            ok: false, 
            ms: Date.now() - t0, 
            status: resp.status, 
            error: text.slice(0, 140) 
          })
        }
      } catch (e: any) {
        attempts.push({ 
          source: 'local-validation-server', 
          ok: false, 
          error: e?.name === 'AbortError' ? 'timeout' : (e?.message || 'error') 
        })
      }
    }

    // 2) Fallback: Try legacy /classify endpoint if /validate failed
    if (!success && LOCAL_URL && LOCAL_URL.length > 0) {
      const t0 = Date.now()
      try {
        const ac = new AbortController()
        const to = setTimeout(() => ac.abort(), LOCAL_TIMEOUT_MS)
        const resp = await fetch(`${LOCAL_URL.replace(/\/$/, '')}/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: imageBuf,
          signal: ac.signal,
        })
        clearTimeout(to)
        
        if (resp.ok) {
          const data = await resp.json()
          if (Array.isArray(data)) {
            const labels = data.map((r: any) => ({ label: String(r.label), score: Number(r.score) }))
            const { category, confidence } = mapLegacyLabelsToCategory(labels)
            
            finalResult = {
              isValid: confidence > 0.3,
              suggestedCategory: category,
              confidence: confidence,
              message: confidence > 0.3 ? `Detected possible ${category.toLowerCase()} issue.` : 'Low confidence detection.',
              rawLabels: labels.slice(0, 6),
              latencyMs: Date.now() - start,
            }
            
            success = true
            attempts.push({ source: 'local-classify-server', ok: true, ms: Date.now() - t0, status: resp.status })
          }
        } else {
          const text = await resp.text()
          attempts.push({ source: 'local-classify-server', ok: false, ms: Date.now() - t0, status: resp.status, error: text.slice(0, 140) })
        }
      } catch (e: any) {
        attempts.push({ source: 'local-classify-server', ok: false, error: e?.name === 'AbortError' ? 'timeout' : (e?.message || 'error') })
      }
    }

    if (!success) {
      console.error('🧭 All classification attempts failed:', JSON.stringify(attempts, null, 2))
      return new Response(
        JSON.stringify({ 
          error: 'Local AI server not available. Please ensure the AI server is running.',
          attempts 
        }), 
        { status: 503 }
      )
    }

    // Cache result for 10 minutes
    cache.set(hash, { data: finalResult, expires: Date.now() + 10 * 60 * 1000 })

    return new Response(JSON.stringify(finalResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    console.error('❌ Classification Error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Server Error' }), { status: 500 })
  }
}

// Legacy label mapping for fallback classifier
function mapLegacyLabelsToCategory(labels: Array<{ label: string; score: number }>) {
  const categoryKeywords: Record<string, string[]> = {
    POTHOLE: ["pothole", "road", "asphalt", "pavement", "crack", "street"],
    GARBAGE: ["garbage", "trash", "litter", "waste", "dump", "rubbish", "debris", "plastic"],
    STREETLIGHT: ["streetlight", "lamp", "light pole", "lighting", "bulb"],
    WATER: ["water", "leak", "pipe", "flood", "sewage", "drain", "puddle"],
    OTHER: ["road", "street", "outdoor", "building", "urban", "city"]
  }

  const scores: Record<string, number> = { POTHOLE: 0, GARBAGE: 0, STREETLIGHT: 0, WATER: 0, OTHER: 0 }

  for (const item of labels) {
    const labelLower = item.label.toLowerCase()
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (labelLower.includes(keyword)) {
          scores[category] += item.score
          break
        }
      }
    }
  }

  const best = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)
  return { category: best[0], confidence: Math.min(best[1], 1.0) }
}
