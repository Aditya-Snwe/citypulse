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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title={shortId} backTo={-1} />
      <main className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-4">
        {report.isDemo && (
          <div className="flex items-center gap-1.5 rounded-xl border border-warning-container/50 bg-warning-container/20 px-3 py-2 text-[12px] text-on-surface-variant">
            <span className="font-semibold text-warning">DEMO REPORT</span>
            <span>· Sample dataset for testing.</span>
          </div>
        )}

        <section className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
          </div>
          <h2 className="mt-3 text-[24px] font-semibold tracking-tight">{report.type}</h2>
          <p className="mt-2 flex items-start gap-1.5 text-[14px] text-on-surface-variant">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {report.locationLabel}
          </p>
        </section>

        {report.image && (
          <img
            src={report.image}
            alt={`${report.type} evidence`}
            className="h-52 w-full rounded-2xl object-cover"
          />
        )}

        <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4 text-[13px]">
          <div>
            <dt className="text-outline">Reported</dt>
            <dd className="mt-1 font-semibold">{formatDate(report.reportedAt)}</dd>
          </div>
          <div>
            <dt className="text-outline">Severity</dt>
            <dd className="mt-1 font-semibold">{report.severity}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-outline">Category</dt>
            <dd className="mt-1 font-semibold">{report.category}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-outline">Coordinates</dt>
            <dd className="mt-1 font-medium">{formatCoords(report.latitude, report.longitude)}</dd>
          </div>
        </dl>

        {report.description && (
          <p className="text-[14px] leading-5 text-on-surface-variant">{report.description}</p>
        )}

        <section className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4">
          <h3 className="mb-3 text-[16px] font-semibold">Timeline</h3>
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

        {isConfigured && !user && (
          <p className="text-center text-[12px] text-on-surface-variant italic">
            Sign in to verify civic issues with the community.
          </p>
        )}

        <VerificationCard
          confirmations={report.confirmations}
          vote={getVote(report.id)}
          onVote={(vote) => confirmIssue(report.id, vote)}
          disabled={isConfigured && !user}
        />


        <section className="rounded-2xl border border-outline-variant/40 bg-surface-low p-4">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Bell className="h-4 w-4" />
            <h3 className="text-[16px] font-semibold">Nearby Citizen Alert</h3>
          </div>
          <p className="text-[14px] text-on-surface-variant">
            Citizens within this ward/radius receive alerts to confirm or avoid this area.
          </p>
        </section>
      </main>
    </div>
  )
}
