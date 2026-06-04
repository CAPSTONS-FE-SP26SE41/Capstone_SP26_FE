import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import StatCard from "../../../components/admin/StatCard"
import { getAdminDashboardStats, AdminDashboardResponse } from "../../../services/adminStatisticService"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, MapPin, Flame, TrendingUp, Sparkles, ChartBar, Layers } from "lucide-react"

export const Route = createFileRoute("/admin/_layout/")({
  component: AdminDashboard,
})

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899"]

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
  padding: "12px 16px",
}

function AdminDashboard() {
  const [period, setPeriod] = useState<string>("daily")
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    )
  }

  // Format data for Role Pie Chart
  const roleData = [
    { name: "Khách hàng", value: stats.accountRoles.userCount },
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ChartBar size={26} className="text-blue-500" />
            Tổng quan Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Theo dõi hiệu suất và sự tăng trưởng của hệ thống.
          </p>
        </div>
        <div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 block w-full p-2.5 outline-none font-semibold shadow-sm transition-all cursor-pointer"
          >
            <option value="daily">Tăng trưởng hàng ngày (30 ngày qua)</option>
            <option value="monthly">Tăng trưởng hàng tháng</option>
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
          title="Tổng địa điểm (POI)"
          value={stats.totalPois.toLocaleString()}
          icon={<MapPin size={22} />}
          gradient="from-emerald-400 to-teal-600"
          shadowColor="shadow-emerald-500/20"
          description="Địa điểm trên toàn hệ thống"
          trend="up"
        />
        <StatCard
          title="Tổng quảng cáo"
          value={stats.totalAds.toLocaleString()}
          icon={<Flame size={22} />}
          gradient="from-violet-500 to-purple-700"
          shadowColor="shadow-violet-500/20"
          description="Các chiến dịch quảng cáo"
          trend="neutral"
        />
        <StatCard
          title="Tài khoản mới"
          value={stats.accountGrowth.reduce((acc, curr) => acc + curr.newAccounts, 0).toLocaleString()}
          icon={<TrendingUp size={22} />}
          gradient="from-rose-400 to-red-600"
          shadowColor="shadow-rose-500/20"
          description="Tăng trưởng trong chu kỳ"
          trend="up"
        />
      </div>

      {/* Main Chart - Account Growth */}
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Xu hướng phát triển tài khoản</h2>
            <p className="text-xs text-slate-400 mt-1">Số lượng tài khoản đăng ký mới theo thời gian</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              {period === "daily" ? "30 ngày qua" : "Theo tháng"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp size={16} className="text-white" />
            </div>
          </div>
        </div>

        <div className="h-80 w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.accountGrowth} style={{ outline: "none" }} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickMargin={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(59,130,246,0.2)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="newAccounts"
                name="Tài khoản mới"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#growthGrad)"
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts: Roles & Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Phân bổ vai trò tài khoản</h3>
              <p className="text-xs text-slate-400 mt-1">Phân chia nhóm người dùng trong hệ thống</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users size={16} className="text-white" />
            </div>
          </div>
          {roleData.length > 0 ? (
            <div className="h-72 w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <defs>
                    {COLORS.map((color, idx) => (
                      <linearGradient key={idx} id={`rolePieGrad${idx}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {roleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#rolePieGrad${index % COLORS.length})`}
                        style={{ outline: "none" }}
                      />
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
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Không có dữ liệu vai trò
            </div>
          )}
        </div>

        {/* Package Popularity */}
        <div className="bg-white rounded-2xl border border-slate-200/85 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Độ phổ biến của gói dịch vụ</h3>
              <p className="text-xs text-slate-400 mt-1">Các gói dịch vụ đang hoạt động được mua nhiều nhất</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers size={16} className="text-white" />
            </div>
          </div>
          {stats.packagePopularity.length > 0 ? (
            <div className="h-72 w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }}>
                  <defs>
                    {COLORS.map((color, idx) => (
                      <linearGradient key={idx} id={`packagePieGrad${idx}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={stats.packagePopularity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="userCount"
                    nameKey="packageName"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {stats.packagePopularity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#packagePieGrad${(index + 2) % COLORS.length})`}
                        style={{ outline: "none" }}
                      />
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
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm text-center border border-dashed border-slate-200 rounded-xl">
              Chưa có gói dịch vụ nào được kích hoạt.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
