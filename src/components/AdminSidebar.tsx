import { Link, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Map,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react'

export default function AdminSidebar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate({ to: '/admin/login' })
  }

  const Item = ({ to, icon: Icon, label }: any) => (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50"
      activeProps={{ className: 'bg-blue-100 text-blue-700' }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  )

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 font-bold text-xl">TripAdmin</div>

      <nav className="flex-1 space-y-1 px-2">
        <Item to="/admin" icon={LayoutDashboard} label="Overview" />
        <Item to="/admin/users" icon={Users} label="Users" />
        <Item to="/admin/bookings" icon={Calendar} label="Bookings" />
        <Item to="/admin/destinations" icon={Map} label="Destinations" />
        <Item to="/admin/analytics" icon={BarChart2} label="Analytics" />
        <Item to="/admin/settings" icon={Settings} label="Settings" />
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  )
}
