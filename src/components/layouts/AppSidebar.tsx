import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, type LucideIcon } from 'lucide-react'

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
  logoutTo: string
  logoutTokenKey: string
  themeColor?: string
}

export default function AppSidebar({
  brand,
  navItems,
  logoutTo,
  logoutTokenKey,
  themeColor = 'green',
}: AppSidebarProps) {
  const navigate = useNavigate()
  const BrandIcon = brand.icon

  const logout = () => {
    localStorage.removeItem(logoutTokenKey)
    navigate({ to: logoutTo })
  }

  const isOrange = themeColor === 'orange'
  const brandBg = isOrange ? 'bg-[#faeadd]' : 'bg-[#e9f5ed]'
  const primaryText = isOrange ? 'text-[#e28743]' : 'text-[#5ab473]'
  const activeBg = isOrange ? 'bg-[#e28743]' : 'bg-[#5ab473]'
  const hoverText = isOrange ? 'group-hover:text-[#e28743]' : 'group-hover:text-[#5ab473]'

  return (
    <aside className="w-70 bg-white border-r border-slate-200 flex flex-col justify-between">

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
              activeOptions={{ exact: item.exact ?? false }}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all hover:bg-slate-50"
              activeProps={{
                className:
                  `group flex items-center gap-3 px-4 py-3 rounded-xl ${activeBg} text-white font-semibold`,
              }}
            >
              <Icon
                size={20}
                className={`transition-colors ${hoverText} group-[.active]:text-white`}
              />
              <span className={`text-sm ${hoverText} group-[.active]:text-white`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
