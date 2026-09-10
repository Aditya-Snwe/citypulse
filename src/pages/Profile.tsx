import { ChevronRight, LogOut, MapPin, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TopHeader } from '../components/TopHeader'

export function Profile() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopHeader title="Profile" />
      <main className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-4">
        <section className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-[18px] font-bold text-primary">
              A
            </div>
            <div>
              <h2 className="text-[18px] font-semibold">Aditi Sharma</h2>
              <p className="text-[13px] text-on-surface-variant">Citizen · Nashik West</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-on-surface-variant">
            <MapPin className="h-4 w-4 text-primary" />
            College Road area (demo profile)
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-lowest">
          <Row label="Notifications" onClick={() => navigate('/notifications')} />
          <Row label="My reports" onClick={() => navigate('/reports')} />
          <Row label="Community map" onClick={() => navigate('/map')} />
        </section>

        <p className="flex items-start gap-2 rounded-2xl bg-surface-low p-4 text-[13px] text-on-surface-variant">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          CityPulse never asks you which department handles an issue. You report what you see; the
          app categorizes it internally.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-lowest text-[14px] font-semibold active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </main>
    </div>
  )
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-between border-b border-outline-variant/30 px-4 text-left last:border-b-0 active:bg-surface-low"
    >
      <span className="text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-5 w-5 text-outline" />
    </button>
  )
}
