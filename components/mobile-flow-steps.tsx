"use client"
import { cn } from '@/lib/utils'
import { Flag, Eye, CheckCircle2 } from 'lucide-react'

interface StepDef { key: string; label: string; icon: any; desc: string }
const STEPS: StepDef[] = [
  { key: 'report', label: 'Report', icon: Flag, desc: 'Capture an issue with details & photo.' },
  { key: 'track', label: 'Track', icon: Eye, desc: 'Follow status & community votes.' },
  { key: 'resolve', label: 'Resolve', icon: CheckCircle2, desc: 'Officials act & close the loop.' },
]

export function MobileFlowSteps({ current = 'report' }: { current?: string }) {
  return (
    <div className="md:hidden -mx-4 mb-4 mt-2">
      <div className="px-4 py-3 rounded-xl border bg-card/60 backdrop-blur-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const ActiveIcon = s.icon
            const isActive = s.key === current
            return (
              <div key={s.key} className="flex-1 flex flex-col items-center gap-1 text-center">
                <div className={cn('h-8 w-8 rounded-full grid place-items-center text-[11px] border transition', isActive ? 'bg-primary/20 border-primary/60 text-primary' : 'bg-muted/40 border-border text-muted-foreground')}>
                  <ActiveIcon className="h-4 w-4" />
                </div>
                <span className={cn('text-[11px] font-medium tracking-wide', isActive ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
              </div>
            )
          })}
        </div>
        <div className="relative h-1 w-full rounded bg-border overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-400 to-emerald-400 transition-all" style={{ width: `${(STEPS.findIndex(s=>s.key===current)+1)/STEPS.length*100}%` }} />
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground min-h-[2.2rem]">
          {STEPS.find(s=>s.key===current)?.desc}
        </p>
      </div>
    </div>
  )
}
export default MobileFlowSteps
