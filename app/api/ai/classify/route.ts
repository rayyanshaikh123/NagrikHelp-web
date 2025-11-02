import { NextRequest } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

// Helper functions
function stripDataUrl(dataUrl: string) {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  return { base64 }
}

function mapLabelsToCategory(labels: Array<{ label: string; score: number }>) {
  // Simple heuristic mapping
  const top = labels[0]
  let category = 'Other'
  if (!top) return { category, confidence: 0 }
  if (top.label.toLowerCase().includes('leaf')) category = 'Leaf'
  else if (top.label.toLowerCase().includes('disease')) category = 'Disease'
  else if (top.label.toLowerCase().includes('plant')) category = 'Plant'
  else category = 'General'
  return { category, confidence: top.score }
}

// Note: We will read env values inside the handler where needed so changes take effect after restart.

const CANDIDATE_MODELS = [
  process.env.CIVIC_VISION_MODEL?.trim() || 'google/vit-base-patch16-224',
  'facebook/convnextv2-base-22k-224',
  'microsoft/resnet-50',
  'microsoft/resnet-34',
]

const TEXT_MODEL = process.env.CIVIC_TEXT_MODEL?.trim() || 'distilbert-base-uncased'

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

    let labels: Array<{ label: string; score: number }> = []
    let success = false
    const attempts: any[] = []

    // 1) Try local vision server first if configured
    const LOCAL_URL = process.env.LOCAL_VISION_URL?.trim()
    if (LOCAL_URL && LOCAL_URL.length > 0) {
      const t0 = Date.now()
      try {
        const ac = new AbortController()
        const to = setTimeout(() => ac.abort(), 7000)
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
            labels = data.map((r: any) => ({ label: String(r.label), score: Number(r.score) }))
            success = true
            attempts.push({ source: 'local-server', ok: true, ms: Date.now() - t0, status: resp.status })
          } else if (Array.isArray((data as any)?.[0])) {
            const arr = (data as any)[0]
            labels = arr.map((r: any) => ({ label: String(r.label), score: Number(r.score) }))
            success = true
            attempts.push({ source: 'local-server', ok: true, ms: Date.now() - t0, status: resp.status })
          } else {
            attempts.push({ source: 'local-server', ok: false, ms: Date.now() - t0, status: resp.status, note: 'Unexpected JSON' })
          }
        } else {
          const text = await resp.text()
          attempts.push({ source: 'local-server', ok: false, ms: Date.now() - t0, status: resp.status, error: text.slice(0, 140) })
        }
      } catch (e: any) {
        attempts.push({ source: 'local-server', ok: false, error: e?.name === 'AbortError' ? 'timeout' : (e?.message || 'error') })
      }
    }

    // 2) If local failed or not configured, try hosted models via HF
    if (!success) {
      const HF_API_KEY = process.env.HUGGING_FACE_API_KEY
      if (!HF_API_KEY) {
        // No key and no local success: return clearly
        return new Response(JSON.stringify({ error: 'HUGGING_FACE_API_KEY missing and local server not available', attempts }), { status: 401 })
      }
    }

    for (const model of CANDIDATE_MODELS) {
      const t0 = Date.now()
      try {
        const resp = await fetch(
          `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}?wait_for_model=true`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/octet-stream',
              Accept: 'application/json',
              'User-Agent': 'NextJS-AI-Classifier/1.0',
            },
            body: imageBuf,
          }
        )

        if (resp.status === 503) {
          attempts.push({ model, ok: false, status: 503, note: 'Model loading...' })
          continue
        }

        const data = await resp.json()
        if (Array.isArray(data)) {
          labels = data.map((r: any) => ({ label: r.label, score: r.score }))
          success = true
          attempts.push({ model, ok: true, ms: Date.now() - t0 })
          break
        } else if (Array.isArray(data[0])) {
          labels = data[0].map((r: any) => ({ label: r.label, score: r.score }))
          success = true
          attempts.push({ model, ok: true, ms: Date.now() - t0 })
          break
        } else {
          attempts.push({
            model,
            ok: false,
            status: resp.status,
            note: JSON.stringify(data).slice(0, 120),
          })
        }
      } catch (e: any) {
        attempts.push({ model, ok: false, error: e.message })
      }
    }

    if (!success || !labels.length) {
      return new Response(JSON.stringify({ error: 'All models failed', attempts }), { status: 503 })
    }

    const { category, confidence } = mapLabelsToCategory(labels)

    // Optional reasoning with text model
    let reasoning = ''
    try {
      const HF_API_KEY = process.env.HUGGING_FACE_API_KEY
      const textResp = HF_API_KEY ? await fetch(`https://api-inference.huggingface.co/models/${TEXT_MODEL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `This image likely shows a ${category}. What might this mean in a general context?`,
        }),
      }) : null
      if (textResp) {
        const textData = await textResp.json()
        reasoning = textData?.[0]?.generated_text || 'No reasoning available.'
      } else {
        reasoning = 'Reasoning model unavailable.'
      }
    } catch (err) {
      reasoning = 'Reasoning model unavailable.'
    }

    const result = {
      isValid: confidence > 0.25,
      suggestedCategory: category,
      confidence: Number(confidence.toFixed(3)),
      message:
        confidence > 0.25
          ? `Detected possible ${category.toLowerCase()} issue.`
          : 'Low confidence detection.',
      reasoning,
      rawLabels: labels.slice(0, 6),
      latencyMs: Date.now() - start,
      attempts,
    }

    // Cache it for 10 minutes
    cache.set(hash, { data: result, expires: Date.now() + 10 * 60 * 1000 })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    console.error('❌ Classification Error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Server Error' }), { status: 500 })
  }
}
