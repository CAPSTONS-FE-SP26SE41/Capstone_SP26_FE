import { Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import AppSidebar, { type NavItem, type SidebarBrand } from './AppSidebar'
import AppTopbar from './AppTopbar'

type DashboardLayoutProps = {
  brand: SidebarBrand
  navItems: NavItem[]
  userName?: string
  userRole?: string
  userAvatarUrl?: string
  searchPlaceholder?: string
  showSearch?: boolean
  themeColor?: string
}

export default function DashboardLayout({
  brand,
  navItems,
  userName,
  userRole,
  userAvatarUrl,
  searchPlaceholder,
  showSearch = false,
  themeColor = 'green',
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar
        brand={brand}
        navItems={navItems}
        themeColor={themeColor}
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
      />

      <div className="flex-1 flex flex-col">
        <AppTopbar
          userName={userName}
          userRole={userRole}
          userAvatarUrl={userAvatarUrl}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          themeColor={themeColor}
        />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}