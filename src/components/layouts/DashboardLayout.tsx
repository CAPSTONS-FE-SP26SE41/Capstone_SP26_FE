import { Outlet } from '@tanstack/react-router'
import AppSidebar, { type NavItem, type SidebarBrand } from './AppSidebar'
import AppTopbar from './AppTopbar'

type DashboardLayoutProps = {
  brand: SidebarBrand
  navItems: NavItem[]
  userName?: string
  userRole?: string
  userAvatarUrl?: string
  searchPlaceholder?: string
  themeColor?: string
}

export default function DashboardLayout({
  brand,
  navItems,
  userName,
  userRole,
  userAvatarUrl,
  searchPlaceholder,
  themeColor = 'green',
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AppSidebar
        brand={brand}
        navItems={navItems}
        themeColor={themeColor}
      />


      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <AppTopbar
          accent={accent}
          userName={userName}
          userRole={userRole}
          userAvatarUrl={userAvatarUrl}
          searchPlaceholder={searchPlaceholder}
          themeColor={themeColor}
        />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
