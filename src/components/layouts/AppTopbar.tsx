import { Bell, Search } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'


type AppTopbarProps = {
  userName?: string
  userRole?: string
  userAvatarUrl?: string
  searchPlaceholder?: string
  themeColor?: string
}

export default function AppTopbar({
  userName = 'Profile',
  userRole = 'User',
  userAvatarUrl = 'https://i.pravatar.cc/40',
  searchPlaceholder = 'Search...',
  themeColor = 'green',
  showSearch = true,
}: AppTopbarProps & { showSearch?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()

  const accentMap = {
    blue: {
      text: "text-blue-600",
      hoverText: "hover:text-blue-600",
      ring: "ring-blue-600/30",
      focusRing: "focus:ring-blue-500/20",
    },
    emerald: {
      text: "text-[#5ab473]",
      hoverText: "hover:text-[#5ab473]",
      ring: "ring-[#5ab473]/30",
      focusRing: "focus:ring-emerald-500/20",
    },
    orange: {
      text: "text-[#e28743]",
      hoverText: "hover:text-[#e28743]",
      ring: "ring-[#e28743]/30",
      focusRing: "focus:ring-orange-500/20",
    },
  } as const

  const accent = (themeColor === 'green' ? 'emerald' : themeColor) as keyof typeof accentMap
  const accentClasses = accentMap[accent] || accentMap.emerald

  const getPageTitle = (path: string) => {
    if (path.includes('/staff/advertisements')) return 'Yêu cầu xét duyệt'
    if (path.includes('/staff/locations')) return 'Quản lí địa điểm'
    if (path.includes('/staff/pois')) return 'Quản lí POIs'
    if (path === '/staff') return 'Trang chủ'
    if (path.includes('/accounts')) return 'Account Management'
    if (path.includes('/analytics')) return 'Analytics'
    if (path.includes('/subscriptions')) return 'Subscription Packages'
    if (path.includes('/settings')) return 'System Settings'
    if (path.includes('/advertisement')) return 'Advertisements'
    if (path.includes('/poi')) return 'Point of Interest'
    if (path.includes('/stats')) return 'Analytics & Statistics'
    if (path.includes('/profile')) return 'Partner Profile'
    if (path.includes('/partner')) return 'My Packages'
    return 'Dashboard'
  }

 

  const hoverText = accentClasses.hoverText
  const ringColor = accentClasses.ring

  return (
    <header className="sticky top-0 z-50 h-18 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8">

      {/* Search or Title */}
      {showSearch ? (
        <div className="relative w-[320px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className={`w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 ${accentClasses.focusRing} transition-all`}
            placeholder={searchPlaceholder}
          />
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {getPageTitle(location.href)}
          </h1>
        </div>
      )}

      <div className="flex items-center gap-6">
        <button className={`relative text-slate-500 ${hoverText} transition-colors`}>
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">{userRole}</p>
          </div>

          <img
            src={userAvatarUrl}
            className={`h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ${ringColor} transition-all`}
            alt={userName}
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

       
      </div>
    </header>
  )
}