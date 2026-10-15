import { ArrowRight, Map as MapIcon, Plus, ShieldCheck, Sparkles } from 'lucide-react'
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

  // Nearby alerts show active/unresolved reports first
  const nearby = reports
    .filter((r) => r.status !== 'Resolved')
    .slice(0, 6)

  // User's own reports: strictly by user.id if configured, else isMine flag
  const mine = reports
    .filter((r) => (isConfigured ? user && r.userId === user.id : r.isMine))
    .slice(0, 4)

  const activeCount = reports.filter((r) => r.status !== 'Resolved').length
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <TopHeader
        title="Nashik Civic Feed"
        subtitle={isConfigured ? 'Live community awareness · verified reports' : 'Demo civic feed · offline mode'}
        right={
          <Link
            to="/report"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary-container px-3.5 py-1.5 text-[13px] font-semibold text-on-primary shadow-xs hover:bg-primary transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Report Issue</span>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-outline-variant/40 bg-linear-to-r from-surface-low via-surface-container/60 to-surface-lowest p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-primary uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Citizen Portal · Nashik
              </span>
              <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-on-surface">
                {greeting()} 👋
              </h2>
              <p className="text-[14px] sm:text-[15px] text-on-surface-variant">
                Stay aware of civic hazards around you. Report issues, verify with the community, and help keep the city safe and well-maintained.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <div className="flex items-center gap-4 rounded-2xl border border-outline-variant/40 bg-surface-lowest/90 px-4 py-2.5 backdrop-blur-xs">
                <div>
                  <p className="text-[11px] font-medium text-outline uppercase tracking-wider">Active</p>
                  <p className="text-[20px] font-bold text-error leading-tight">{activeCount}</p>
                </div>
                <div className="h-8 w-px bg-outline-variant/40" />
                <div>
                  <p className="text-[11px] font-medium text-outline uppercase tracking-wider">Resolved</p>
                  <p className="text-[20px] font-bold text-tertiary leading-tight">{resolvedCount}</p>
                </div>
              </div>

              <Link
                to="/report"
                className="flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-[14px] font-semibold text-on-primary shadow-md shadow-primary/20 hover:bg-primary transition-all active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                <span>Report an Issue</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Area: Active Alerts and Map Banner (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Alerts */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-on-surface">Active Civic Alerts</h3>
                  <p className="text-[12px] sm:text-[13px] text-on-surface-variant">
                    Unresolved road, waste, water, and lighting hazards near your area
                  </p>
                </div>
                <span className="rounded-full bg-surface-container px-3 py-1 text-[12px] font-semibold text-on-surface-variant">
                  {loading ? 'Updating…' : `${nearby.length} active`}
                </span>
              </div>

              {nearby.length > 0 ? (
                /* Mobile carousel, Tablet & Desktop responsive grid */
                <div className="flex md:grid md:grid-cols-2 gap-3.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                  {nearby.map((report) => (
                    <AlertCard key={report.id} report={report} compact />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-8 text-center text-[14px] text-on-surface-variant">
                  No active alerts right now. Your neighborhood is clear.
                </div>
              )}
            </section>

            {/* Interactive Map Teaser Banner */}
            <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-semibold text-[13px]">
                    <MapIcon className="h-4 w-4" />
                    <span>Nashik Spatial Map</span>
                  </div>
                  <h4 className="text-[18px] font-bold text-on-surface">
                    Explore All Neighborhood Reports on the Map
                  </h4>
                  <p className="text-[13px] text-on-surface-variant max-w-xl">
                    View active clusters, filter by category (Roads, Waste, Water, Electricity), and click any marker to view evidence and verification status.
                  </p>
                </div>
                <Link
                  to="/map"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-primary text-primary px-4 py-2.5 text-[13px] font-semibold hover:bg-primary/5 active:scale-95 transition-all"
                >
                  <span>Open Community Map</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>

          {/* Secondary Column: User Reports & Civic Info (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* User's Reports */}
            <section className="rounded-3xl border border-outline-variant/40 bg-surface-lowest p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-on-surface">Your Reports</h3>
                <Link
                  to="/reports"
                  className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {mine.length > 0 ? (
                  mine.map((report) => <ReportCard key={report.id} report={report} />)
                ) : (
                  <div className="rounded-2xl border border-dashed border-outline-variant/60 p-6 text-center space-y-2">
                    <p className="text-[13px] text-on-surface-variant">
                      {isConfigured && !user
                        ? 'Sign in to see and track reports you have submitted.'
                        : 'You haven’t reported any civic issues yet.'}
                    </p>
                    <Link
                      to="/report"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
                    >
                      <span>Report your first issue →</span>
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Civic Guarantee & How It Works */}
            <section className="rounded-3xl border border-outline-variant/40 bg-surface-low p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h4 className="text-[15px] font-bold text-on-surface">Civic Pulse Guarantee</h4>
              </div>
              <ul className="space-y-2 text-[12px] text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-primary">•</span>
                  <span><strong>Zero department guessing:</strong> You describe what you see, and CityPulse auto-derives the category and severity.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-primary">•</span>
                  <span><strong>Duplicate prevention:</strong> 100m street proximity detection prevents redundant duplicate tickets.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-primary">•</span>
                  <span><strong>Community verified:</strong> 5 citizen votes confirm issues and keep the municipal feed transparent.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

