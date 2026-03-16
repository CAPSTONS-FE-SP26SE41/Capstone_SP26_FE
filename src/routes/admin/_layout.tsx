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
  return (
    <DashboardLayout
      brand={{
        name: 'TripAdmin',
        subtitle: 'Trip Planner Panel',
        icon: PlaneTakeoff,
      }}
      navItems={[
        { to: '/admin/accounts', icon: UserCog, label: 'Account', exact: true },
        { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscription' },
        { to: '/admin/settings', icon: Settings, label: 'System' },
        { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
      ]}
      logoutTo="/admin/login"
      logoutTokenKey="admin_token"
      userName="Admin Profile"
      userRole="Super Admin"
      searchPlaceholder="Search users, bookings..."
    />
  )
}
