"use client"
import { Issue } from '@/services/issues'

// Extended placeholder issues (UI only). These are appended client-side if live data is sparse.
export const DEMO_ISSUES: Issue[] = Array.from({ length: 24 }).map((_, i) => {
  const categories = ['POTHOLE','GARBAGE','STREETLIGHT','WATER','OTHER'] as const
  const statuses: Issue['status'][] = ['pending','in-progress','resolved']
  const cat = categories[i % categories.length]
  const status = statuses[i % statuses.length]
  return {
    id: `demo-${i+1}`,
    title: `${cat} issue #${i+1}`,
    description: `Auto‑generated demo description for ${cat.toLowerCase()} issue number ${i+1}. This placeholder text illustrates how longer content wraps within the card layout and maintains consistent vertical rhythm.`,
    location: `Sector ${(i%9)+1}, Demo City` ,
    category: cat,
    status,
    createdAt: Date.now() - i*3600_000,
    updatedAt: Date.now() - i*3400_000,
    upVotes: Math.floor(Math.random()*40)+ (status==='resolved'?5:0),
    downVotes: Math.floor(Math.random()*6),
    userVote: null,
    imageBase64: undefined,
    photoUrl: undefined,
    createdBy: 'demo@user.local',
    commentsCount: Math.floor(Math.random()*5),
    recentComments: [],
    shareToken: undefined,
  } as Issue
})
