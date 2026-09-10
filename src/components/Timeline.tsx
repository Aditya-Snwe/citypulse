import { CircleCheck, Radio } from 'lucide-react'
import { cn } from '../lib/cn'
import type { TimelineStep } from '../types/report'

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1
        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex w-8 flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  step.done && 'bg-tertiary text-on-primary',
                  step.active && !step.done && 'bg-primary-container text-on-primary ring-4 ring-primary-fixed',
                  !step.done && !step.active && 'bg-surface-high text-on-surface-variant',
                )}
              >
                {step.done ? <CircleCheck className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
              </span>
              {!last && (
                <span
                  className={cn(
                    'my-1 w-0.5 flex-1 min-h-6',
                    step.done ? 'bg-tertiary' : 'bg-outline-variant/50',
                  )}
                />
              )}
            </div>
            <p
              className={cn(
                'pt-1.5 pb-4 text-[14px] font-medium',
                step.active ? 'text-primary' : 'text-on-surface',
              )}
            >
              {step.done ? '✓ ' : step.active ? '● ' : '○ '}
              {step.label}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
