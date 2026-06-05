import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Calendar,
  Map,
  BarChart2,
  PlaneTakeoff,
  UserCog,
  CreditCard,
  Receipt,
  Sliders,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { getMe } from '../../services/authService'


export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const [isMounted, setIsMounted] = useState(false)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined)

  useEffect(() => {
    setIsMounted(true)
    
    // Lấy dữ liệu từ localStorage ngay khi mount
    const storedName = localStorage.getItem('user_name')
    const storedRole = localStorage.getItem('user_role')
    const storedAvatar = localStorage.getItem('user_avatar')
    
    if (storedName) setUserName(storedName)
    else setUserName("Hồ sơ Admin")
    
    if (storedRole) setUserRole(storedRole)
    else setUserRole("Quản trị viên")
    
    if (storedAvatar) setUserAvatar(storedAvatar)

    // Gọi API để cập nhật tên thật (nếu cần)
    const fetchProfile = async () => {
      try {
        const data = await getMe()
        const name = data?.name || data?.profile?.name || localStorage.getItem('user_name')
        if (name) setUserName(name)
      } catch (error) {
        console.error("Failed to sync profile name:", error)
      }
    }
    fetchProfile()
  }, [])

  // Nếu chưa mount, hiển thị layout trống hoặc skeleton để tránh flash
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }





  return (
    <DashboardLayout
      brand={{
        name: 'TripAdmin',
        subtitle: 'Bảng điều khiển quản trị',
        icon: PlaneTakeoff,
      }}
      navItems={[
        { to: '/admin/analytics', icon: BarChart2, label: 'Thống kê' },
        { to: '/admin/accounts', icon: UserCog, label: 'Quản lý tài khoản', exact: true },
        { to: '/admin/destinations', icon: Map, label: 'Quản lý địa điểm' },
        { to: '/admin/subscriptions', icon: CreditCard, label: 'Gói dịch vụ' },
        { to: '/admin/transactions', icon: Receipt, label: 'Lịch sử giao dịch' },
        { to: '/admin/preferences', icon: Sliders, label: 'Sở thích hệ thống' },
      ]}

      userName={userName}
      userRole={userRole}
      userAvatarUrl={userAvatar}
      searchPlaceholder="Tìm kiếm tài khoản, gói dịch vụ..."
      themeColor="blue"

    />

  )
}

