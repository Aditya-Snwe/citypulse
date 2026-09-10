import {
  Bell,
  CirclePlus,
  House,
  Map,
  UserRound,
  ClipboardList,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../lib/cn'

const tabs = [
  { to: '/home', label: 'Home', icon: House, match: ['/home'] },
  { to: '/map', label: 'Community', icon: Map, match: ['/map'] },
  { to: '/report', label: 'Report', icon: CirclePlus, match: ['/report'], primary: true },
  { to: '/reports', label: 'My Reports', icon: ClipboardList, match: ['/reports'] },
  { to: '/profile', label: 'Profile', icon: UserRound, match: ['/profile'] },
]

export function BottomTabBar() {
  const location = useLocation()

  return (
    <nav
      className="z-40 flex h-[72px] items-end justify-around border-t border-outline-variant/40 bg-surface/90 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const active =
          tab.to === '/reports'
            ? location.pathname.startsWith('/reports')
            : location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`)
        const Icon = tab.icon

        if (tab.primary) {
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex min-w-[64px] flex-col items-center justify-center text-primary active:scale-95"
            >
              <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-[0_8px_20px_rgba(37,99,235,0.35)] ring-4 ring-surface">
                <Icon className="h-7 w-7" strokeWidth={2.4} />
              </span>
              <span className="mt-1 text-[11px] font-semibold tracking-wide">Report</span>
            </NavLink>
          )
        }

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex min-h-11 min-w-[56px] flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors active:scale-95',
              active ? 'text-primary' : 'text-on-surface-variant',
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} fill={active ? 'currentColor' : 'none'} />
            <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function BellButton() {
  return (
    <NavLink
      to="/notifications"
      aria-label="Notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container active:scale-95"
    >
      <Bell className="h-5 w-5" />
      <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
    </NavLink>
  )
}
