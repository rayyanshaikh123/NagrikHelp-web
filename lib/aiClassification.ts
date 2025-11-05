// AI classification utilities for client + route
// Centralizes types, categories and mapping heuristics.

import type { IssueCategory } from "@/services/issues"

export const CIVIC_ISSUE_CATEGORIES: IssueCategory[] = [
  "POTHOLE",
  "GARBAGE",
  "STREETLIGHT",
  "WATER",
  "OTHER",
]

export interface AiIssueClassification {
  isValid: boolean
  suggestedCategory: IssueCategory
  confidence: number // 0..1
  message: string
  rawLabels?: Array<{ label: string; score: number }>
  reasoning?: string
  latencyMs?: number
  bbox?: number[] | null // Bounding box [x1, y1, x2, y2] from YOLO
  modelUsed?: string // Which model(s) were used
  debug?: any // Debug information from multi-model pipeline
}

export interface AiIssueRequestPayload {
  imageBase64: string // data URL or raw base64
  // Optionally allow passing a user hint (like description or chosen category) to refine reasoning
  hintText?: string
  description?: string
}

// Lightweight mapping from generic model labels to our IssueCategory domain.
// Model labels from common vision models like ViT/ResNet (imagenet labels etc.) will be noisy;
// we perform a heuristic mapping. For production, replace with a fine-tuned classifier.
const KEYWORD_CATEGORY_MAP: Array<{ kw: RegExp; cat: IssueCategory }> = [
  { kw: /pothole|asphalt|road|street.*hole|pavement.*damage/i, cat: "POTHOLE" },
  { kw: /garbage|trash|litter|waste|dump|rubbish|debris|plastic.*bag/i, cat: "GARBAGE" },
  { kw: /lamp|street.?light|light pole|lighting|bulb/i, cat: "STREETLIGHT" },
  { kw: /water|leak|pipe|flood|sewage|drain|waterlog/i, cat: "WATER" },
]

export function mapLabelsToCategory(labels: Array<{ label: string; score: number }>): { category: IssueCategory; confidence: number } {
  if (!labels.length) return { category: "OTHER", confidence: 0 }
  // Combine scores for matched categories.
  const accum: Record<IssueCategory, number> = { POTHOLE: 0, GARBAGE: 0, STREETLIGHT: 0, WATER: 0, OTHER: 0 }
  for (const l of labels) {
    for (const { kw, cat } of KEYWORD_CATEGORY_MAP) {
      if (kw.test(l.label)) accum[cat] += l.score
    }
  }
  // Determine best category
  let best: IssueCategory = "OTHER"
  let bestScore = 0
  for (const c of CIVIC_ISSUE_CATEGORIES) {
    if (accum[c] > bestScore) {
      best = c
      bestScore = accum[c]
    }
  }
  // Fallback: if everything zero, pick OTHER with low confidence based on top raw score
  if (bestScore === 0) {
    const maxRaw = labels[0]
    return { category: "OTHER", confidence: Math.min(0.2, maxRaw.score) }
  }
  // Normalize confidence to (0,1] relative to sum of accum scores
  const sum = Object.values(accum).reduce((a, b) => a + b, 0) || bestScore
  const confidence = Math.min(1, bestScore / sum + 0.05) // slight bias
  return { category: best, confidence }
}

export function emptyClassification(): AiIssueClassification {
  return {
    isValid: false,
    suggestedCategory: "OTHER",
    confidence: 0,
    message: "No issue detected",
  }
}

// Helper to extract pure base64 from a data URL if present.
export function stripDataUrl(dataUrl: string): { base64: string; mime?: string } {
  const m = /^data:(.*?);base64,(.*)$/i.exec(dataUrl)
  if (m) return { mime: m[1], base64: m[2] }
  return { base64: dataUrl }
}
