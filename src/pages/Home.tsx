import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertCard } from '../components/AlertCard'
import { ReportCard } from '../components/ReportCard'
import { TopHeader } from '../components/TopHeader'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { greeting } from '../lib/format'

export function Home() {
  const { reports, loading } = useReports()
  const { user, isConfigured } = useAuth()

  // Real reports prioritization:
  // Nearby alerts show active/unresolved reports first
  const nearby = reports
    .filter((r) => r.status !== 'Resolved')
    .slice(0, 5)

  // User's own reports: strictly by user.id if configured, else isMine flag
  const mine = reports
    .filter((r) => (isConfigured ? user && r.userId === user.id : r.isMine))
    .slice(0, 3)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader
        title="Nashik, Civic Feed"
        subtitle={isConfigured ? 'Live community awareness' : 'Demo civic feed · offline mode'}
      />
      <main className="flex-1 space-y-6 overflow-y-auto px-4 pt-4 pb-4">
        <section>
          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
            Citizen portal
          </p>
          <h2 className="mt-1 text-[26px] leading-8 font-semibold tracking-tight">
            {greeting()} 👋
          </h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">
            Stay aware of civic hazards and reports around you.
          </p>
        </section>

        <Link
          to="/report"
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary-container text-[16px] font-semibold text-on-primary shadow-md active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Report an Issue
        </Link>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold">Active Alerts</h3>
            <span className="text-[12px] text-on-surface-variant">
              {loading ? 'Updating…' : `${nearby.length} active`}
            </span>
          </div>
          {nearby.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
              {nearby.map((report) => (
                <AlertCard key={report.id} report={report} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-6 text-center text-[13px] text-on-surface-variant">
              No active alerts right now. Your neighborhood is clear.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold">Your Reports</h3>
            <Link
              to="/reports"
              className="flex min-h-11 items-center text-[13px] font-semibold text-primary"
            >
              View All Reports
            </Link>
          </div>
          <div className="space-y-3">
            {mine.length > 0 ? (
              mine.map((report) => <ReportCard key={report.id} report={report} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant/60 p-4 text-center">
                <p className="text-[13px] text-on-surface-variant">
                  {isConfigured && !user
                    ? 'Sign in to see reports you have submitted.'
                    : 'You haven’t reported any civic issues yet.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
