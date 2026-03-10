import { Link, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Map,
  BarChart2,
  Settings,
  LogOut,
  PlaneTakeoff,
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
      activeOptions={{ exact: true }} 
      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium transition-all"
      activeProps={{
        className:
          'flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold',
      }}
    >
      <Icon
        size={20}
        className="transition-colors group-hover:text-blue-600"
      />
      <span className="text-sm">{label}</span>
    </Link>
  )

  return (
    <aside className="w-70 bg-white border-r border-slate-200 flex flex-col justify-between">

      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 flex items-center justify-center rounded-xl h-10 w-10">
            <PlaneTakeoff size={32} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              TripAdmin
            </h1>
            <p className="text-xs text-slate-500">
              Trip Planner Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2">
        <Item to="/admin" icon={LayoutDashboard} label="Overview" />
        <Item to="/admin/users" icon={Users} label="Users" />
        <Item to="/admin/bookings" icon={Calendar} label="Bookings" />
        <Item to="/admin/destinations" icon={Map} label="Destinations" />
        <Item to="/admin/analytics" icon={BarChart2} label="Analytics" />

        <div className="h-px bg-slate-200 my-4" />

        <Item to="/admin/settings" icon={Settings} label="Settings" />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
