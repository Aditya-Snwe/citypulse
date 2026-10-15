import { ChevronDown, ChevronUp, Layers, MapPin, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapView } from '../components/MapView'
import { SeverityBadge, StatusBadge } from '../components/StatusBadge'
import { TopHeader } from '../components/TopHeader'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { NASHIK_CENTER } from '../data/mockReports'
import { cn } from '../lib/cn'
import { formatDistance, formatRelative } from '../lib/format'
import { matchesMapFilter } from '../lib/issueMeta'
import type { MapFilter, Report } from '../types/report'

const FILTERS: MapFilter[] = ['All', 'Roads', 'Waste', 'Water', 'Electricity', 'Other']

export function CommunityMap() {
  const { reports, showMockData, setShowMockData } = useReports()
  const { isConfigured } = useAuth()
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
      <TopHeader
        title="Community Map"
        subtitle={isConfigured ? 'Live citizen reports across Nashik' : 'Civic hazard map · Nashik demo'}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Sidebar Panel (Visible on lg and larger screens) */}
        <aside className="hidden lg:flex w-96 xl:w-[420px] shrink-0 flex-col border-r border-outline-variant/40 bg-surface-lowest z-20 shadow-xs">
          {/* Filter Pills */}
          <div className="border-b border-outline-variant/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-outline uppercase tracking-wider">
                Filter by Category
              </span>
              <span className="text-[12px] font-medium text-primary">
                {visible.length} {visible.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item)
                    setSelected(null)
                  }}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all active:scale-95',
                    filter === item
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'border border-outline-variant/50 bg-surface text-on-surface hover:bg-surface-container',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Severity Legend & Demo Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-3">
                <LegendDot color="#ef4444" label="High" />
                <LegendDot color="#f59e0b" label="Medium" />
                <LegendDot color="#007d55" label="Low" />
              </div>

              {isConfigured && (
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>Demo data</span>
                  <input
                    type="checkbox"
                    checked={showMockData}
                    onChange={(e) => setShowMockData(e.target.checked)}
                    className="rounded accent-primary"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Selected Issue Preview or List Feed */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {selected ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Selected Issue
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-outline hover:text-on-surface"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Deselect</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-outline-variant/60 bg-surface p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-outline font-mono">
                          {selected.id.length > 10 ? `CP-${selected.id.substring(0, 8)}` : selected.id}
                        </span>
                        {selected.isDemo && (
                          <span className="rounded bg-warning-container px-1.5 py-0.5 text-[10px] font-bold text-on-warning-container">
                            DEMO
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-[18px] font-bold text-on-surface">{selected.type}</h3>
                    </div>
                    <SeverityBadge severity={selected.severity} />
                  </div>

                  <p className="flex items-start gap-1.5 text-[13px] text-on-surface-variant">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{selected.locationLabel}</span>
                  </p>

                  <div className="flex items-center justify-between text-[12px]">
                    <StatusBadge status={selected.status} />
                    <span className="font-semibold text-primary">
                      {formatDistance(selected.distanceMeters) || 'Nearby'}
                    </span>
                  </div>

                  {selected.description && (
                    <p className="text-[13px] text-on-surface-variant line-clamp-2">
                      {selected.description}
                    </p>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/reports/${selected.id}`)}
                      className="h-10 flex-1 rounded-xl bg-primary-container text-[13px] font-semibold text-on-primary hover:bg-primary transition-all active:scale-98"
                    >
                      View Full Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="h-10 rounded-xl border border-outline-variant px-3 text-[13px] font-semibold hover:bg-surface-container"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[12px] font-semibold text-outline uppercase tracking-wider mb-2">
                    Other {filter} Reports ({visible.length - 1})
                  </p>
                  <div className="space-y-2">
                    {visible
                      .filter((r) => r.id !== selected.id)
                      .map((report) => (
                        <button
                          key={report.id}
                          type="button"
                          onClick={() => setSelected(report)}
                          className="w-full text-left rounded-xl border border-outline-variant/40 bg-surface-lowest p-3 transition-all hover:border-primary/50 hover:bg-surface-container/30"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-semibold text-on-surface">{report.type}</span>
                            <SeverityBadge severity={report.severity} />
                          </div>
                          <p className="mt-1 text-[12px] text-on-surface-variant truncate">
                            {report.locationLabel}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                <p className="text-[12px] text-on-surface-variant pb-1">
                  Click any marker on the map or select an issue below to inspect:
                </p>
                {visible.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelected(report)}
                    className="w-full text-left rounded-xl border border-outline-variant/40 bg-surface-lowest p-3 transition-all hover:border-primary hover:bg-surface-container/30 active:scale-99"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-on-surface">{report.type}</span>
                      <SeverityBadge severity={report.severity} />
                    </div>
                    <p className="mt-1 text-[12px] text-on-surface-variant truncate">
                      {report.locationLabel}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-outline">
                      <span>{formatRelative(report.reportedAt)}</span>
                      <span>{formatDistance(report.distanceMeters)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Map View Canvas (Fills full width on mobile, fills right area on desktop) */}
        <div className="relative min-h-0 flex-1">
          <MapView
            reports={visible}
            selectedId={selected?.id}
            onSelect={setSelected}
            center={selected ? { lat: selected.latitude, lng: selected.longitude } : NASHIK_CENTER}
            zoom={selected ? 15 : 13}
          />

          {/* Mobile Top Filter Pills (< lg) */}
          <div className="absolute top-3 right-0 left-0 z-20 px-3 lg:hidden">
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
                    'h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold shadow-sm active:scale-95',
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

          {/* Mobile Legend (< lg) */}
          <div className="absolute top-16 right-3 z-20 flex flex-col items-end gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setLegendOpen((open) => !open)}
              className="flex h-10 items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface/95 px-3 text-[12px] font-semibold shadow-sm backdrop-blur-md"
            >
              Legend {legendOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {legendOpen && (
              <div className="w-48 space-y-2 rounded-xl border border-outline-variant/60 bg-surface/95 p-3 text-[12px] shadow-md backdrop-blur-md">
                <LegendDot color="#ef4444" label="High severity" />
                <LegendDot color="#f59e0b" label="Medium severity" />
                <LegendDot color="#007d55" label="Low / resolved" />

                {isConfigured && (
                  <div className="mt-3 pt-2 border-t border-outline-variant/40">
                    <label className="flex items-center justify-between text-[11px] font-medium cursor-pointer">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        Preview Demo Data
                      </span>
                      <input
                        type="checkbox"
                        checked={showMockData}
                        onChange={(e) => setShowMockData(e.target.checked)}
                        className="rounded accent-primary"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Selected Bottom Sheet (< lg) */}
          {selected && (
            <div className="absolute right-3 bottom-3 left-3 z-30 lg:hidden">
              <section className="rounded-2xl border border-outline-variant/70 bg-surface-lowest/98 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-outline-variant/60" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] text-outline font-mono">
                        {selected.id.length > 10 ? `CP-${selected.id.substring(0, 8)}` : selected.id}
                      </p>
                      {selected.isDemo && (
                        <span className="rounded bg-warning-container px-1.5 py-0.5 text-[10px] font-bold text-on-warning-container">
                          DEMO
                        </span>
                      )}
                    </div>
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
                    className="h-11 flex-1 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary active:scale-[0.98]"
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="h-11 rounded-lg border border-outline-variant px-4 text-[14px] font-semibold"
                  >
                    Close
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full border border-white shadow-xs" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}

