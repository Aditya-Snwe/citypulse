import { Camera, LocateFixed, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IssueTypeCard } from '../components/IssueTypeCard'
import { MapView } from '../components/MapView'
import { TopHeader } from '../components/TopHeader'
import { useReports } from '../context/ReportsContext'
import { DEFAULT_PIN } from '../data/mockReports'
import { cn } from '../lib/cn'
import { formatCoords } from '../lib/format'
import { ISSUE_TYPES } from '../lib/issueMeta'
import type { GeoPoint, IssueType } from '../types/report'

const STEPS = ['Issue', 'Location', 'Evidence', 'Review'] as const

export function ReportIssue() {
  const navigate = useNavigate()
  const { addReport } = useReports()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [type, setType] = useState<IssueType | null>(null)
  const [point, setPoint] = useState<GeoPoint>(DEFAULT_PIN)
  const [locationLabel, setLocationLabel] = useState('College Road, Nashik')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [geoBusy, setGeoBusy] = useState(false)

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(type)
    if (step === 1) return Boolean(point)
    return true
  }, [step, type, point])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setPoint(DEFAULT_PIN)
      setLocationLabel('College Road, Nashik (mock location)')
      return
    }
    setGeoBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLabel('Current location')
        setGeoBusy(false)
      },
      () => {
        setPoint(DEFAULT_PIN)
        setLocationLabel('College Road, Nashik (mock fallback)')
        setGeoBusy(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const onFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (!type) return
    const created = addReport({
      type,
      locationLabel,
      point,
      description,
      image,
    })
    navigate(`/reports/${created.id}`, { replace: true })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="Report an Issue" backTo="/home" showBell={false} />
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
            <span className={cn('text-[10px] font-semibold', index === step ? 'text-primary' : 'text-outline')}>
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
              Tell us what you see. CityPulse will categorize it — you don't need to know the department.
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
                Tap the map to drop a pin. Default pin is a mock College Road location.
              </p>
              <p className="mt-2 text-[12px] font-medium text-primary">{formatCoords(point.lat, point.lng)}</p>
            </div>
            <div className="min-h-0 flex-1">
              <MapView pickable picked={point} onPick={setPoint} center={point} zoom={15} />
            </div>
            <div className="px-4 pt-3">
              <button
                type="button"
                onClick={useMyLocation}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-lowest text-[14px] font-semibold active:scale-[0.98]"
              >
                <LocateFixed className="h-4 w-4 text-primary" />
                {geoBusy ? 'Locating…' : 'Use My Location'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="h-full overflow-y-auto px-4 py-4">
            <h2 className="text-[24px] font-semibold tracking-tight">Add evidence</h2>
            <p className="mt-1 mb-4 text-[13px] text-on-surface-variant">
              A photo helps nearby citizens recognize the issue.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
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
                  onClick={() => setImage(null)}
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
                <span className="text-[12px] text-on-surface-variant">Camera or gallery</span>
              </button>
            )}
            <label className="mt-4 block">
              <span className="mb-2 block text-[13px] font-semibold">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="There's a huge pothole here…"
                className="w-full rounded-lg border border-outline-variant bg-surface-lowest p-3 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="h-full overflow-y-auto px-4 py-4 space-y-3">
            <h2 className="text-[24px] font-semibold tracking-tight">Review</h2>
            <ReviewRow label="Issue" value={type ?? '—'} />
            <ReviewRow label="Location" value={`${locationLabel}\n${formatCoords(point.lat, point.lng)}`} />
            <ReviewRow label="Description" value={description || 'No description added'} />
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-3">
              <p className="text-[12px] font-semibold tracking-wide text-outline uppercase">Photo</p>
              {image ? (
                <img src={image} alt="Evidence preview" className="mt-2 h-40 w-full rounded-lg object-cover" />
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
              onClick={() => setStep((s) => s - 1)}
              className="h-12 min-w-24 rounded-lg border border-outline-variant bg-surface-low px-4 text-[14px] font-semibold active:scale-[0.98]"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="h-12 flex-1 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary disabled:opacity-40 active:scale-[0.98]"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="h-12 flex-1 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary active:scale-[0.98]"
            >
              Submit Report
            </button>
          )}
        </div>
      </div>
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
