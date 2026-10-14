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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="My Reports" subtitle="Track the issues you submitted" />
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {isConfigured && !user ? (
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-lowest p-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <LogIn className="h-6 w-6" />
            </div>
            <h3 className="text-[18px] font-semibold">Sign in to track your reports</h3>
            <p className="text-[13px] text-on-surface-variant max-w-xs mx-auto">
              You are currently browsing as a guest. Sign in to view and track reports linked to
              your account.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-[13px] font-semibold text-on-primary active:scale-[0.98]"
            >
              Sign In / Register
            </Link>
          </div>
        ) : (
          <>
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

            {loading ? (
              <div className="py-12 text-center text-[13px] text-on-surface-variant">
                Loading your reports…
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/60 p-8 text-center space-y-3">
                <p className="text-[14px] font-medium text-on-surface">No reports in this tab</p>
                <p className="text-[12px] text-on-surface-variant">
                  {tab === 'All'
                    ? "You haven't submitted any civic issues yet."
                    : `No ${tab.toLowerCase()} reports found.`}
                </p>
                <Link
                  to="/report"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-container px-4 text-[13px] font-semibold text-on-primary"
                >
                  <Plus className="h-4 w-4" />
                  Report an Issue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
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
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-3 text-center">
      <p className="text-[11px] text-on-surface-variant">{label}</p>
      <p className={cn('mt-1 text-[24px] font-bold', accent ?? 'text-on-surface')}>{value}</p>
    </div>
  )
}
