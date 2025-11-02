"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { getIssues, type Issue } from "@/services/issues"
import dynamic from "next/dynamic"

// Dynamically load react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false })

export default function AdminMap({ height = 400, issues: providedIssues }: { height?: number; issues?: Issue[] }) {
  const { data } = useSWR(providedIssues ? null : ["all-issues"], () => getIssues())
  const issues: Issue[] = providedIssues || data || []

  // Local state for leaflet module once loaded on client
  const [LRef, setLRef] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Dynamically import leaflet only on client
    import("leaflet").then(leaflet => {
      const L = leaflet.default || leaflet
      // Configure default marker icons once
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })
      setLRef(L)
    }).catch(() => {})
  }, [])

  const center: [number, number] = [20.5937, 78.9629]

  const colorFor = (status: string) => {
    switch (status) {
      case "pending":
      case "open": return "#f59e0b"
      case "in-progress": return "#3b82f6"
      case "resolved": return "#10b981"
      default: return "#6b7280"
    }
  }

  const points = useMemo(() => {
    if (!LRef) return []
    return issues.map(i => ({
      issue: i,
      pos: extractLatLng(i.location, center),
      icon: LRef.divIcon({
        className: "issue-status-marker",
        html: `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2);background:${colorFor(i.status)}"></span>`
      })
    }))
  }, [issues, LRef])

  return (
    <div className="w-full rounded-lg overflow-hidden border" style={{ height }}>
      {typeof window !== "undefined" && LRef ? (
        <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {points.map(({ issue, pos, icon }) => (
            <Marker key={issue.id} position={pos} icon={icon}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: colorFor(issue.status) }} />
                    {issue.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{issue.location}</div>
                  <div className="text-xs">Status: {issue.status}</div>
                  <div className="text-xs">Reported by: {issue.createdBy}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading map...</div>
      )}
    </div>
  )
}

function extractLatLng(loc: string, fallback: [number, number]): [number, number] {
  if (loc) {
    const m = loc.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
    if (m) {
      const lat = parseFloat(m[1])
      const lng = parseFloat(m[2])
      if (isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return [lat, lng]
      }
    }
  }
  let h1 = 0, h2 = 0
  for (let i = 0; i < loc.length; i++) { const c = loc.charCodeAt(i); h1 = (h1 * 31 + c) % 1000; h2 = (h2 * 17 + c) % 1000 }
  const lat = fallback[0] + ((h1 / 1000) * 6 - 3)
  const lng = fallback[1] + ((h2 / 1000) * 6 - 3)
  return [lat, lng]
}
