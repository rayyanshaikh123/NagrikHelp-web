# AI Classification (Frontend)

This document explains the client-side AI feature that validates & classifies uploaded issue photos on the Create Issue page.

## Overview

When a user selects an image, the UI component `AiIssueAnalyzer`:

1. Reads the file as a Data URL (base64)
2. Calls the Next.js API route `POST /api/ai/classify`
3. The route sends the image to a Hugging Face vision model (`google/vit-base-patch16-224` by default)
4. Raw labels are heuristically mapped to civic categories: POTHOLE, GARBAGE, STREETLIGHT, WATER, OTHER
5. The suggested category + confidence appears in real-time; the user can override
6. Selected category is used in the eventual `createIssue` submission

## Files

| File | Purpose |
|------|---------|
| `app/api/ai/classify/route.ts` | Serverless route invoking Hugging Face Inference API. |
| `lib/aiClassification.ts` | Types, category list, label mapping heuristics & helpers. |
| `components/ai-issue-analyzer.tsx` | Upload UI, preview, progress, result & override. |
| `components/report-issue-form.tsx` | Integrated analyzer into issue creation form. |

## Environment Variables

Add these to `.env.local` (never commit real keys):

```
HUGGING_FACE_API_KEY=hf_xxx           # Required for non-public model or higher rate limits
CIVIC_VISION_MODEL=google/vit-base-patch16-224  # Optional override
# CIVIC_TEXT_MODEL=distilbert-base-uncased      # (Reserved) for future reasoning step
```

Restart `pnpm dev` after adding environment variables.

## API Contract

Request:
```json
POST /api/ai/classify
{
  "imageBase64": "data:image/jpeg;base64,/9j/…",
  "hintText": "(optional user description)"
}
```

Response:
```json
{
  "isValid": true,
  "suggestedCategory": "GARBAGE",
  "confidence": 0.91,
  "message": "Detected potential garbage issue.",
  "rawLabels": [{ "label": "trash", "score": 0.62 }, ...],
  "latencyMs": 842
}
```

## Heuristic Mapping

Because generic vision models output ImageNet-style labels (e.g., "street sign", "trash can"), we regex-match keywords and accumulate scores. If no category is confidently matched, we fall back to `OTHER` with low confidence.

You can refine mapping in `KEYWORD_CATEGORY_MAP` inside `lib/aiClassification.ts` or replace entirely with a fine-tuned classifier.

## Customization Points

| Need | Change |
|------|-------|
| Adjust confidence threshold for `isValid` | `confidence > 0.25` in `route.ts` |
| Add category | Extend `IssueCategory`, update arrays & backend acceptance |
| Improve mapping | Edit regex list in `KEYWORD_CATEGORY_MAP` |
| Add reasoning text model | After classification, send top labels to a text model with a prompt and enrich `message` |
| Limit image size | Downscale in the analyzer before uploading |

## Privacy & Cost Considerations

Images are sent to Hugging Face Inference API. For sensitive deployments, consider:
1. Self-hosting the model (HF `text-generation-inference` or `transformers.js` edge variant)
2. On-device (WebGPU) inference for small models
3. Strip EXIF metadata before sending (current code does not extract EXIF)

## Roadmap Ideas

- Progressive enhancement: first local heuristic (size / brightness) before remote call
- Offline queue with localStorage for batch classification
- Multi-model ensemble with voting
- Region-of-interest detection (YOLOv8) for localized explanation
- Add LLM reasoning summarizing probable civic impact
- Caching identical base64 hashes in `IndexedDB`

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| 401 from HF | Missing / invalid key | Set `HUGGING_FACE_API_KEY` |
| Slow latency | Cold start or large image | Downscale client-side before upload |
| Always OTHER | Labels not matching regex | Inspect `rawLabels` (expand details) and tune mapping |
| Build error on props | Declaration file missing | Ensure `components/LogoLoop.d.ts` committed |

## Quick Dev Test

1. Start dev server: `pnpm dev`
2. Navigate to `/issues/create`
3. Upload sample images (pothole, garbage, etc.)
4. Observe suggestion & try override select

---

For deeper backend AI integration (e.g., storing embeddings or audit logs), see `backend/AI_SETUP.md`.
