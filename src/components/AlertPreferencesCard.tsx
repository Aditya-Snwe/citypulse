import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, Sliders, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { dbService, type SavedAlertLocation, type UserAlertPreferences } from '../lib/dbService'
import { isSupabaseConfigured } from '../lib/supabase'

export function AlertPreferencesCard() {
  const { user } = useAuth()
  const [locations, setLocations] = useState<SavedAlertLocation[]>([])
  const [preferences, setPreferences] = useState<UserAlertPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newRadius, setNewRadius] = useState(2000)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isDetectingGps, setIsDetectingGps] = useState(false)
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return

    let isMounted = true
    setLoading(true)

    Promise.all([
      dbService.getSavedLocations(user.id),
      dbService.getAlertPreferences(user.id),
    ])
      .then(([locs, prefs]) => {
        if (!isMounted) return
        setLocations(locs)
        setPreferences(prefs)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [user])

  const handleUseCurrentLocation = () => {
    setGpsError(null)
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }

    setIsDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false)
        setDetectedCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        })
        if (!newLabel) {
          setNewLabel('My Current Area')
        }
      },
      (err) => {
        setIsDetectingGps(false)
        setGpsError(
          err.code === 1
            ? 'Location access denied. Please grant permission in browser settings.'
            : 'Unable to detect location. Enter coordinates or try again.',
        )
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !detectedCoords || !newLabel.trim()) return

    setLoading(true)
    const created = await dbService.addSavedLocation(user.id, {
      label: newLabel.trim(),
      latitude: detectedCoords.lat,
      longitude: detectedCoords.lng,
      radius_meters: newRadius,
    })

    if (created) {
      setLocations((prev) => [...prev, created])
      setNewLabel('')
      setDetectedCoords(null)
      setShowAddForm(false)
      showNotification('Alert location saved successfully!')
    }
    setLoading(false)
  }

  const handleDeleteLocation = async (id: string) => {
    setLoading(true)
    const success = await dbService.deleteSavedLocation(id)
    if (success) {
      setLocations((prev) => prev.filter((loc) => loc.id !== id))
      showNotification('Location removed.')
    }
    setLoading(false)
  }

  const handleTogglePreference = async (key: 'in_app_enabled' | 'push_enabled' | 'high_severity_only') => {
    if (!user || !preferences) return
    const updatedVal = !preferences[key]
    setPreferences({ ...preferences, [key]: updatedVal })

    setSavingPrefs(true)
    await dbService.updateAlertPreferences(user.id, { [key]: updatedVal })
    setSavingPrefs(false)
    showNotification('Preferences updated.')
  }

  const showNotification = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  if (!user || !isSupabaseConfigured) {
    return null
  }

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface">Civic Alert Preferences</h3>
            <p className="text-[11px] text-on-surface-variant">Nearby matching & radius settings</p>
          </div>
        </div>
        {savingPrefs && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>

      {successMsg && (
        <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-[12px] font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Toggles */}
      {preferences && (
        <div className="space-y-2 border-b border-outline-variant/30 pb-3">
          <label className="flex items-center justify-between text-[13px] font-medium cursor-pointer">
            <span>In-App Notifications</span>
            <input
              type="checkbox"
              checked={preferences.in_app_enabled}
              onChange={() => handleTogglePreference('in_app_enabled')}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>
          <label className="flex items-center justify-between text-[13px] font-medium cursor-pointer">
            <span>High Severity Only</span>
            <input
              type="checkbox"
              checked={preferences.high_severity_only}
              onChange={() => handleTogglePreference('high_severity_only')}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>
        </div>
      )}

      {/* Saved Locations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-outline">
            Saved Alert Locations ({locations.length})
          </h4>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add location</span>
            </button>
          )}
        </div>

        {locations.length === 0 && !showAddForm ? (
          <p className="text-[12px] text-on-surface-variant">
            No saved alert locations. Add one (such as Home or Office) to receive alerts when issues
            are reported nearby.
          </p>
        ) : (
          <div className="space-y-2">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container/40 p-2.5 text-left"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="truncate">
                    <p className="text-[13px] font-medium truncate">{loc.label}</p>
                    <p className="text-[11px] text-outline">
                      Radius: {(loc.radius_meters / 1000).toFixed(1)} km · {loc.latitude.toFixed(3)}°, {loc.longitude.toFixed(3)}°
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLocation(loc.id)}
                  aria-label="Delete location"
                  className="rounded-lg p-1.5 text-on-surface-variant hover:text-error active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Location Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddLocation}
            className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3"
          >
            <p className="text-[12px] font-semibold text-primary">Add Alert Location</p>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isDetectingGps}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-lowest text-[12px] font-medium text-on-surface hover:bg-surface-container active:scale-98 disabled:opacity-50"
            >
              {isDetectingGps ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Detecting GPS…</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Use Device GPS for Coordinates</span>
                </>
              )}
            </button>

            {gpsError && (
              <p className="text-[11px] text-error">{gpsError}</p>
            )}

            {detectedCoords && (
              <p className="text-[11px] text-emerald-600 font-medium">
                Detected: {detectedCoords.lat}°, {detectedCoords.lng}°
              </p>
            )}

            <div>
              <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                Location Label
              </label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Home, Office, College"
                className="h-9 w-full rounded-lg border border-outline-variant bg-surface-lowest px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-on-surface-variant block mb-1">
                Alert Radius: {(newRadius / 1000).toFixed(1)} km
              </label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={newRadius}
                onChange={(e) => setNewRadius(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setDetectedCoords(null)
                  setGpsError(null)
                }}
                className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !detectedCoords || !newLabel.trim()}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-on-primary shadow-xs disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>Save Area</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
