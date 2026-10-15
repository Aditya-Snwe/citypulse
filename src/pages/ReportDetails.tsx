import { Bell, MapPin } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { SeverityBadge, StatusBadge } from '../components/StatusBadge'
import { Timeline } from '../components/Timeline'
import { TopHeader } from '../components/TopHeader'
import { VerificationCard } from '../components/VerificationCard'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { formatCoords, formatDate } from '../lib/format'

export function ReportDetails() {
  const { id } = useParams()
  const { user, isConfigured } = useAuth()
  const { getReport, confirmIssue, getVote, loading } = useReports()
  const report = id ? getReport(id) : undefined

  if (loading && !report) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <TopHeader title="Report" backTo="/reports" />
        <p className="p-6 text-center text-[14px] text-on-surface-variant">Loading report details…</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <TopHeader title="Report" backTo="/reports" />
        <div className="p-6 text-center space-y-2">
          <p className="text-[16px] font-semibold">Report Not Found</p>
          <p className="text-[14px] text-on-surface-variant">
            This report does not exist or may have been removed.
          </p>
        </div>
      </div>
    )
  }

  // Display short ID if UUID
  const shortId = report.id.length > 10 ? `CP-${report.id.substring(0, 8)}` : report.id

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <TopHeader title={shortId} backTo={-1} subtitle={`${report.category} · ${report.locationLabel}`} />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        {report.isDemo && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-warning-container/50 bg-warning-container/20 px-4 py-2.5 text-[13px] text-on-surface-variant">
            <span className="font-semibold text-warning">DEMO REPORT</span>
            <span>· Sample dataset for demonstration and automated testing.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column (Issue Info, Photo, Metadata, Timeline) */}
          <div className="lg:col-span-7 space-y-6">
            <section className="rounded-3xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={report.status} />
                  <SeverityBadge severity={report.severity} />
                </div>
                <span className="text-[12px] font-mono text-outline">{shortId}</span>
              </div>
              <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-on-surface">
                {report.type}
              </h1>
              <p className="flex items-start gap-1.5 text-[14px] sm:text-[15px] text-on-surface-variant">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{report.locationLabel}</span>
              </p>
            </section>

            {report.image && (
              <div className="overflow-hidden rounded-3xl border border-outline-variant/40 shadow-xs">
                <img
                  src={report.image}
                  alt={`${report.type} evidence`}
                  className="max-h-96 w-full object-cover"
                />
              </div>
            )}

            {report.description && (
              <section className="rounded-3xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs space-y-2">
                <h3 className="text-[14px] font-semibold text-outline uppercase tracking-wider">
                  Citizen Observations
                </h3>
                <p className="text-[15px] leading-relaxed text-on-surface whitespace-pre-line">
                  {report.description}
                </p>
              </section>
            )}

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-3xl border border-outline-variant/40 bg-surface-lowest p-6 text-[13px] shadow-xs">
              <div>
                <dt className="text-outline font-medium">Reported</dt>
                <dd className="mt-1 font-semibold text-on-surface">{formatDate(report.reportedAt)}</dd>
              </div>
              <div>
                <dt className="text-outline font-medium">Severity</dt>
                <dd className="mt-1 font-semibold text-on-surface">{report.severity}</dd>
              </div>
              <div>
                <dt className="text-outline font-medium">Category</dt>
                <dd className="mt-1 font-semibold text-on-surface">{report.category}</dd>
              </div>
              <div>
                <dt className="text-outline font-medium">Coordinates</dt>
                <dd className="mt-1 font-mono font-medium text-primary">
                  {formatCoords(report.latitude, report.longitude)}
                </dd>
              </div>
            </dl>

            <section className="rounded-3xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs">
              <h3 className="mb-4 text-[17px] font-bold text-on-surface">Civic Resolution Timeline</h3>
              <Timeline
                steps={
                  report.timeline ?? [
                    { label: 'Report submitted', done: true },
                    { label: 'Location recorded', done: true },
                    { label: 'Community verification started', done: true },
                    { label: 'Community monitoring', done: false, active: true },
                  ]
                }
              />
            </section>
          </div>

          {/* Side Column (Verification & Ward Alert) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-4">
              <VerificationCard
                confirmations={report.confirmations}
                vote={getVote(report.id)}
                onVote={(vote) => confirmIssue(report.id, vote)}
                disabled={isConfigured && !user}
              />

              {isConfigured && !user && (
                <p className="text-center text-[12px] text-on-surface-variant italic">
                  Sign in to register your verification vote for this report.
                </p>
              )}
            </div>

            <section className="rounded-3xl border border-outline-variant/40 bg-surface-low p-6 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="h-4 w-4" />
                <h3 className="text-[16px] font-bold text-on-surface">Nearby Citizen Alert</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-on-surface-variant">
                Citizens with alert preferences saved within this ward receive push and in-app alerts to confirm or avoid this area.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
