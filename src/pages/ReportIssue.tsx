import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Info,
  LocateFixed,
  X,
} from 'lucide-react'

import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IssueTypeCard } from '../components/IssueTypeCard'
import { MapView } from '../components/MapView'
import { StatusBadge } from '../components/StatusBadge'
import { TopHeader } from '../components/TopHeader'
import { useAuth } from '../context/AuthContext'
import { useReports } from '../context/ReportsContext'
import { DEFAULT_PIN } from '../data/mockReports'
import { cn } from '../lib/cn'
import { findDuplicateReports } from '../lib/duplicateDetector'
import { formatCoords, formatDistance, formatRelative } from '../lib/format'
import { ISSUE_TYPES, categoryForType, severityForType } from '../lib/issueMeta'
import type { GeoPoint, IssueType } from '../types/report'

const STEPS = ['Issue', 'Location', 'Evidence', 'Review'] as const

export function ReportIssue() {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()
  const { reports, addReport } = useReports()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [type, setType] = useState<IssueType | null>(null)
  const [point, setPoint] = useState<GeoPoint>(DEFAULT_PIN)
  const [locationLabel, setLocationLabel] = useState('College Road, Nashik')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [geoBusy, setGeoBusy] = useState(false)
  const [geoStatus, setGeoStatus] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Duplicate detection state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [ignoredDuplicate, setIgnoredDuplicate] = useState(false)

  const duplicates = useMemo(() => {
    if (!type) return []
    return findDuplicateReports(reports, type, point, 100) // 100m street radius
  }, [reports, type, point])

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(type)
    if (step === 1) return Boolean(point)
    return true
  }, [step, type, point])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.')
      return
    }
    setGeoBusy(true)
    setGeoStatus(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPoint(nextPoint)
        setLocationLabel(`GPS Location (${formatCoords(nextPoint.lat, nextPoint.lng)})`)
        setGeoStatus('GPS location acquired accurately.')
        setGeoBusy(false)
      },
      (err) => {
        setGeoStatus(err.message || 'Could not acquire GPS position. Tap the map to drop a pin.')
        setGeoBusy(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleMapPick = (newPoint: GeoPoint) => {
    setPoint(newPoint)
    setLocationLabel(`Pinned on map (${formatCoords(newPoint.lat, newPoint.lng)})`)
    setGeoStatus(null)
  }

  const onFile = (file?: File) => {
    if (!file) return
    setSubmitError(null)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Invalid file type. Please upload a JPEG, PNG, WEBP, or HEIC photo.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Photo is too large. Maximum file size is 5MB.')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleNextStep = () => {
    setSubmitError(null)
    // If moving from Location step (step 1) to Evidence (step 2) and duplicates found, alert the user
    if (step === 1 && duplicates.length > 0 && !ignoredDuplicate) {
      setShowDuplicateModal(true)
      return
    }
    setStep((s) => s + 1)
  }

  const submit = async () => {
    if (!type || submitting) return

    if (isConfigured && !user) {
      setSubmitError('Authentication required: please sign in to submit civic reports.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const created = await addReport({
        type,
        locationLabel,
        point,
        description,
        image,
        file: selectedFile,
      })
      navigate(`/reports/${created.id}`, { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report. Please try again.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const isAuthRequired = isConfigured && !user

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="Report an Issue" backTo="/home" showBell={false} />

      {isAuthRequired && (
        <div className="flex items-center justify-between border-b border-warning-container bg-surface-container px-4 py-2.5 text-[12px]">
          <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <AlertCircle className="h-4 w-4 text-warning" />
            Guest mode: Sign in to save reports to the cloud.
          </span>
          <Link to="/" className="font-semibold text-primary underline">
            Sign In
          </Link>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 border-b border-outline-variant/30 px-4 py-3">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold',
                index < step && 'bg-tertiary text-on-primary',
                index === step && 'bg-primary text-on-primary ring-4 ring-primary-fixed',
                index > step && 'bg-surface-high text-on-surface-variant',
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold',
                index === step ? 'text-primary' : 'text-outline',
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {step === 0 && (
          <div className="h-full overflow-y-auto px-4 py-4">
            <h2 className="text-[24px] font-semibold tracking-tight">What's the issue?</h2>
            <p className="mt-1 mb-4 text-[13px] text-on-surface-variant">
              Tell us what you see. CityPulse will categorize it — you don't need to know the
              department.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ISSUE_TYPES.map((issue) => (
                <IssueTypeCard
                  key={issue}
                  type={issue}
                  selected={type === issue}
                  onSelect={setType}
                />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex h-full flex-col">
            <div className="px-4 py-3">
              <h2 className="text-[24px] font-semibold tracking-tight">Where is it?</h2>
              <p className="mt-1 text-[13px] text-on-surface-variant">
                Tap anywhere on the map or use your device GPS.
              </p>
              <p className="mt-1 text-[12px] font-medium text-primary">
                {formatCoords(point.lat, point.lng)}
              </p>
              {geoStatus && (
                <p className="mt-1 text-[11px] text-on-surface-variant italic">{geoStatus}</p>
              )}
            </div>
            <div className="min-h-0 flex-1">
              <MapView
                pickable
                picked={point}
                onPick={handleMapPick}
                center={point}
                zoom={15}
              />
            </div>
            <div className="px-4 pt-3 pb-1 space-y-2">
              <button
                type="button"
                onClick={useMyLocation}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-lowest text-[14px] font-semibold active:scale-[0.98]"
              >
                <LocateFixed className="h-4 w-4 text-primary" />
                {geoBusy ? 'Acquiring GPS…' : 'Use My GPS Location'}
              </button>
              <div>
                <label className="block text-[11px] font-semibold text-outline">
                  Location Note / Landmark
                </label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g. Near Big Bazaar, College Road"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-[13px] text-on-surface"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="h-full overflow-y-auto px-4 py-4">
            <h2 className="text-[24px] font-semibold tracking-tight">Add evidence</h2>
            <p className="mt-1 mb-4 text-[13px] text-on-surface-variant">
              A photo helps nearby citizens recognize the issue. (Optional, up to 5MB)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              capture="environment"
              className="hidden"
              onChange={(event) => onFile(event.target.files?.[0])}
            />
            {image ? (
              <div className="relative overflow-hidden rounded-2xl border border-outline-variant/40">
                <img src={image} alt="Selected evidence" className="h-56 w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => {
                    setImage(null)
                    setSelectedFile(null)
                  }}
                  className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-inverse-surface/80 text-inverse-on"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-outline bg-surface-bright"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary">
                  <Camera className="h-7 w-7" />
                </span>
                <span className="text-[16px] font-semibold">Tap to add a photo</span>
                <span className="text-[12px] text-on-surface-variant">
                  Camera or gallery (JPG, PNG, WEBP)
                </span>
              </button>
            )}
            <label className="mt-4 block">
              <span className="mb-2 block text-[13px] font-semibold">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Describe what needs attention…"
                className="w-full rounded-lg border border-outline-variant bg-surface-lowest p-3 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="h-full overflow-y-auto px-4 py-4 space-y-3">
            <h2 className="text-[24px] font-semibold tracking-tight">Review</h2>

            {submitError && (
              <div className="flex items-start gap-2 rounded-xl bg-error-container p-3 text-[13px] text-error">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Submission failed</p>
                  <p className="mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            {duplicates.length > 0 && (
              <div className="rounded-xl border border-warning-container/80 bg-warning-container/20 p-3 text-[13px]">
                <div className="flex items-center gap-1.5 font-semibold text-warning">
                  <Info className="h-4 w-4" />
                  Potential duplicate detected ({duplicates.length} nearby)
                </div>
                <p className="mt-1 text-on-surface-variant text-[12px]">
                  A similar '{type}' was already reported within {duplicates[0].distanceMeters}m.
                  You can proceed with your distinct report or view the existing issue.
                </p>
              </div>
            )}

            <ReviewRow label="Issue" value={type ?? '—'} />
            <ReviewRow
              label="Derived Category & Severity"
              value={type ? `${categoryForType(type)} · ${severityForType(type)} priority` : '—'}
            />
            <ReviewRow
              label="Location"
              value={`${locationLabel}\n${formatCoords(point.lat, point.lng)}`}
            />
            <ReviewRow label="Description" value={description || 'No description added'} />
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-3">
              <p className="text-[12px] font-semibold tracking-wide text-outline uppercase">
                Photo
              </p>
              {image ? (
                <img
                  src={image}
                  alt="Evidence preview"
                  className="mt-2 h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <p className="mt-2 text-[14px] text-on-surface-variant">No photo attached</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-outline-variant/30 bg-surface px-4 py-3">
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setSubmitError(null)
                setStep((s) => s - 1)
              }}
              className="h-12 min-w-24 rounded-lg border border-outline-variant bg-surface-low px-4 text-[14px] font-semibold active:scale-[0.98] disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={handleNextStep}
              className="h-12 flex-1 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary disabled:opacity-40 active:scale-[0.98]"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="h-12 flex-1 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? 'Submitting to CityPulse…' : 'Submit Report'}
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Review Modal */}
      {showDuplicateModal && duplicates.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-[430px] rounded-t-3xl sm:rounded-2xl border border-outline-variant/60 bg-surface-lowest p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[18px] font-bold">Similar Issue Nearby</h3>
                <p className="text-[12px] text-on-surface-variant">
                  We found an existing active report close to your pin:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-high"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-outline-variant/60 bg-surface-low p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[14px]">{duplicates[0].report.type}</span>
                <StatusBadge status={duplicates[0].report.status} />
              </div>
              <p className="text-[13px] text-on-surface-variant">
                {duplicates[0].report.locationLabel}
              </p>
              <div className="flex items-center justify-between text-[11px] text-outline">
                <span>{formatDistance(duplicates[0].distanceMeters)}</span>
                <span>{formatRelative(duplicates[0].report.reportedAt)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false)
                  navigate(`/reports/${duplicates[0].report.id}`)
                }}
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-primary text-primary font-semibold text-[13px] active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                View & Verify Existing Report
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false)
                  setIgnoredDuplicate(true)
                  setStep(2)
                }}
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg bg-surface-high text-on-surface font-semibold text-[13px] active:scale-[0.98]"
              >
                No, this is a separate new issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-3">
      <p className="text-[12px] font-semibold tracking-wide text-outline uppercase">{label}</p>
      <p className="mt-1 whitespace-pre-line text-[14px] font-medium text-on-surface">{value}</p>
    </div>
  )
}
