import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

export const Route = createFileRoute('/partner/_layout/ads')({
  component: PartnerAds,
})

type Ad = {
  id: string
  title: string
  package: string
  startDate: string
  endDate: string
  status: 'Active' | 'Pending' | 'Expired'
  impressions: number
  clicks: number
}

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Summer Beach Resort Campaign',
    package: 'Premium',
    startDate: '01 Mar 2026',
    endDate: '30 Mar 2026',
    status: 'Active',
    impressions: 12540,
    clicks: 430,
  },
  {
    id: '2',
    title: 'City Hotel Weekend Deal',
    package: 'Standard',
    startDate: '10 Mar 2026',
    endDate: '20 Mar 2026',
    status: 'Pending',
    impressions: 0,
    clicks: 0,
  },
  {
    id: '3',
    title: 'Mountain Retreat Package',
    package: 'Basic',
    startDate: '01 Feb 2026',
    endDate: '28 Feb 2026',
    status: 'Expired',
    impressions: 5820,
    clicks: 178,
  },
  {
    id: '4',
    title: 'Luxury Spa Weekend Promo',
    package: 'Premium',
    startDate: '15 Mar 2026',
    endDate: '15 Apr 2026',
    status: 'Active',
    impressions: 3210,
    clicks: 95,
  },
]

export default function PartnerAds() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Active' | 'Pending' | 'Expired'>('All')

  const filtered = mockAds.filter((ad) => {
    const matchSearch = ad.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || ad.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Ads</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage and monitor all your advertisements.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={18} />
          Create New Ad
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full h-10 pl-9 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Search ads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Active', 'Pending', 'Expired'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filter === s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4 text-left">Ad Title</th>
                <th className="px-6 py-4 text-left">Package</th>
                <th className="px-6 py-4 text-left">Period</th>
                <th className="px-6 py-4 text-left">Impressions</th>
                <th className="px-6 py-4 text-left">Clicks</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right w-[120px]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    No ads found.
                  </td>
                </tr>
              ) : (
                filtered.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{ad.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{ad.package}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{ad.startDate} – {ad.endDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{ad.impressions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{ad.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        ad.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ad.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-[120px]">
                      <div className="flex justify-end">
                        <button className="inline-flex items-center justify-center h-9 min-w-[80px] px-3 text-sm font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
