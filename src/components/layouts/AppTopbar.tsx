import { LogOut, Search } from 'lucide-react'
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
  userName = 'Hồ sơ',
  userRole = 'Người dùng',
  userAvatarUrl = 'https://ui-avatars.com/api/?name=Admin&background=E2E8F0&color=475569',

  searchPlaceholder = 'Tìm kiếm...',
  themeColor = 'green',
  showSearch = true,
}: AppTopbarProps & { showSearch?: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  const accentMap = {
    blue: {
      text: "text-blue-600",
      hoverText: "hover:text-blue-600",
      ring: "ring-blue-600/30",
      focusRing: "focus:ring-blue-500/20",
    },
    emerald: {
      text: "text-[#009a63]",
      hoverText: "hover:text-[#009a63]",
      ring: "ring-[#009a63]/30",
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
    // Staff
    if (path.includes('/staff/partner-requests')) return 'Yêu cầu đối tác'
    if (path.includes('/staff/advertisements')) return 'Yêu cầu xét duyệt'
    if (path.includes('/staff/locations')) return 'Quản lý địa điểm'
    if (path.includes('/staff/pois')) return 'Quản lý POIs'
    if (path === '/staff') return 'Trang chủ'

    // Admin
    if (path.includes('/admin/accounts')) return 'Quản lý tài khoản'
    if (path.includes('/admin/analytics')) return 'Thống kê hệ thống'
    if (path.includes('/admin/bookings')) return 'Quản lý đơn đặt chỗ'
    if (path.includes('/admin/destinations')) return 'Quản lý địa điểm'
    if (path.includes('/admin/settings')) return 'Cài đặt hệ thống'
    if (path.includes('/admin/subscriptions')) return 'Quản lý gói dịch vụ'

    // Partner
    if (path.includes('/partner/stats')) return 'Thống kê kinh doanh'
    if (path.includes('/partner/poi')) return 'Quản lý địa điểm (POI)'
    if (path.includes('/partner/advertisement')) return 'Quản lý quảng cáo'
    if (path.includes('/partner/subscriptions')) return 'Gói dịch vụ của tôi'
    if (path.includes('/partner/history')) return 'Lịch sử giao dịch'
    if (path.includes('/partner/profile')) return 'Hồ sơ doanh nghiệp'
    
    // Fallbacks
    if (path.includes('/profile')) return 'Hồ sơ cá nhân'
    return 'Bảng điều khiển'
  }


 

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
        <button 
          onClick={() => {
            if (location.href.includes('/partner')) {
              navigate({ to: '/partner/profile' })
            } else if (location.href.includes('/admin')) {
              navigate({ to: '/admin/profile' })
            } else if (location.href.includes('/staff')) {
              // Manager chưa có trang profile riêng
            } else {
              navigate({ to: '/profile' as any })
            }
          }}


          className="flex items-center gap-3 group transition-opacity hover:opacity-80"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
            <p className="text-xs text-slate-500">{userRole}</p>
          </div>

          <img
            src={userAvatarUrl}
            className={`h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ${ringColor} transition-all object-cover`}
            alt={userName}
          />
        </button>


        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}