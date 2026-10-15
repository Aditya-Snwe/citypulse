import { LogIn, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Link } from 'react-router-dom'
import { ReportCard } from '../components/ReportCard'
import { TopHeader } from '../components/TopHeader'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { cn } from '../lib/cn'
import type { Report } from '../types/report'

type Tab = 'All' | 'Active' | 'Resolved'

function isActive(report: Report) {
  return report.status !== 'Resolved'
}

export function MyReports() {
  const { reports, loading } = useReports()
  const { user, isConfigured } = useAuth()
  const [tab, setTab] = useState<Tab>('All')

  // When Supabase is configured, filter strictly by authenticated user's ID
  // When offline / unconfigured, fallback to the client session's isMine property
  const mine = useMemo(() => {
    if (isConfigured) {
      if (!user) return []
      return reports.filter((r) => r.userId === user.id)
    }
    return reports.filter((r) => r.isMine)
  }, [reports, user, isConfigured])

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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <TopHeader
        title="My Reports"
        subtitle="Track the civic issues you submitted and their community verification status"
        right={
          <Link
            to="/report"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary-container px-3.5 py-1.5 text-[13px] font-semibold text-on-primary shadow-xs hover:bg-primary transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Report</span>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isConfigured && !user ? (
          <div className="mx-auto max-w-md rounded-3xl border border-outline-variant/50 bg-surface-lowest p-8 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="text-[20px] font-bold text-on-surface">Sign in to track your reports</h3>
            <p className="text-[14px] text-on-surface-variant leading-relaxed">
              You are currently browsing as a guest. Sign in to view, edit, and track resolution progress for reports linked to your account.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-[14px] font-semibold text-on-primary hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98]"
            >
              Sign In / Register
            </Link>
          </div>
        ) : (
          <>
            {/* Metrics & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-3 w-full sm:max-w-md">
                <Metric label="Total Reports" value={counts.All} />
                <Metric label="Active" value={counts.Active} accent="text-error" />
                <Metric label="Resolved" value={counts.Resolved} accent="text-tertiary" />
              </div>

              <div className="flex w-full sm:w-auto rounded-2xl bg-surface-high p-1">
                {(['All', 'Active', 'Resolved'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={cn(
                      'h-10 px-5 rounded-xl text-[13px] font-semibold transition-all active:scale-95',
                      tab === item
                        ? 'bg-surface-lowest text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface',
                    )}
                  >
                    {item} ({counts[item]})
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[14px] text-on-surface-variant">
                Loading your civic reports…
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-outline-variant/60 p-12 text-center space-y-3">
                <p className="text-[16px] font-semibold text-on-surface">No reports found in this view</p>
                <p className="text-[13px] text-on-surface-variant max-w-sm mx-auto">
                  {tab === 'All'
                    ? "You haven't submitted any civic issues yet. Notice an issue around Nashik? Help by filing a report."
                    : `No ${tab.toLowerCase()} reports found in your submission history.`}
                </p>
                <div className="pt-2">
                  <Link
                    to="/report"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary-container px-5 text-[13px] font-semibold text-on-primary hover:bg-primary shadow-xs transition-all active:scale-98"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Report an Issue</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Responsive multi-column grid: 1 col on mobile, 2 cols on md, 3 cols on lg+ */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </>
        )}
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
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-3.5 text-center shadow-xs">
      <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className={cn('mt-1 text-[22px] sm:text-[24px] font-bold leading-tight', accent ?? 'text-on-surface')}>
        {value}
      </p>
    </div>
  )
}

