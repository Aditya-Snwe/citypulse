import { Outlet, useLocation } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { cn } from '../lib/cn'

const TAB_ROUTES = ['/home', '/map', '/report', '/reports', '/profile', '/notifications']

export function PhoneShell() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const showTabs = TAB_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`),
  )

  return (
    <div className="min-h-dvh bg-surface-dim">
      <div
        className={cn(
          'relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background shadow-[0_0_40px_rgba(11,28,48,0.12)]',
          !isLanding && 'h-dvh overflow-hidden',
        )}
      >
        <div className={cn('flex min-h-0 flex-1 flex-col', !isLanding && 'overflow-hidden')}>
          <Outlet />
        </div>
        {showTabs && <BottomTabBar />}
      </div>
    </div>
  )
}
