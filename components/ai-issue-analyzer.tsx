"use client"

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CIVIC_ISSUE_CATEGORIES, type AiIssueClassification } from '@/lib/aiClassification'
import type { IssueCategory } from '@/services/issues'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface AnalyzerProps {
  value?: string // current base64
  onImageChange?: (base64?: string) => void
  onSuggestion?: (cat: IssueCategory, meta: AiIssueClassification) => void
  onOverride?: (cat: IssueCategory) => void
  category?: IssueCategory
}

export function AiIssueAnalyzer(props: AnalyzerProps) {
  const { value, onImageChange, onSuggestion, category, onOverride } = props
  const [preview, setPreview] = useState<string | undefined>(value)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiIssueClassification | null>(null)
  const [overrideCat, setOverrideCat] = useState<IssueCategory | undefined>(category)
  const abortRef = useRef<AbortController | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [attempts, setAttempts] = useState<any[] | null>(null)

  const reset = () => {
    setResult(null)
  }

  const classify = useCallback(async (dataUrl: string) => {
    reset()
    setLoading(true)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    try {
      setStatusMsg('Analyzing (warming models if needed)...')
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
        signal: ac.signal,
      })
      const raw = await res.json().catch(() => { throw new Error(`Non-JSON response (${res.status})`) })
      if (!res.ok) {
        setAttempts(raw?.attempts || null)
        throw new Error(raw?.error || `AI error ${res.status}`)
      }
      setAttempts(raw?.attempts || null)
      const parsed: AiIssueClassification = raw
      setResult(parsed)
      setOverrideCat(parsed.suggestedCategory)
      onSuggestion?.(parsed.suggestedCategory, parsed)
      setStatusMsg(null)
    } catch (e: any) {
      if (e.name === 'AbortError') return
      setResult({
        isValid: false,
        suggestedCategory: 'OTHER',
        confidence: 0,
        message: e.message || 'Classification failed',
      } as AiIssueClassification)
      setStatusMsg('Model(s) failed. You can retry.')
    } finally {
      setLoading(false)
    }
  }, [onSuggestion])

  const onFile = (f?: File) => {
    if (!f) {
      setPreview(undefined)
      onImageChange?.(undefined)
      reset()
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const original = reader.result as string
      // Downscale to 224x224 for vision model efficiency
      const img = new Image()
      img.onload = () => {
        try {
          const CANVAS_SIZE = 224
          const canvas = document.createElement('canvas')
            ; (canvas.width = CANVAS_SIZE), (canvas.height = CANVAS_SIZE)
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // cover fit
            const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height)
            const w = img.width * scale
            const h = img.height * scale
            const dx = (CANVAS_SIZE - w) / 2
            const dy = (CANVAS_SIZE - h) / 2
            ctx.drawImage(img, dx, dy, w, h)
            const scaled = canvas.toDataURL('image/jpeg', 0.85)
            setPreview(scaled)
            onImageChange?.(scaled)
            classify(scaled)
          } else {
            setPreview(original)
            onImageChange?.(original)
            classify(original)
          }
        } catch {
          setPreview(original)
          onImageChange?.(original)
          classify(original)
        }
      }
      img.onerror = () => {
        setPreview(original)
        onImageChange?.(original)
        classify(original)
      }
      img.src = original
    }
    reader.readAsDataURL(f)
  }

  return (
    <Card className="p-4 space-y-3 border-dashed border-2 bg-background/40 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="preview" className="h-40 w-auto max-w-full rounded-md border object-cover" />
          )}
          {loading && <Progress value={45} className="h-2 animate-pulse" />}
          {statusMsg && <p className="text-[11px] text-muted-foreground">{statusMsg}</p>}
        </div>
        <div className="w-full md:w-72 space-y-2 text-sm">
          <div className="font-medium tracking-tight">AI Analysis</div>
          {result ? (
            <div className={cn("rounded-md p-3 border text-xs space-y-1", result.isValid ? 'border-green-500/40 bg-green-500/5' : 'border-yellow-500/40 bg-yellow-500/5')}> 
              <div className="flex items-center justify-between">
                <span className="uppercase font-semibold tracking-wide text-[10px] opacity-70">Suggestion</span>
                {result.confidence ? <span className="tabular-nums">{(result.confidence * 100).toFixed(1)}%</span> : null}
              </div>
              <div className="text-base font-semibold">{result.suggestedCategory}</div>
              <p className="text-muted-foreground leading-snug">{result.message}</p>
              {result.latencyMs && (
                <div className="text-[10px] opacity-60">{result.latencyMs} ms</div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Upload an image to analyze civic issue category.</p>
          )}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold tracking-wide opacity-70">Override Category</div>
            <Select value={overrideCat} onValueChange={v => { setOverrideCat(v as IssueCategory); onOverride?.(v as IssueCategory) }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {CIVIC_ISSUE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={!preview || loading} onClick={() => preview && classify(preview)}>Re-run</Button>
            <Button type="button" variant="ghost" size="sm" disabled={!preview || loading} onClick={() => { setPreview(undefined); onImageChange?.(undefined); reset(); }}>Clear</Button>
          </div>
        </div>
      </div>
      {result?.rawLabels && result.rawLabels.length ? (
        <details className="text-[10px] opacity-70">
          <summary className="cursor-pointer">Model raw labels</summary>
          <ul className="mt-1 space-y-0.5">
            {result.rawLabels.map(r => <li key={r.label}>{r.label}: {(r.score * 100).toFixed(1)}%</li>)}
          </ul>
        </details>
      ) : null}
      {attempts && attempts.length ? (
        <details className="text-[10px] opacity-60">
          <summary className="cursor-pointer">Debug attempts</summary>
          <ul className="mt-1 space-y-0.5">
            {attempts.map((a, i) => <li key={i}>{a.model}: {a.ok ? 'OK' : 'FAIL'} {a.error ? `- ${a.error}` : ''}</li>)}
          </ul>
        </details>
      ) : null}
    </Card>
  )
}

export default AiIssueAnalyzer
