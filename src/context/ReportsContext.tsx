import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { MOCK_REPORTS } from '../data/mockReports'
import { categoryForType, severityForType } from '../lib/issueMeta'
import type { GeoPoint, IssueType, Report } from '../types/report'

const STORAGE_KEY = 'citypulse.userReports'
const VOTES_KEY = 'citypulse.votes'

type Vote = 'present' | 'resolved'

interface ReportsContextValue {
  reports: Report[]
  addReport: (input: {
    type: IssueType
    locationLabel: string
    point: GeoPoint
    description: string
    image: string | null
  }) => Report
  getReport: (id: string) => Report | undefined
  confirmIssue: (id: string, vote: Vote) => void
  getVote: (id: string) => Vote | undefined
}

const ReportsContext = createContext<ReportsContextValue | null>(null)

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function nextId(existing: Report[]): string {
  const nums = existing
    .map((r) => Number(r.id.replace('CP-', '')))
    .filter((n) => Number.isFinite(n))
  const max = nums.length ? Math.max(...nums) : 1042
  return `CP-${max + 1}`
}

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [userReports, setUserReports] = useState<Report[]>(() =>
    readJson<Report[]>(STORAGE_KEY, []),
  )
  const [votes, setVotes] = useState<Record<string, Vote>>(() =>
    readJson<Record<string, Vote>>(VOTES_KEY, {}),
  )
  const [confirmOverrides, setConfirmOverrides] = useState<Record<string, number>>({})

  const reports = useMemo(() => {
    const mockIds = new Set(MOCK_REPORTS.map((r) => r.id))
    const extras = userReports.filter((r) => !mockIds.has(r.id))
    return [...extras, ...MOCK_REPORTS].map((r) => ({
      ...r,
      confirmations: r.confirmations + (confirmOverrides[r.id] ?? 0),
    }))
  }, [userReports, confirmOverrides])

  const addReport: ReportsContextValue['addReport'] = (input) => {
    const report: Report = {
      id: nextId([...userReports, ...MOCK_REPORTS]),
      type: input.type,
      category: categoryForType(input.type),
      description: input.description || 'Citizen-reported civic issue.',
      locationLabel: input.locationLabel,
      latitude: input.point.lat,
      longitude: input.point.lng,
      severity: severityForType(input.type),
      status: 'Submitted',
      reportedAt: new Date().toISOString(),
      confirmations: 1,
      image: input.image,
      isMine: true,
      distanceMeters: 0,
      timeline: [
        { label: 'Report submitted', done: true },
        { label: 'Location recorded', done: true },
        { label: 'Community verification started', done: false, active: true },
        { label: 'Community monitoring', done: false },
      ],
    }
    setUserReports((prev) => {
      const next = [report, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    return report
  }

  const getReport = (id: string) => reports.find((r) => r.id === id)

  const confirmIssue = (id: string, vote: Vote) => {
    const previous = votes[id]
    setVotes((prev) => {
      const next = { ...prev, [id]: vote }
      localStorage.setItem(VOTES_KEY, JSON.stringify(next))
      return next
    })
    setConfirmOverrides((prev) => {
      let delta = 0
      if (vote === 'present' && previous !== 'present') delta += 1
      if (previous === 'present' && vote !== 'present') delta -= 1
      if (!delta) return prev
      return { ...prev, [id]: (prev[id] ?? 0) + delta }
    })
  }

  const getVote = (id: string) => votes[id]

  const value = useMemo(
    () => ({ reports, addReport, getReport, confirmIssue, getVote }),
    [reports, votes, confirmOverrides, userReports],
  )

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error('useReports must be used within ReportsProvider')
  return ctx
}
