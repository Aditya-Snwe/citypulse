import { ArrowRight, RadioTower, Shield, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
            <RadioTower className="h-4 w-4" />
          </div>
          <span className="text-[20px] font-bold tracking-tight">CityPulse</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
          </span>
          <span className="text-[11px] font-semibold">Nashik · demo</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-8">
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-lowest p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c3c6d7_1px,transparent_1px)] bg-size-[16px_16px] opacity-40" />
          <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/30 bg-linear-to-b from-surface-low to-surface-container">
            <div className="absolute h-36 w-36 animate-pulse rounded-full border border-primary/20" />
            <div className="absolute h-24 w-24 rounded-full border border-primary/30" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary-fixed" />
            </div>
            <div className="absolute top-7 left-6 flex items-center gap-1.5 rounded-full border border-error/30 bg-surface-lowest/90 px-2 py-0.5 text-[12px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
              Pothole (demo)
            </div>
            <div className="absolute right-6 bottom-8 flex items-center gap-1.5 rounded-full border border-tertiary-container/30 bg-surface-lowest/90 px-2 py-0.5 text-[12px]">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              Cleared nearby
            </div>
            <p className="absolute bottom-2 left-2 text-[12px] text-on-surface-variant">
              19.9975° N, 73.7898° E
            </p>
          </div>
          <div className="relative mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-low p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-error-container text-error">
                !
              </div>
              <div>
                <p className="text-[20px] font-bold leading-none">8</p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">Demo hazards</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-low p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-fixed text-tertiary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[20px] font-bold leading-none">Mock</p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">Sample data only</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-2.5 py-1 text-[11px] font-semibold text-on-primary-fixed">
            <Shield className="h-3.5 w-3.5" />
            Citizen civic awareness
          </span>
          <h1 className="text-[32px] leading-9 font-bold tracking-tight">CITYPULSE</h1>
          <p className="mt-1 text-[16px] font-semibold text-primary">Your city. Your awareness.</p>
          <p className="mt-2 text-[14px] leading-5 text-on-surface-variant">
            Stay informed about civic issues around you and help your community stay safer.
          </p>
        </div>

        <div className="mt-auto space-y-2">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-[13px] font-semibold text-on-primary-container shadow-sm active:scale-[0.98]"
          >
            Continue as Citizen
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex h-12 w-full items-center justify-center rounded-lg border border-outline-variant/60 bg-surface-low text-[13px] font-semibold text-on-surface active:scale-[0.98]"
          >
            Sign In
          </button>
          <p className="pt-3 text-center text-[11px] text-on-surface-variant">
            Prototype login — no real authentication yet.
          </p>
        </div>
      </main>
    </div>
  )
}
