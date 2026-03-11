import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Map,
  BarChart2,
  Settings,
  PlaneTakeoff,
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
        { to: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
        { to: '/admin/destinations', icon: Map, label: 'Destinations' },
        { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
      ]}
      logoutTo="/admin/login"
      logoutTokenKey="admin_token"
      userName="Admin Profile"
      userRole="Super Admin"
      searchPlaceholder="Search users, bookings..."
    />
  )
}
