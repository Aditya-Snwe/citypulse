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
    <header className="shrink-0 border-b border-outline-variant/40 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {backTo != null && (
            <button
              type="button"
              aria-label="Go back"
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-lowest text-on-surface-variant hover:bg-surface-container active:scale-95"
              onClick={() => {
                if (typeof backTo === 'number') navigate(backTo)
                else navigate(backTo)
              }}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[20px] sm:text-[22px] leading-tight font-semibold tracking-tight text-on-surface">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-[11px] sm:text-[12px] font-medium tracking-wide text-on-surface-variant">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {right}
          {showBell && (
            <div className="md:hidden">
              <BellButton />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
