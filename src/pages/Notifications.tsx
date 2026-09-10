import { useNavigate } from 'react-router-dom'
import { TopHeader } from '../components/TopHeader'
import { useReports } from '../context/ReportsContext'
import { NEARBY_ALERT_IDS } from '../data/mockReports'
import { formatDistance, formatRelative } from '../lib/format'
import { SeverityBadge } from '../components/StatusBadge'

export function Notifications() {
  const { reports } = useReports()
  const navigate = useNavigate()
  const alerts = NEARBY_ALERT_IDS.map((id) => reports.find((r) => r.id === id)).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="Notifications" backTo="/home" />
      <main className="flex-1 space-y-3 overflow-y-auto px-4 pt-4 pb-4">
        <p className="text-[13px] text-on-surface-variant">
          Mock nearby alerts for this prototype. Real push notifications come later.
        </p>
        {alerts.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => navigate(`/reports/${report.id}`)}
            className="w-full rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4 text-left active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{report.type} nearby</p>
              <SeverityBadge severity={report.severity} />
            </div>
            <p className="mt-1 text-[13px] text-on-surface-variant">{report.locationLabel}</p>
            <p className="mt-2 text-[12px] text-outline">
              {formatDistance(report.distanceMeters)} · {formatRelative(report.reportedAt)}
            </p>
          </button>
        ))}
      </main>
    </div>
  )
}
