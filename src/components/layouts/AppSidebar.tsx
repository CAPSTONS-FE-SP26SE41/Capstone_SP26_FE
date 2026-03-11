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
}

export default function AppSidebar({
  brand,
  navItems,
  logoutTo,
  logoutTokenKey,
}: AppSidebarProps) {
  const navigate = useNavigate()
  const BrandIcon = brand.icon

  const logout = () => {
    localStorage.removeItem(logoutTokenKey)
    navigate({ to: logoutTo })
  }

  return (
    <aside className="w-70 bg-white border-r border-slate-200 flex flex-col justify-between">

      {/* Logo / Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 flex items-center justify-center rounded-xl h-10 w-10">
            <BrandIcon size={24} className="text-blue-600" />
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
                  'flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold',
              }}
            >
              <Icon
                size={20}
                className="transition-colors group-hover:text-blue-600"
              />
              <span className="text-sm">{item.label}</span>
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
