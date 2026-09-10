import { useState } from 'react'
import { cn } from '../lib/cn'

export function VerificationCard({
  confirmations,
  vote,
  onVote,
}: {
  confirmations: number
  vote?: 'present' | 'resolved'
  onVote: (vote: 'present' | 'resolved') => void
}) {
  const [justVoted, setJustVoted] = useState(false)

  return (
    <section className="space-y-3 rounded-2xl border-2 border-primary/30 bg-surface-lowest p-4">
      <div>
        <h2 className="text-[20px] font-semibold text-on-surface">Community Verification</h2>
        <p className="mt-1 text-[14px] text-on-surface-variant">Is this issue still present?</p>
      </div>
      <button
        type="button"
        onClick={() => {
          onVote('present')
          setJustVoted(true)
        }}
        className={cn(
          'flex min-h-12 w-full items-center justify-center rounded-lg bg-error px-4 text-[16px] font-semibold text-on-error shadow-sm active:scale-[0.98]',
          vote === 'present' && 'ring-2 ring-offset-2 ring-error',
        )}
      >
        Yes, still present
      </button>
      <button
        type="button"
        onClick={() => {
          onVote('resolved')
          setJustVoted(true)
        }}
        className={cn(
          'flex min-h-12 w-full items-center justify-center rounded-lg border border-outline bg-surface-low px-4 text-[16px] font-semibold text-on-surface active:scale-[0.98]',
          vote === 'resolved' && 'ring-2 ring-offset-2 ring-primary',
        )}
      >
        No, resolved
      </button>
      <p className="text-[13px] text-on-surface-variant">
        {confirmations} citizens confirmed this issue.
        {justVoted && vote === 'present' && ' Thanks — your confirmation is recorded on this device.'}
        {justVoted && vote === 'resolved' && ' Thanks — marked resolved from your view.'}
      </p>
    </section>
  )
}
