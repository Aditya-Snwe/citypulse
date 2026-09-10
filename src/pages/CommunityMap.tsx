import { ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '../components/MapView'
import { SeverityBadge, StatusBadge } from '../components/StatusBadge'
import { TopHeader } from '../components/TopHeader'
import { useReports } from '../context/ReportsContext'
import { NASHIK_CENTER } from '../data/mockReports'
import { cn } from '../lib/cn'
import { formatDistance, formatRelative } from '../lib/format'
import { matchesMapFilter } from '../lib/issueMeta'
import type { MapFilter, Report } from '../types/report'

const FILTERS: MapFilter[] = ['All', 'Roads', 'Waste', 'Water', 'Electricity', 'Other']

export function CommunityMap() {
  const { reports } = useReports()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<MapFilter>('All')
  const [selected, setSelected] = useState<Report | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)

  const visible = useMemo(
    () => reports.filter((r) => matchesMapFilter(r.category, filter)),
    [reports, filter],
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="Community" subtitle="Mock hazards around Nashik" />
      <div className="relative min-h-0 flex-1">
        <MapView
          reports={visible}
          selectedId={selected?.id}
          onSelect={setSelected}
          center={NASHIK_CENTER}
          zoom={13}
        />

        <div className="absolute top-3 right-0 left-0 z-20 px-3">
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setFilter(item)
                  setSelected(null)
                }}
                className={cn(
                  'h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold shadow-sm active:scale-95',
                  filter === item
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant/60 bg-surface-lowest/95 text-on-surface backdrop-blur-md',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-16 right-3 z-20">
          <button
            type="button"
            onClick={() => setLegendOpen((open) => !open)}
            className="flex h-11 items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface/95 px-3 text-[12px] font-semibold shadow-sm backdrop-blur-md"
          >
            Legend {legendOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {legendOpen && (
            <div className="mt-2 w-40 space-y-2 rounded-xl border border-outline-variant/60 bg-surface/95 p-3 text-[12px] shadow-md backdrop-blur-md">
              <LegendDot color="#ef4444" label="High severity" />
              <LegendDot color="#f59e0b" label="Medium severity" />
              <LegendDot color="#007d55" label="Low / resolved" />
            </div>
          )}
        </div>

        {selected && (
          <div className="absolute right-3 bottom-3 left-3 z-30">
            <section className="rounded-2xl border border-outline-variant/70 bg-surface-lowest/98 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-outline-variant/60" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] text-outline">Issue</p>
                  <h2 className="text-[18px] font-semibold">{selected.type}</h2>
                </div>
                <SeverityBadge severity={selected.severity} />
              </div>
              <p className="mt-2 text-[13px] text-on-surface-variant">
                Location: {selected.locationLabel}
              </p>
              <p className="mt-1 text-[13px] text-on-surface-variant">
                Reported: {formatRelative(selected.reportedAt)}
              </p>
              <div className="mt-2">
                <StatusBadge status={selected.status} />
              </div>
              <p className="mt-2 text-[13px] font-medium text-primary">
                {formatDistance(selected.distanceMeters) || 'Nearby'}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/reports/${selected.id}`)}
                  className="h-12 flex-1 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary active:scale-[0.98]"
                >
                  View details
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-12 rounded-lg border border-outline-variant px-4 text-[14px] font-semibold"
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full border-2 border-white shadow" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}
