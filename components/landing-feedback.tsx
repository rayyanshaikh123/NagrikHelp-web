"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function Feedback() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In a real app, POST to an API route. Here we just show success.
    setSent(true)
  }

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanks for your feedback!</CardTitle>
          <CardDescription>We appreciate your ideas to make our cities better.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-brand">
          <CheckCircle2 className="h-5 w-5" />
          <p>Your message has been received.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <CardDescription>Tell us what to add next or how we can improve the experience.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Citizen"
              autoComplete="name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              required
              rows={5}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-brand hover:bg-brand/90 text-background">
              Send feedback
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
