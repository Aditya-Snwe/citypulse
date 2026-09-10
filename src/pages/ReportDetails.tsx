import { Bell, MapPin } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { SeverityBadge, StatusBadge } from '../components/StatusBadge'
import { Timeline } from '../components/Timeline'
import { TopHeader } from '../components/TopHeader'
import { VerificationCard } from '../components/VerificationCard'
import { useReports } from '../context/ReportsContext'
import { formatCoords, formatDate } from '../lib/format'

export function ReportDetails() {
  const { id } = useParams()
  const { getReport, confirmIssue, getVote } = useReports()
  const report = id ? getReport(id) : undefined

  if (!report) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <TopHeader title="Report" backTo="/reports" />
        <p className="p-4 text-[14px] text-on-surface-variant">This report could not be found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title={report.id} backTo={-1} />
      <main className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-4">
        <section className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
          </div>
          <h2 className="mt-3 text-[24px] font-semibold tracking-tight">{report.type}</h2>
          <p className="mt-2 flex items-start gap-1.5 text-[14px] text-on-surface-variant">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
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

        <VerificationCard
          confirmations={report.confirmations}
          vote={getVote(report.id)}
          onVote={(vote) => confirmIssue(report.id, vote)}
        />

        <section className="rounded-2xl border border-outline-variant/40 bg-surface-low p-4">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Bell className="h-4 w-4" />
            <h3 className="text-[16px] font-semibold">Nearby Citizen Alert</h3>
          </div>
          <p className="text-[14px] text-on-surface-variant">
            Citizens within the affected area may receive an awareness alert.
          </p>
        </section>
      </main>
    </div>
  )
}
