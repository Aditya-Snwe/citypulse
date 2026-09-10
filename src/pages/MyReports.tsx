import { useMemo, useState } from 'react'
import { ReportCard } from '../components/ReportCard'
import { TopHeader } from '../components/TopHeader'
import { useReports } from '../context/ReportsContext'
import { cn } from '../lib/cn'
import type { Report } from '../types/report'

type Tab = 'All' | 'Active' | 'Resolved'

function isActive(report: Report) {
  return report.status !== 'Resolved'
}

export function MyReports() {
  const { reports } = useReports()
  const [tab, setTab] = useState<Tab>('All')
  const mine = reports.filter((r) => r.isMine)

  const filtered = useMemo(() => {
    if (tab === 'Active') return mine.filter(isActive)
    if (tab === 'Resolved') return mine.filter((r) => r.status === 'Resolved')
    return mine
  }, [mine, tab])

  const counts = {
    All: mine.length,
    Active: mine.filter(isActive).length,
    Resolved: mine.filter((r) => r.status === 'Resolved').length,
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="My Reports" subtitle="Track the issues you submitted" />
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Metric label="Total" value={counts.All} />
          <Metric label="Active" value={counts.Active} accent="text-error" />
          <Metric label="Resolved" value={counts.Resolved} accent="text-tertiary" />
        </div>

        <div className="mb-4 flex rounded-full bg-surface-high p-1">
          {(['All', 'Active', 'Resolved'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                'h-11 flex-1 rounded-full text-[13px] font-semibold transition-all active:scale-95',
                tab === item
                  ? 'bg-surface-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-[14px] text-on-surface-variant">
              No reports in this tab yet.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-3 text-center">
      <p className="text-[11px] text-on-surface-variant">{label}</p>
      <p className={cn('mt-1 text-[24px] font-bold', accent ?? 'text-on-surface')}>{value}</p>
    </div>
  )
}
