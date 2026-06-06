import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { Users, DollarSign, CreditCard, TrendingUp, Flame } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { getAdminDashboardStats, AdminDashboardResponse } from "../../../services/adminStatisticService"
import { DateRangePicker } from "../../../components/ui/DateRangePicker"
import StatCard from "../../../components/admin/StatCard"

export const Route = createFileRoute("/admin/_layout/analytics")({
  component: AdminAnalytics,
})

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899"]

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
  padding: "12px 16px",
}

function AdminAnalytics() {
  const [period, setPeriod] = useState<string>("daily")
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    )
  }

  // Format data for Role Pie Chart
  const roleData = [
    { name: "Người dùng", value: stats.accountRoles.userCount },
    { name: "Đối tác", value: stats.accountRoles.partnerCount },
    { name: "Quản lý", value: stats.accountRoles.managerCount },
    { name: "Nhân viên", value: stats.accountRoles.staffCount },
  ].filter((r) => r.value > 0)

  return (
    <div className="space-y-6 pb-10">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .recharts-wrapper, .recharts-surface, .recharts-responsive-container { outline: none !important; }
        path.recharts-sector, .recharts-bar-rectangle { outline: none !important; }
      `}</style>

      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <DateRangePicker
            value={{ start: dateRange.start, end: dateRange.end }}
            onChange={(range) => setDateRange(range)}
            theme="blue"
            align="left"
          />

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 block w-full sm:w-auto p-2.5 outline-none font-semibold shadow-sm transition-all cursor-pointer"
          >
            <option value="daily">Kiểu xem: Theo ngày</option>
            <option value="monthly">Kiểu xem: Theo tháng</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Tổng tài khoản"
          value={stats.totalAccounts.toLocaleString()}
          icon={<Users size={22} />}
          gradient="from-blue-500 to-indigo-600"
          shadowColor="shadow-blue-500/20"
          description="Tất cả tài khoản hệ thống"
          trend="up"
        />
        <StatCard
          title="Tổng doanh thu"
          value={`${stats.totalRevenue.toLocaleString("vi-VN")} ₫`}
          icon={<DollarSign size={22} />}
          gradient="from-emerald-400 to-teal-600"
          shadowColor="shadow-emerald-500/20"
          description="Doanh thu từ gói dịch vụ"
          trend="up"
        />
        <StatCard
          title="Gói đang hoạt động"
          value={stats.activeSubscriptions.toLocaleString()}
          icon={<CreditCard size={22} />}
          gradient="from-violet-500 to-purple-700"
          shadowColor="shadow-violet-500/20"
          description="Subscription đang Active"
          trend="neutral"
        />
        <StatCard
          title="Tài khoản mới"
          value={stats.accountGrowth.reduce((sum, item) => sum + item.newAccounts, 0).toLocaleString()}
          icon={<TrendingUp size={22} />}
          gradient="from-rose-400 to-red-600"
          shadowColor="shadow-rose-500/20"
          description="Tăng trưởng trong chu kỳ"
          trend="up"
        />
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tốc độ tăng trưởng tài khoản</h3>
            <p className="text-xs text-slate-400 mt-1">Biểu đồ thể hiện lượt đăng ký mới trong giai đoạn chọn lọc</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp size={16} className="text-white" />
          </div>
        </div>

        <div
          className={`h-80 w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none transition-opacity duration-300 ${
            isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.accountGrowth} style={{ outline: "none" }} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="analyticsGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickMargin={10} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(59,130,246,0.2)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="newAccounts"
                name="Tài khoản mới"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#analyticsGrowthGrad)"
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Role distribution & Package popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Phân bổ vai trò tài khoản</h3>
              <p className="text-xs text-slate-400 mt-1">Cơ cấu người dùng trên hệ thống</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users size={16} className="text-white" />
            </div>
          </div>

          <div className="h-72 w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <defs>
                    {COLORS.map((color, idx) => (
                      <linearGradient key={idx} id={`analyticsRoleGrad${idx}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    stroke="none"
                    cornerRadius={6}
                  >
                    {roleData.map((_, index) => (
                      <Cell key={index} fill={`url(#analyticsRoleGrad${index % COLORS.length})`} style={{ outline: "none" }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-slate-600 text-xs font-semibold">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Package Popularity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Độ phổ biến của gói dịch vụ</h3>
              <p className="text-xs text-slate-400 mt-1">Các gói dịch vụ được kích hoạt nhiều nhất</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Flame size={16} className="text-white" />
            </div>
          </div>

          <div className="h-72 w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            {stats.packagePopularity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.packagePopularity} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }} style={{ outline: "none" }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="packageName" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} width={120} />
                  <Tooltip
                    cursor={{ fill: "rgba(16,185,129,0.04)" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="userCount" name="Người sử dụng" radius={[0, 6, 6, 0]} barSize={20}>
                    {stats.packagePopularity.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Không có gói dịch vụ nào đang hoạt động
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
