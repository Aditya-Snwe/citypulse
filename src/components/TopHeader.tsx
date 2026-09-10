import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellButton } from './BottomTabBar'

interface TopHeaderProps {
  title: string
  subtitle?: string
  backTo?: string | number
  showBell?: boolean
  right?: ReactNode
}

export function TopHeader({
  title,
  subtitle,
  backTo,
  showBell = true,
  right,
}: TopHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between gap-2 border-b border-outline-variant/40 bg-surface/90 px-4 py-2 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        {backTo != null && (
          <button
            type="button"
            aria-label="Go back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container active:scale-95"
            onClick={() => {
              if (typeof backTo === 'number') navigate(backTo)
              else navigate(backTo)
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[20px] leading-[26px] font-semibold tracking-tight text-on-surface">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[11px] font-medium tracking-wide text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {right}
        {showBell && <BellButton />}
      </div>
    </header>
  )
}
