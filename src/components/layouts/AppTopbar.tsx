import { Bell } from 'lucide-react'
import { useLocation } from '@tanstack/react-router'

type AppTopbarProps = {
  userName?: string
  userRole?: string
  userAvatarUrl?: string
  searchPlaceholder?: string
}

export default function AppTopbar({
  userName = 'Profile',
  userRole = 'User',
  userAvatarUrl = 'https://i.pravatar.cc/40',
  searchPlaceholder = 'Search...',
}: AppTopbarProps) {
  const location = useLocation()
  
  const getPageTitle = (path: string) => {
    if (path.includes('/accounts')) return 'Account Management'
    if (path.includes('/analytics')) return 'Analytics'
    if (path.includes('/subscriptions')) return 'Subscription Packages'
    if (path.includes('/settings')) return 'System Settings'
    return 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-50 h-18 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8">

      {/* Page Title Node */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button className="relative text-slate-500 hover:text-[#5ab473] transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {userName}
            </p>
            <p className="text-xs text-slate-500">
              {userRole}
            </p>
          </div>

          <img
            src={userAvatarUrl}
            className="h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ring-[#5ab473]/30 transition-all"
            alt={userName}
          />
        </div>
      </div>
    </header>
  )
}
