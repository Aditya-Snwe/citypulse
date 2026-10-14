import { useState } from 'react'
import { cn } from '../lib/cn'

export function VerificationCard({
  confirmations,
  vote,
  onVote,
  disabled = false,
}: {
  confirmations: number
  vote?: 'present' | 'resolved'
  onVote: (vote: 'present' | 'resolved') => void
  disabled?: boolean
}) {
  const [justVoted, setJustVoted] = useState(false)

  const handleVote = (selectedVote: 'present' | 'resolved') => {
    if (disabled) return
    onVote(selectedVote)
    setJustVoted(true)
  }

  return (
    <section className="space-y-3 rounded-2xl border-2 border-primary/30 bg-surface-lowest p-4">
      <div>
        <h2 className="text-[20px] font-semibold text-on-surface">Community Verification</h2>
        <p className="mt-1 text-[14px] text-on-surface-variant">
          Is this issue still present on the ground?
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleVote('present')}
          className={cn(
            'flex min-h-12 w-full items-center justify-between rounded-lg bg-error px-4 text-[15px] font-semibold text-on-error shadow-sm disabled:opacity-50 active:scale-[0.98]',
            vote === 'present' && 'ring-3 ring-error-container ring-offset-2 ring-offset-surface',
          )}
        >
          <span>Yes, still present</span>
          {vote === 'present' && (
            <span className="rounded bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-wider font-bold">
              Your Vote
            </span>
          )}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleVote('resolved')}
          className={cn(
            'flex min-h-12 w-full items-center justify-between rounded-lg border border-outline bg-surface-low px-4 text-[15px] font-semibold text-on-surface disabled:opacity-50 active:scale-[0.98]',
            vote === 'resolved' && 'ring-3 ring-primary ring-offset-2 ring-offset-surface',
          )}
        >
          <span>No, resolved</span>
          {vote === 'resolved' && (
            <span className="rounded bg-surface-high px-2 py-0.5 text-[11px] uppercase tracking-wider font-bold text-primary">
              Your Vote
            </span>
          )}
        </button>
      </div>

      <div className="pt-1 text-[13px] text-on-surface-variant">
        <p>
          <strong className="text-on-surface">{confirmations}</strong> citizen
          {confirmations === 1 ? '' : 's'} confirmed this issue.
        </p>
        {justVoted && vote === 'present' && (
          <p className="mt-1 text-tertiary font-medium">
            ✓ Your verification vote has been registered.
          </p>
        )}
        {justVoted && vote === 'resolved' && (
          <p className="mt-1 text-primary font-medium">
            ✓ Resolution feedback submitted for community monitoring.
          </p>
        )}
      </div>
    </section>
  )
}
