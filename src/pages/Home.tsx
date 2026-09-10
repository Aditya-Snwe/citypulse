import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertCard } from '../components/AlertCard'
import { ReportCard } from '../components/ReportCard'
import { TopHeader } from '../components/TopHeader'
import { useReports } from '../context/ReportsContext'
import { NEARBY_ALERT_IDS } from '../data/mockReports'
import { greeting } from '../lib/format'

export function Home() {
  const { reports } = useReports()
  const nearby = NEARBY_ALERT_IDS.map((id) => reports.find((r) => r.id === id)).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  )
  const mine = reports.filter((r) => r.isMine).slice(0, 3)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="Nashik, College Rd" subtitle="Demo civic feed · not live reports" />
      <main className="flex-1 space-y-6 overflow-y-auto px-4 pt-4 pb-4">
        <section>
          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
            Citizen portal
          </p>
          <h2 className="mt-1 text-[26px] leading-8 font-semibold tracking-tight">
            {greeting()} 👋
          </h2>
          <p className="mt-1 text-[14px] text-on-surface-variant">
            Stay aware of what's happening around you.
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
          <h3 className="text-[20px] font-semibold">Nearby Alerts</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {nearby.map((report) => (
              <AlertCard key={report.id} report={report} compact />
            ))}
          </div>
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
            {mine.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
