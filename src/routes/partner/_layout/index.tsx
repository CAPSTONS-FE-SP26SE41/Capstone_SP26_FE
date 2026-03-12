import { createFileRoute } from '@tanstack/react-router'
import StatCard from '../../../components/admin/StatCard'

export const Route = createFileRoute('/partner/_layout/')({
  component: PartnerDashboard,
})

type AdItem = {
  id: string
  title: string
  package: string
  startDate: string
  endDate: string
  status: 'Active' | 'Pending' | 'Expired'
  impressions: number
}

function PartnerDashboard() {
  const recentAds: AdItem[] = [
    {
      id: '1',
      title: 'Summer Beach Resort Campaign',
      package: 'Premium',
      startDate: '01 Mar 2026',
      endDate: '30 Mar 2026',
      status: 'Active',
      impressions: 12540,
    },
    {
      id: '2',
      title: 'City Hotel Weekend Deal',
      package: 'Standard',
      startDate: '10 Mar 2026',
      endDate: '20 Mar 2026',
      status: 'Pending',
      impressions: 0,
    },
    {
      id: '3',
      title: 'Mountain Retreat Package',
      package: 'Basic',
      startDate: '01 Feb 2026',
      endDate: '28 Feb 2026',
      status: 'Expired',
      impressions: 5820,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Partner Overview
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Track your ad performance, revenue, and package usage.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Ads" value="3" />
        <StatCard title="Total Impressions" value="18,360" />
        <StatCard title="Revenue Earned" value="$2,450" />
        <StatCard title="Pending Reviews" value="1" />
      </div>

      {/* Performance Chart Placeholder */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Ad Performance
          </h2>
          <span className="text-sm text-slate-400">
            Last 30 days
          </span>
        </div>

        <div className="h-56 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
          (Chart placeholder)
        </div>
      </div>

      {/* Recent Ads Table */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Ads
          </h3>
          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4 text-left">Ad Title</th>
                <th className="px-6 py-4 text-left">Package</th>
                <th className="px-6 py-4 text-left">Period</th>
                <th className="px-6 py-4 text-left">Impressions</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right w-[140px]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {recentAds.map((ad) => (
                <tr
                  key={ad.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Title */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800 text-sm">
                      {ad.title}
                    </span>
                  </td>

                  {/* Package */}
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {ad.package}
                  </td>

                  {/* Period */}
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {ad.startDate} – {ad.endDate}
                  </td>

                  {/* Impressions */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {ad.impressions.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        ad.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ad.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ad.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 w-[140px]">
                    <div className="flex justify-end">
                      <button
                        className={`
                          inline-flex items-center justify-center
                          h-9 min-w-[90px]
                          px-3
                          text-sm font-semibold
                          rounded-lg
                          transition-colors
                          ${
                            ad.status === 'Pending'
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : ad.status === 'Active'
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                          }
                        `}
                      >
                        {ad.status === 'Pending' ? 'View' : 'Details'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
