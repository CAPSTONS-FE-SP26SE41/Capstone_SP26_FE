import { createFileRoute } from '@tanstack/react-router'
import StatCard from '../../../components/admin/StatCard'

export const Route = createFileRoute('/admin/_layout/')({
  component: AdminDashboard,
})

type Activity = {
  id: string
  user: {
    name: string
    avatarUrl: string
  }
  destination: string
  date: string
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

function AdminDashboard() {
  const recentActivity: Activity[] = [
    {
      id: '1',
      user: {
        name: 'John Doe',
        avatarUrl: 'https://i.pravatar.cc/100?img=1',
      },
      destination: 'Paris',
      date: '12 Feb 2026',
      status: 'Confirmed',
    },
    {
      id: '2',
      user: {
        name: 'Anna Smith',
        avatarUrl: 'https://i.pravatar.cc/100?img=2',
      },
      destination: 'Tokyo',
      date: '15 Feb 2026',
      status: 'Pending',
    },
    {
      id: '3',
      user: {
        name: 'David Lee',
        avatarUrl: 'https://i.pravatar.cc/100?img=3',
      },
      destination: 'Seoul',
      date: '20 Feb 2026',
      status: 'Cancelled',
    },
  ]

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

      {/* Recent Activity Table */}
      <div className="
        mt-8
        bg-white 
        rounded-2xl 
        border border-slate-200
        shadow-sm
        overflow-hidden
      ">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Trip Activity
          </h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right w-[120px]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${row.user.avatarUrl}")` }}
                        ></div>
                        <span className="font-medium text-slate-800">
                          {row.user.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {row.destination}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {row.date}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${row.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : row.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {row.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        className={`
      inline-flex items-center justify-center
      h-9 min-w-[80px]
      px-3
      text-sm font-semibold
      rounded-lg
      transition-colors
      ${row.status === 'Pending'
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                          }
    `}
                      >
                        {row.status === 'Pending' ? 'Review' : (
  <>
    <span className="mr-1">👁</span> View
  </>
)}

                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No recent activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
