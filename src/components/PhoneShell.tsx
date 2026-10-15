import { Outlet, useLocation } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { DesktopNavBar } from './DesktopNavBar'
import { cn } from '../lib/cn'

const TAB_ROUTES = ['/home', '/map', '/report', '/reports', '/profile', '/notifications']

export function PhoneShell() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isMap = location.pathname === '/map'
  const showTabs = TAB_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`),
  )

  return (
    <div className="relative min-h-dvh flex flex-col bg-surface text-on-surface">
      {!isLanding && <DesktopNavBar />}
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col w-full',
          isMap && 'h-[calc(100dvh-72px)] md:h-[calc(100dvh-4rem)] overflow-hidden',
        )}
      >
        <Outlet />
      </div>
      {showTabs && <BottomTabBar />}
    </div>
  )
}

