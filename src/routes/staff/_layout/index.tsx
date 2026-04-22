import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  ClipboardCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { getManagerDashboardStats, ManagerDashboardResponse } from "../../../services/managerStatisticService"

export const Route = createFileRoute("/staff/_layout/")({
  component: StaffDashboard,
})

const COLORS = ["#009a63", "#00b374", "#20c997", "#5fe3c0", "#a1f1db"]

function StaffDashboard() {
  const [period, setPeriod] = useState<string>("daily")
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [stats, setStats] = useState<ManagerDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const data = await getManagerDashboardStats(
          period,
          dateRange.start || undefined,
          dateRange.end || undefined
        )
        setStats(data)
      } catch (e) {
        console.error("Failed to fetch manager stats", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [period, dateRange])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 font-medium italic">Đang tải dữ liệu thống kê...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Thống kê</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="bg-white border border-emerald-100 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none shadow-sm transition-all"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="bg-white border border-emerald-100 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none shadow-sm transition-all"
            />
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-emerald-100 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:w-auto p-2.5 outline-none font-medium shadow-sm transition-all"
          >
            <option value="daily">Kiểu xem: Theo ngày</option>
            <option value="monthly">Kiểu xem: Theo tháng</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="POI chờ duyệt"
          value={String(stats.pendingPois)}
          icon={<AlertCircle size={18} className="text-amber-600" />}
          bgColor="bg-amber-50"
          borderColor="border-amber-100"
          isWarning={stats.pendingPois > 0}
        />
        <SummaryCard
          title="Quảng cáo chờ duyệt"
          value={String(stats.pendingAds)}
          icon={<ClipboardCheck size={18} className="text-blue-600" />}
          bgColor="bg-blue-50"
          borderColor="border-blue-100"
          isWarning={stats.pendingAds > 0}
        />
        <SummaryCard
          title="Đối tác mới"
          value={String(stats.newPartnersGrowth.reduce((acc, curr) => acc + curr.newPartners, 0))}
          icon={<Users size={18} className="text-emerald-700" />}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
        <SummaryCard
          title="Doanh thu kỳ này"
          value={formatCurrency(stats.packageRevenue.reduce((acc, curr) => acc + curr.totalRevenue, 0))}
          icon={<TrendingUp size={18} className="text-emerald-700" />}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-100"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Growth */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tăng trưởng đối tác</h3>
          <div className={`h-64 transition-opacity duration-300 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none ${isLoading ? "opacity-50" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.newPartnersGrowth} style={{ outline: "none" }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="newPartners"
                  name="Đối tác mới"
                  stroke="#009a63"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Phân bổ danh mục POI</h3>
          <div className={`h-64 transition-opacity duration-300 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none ${isLoading ? "opacity-50" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topPoiCategories} layout="vertical" margin={{ left: 20 }} style={{ outline: "none" }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis type="category" dataKey="categoryName" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={100} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" name="Số lượng" fill="#009a63" radius={[0, 4, 4, 0]}>
                  {stats.topPoiCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Ratios */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Tỷ lệ phê duyệt</h3>
          <div className="space-y-6">
            <ApprovalIndicator
              label="Địa điểm (POI)"
              approved={stats.poiApprovalRatio.approvedPercentage}
              rejected={stats.poiApprovalRatio.rejectedPercentage}
              total={stats.poiApprovalRatio.totalProcessed}
              color="bg-emerald-500"
            />
            <ApprovalIndicator
              label="Quảng cáo (Ads)"
              approved={stats.adApprovalRatio.approvedPercentage}
              rejected={stats.adApprovalRatio.rejectedPercentage}
              total={stats.adApprovalRatio.totalProcessed}
              color="bg-emerald-500"
            />
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
             <h4 className="text-sm font-semibold text-slate-700 mb-4">Trạng thái quảng cáo</h4>
             <div className="grid grid-cols-2 gap-3">
                <StatusSmallCard label="Đang chạy" value={stats.adStatusBreakdown.active} color="bg-emerald-500" />
                <StatusSmallCard label="Tạm dừng" value={stats.adStatusBreakdown.paused} color="bg-amber-500" />
                <StatusSmallCard label="Hết hạn" value={stats.adStatusBreakdown.expired} color="bg-slate-400" />
                <StatusSmallCard label="Từ chối" value={stats.adStatusBreakdown.rejected} color="bg-rose-500" />
             </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Doanh thu theo gói dịch vụ</h3>
          <div className={`h-[350px] transition-opacity duration-300 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none ${isLoading ? "opacity-50" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: "none" }}>
                <Pie
                  data={stats.packageRevenue}
                  dataKey="totalRevenue"
                  nameKey="packageName"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                >
                  {stats.packageRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  bgColor = "bg-emerald-50",
  borderColor = "border-emerald-100",
  isWarning = false,
}: {
  title: string
  value: string
  icon: React.ReactNode
  bgColor?: string
  borderColor?: string
  isWarning?: boolean
}) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm p-5 transition-all hover:shadow-md ${isWarning ? 'ring-2 ring-amber-500 ring-opacity-20' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${isWarning ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-2xl ${bgColor} border ${borderColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ApprovalIndicator({ label, approved, rejected, total, color = "bg-emerald-500" }: { label: string, approved: number, rejected: number, total: number, color?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-400 text-xs">Tổng: {total}</span>
      </div>
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <div className={`h-full ${color}`} style={{ width: `${approved}%` }} />
        <div className="h-full bg-rose-400" style={{ width: `${rejected}%` }} />
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-emerald-600">Được duyệt: {approved}%</span>
        <span className="text-rose-500">Từ chối: {rejected}%</span>
      </div>
    </div>
  )
}

function StatusSmallCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
       <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
       </div>
       <div className="text-lg font-bold text-slate-800">{value}</div>
    </div>
  )
}

function formatCurrency(amount: number) {
  return `${Math.round(amount).toLocaleString("vi-VN")} đ`
}