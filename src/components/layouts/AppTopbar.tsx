import { Bell, LogOut } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { logout } from '../../services/authService'

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
  themeColor = 'green',
}: AppTopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const getPageTitle = (path: string) => {
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

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  const isOrange = themeColor === 'orange'
  const hoverText = isOrange ? 'hover:text-[#e28743]' : 'hover:text-[#5ab473]'
  const ringColor = isOrange ? 'ring-[#e28743]/30' : 'ring-[#5ab473]/30'

  return (
    <header className="sticky top-0 z-50 h-18 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8">

      {/* Search */}
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

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button className={`relative text-slate-500 ${hoverText} transition-colors`}>
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile */}
        <div className="flex items-center gap-3 group">
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
            className={`h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ${ringColor} transition-all`}
            alt={userName}
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Always Visible Logout */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 px-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm group"
          title="Đăng xuất"
        >
          <LogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
