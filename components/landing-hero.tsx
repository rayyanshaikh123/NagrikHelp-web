"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import LightRays from './LightRays'
import Image from 'next/image'
import { FlipWords } from "@/components/ui/flip-words"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-background min-h-[600px]">
      {/* Subtle dark overlay behind rays for contrast shaping */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/10 via-background/30 to-background/70 pointer-events-none" />
      {/* LightRays animated background toned down */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#00ffff"
        raysSpeed={1.3}
        lightSpread={0.95}
        rayLength={1.9}
        followMouse
        mouseInfluence={0.05}
        noiseAmount={0.05}
        distortion={0.035}
        brightnessFloor={0.25}
        brightnessPower={1.05}
        intensity={1.2}
        className="absolute inset-0 z-[1] opacity-80 mix-blend-screen pointer-events-none transition-opacity duration-700"
      />
      {/* Gradient top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-16 md:pt-20 md:pb-24 relative mt-20 z-10">
        <div className="grid gap-12 md:gap-16 md:grid-cols-2 items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary/50 blink-indicator" /> Empowering local governance
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-balance">
                <span className="font-brand">NagrikHelp</span>: <FlipWords words={["Report", "Track", "Resolve"]} duration={2500} className="text-primary" /> <span className="inline-block">Civic Issues Faster</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-prose">
                Connect citizens and municipal departments in a transparent workflow. Submit geo‑tagged issues, monitor progress, and close the feedback loop with verified resolutions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="sm" className="sm:w-auto w-full">
                <Link href="/citizen/create">Report an Issue</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="sm:w-auto w-full">
                <Link href="/citizen/public">Track Issues</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="sm:w-auto w-full">
                <Link href="/roles">For Administrations</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {FEATURE_PILLS.map(p => (
                <Badge key={p} variant="outline" className="border-border text-[10px] font-normal tracking-wide">
                  {p}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-muted-foreground">
              <span>Real-time updates</span>
              <span className="hidden sm:inline h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span>Mobile-friendly</span>
            </div>
          </div>

          {/* Right Column (Live style metrics panel) */}
          <div className="relative hidden md:flex">
            <div className="relative w-full aspect-[4/3] rounded-xl border bg-card/60 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_38%,var(--color-primary)/8,transparent_72%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.04),transparent_55%,rgba(0,0,0,0.06))] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_55%,rgba(255,255,255,0.08))]" />
              {/* Map Image Placeholder */}
              <Image
                src="/map.jpeg"
                alt="City civic issues map preview"
                fill
                priority
                className="object-cover"
              />
              {/* Subtle overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/10 to-transparent" />
              {/* Metrics pill */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-1 text-[10px] px-3 py-2 rounded-md bg-background/80 backdrop-blur border border-border/60 shadow-sm">
                <span className="font-medium tracking-wide">Live Snapshot</span>
                <div className="flex gap-3">
                  <span className="text-muted-foreground">Active: <strong className="text-foreground/90">128</strong></span>
                  <span className="text-muted-foreground">Resolved: <strong className="text-foreground/90">94</strong></span>
                </div>
              </div>
              <div className="absolute -inset-px rounded-xl pointer-events-none border border-border/60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground/70">{label}</span>
      <span className="font-medium text-foreground/80">{value}</span>
    </div>
  )
}

const FEATURE_PILLS = [
  'Geo-tagged reports',
  'Photo attachments',
  'Status tracking',
  'Community feedback',
]
