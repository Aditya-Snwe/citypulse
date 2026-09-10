import { useNavigate } from 'react-router-dom'
import { formatDistance, formatRelative } from '../lib/format'
import { cn } from '../lib/cn'
import type { Report } from '../types/report'
import { SeverityBadge } from './StatusBadge'

export function AlertCard({ report, compact = false }: { report: Report; compact?: boolean }) {
  const navigate = useNavigate()
  const edge =
    report.severity === 'High'
      ? 'bg-severity-high'
      : report.severity === 'Medium'
        ? 'bg-severity-medium'
        : 'bg-severity-low'

  return (
    <button
      type="button"
      onClick={() => navigate(`/reports/${report.id}`)}
      className={cn(
        'relative min-h-[88px] w-full rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4 text-left shadow-sm transition-all active:scale-[0.99]',
        compact && 'min-w-[260px] shrink-0',
      )}
    >
      <span className={cn('absolute top-3 bottom-3 left-0 w-1 rounded-r', edge)} />
      <div className="flex items-start justify-between gap-2 pl-1">
        <div>
          <p className="text-[16px] font-semibold tracking-tight text-on-surface">
            {report.type} reported
          </p>
          <p className="mt-0.5 text-[13px] text-on-surface-variant">{report.locationLabel}</p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>
      <div className="mt-3 flex items-center justify-between pl-1 text-[12px] text-outline">
        <span>{formatDistance(report.distanceMeters)}</span>
        <span className="font-medium">{formatRelative(report.reportedAt)}</span>
      </div>
    </button>
  )
}
