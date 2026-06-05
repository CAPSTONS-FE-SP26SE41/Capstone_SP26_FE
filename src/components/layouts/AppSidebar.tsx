import { Link } from '@tanstack/react-router'
import { type LucideIcon, PanelLeftClose, PanelLeft } from 'lucide-react'

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
  collapsed?: boolean
  onToggle?: () => void
}

export default function AppSidebar({
  brand,
  navItems,
  themeColor = 'green',
  collapsed = false,
  onToggle,
}: AppSidebarProps) {
  const BrandIcon = brand.icon
  const accentMap = {
    blue: {
      logoBg: "bg-blue-100",
      logoText: "text-blue-600",
      activeBg: "bg-blue-600",
      activeHoverBg: "hover:bg-blue-700",
      hoverBg: "hover:bg-blue-600",
      hoverText: "hover:text-white",
    },
    emerald: {
      logoBg: "bg-[#e6f5ef]",
      logoText: "text-[#009a63]",
      activeBg: "bg-[#009a63]",
      activeHoverBg: "hover:bg-[#008a58]",
      hoverBg: "hover:bg-[#009a63]",
      hoverText: "hover:text-white",
    },
    orange: {
      logoBg: "bg-[#faeadd]",
      logoText: "text-[#e28743]",
      activeBg: "bg-[#e28743]",
      activeHoverBg: "hover:bg-[#eb9e61]",
      hoverBg: "hover:bg-[#e28743]",
      hoverText: "hover:text-white",
    },
  } as const

  const accent = (themeColor === 'green' ? 'emerald' : themeColor) as keyof typeof accentMap
  const accentClasses = accentMap[accent] || accentMap.emerald

  const brandBg = accentClasses.logoBg
  const primaryText = accentClasses.logoText
  const activeBg = accentClasses.activeBg
  const activeHoverBg = accentClasses.activeHoverBg
  const hoverBg = accentClasses.hoverBg
  const hoverContent = accentClasses.hoverText

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-72'
      }`}
    >
      {/* Logo / Brand */}
      <div className={`p-4 ${collapsed ? 'px-3 pb-2' : 'p-6 pb-4'} flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div className={`${brandBg} flex items-center justify-center rounded-xl h-10 w-10 shrink-0`}>
              <BrandIcon size={24} className={primaryText} />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-slate-800 whitespace-nowrap">
                  {brand.name}
                </h1>
                <p className="text-xs text-slate-500 whitespace-nowrap">
                  {brand.subtitle}
                </p>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0"
              title="Thu gọn menu"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center border-t border-slate-100 pt-2">
            <button
              onClick={onToggle}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Mở rộng menu"
            >
              <PanelLeft size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} space-y-1`}>
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
              className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-0 py-3' : 'px-4 py-3'} rounded-xl text-slate-600 font-medium transition-all ${hoverBg} ${hoverContent} relative`}
              activeProps={{
                className:
                  `active group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-0 py-3' : 'px-4 py-3'} rounded-xl ${activeBg} ${activeHoverBg} text-white font-semibold`,
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className={`transition-colors text-slate-500 group-hover:text-white group-[.active]:text-white shrink-0`}
              />
              {!collapsed && (
                <span className={`text-sm transition-colors text-slate-600 group-hover:text-white group-[.active]:text-white whitespace-nowrap`}>
                  {item.label}
                </span>
              )}
            </Link>
          )
          
        })}
      </nav>
    </aside>
  )
}
