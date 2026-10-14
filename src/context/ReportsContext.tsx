import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_REPORTS } from '../data/mockReports'
import { dbService } from '../lib/dbService'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { categoryForType, severityForType } from '../lib/issueMeta'
import type { GeoPoint, IssueType, Report } from '../types/report'
import { useAuth } from './AuthContext'

const STORAGE_KEY = 'citypulse.userReports'
const VOTES_KEY = 'citypulse.votes'
const DEMO_PREVIEW_KEY = 'citypulse.showMockData'

type Vote = 'present' | 'resolved'

interface ReportsContextValue {
  reports: Report[]
  loading: boolean
  error: string | null
  showMockData: boolean
  setShowMockData: (show: boolean) => void
  addReport: (input: {
    type: IssueType
    locationLabel: string
    point: GeoPoint
    description: string
    image: string | null
    file?: File | null
  }) => Promise<Report>
  getReport: (id: string) => Report | undefined
  confirmIssue: (id: string, vote: Vote) => Promise<void>
  getVote: (id: string) => Vote | undefined
  refreshReports: () => Promise<void>
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
  const { user } = useAuth()
  const [loading, setLoading] = useState(() => isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [supabaseReports, setSupabaseReports] = useState<Report[]>([])
  const [userReports, setUserReports] = useState<Report[]>(() =>
    readJson<Report[]>(STORAGE_KEY, []),
  )
  const [votes, setVotes] = useState<Record<string, Vote>>(() =>
    readJson<Record<string, Vote>>(VOTES_KEY, {}),
  )

  // Demo preview toggle
  const [showMockData, setShowMockDataState] = useState<boolean>(() => {
    if (!isSupabaseConfigured) return true
    return readJson<boolean>(DEMO_PREVIEW_KEY, true)
  })

  const setShowMockData = useCallback((val: boolean) => {
    setShowMockDataState(val)
    localStorage.setItem(DEMO_PREVIEW_KEY, JSON.stringify(val))
  }, [])

  const loadReportsAndVotes = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setError(null)
    try {
      const [reportsData, userVotesData] = await Promise.all([
        dbService.fetchReports(),
        user ? dbService.fetchUserVotes(user.id) : Promise.resolve({}),
      ])

      setSupabaseReports(
        reportsData.map((r) => ({
          ...r,
          isMine: user ? r.userId === user.id : false,
        })),
      )

      if (user) {
        setVotes((prev) => ({ ...prev, ...userVotesData }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch civic reports'
      setError(msg)
      console.warn('Reports load error:', msg)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let isMounted = true

    dbService
      .fetchReports()
      .then((data) => {
        if (!isMounted) return
        setSupabaseReports(
          data.map((r) => ({
            ...r,
            isMine: user ? r.userId === user.id : false,
          })),
        )
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : 'Failed to fetch civic reports'
        setError(msg)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    // Fetch user votes if authenticated
    if (user) {
      dbService.fetchUserVotes(user.id).then((userVotes) => {
        if (isMounted) {
          setVotes((prev) => ({ ...prev, ...userVotes }))
        }
      })
    }

    // Subscribe to both reports and report_votes tables
    const reportsChannel = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        if (isMounted) {
          loadReportsAndVotes()
        }
      })
      .subscribe()

    const votesChannel = supabase
      .channel('public:report_votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'report_votes' }, () => {
        if (isMounted) {
          loadReportsAndVotes()
        }
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(reportsChannel)
      supabase.removeChannel(votesChannel)
    }
  }, [loadReportsAndVotes, user])

  // Combine live Supabase reports, local offline reports, and optional demo mock reports
  const reports = useMemo(() => {
    const existingIds = new Set<string>()
    const merged: Report[] = []

    // 1. Live Supabase reports (Highest priority)
    for (const r of supabaseReports) {
      if (!existingIds.has(r.id)) {
        existingIds.add(r.id)
        merged.push({
          ...r,
          isMine: user ? r.userId === user.id : false,
        })
      }
    }

    // 2. Local user reports (Offline/unconfigured mode)
    if (!isSupabaseConfigured) {
      for (const r of userReports) {
        if (!existingIds.has(r.id)) {
          existingIds.add(r.id)
          merged.push(r)
        }
      }
    }

    // 3. Fallback demo mock reports (clearly tagged with isDemo: true)
    if (showMockData) {
      for (const r of MOCK_REPORTS) {
        if (!existingIds.has(r.id)) {
          existingIds.add(r.id)
          merged.push({
            ...r,
            isDemo: true,
            isMine: !isSupabaseConfigured ? r.isMine : false,
          })
        }
      }
    }

    // Sort newest first by reportedAt timestamp
    return merged.sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(),
    )
  }, [supabaseReports, userReports, user, showMockData])

  const addReport = useCallback(
    async (input: {
      type: IssueType
      locationLabel: string
      point: GeoPoint
      description: string
      image: string | null
      file?: File | null
    }): Promise<Report> => {
      // Internal derivation of category and severity to prevent arbitrary client manipulation
      const category = categoryForType(input.type)
      const severity = severityForType(input.type)

      // When Supabase is configured, enforce authenticated submission with real backend persistence
      if (isSupabaseConfigured) {
        if (!user) {
          throw new Error('Authentication required: You must be signed in to submit a report.')
        }

        let uploadedUrl: string | null = null
        let uploadedFilePath: string | null = null

        // 1. Photo upload if file was provided
        if (input.file) {
          try {
            const uploadRes = await dbService.uploadReportPhoto(input.file, user.id)
            if (uploadRes) {
              uploadedUrl = uploadRes.publicUrl
              uploadedFilePath = uploadRes.filePath
            }
          } catch (uploadErr) {
            const msg = uploadErr instanceof Error ? uploadErr.message : 'Photo upload failed'
            throw new Error(`Photo upload failed: ${msg}`)
          }
        }

        // 2. Database record creation
        try {
          const { data, error: dbError } = await dbService.createReport({
            userId: user.id,
            type: input.type,
            category,
            severity,
            description: input.description.trim() || 'Citizen-reported civic issue.',
            locationLabel: input.locationLabel.trim() || 'Nashik',
            point: input.point,
            imageUrl: uploadedUrl,
          })

          if (dbError || !data) {
            // Clean up uploaded image if database insert fails
            if (uploadedFilePath) {
              await dbService.deleteReportPhoto(uploadedFilePath)
            }
            throw new Error(dbError?.message || 'Database insert failed')
          }

          const createdReport: Report = {
            id: data.id,
            userId: user.id,
            type: data.type,
            category: data.category,
            description: data.description,
            locationLabel: data.location_label,
            latitude: data.latitude,
            longitude: data.longitude,
            severity: data.severity,
            status: data.status,
            reportedAt: data.created_at,
            confirmations: data.confirmations,
            image: data.image_url,
            isMine: true,
            distanceMeters: 0,
            timeline: Array.isArray(data.timeline)
              ? (data.timeline as unknown as Report['timeline'])
              : [
                  { label: 'Report submitted', done: true, timestamp: data.created_at, actor: 'citizen' },
                  { label: 'Location recorded', done: true, timestamp: data.created_at },
                  { label: 'Community verification started', done: false, active: true },
                  { label: 'Community monitoring', done: false },
                ],
          }

          setSupabaseReports((prev) => [createdReport, ...prev])
          return createdReport
        } catch (dbErr) {
          if (uploadedFilePath) {
            await dbService.deleteReportPhoto(uploadedFilePath)
          }
          throw dbErr
        }
      }

      // Offline / Unconfigured fallback
      const nowIso = new Date().toISOString()
      const fallbackReport: Report = {
        id: nextId([...userReports, ...MOCK_REPORTS]),
        userId: user?.id,
        type: input.type,
        category,
        severity,
        description: input.description.trim() || 'Citizen-reported civic issue.',
        locationLabel: input.locationLabel.trim() || 'College Road, Nashik',
        latitude: input.point.lat,
        longitude: input.point.lng,
        status: 'Submitted',
        reportedAt: nowIso,
        confirmations: 1,
        image: input.image,
        isMine: true,
        distanceMeters: 0,
        timeline: [
          { label: 'Report submitted', done: true, timestamp: nowIso, actor: 'citizen' },
          { label: 'Location recorded', done: true, timestamp: nowIso },
          { label: 'Community verification started', done: false, active: true },
          { label: 'Community monitoring', done: false },
        ],
      }

      setUserReports((prev) => {
        const next = [fallbackReport, ...prev]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })

      return fallbackReport
    },
    [user, userReports],
  )

  const getReport = useCallback((id: string) => reports.find((r) => r.id === id), [reports])

  const confirmIssue = useCallback(
    async (id: string, vote: Vote) => {
      // Local optimistic update for instant UI responsiveness
      setVotes((prev) => {
        const next = { ...prev, [id]: vote }
        localStorage.setItem(VOTES_KEY, JSON.stringify(next))
        return next
      })

      // Backend atomic stored procedure with transparent status rules
      if (isSupabaseConfigured && user) {
        try {
          const { data, error: rpcErr } = await dbService.voteOnReport(id, vote)
          if (rpcErr) {
            console.warn('Backend vote error:', rpcErr.message)
            return
          }

          // If RPC succeeded, update report state directly from returned trusted DB data
          if (data && data.length > 0) {
            const result = data[0]
            setSupabaseReports((prev) =>
              prev.map((r) =>
                r.id === id
                  ? {
                      ...r,
                      confirmations: result.new_confirmations,
                      status: result.new_status,
                    }
                  : r,
              ),
            )
          }
        } catch (err) {
          console.warn('Backend vote exception:', err)
        }
      }
    },
    [user],
  )

  const getVote = useCallback((id: string) => votes[id], [votes])

  const value = useMemo(
    () => ({
      reports,
      loading,
      error,
      showMockData,
      setShowMockData,
      addReport,
      getReport,
      confirmIssue,
      getVote,
      refreshReports: loadReportsAndVotes,
    }),
    [
      reports,
      loading,
      error,
      showMockData,
      setShowMockData,
      addReport,
      getReport,
      confirmIssue,
      getVote,
      loadReportsAndVotes,
    ],
  )

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
}

export function useReports() {
  const ctx = useContext(ReportsContext)
  if (!ctx) throw new Error('useReports must be used within ReportsProvider')
  return ctx
}
