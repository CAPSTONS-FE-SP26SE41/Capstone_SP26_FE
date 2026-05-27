import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getAdminDashboardStats, AdminDashboardResponse } from '../../../services/adminStatisticService'

export const Route = createFileRoute('/admin/_layout/analytics')({
  component: AdminAnalytics,
})

const COLORS = ['#258cf4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function AdminAnalytics() {
  const [period, setPeriod] = useState<string>('daily')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const data = await getAdminDashboardStats(
          period, 
          dateRange.start || undefined, 
          dateRange.end || undefined
        )
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch admin stats", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [period, dateRange])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-secondary font-medium">Đang tải dữ liệu thống kê...</div>
      </div>
    )
  }

  // Format data for Role Pie Chart
  const roleData = [
    { name: 'Người dùng', value: stats.accountRoles.userCount },
    { name: 'Đối tác', value: stats.accountRoles.partnerCount },
    { name: 'Quản lý', value: stats.accountRoles.managerCount },
    { name: 'Nhân viên', value: stats.accountRoles.staffCount },
  ].filter(r => r.value > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="bg-white border border-[#e7edf4] text-text-main text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm transition-all"
          />
          <span className="text-text-secondary">-</span>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="bg-white border border-[#e7edf4] text-text-main text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm transition-all"
          />
        </div>
        
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-[#e7edf4] text-text-main text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5 outline-none font-medium shadow-sm transition-all"
        >
          <option value="daily">Kiểu xem: Theo ngày</option>
          <option value="monthly">Kiểu xem: Theo tháng</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Tổng tài khoản
          </p>
          <p className="text-2xl font-bold text-text-main mt-2">
            {stats.totalAccounts}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Tổng địa điểm (POI)
          </p>
          <p className="text-2xl font-bold text-text-main mt-2">
            {stats.totalPois}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Tổng quảng cáo
          </p>
          <p className="text-2xl font-bold text-text-main mt-2">
            {stats.totalAds}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Tài khoản mới
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            +{stats.accountGrowth.reduce((sum, item) => sum + item.newAccounts, 0)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl border border-[#e7edf4] shadow-sm">
        <h3 className="text-lg font-bold text-text-main mb-6">
          Tốc độ tăng trưởng tài khoản
        </h3>

        <div className={`h-[300px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.accountGrowth} style={{ outline: 'none' }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7edf4" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickMargin={10} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="newAccounts" 
                name="Tài khoản mới" 
                stroke="#258cf4" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-[#e7edf4] shadow-sm">
          <h3 className="text-lg font-bold text-text-main mb-4">
            Phân bổ vai trò tài khoản
          </h3>

          <div className="h-[300px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: 'none' }}>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {roleData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Package Popularity */}
        <div className="bg-white p-6 rounded-xl border border-[#e7edf4] shadow-sm">
          <h3 className="text-lg font-bold text-text-main mb-4">
            Độ phổ biến của gói dịch vụ
          </h3>

          <div className="h-[300px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            {stats.packagePopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.packagePopularity} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }} style={{ outline: 'none' }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7edf4" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis type="category" dataKey="packageName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="userCount" name="Người sử dụng" fill="#10b981" radius={[0, 6, 6, 0]}>
                    {stats.packagePopularity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary">
                Không có gói dịch vụ nào đang hoạt động
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

