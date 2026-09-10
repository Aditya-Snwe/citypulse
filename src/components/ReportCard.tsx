import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { cn } from '../lib/cn'
import type { Report } from '../types/report'
import { StatusBadge } from './StatusBadge'

export function ReportCard({ report }: { report: Report }) {
  const navigate = useNavigate()
  const edge =
    report.status === 'Resolved'
      ? 'bg-tertiary'
      : report.severity === 'High'
        ? 'bg-error'
        : report.severity === 'Medium'
          ? 'bg-severity-medium'
          : 'bg-primary'

  return (
    <button
      type="button"
      onClick={() => navigate(`/reports/${report.id}`)}
      className="relative w-full overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-lowest p-4 text-left shadow-sm transition-all hover:border-outline active:scale-[0.99]"
    >
      <span className={cn('absolute top-0 bottom-0 left-0 w-1', edge)} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold tracking-tight text-on-surface-variant tabular-nums">
          {report.id}
        </span>
        <StatusBadge status={report.status} />
      </div>
      <h3 className="mt-2 text-[16px] font-semibold text-on-surface">{report.type}</h3>
      <p className="mt-1 flex items-start gap-1 text-[13px] text-on-surface-variant">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-outline" />
        <span>{report.locationLabel}</span>
      </p>
      <p className="mt-2 text-[12px] text-outline">{formatDate(report.reportedAt)}</p>
    </button>
  )
}
