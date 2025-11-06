import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ensure COOP header is set in both dev and production so Google Identity
// popups/iframes can postMessage back to the opener without being blocked.
export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  try {
    // Only set COOP for top-level document navigation requests (HTML pages).
    // This avoids setting COOP on API/json responses or other resources which
    // can lead to COOP mismatches and block window.postMessage between
    // contexts opened by third-parties.
    const accept = req.headers.get('accept') || ''
    const secFetchDest = req.headers.get('sec-fetch-dest') || ''
    const isDocument = accept.includes('text/html') || secFetchDest === 'document'
    if (isDocument) {
      res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    }
    // Do NOT set Cross-Origin-Embedder-Policy unless you intentionally need it
  } catch (e) {
    // swallowing errors to avoid breaking dev server
    // (headers may be read-only in some runtimes)
  }
  return res
}

export const config = {
  matcher: '/:path*',
}
