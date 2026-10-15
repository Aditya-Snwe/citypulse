import {
  Bell,
  CirclePlus,
  House,
  Map,
  RadioTower,
  UserRound,
  ClipboardList,
  LogIn,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { cn } from '../lib/cn'

const NAV_LINKS = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/map', label: 'Community Map', icon: Map },
  { to: '/reports', label: 'My Reports', icon: ClipboardList },
]

export function DesktopNavBar() {
  const location = useLocation()
  const { user, profile, isConfigured } = useAuth()
  const { unreadCount } = useNotifications()

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Citizen'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-50 hidden md:block border-b border-outline-variant/40 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & City Status */}
        <div className="flex items-center gap-6">
          <Link to="/home" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/30">
              <RadioTower className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[19px] font-bold tracking-tight text-on-surface">CityPulse</span>
              <span className="text-[10px] -mt-1 font-semibold uppercase tracking-wider text-outline">
                Civic Technology
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
            </span>
            <span>{isConfigured ? 'Nashik · Live' : 'Nashik · Demo Mode'}</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-1" aria-label="Desktop primary">
          {NAV_LINKS.map((item) => {
            const active =
              item.to === '/reports'
                ? location.pathname.startsWith('/reports')
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-[14px] font-semibold transition-all',
                  active
                    ? 'bg-primary/10 text-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 2} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Right Actions & Account */}
        <div className="flex items-center gap-3">
          {/* Report CTA */}
          <Link
            to="/report"
            className="flex items-center gap-1.5 rounded-xl bg-primary-container px-4 py-2 text-[13px] font-semibold text-on-primary shadow-sm shadow-primary/25 transition-all hover:bg-primary active:scale-98"
          >
            <CirclePlus className="h-4 w-4" strokeWidth={2.2} />
            <span>Report Issue</span>
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/50 bg-surface-lowest text-on-surface transition-all hover:bg-surface-container active:scale-95"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error ring-2 ring-surface">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile / Account link */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl border border-outline-variant/40 bg-surface-lowest px-2.5 py-1.5 text-left transition-all hover:border-outline hover:bg-surface-container/60 active:scale-98"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-[13px] font-bold text-primary">
              {user ? initial : <UserRound className="h-4 w-4" />}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="max-w-[120px] truncate text-[12px] font-semibold text-on-surface leading-tight">
                {user ? displayName : 'Guest'}
              </span>
              <span className="text-[10px] text-outline leading-tight">
                {user ? 'Citizen' : 'Sign in'}
              </span>
            </div>
            {!user && <LogIn className="h-3.5 w-3.5 text-outline hidden lg:block" />}
          </Link>
        </div>
      </div>
    </header>
  )
}
