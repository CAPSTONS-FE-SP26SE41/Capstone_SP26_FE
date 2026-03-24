import { Link, useNavigate } from "@tanstack/react-router"
import { LogOut, type LucideIcon } from "lucide-react"

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
  accent?: "blue" | "emerald"
  logoutLabel?: string
}

export default function AppSidebar({
  brand,
  navItems,
  logoutTo,
  logoutTokenKey,
  accent = "blue",
  logoutLabel = "Logout",
}: AppSidebarProps) {
  const navigate = useNavigate()
  const BrandIcon = brand.icon
  const accentMap = {
    blue: {
      logoBg: "bg-blue-100",
      logoText: "text-blue-600",
      activeBg: "bg-blue-50",
      activeText: "text-blue-600",
      hoverText: "group-hover:text-blue-600",
    },
    emerald: {
      logoBg: "bg-emerald-100",
      logoText: "text-emerald-600",
      activeBg: "bg-emerald-50",
      activeText: "text-emerald-700",
      hoverText: "group-hover:text-emerald-700",
    },
  } as const

  const accentClasses = accentMap[accent]

  const logout = () => {
    localStorage.removeItem(logoutTokenKey)
    navigate({ to: logoutTo })
  }

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between">

      {/* Logo / Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className={`${accentClasses.logoBg} flex items-center justify-center rounded-xl h-10 w-10`}>
            <BrandIcon size={24} className={accentClasses.logoText} />
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
                  `flex items-center gap-3 px-4 py-3 rounded-xl ${accentClasses.activeBg} ${accentClasses.activeText} font-semibold`,
              }}
            >
              <Icon
                size={20}
                className={`transition-colors ${accentClasses.hoverText}`}
              />
              <span className={`text-sm ${accentClasses.hoverText}`}>
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
          <span className="text-sm font-medium">{logoutLabel}</span>
        </button>
      </div>
    </aside>
  )
}
