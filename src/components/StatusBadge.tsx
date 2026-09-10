import { cn } from '../lib/cn'
import type { ReportStatus, Severity } from '../types/report'

export function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    Submitted: 'bg-surface-container text-primary',
    'In Progress': 'bg-primary-fixed text-on-primary-fixed',
    'Community Confirmed': 'bg-secondary-container/40 text-secondary',
    'Community Monitoring': 'bg-surface-container text-primary',
    Resolved: 'bg-tertiary-fixed/50 text-tertiary',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        styles[status],
      )}
    >
      {status}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    High: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#B91C1C]',
    Medium: 'bg-[#FFFBEB] border-[#FCD34D] text-[#B45309]',
    Low: 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]',
  }
  const dot: Record<Severity, string> = {
    High: 'bg-severity-high',
    Medium: 'bg-severity-medium',
    Low: 'bg-severity-low',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        styles[severity],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot[severity], severity === 'High' && 'animate-pulse')} />
      {severity}
    </span>
  )
}
