import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import StatCard from '../../../components/admin/StatCard'
import { getAdminDashboardStats, AdminDashboardResponse } from '../../../services/adminStatisticService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export const Route = createFileRoute('/admin/_layout/')({
  component: AdminDashboard,
})

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function AdminDashboard() {
  const [period, setPeriod] = useState<string>('daily')
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const data = await getAdminDashboardStats(period)
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch admin stats", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [period])

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading statistics...</div>
      </div>
    )
  }

  // Format data for Role Pie Chart
  const roleData = [
    { name: 'Users', value: stats.accountRoles.userCount },
    { name: 'Partners', value: stats.accountRoles.partnerCount },
    { name: 'Managers', value: stats.accountRoles.managerCount },
    { name: 'Staff', value: stats.accountRoles.staffCount },
  ].filter(r => r.value > 0);

  return (
    <div className="min-h-screen bg-white p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor your platform performance and growth.
          </p>
        </div>
        <div>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none font-medium shadow-sm transition-all"
          >
            <option value="daily">Daily Growth (Last 30 Days)</option>
            <option value="monthly">Monthly Growth</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Accounts" value={stats.totalAccounts.toString()} />
        <StatCard title="Total POIs" value={stats.totalPois.toString()} />
        <StatCard title="Total Ads" value={stats.totalAds.toString()} />
        <StatCard title="New Accounts (Chart)" value={stats.accountGrowth.reduce((acc, curr) => acc + curr.newAccounts, 0).toString()} />
      </div>

      {/* Main Chart */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Account Growth Trends
          </h2>
          <span className="text-sm text-slate-400">
            {period === 'daily' ? 'Last 30 days' : 'By Month'}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.accountGrowth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#334155' }}
              />
              <Line type="monotone" dataKey="newAccounts" name="New Accounts" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Roles & Packages */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Role Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Account Roles Distribution
          </h3>
          {roleData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No role data available
            </div>
          )}
        </div>

        {/* Package Popularity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Active Packages Popularity
          </h3>
          {stats.packagePopularity.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.packagePopularity}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="userCount"
                    nameKey="packageName"
                  >
                    {stats.packagePopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm text-center border border-dashed border-slate-200 rounded-xl">
              No active subscription packages found.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
