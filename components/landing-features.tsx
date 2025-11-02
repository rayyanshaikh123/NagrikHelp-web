"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Camera, MessagesSquare, ShieldCheck, BarChart3 } from "lucide-react"
import SpotlightCard from "./spotlight-card"

const FEATURES = [
  {
    title: "Location-aware",
    desc: "Pin exact locations of issues for precise resolution.",
    Icon: MapPin,
  },
  {
    title: "Photo evidence",
    desc: "Attach images for clearer context and faster triage.",
    Icon: Camera,
  },
  {
    title: "Comments & updates",
    desc: "Discuss issues and receive progress notifications.",
    Icon: MessagesSquare,
  },
  {
    title: "Admin tools",
    desc: "Assign, prioritize, and track completion with ease.",
    Icon: ShieldCheck,
  },
  {
    title: "Basic analytics",
    desc: "Spot trends and allocate resources effectively.",
    Icon: BarChart3,
  },
]

export function Features() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ title, desc, Icon }) => (
        <SpotlightCard key={title} spotlightColor="rgba(5, 213, 255, 0.26)" className="h-full rounded-xl">
          <Card className="h-full bg-background/60 backdrop-blur-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{title}</CardTitle>
              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
          </Card>
        </SpotlightCard>
      ))}
    </div>
  )
}
