import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Map,
  BarChart2,
  Settings,
  PlaneTakeoff,
  UserCog,
  CreditCard,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const [userName, setUserName] = useState('Admin Profile')
  const [userRole, setUserRole] = useState('Admin')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_name')
      const storedRole = localStorage.getItem('user_role')
      if (storedName) setUserName(storedName)
      if (storedRole) setUserRole(storedRole)
    }
  }, [])

  return (
    <DashboardLayout
      brand={{
        name: 'TripAdmin',
        subtitle: 'Trip Planner Panel',
        icon: PlaneTakeoff,
      }}
      navItems={[
        { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/admin/accounts', icon: UserCog, label: 'Account', exact: true },
        { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscription' },
        { to: '/admin/settings', icon: Settings, label: 'System' },
      ]}
      logoutTo="/admin/login"
      logoutTokenKey="admin_token"
      userName={userName}
      userRole={userRole}
      searchPlaceholder="Search users, bookings..."
    />
  )
}
