import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Megaphone,
  PackageOpen,
  TrendingUp,
  UserCircle,
  Handshake,
} from 'lucide-react'
import DashboardLayout from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/partner/_layout')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('partner_token')) {
      throw redirect({ to: '/login' })
    }
  },
  component: PartnerLayout,
})

function PartnerLayout() {
  return (
    <DashboardLayout
      brand={{
        name: 'PartnerHub',
        subtitle: 'Partner & Ads Panel',
        icon: Handshake,
      }}
      navItems={[
        { to: '/partner', icon: LayoutDashboard, label: 'Overview', exact: true },
        { to: '/partner/ads', icon: Megaphone, label: 'My Ads' },
        { to: '/partner/packages', icon: PackageOpen, label: 'Packages' },
        { to: '/partner/revenue', icon: TrendingUp, label: 'Revenue' },
        { to: '/partner/profile', icon: UserCircle, label: 'Profile' },
      ]}
      logoutTo="/login"
      logoutTokenKey="partner_token"
      userName="Partner Profile"
      userRole="Business Partner"
      searchPlaceholder="Search ads, packages..."
    />
  )
}
