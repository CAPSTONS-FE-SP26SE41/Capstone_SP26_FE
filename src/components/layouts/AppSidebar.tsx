import { Link } from '@tanstack/react-router'
import { type LucideIcon,LogOut } from 'lucide-react'
import { logout } from '../../services/authService'
import { useNavigate } from '@tanstack/react-router'

export type NavItem = {
  to: string
  icon: LucideIcon
  label: string
  exact?: boolean
}

export type SidebarBrand = {
  name: string
  subtitle: string
  icon: LucideIcon
}

type AppSidebarProps = {
  brand: SidebarBrand
  navItems: NavItem[]
  themeColor?: string
}

export default function AppSidebar({
  brand,
  navItems,
  themeColor = 'green',
}: AppSidebarProps) {
  const BrandIcon = brand.icon
  const navigate = useNavigate()
 const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  const isOrange = themeColor === 'orange'
  const brandBg = isOrange ? 'bg-[#faeadd]' : 'bg-[#e9f5ed]'
  const primaryText = isOrange ? 'text-[#e28743]' : 'text-[#5ab473]'
  const activeBg = isOrange ? 'bg-[#e28743]' : 'bg-[#5ab473]'
  const activeHoverBg = isOrange ? 'hover:bg-[#eb9e61]' : 'hover:bg-[#68bc80]'
  const hoverBg = isOrange ? 'hover:bg-[#e28743]' : 'hover:bg-[#5ab473]'
  const hoverContent = isOrange ? 'hover:text-white' : 'hover:text-white'

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between">

      {/* Logo / Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className={`${brandBg} flex items-center justify-center rounded-xl h-10 w-10`}>
            <BrandIcon size={24} className={primaryText} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              {brand.name}
            </h1>
            <p className="text-xs text-slate-500">
              {brand.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ 
                exact: item.exact ?? false,
                includeSearch: false
              }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all ${hoverBg} ${hoverContent}`}
              activeProps={{
                className:
                  `active group flex items-center gap-3 px-4 py-3 rounded-xl ${activeBg} ${activeHoverBg} text-white font-semibold`,
              }}
            >
              <Icon
                size={20}
                className={`transition-colors text-slate-500 group-hover:text-white group-[.active]:text-white`}
              />
              <span className={`text-sm transition-colors text-slate-600 group-hover:text-white group-[.active]:text-white`}>
                {item.label}
              </span>
            </Link>
          )
          
        })}
      </nav>

      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 px-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm group"
          title="Đăng xuất"
        >
          <LogOut
            size={18}
            className="transition-transform group-hover:translate-x-0.5"
          />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}

