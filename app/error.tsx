"use client"
import React from 'react'
import FuzzyText from '@/components/ui/FuzzyText'

export default function ErrorPage({ error }: { error: Error }) {
  console.error(error)
  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-6">
      <div className="max-w-3xl text-center">
        <div className="mb-6">
          <FuzzyText className="text-6xl md:text-[96px] leading-none font-extrabold">Error</FuzzyText>
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">An unexpected error occurred. You can try refreshing the page or come back later.</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => location.reload()} className="btn">Retry</button>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</a>
        </div>
      </div>
    </main>
  )
}
