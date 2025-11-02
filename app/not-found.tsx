"use client"
import React from 'react'
import Link from 'next/link'
import FuzzyText from '@/components/ui/FuzzyText'

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-6">
      <div className="max-w-3xl text-center">
        <div className="mb-6">
          <FuzzyText className="text-8xl md:text-[140px] leading-none font-extrabold">404</FuzzyText>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground mb-6">We couldn't find the page you're looking for. It may have been removed or the link is incorrect.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="btn">Go home</Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </div>
    </main>
  )
}
