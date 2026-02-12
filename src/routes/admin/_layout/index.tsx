import { createFileRoute } from '@tanstack/react-router'
import StatCard from '../../../components/admin/StatCard'

export const Route = createFileRoute('/admin/_layout/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Monitor your platform performance and growth.
        </p>
      </div>

      {/* Stats */}
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-4 
        gap-6
      ">
        <StatCard title="Total Users" value="12,345" />
        <StatCard title="Active Trips" value="432" />
        <StatCard title="Revenue" value="$45,290" />
        <StatCard title="Pending" value="18" />
      </div>

      {/* Chart Card */}
      <div className="
        mt-8
        bg-white 
        rounded-2xl 
        border border-slate-200
        shadow-sm
        p-6
      ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            User Growth Trends
          </h2>

          <span className="text-sm text-slate-400">
            Last 30 days
          </span>
        </div>

        <div className="
          h-56 
          rounded-xl 
          bg-slate-50 
          flex items-center justify-center 
          text-slate-400
          border border-dashed border-slate-200
        ">
          (Chart placeholder)
        </div>
      </div>

    </div>
  )
}

