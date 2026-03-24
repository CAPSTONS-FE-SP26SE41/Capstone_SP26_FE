import { Outlet } from '@tanstack/react-router'
import AppSidebar, { type NavItem, type SidebarBrand } from './AppSidebar'
import AppTopbar from './AppTopbar'

type DashboardLayoutProps = {
  brand: SidebarBrand
  navItems: NavItem[]
  /**
   * Accent theme for staff-like UI (ex: emerald/green).
   * Defaults to "blue" to avoid changing admin styling.
   */
  accent?: 'blue' | 'emerald'
  logoutTo: string
  logoutTokenKey: string
  userName?: string
  userRole?: string
  userAvatarUrl?: string
  searchPlaceholder?: string
}

export default function DashboardLayout({
  brand,
  navItems,
  accent = 'blue',
  logoutTo,
  logoutTokenKey,
  userName,
  userRole,
  userAvatarUrl,
  searchPlaceholder,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AppSidebar
        brand={brand}
        navItems={navItems}
        logoutTo={logoutTo}
        logoutTokenKey={logoutTokenKey}
        accent={accent}
        logoutLabel={accent === "emerald" ? "Đăng xuất" : "Logout"}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <AppTopbar
          accent={accent}
          userName={userName}
          userRole={userRole}
          userAvatarUrl={userAvatarUrl}
          searchPlaceholder={searchPlaceholder}
        />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
