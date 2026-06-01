import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  ClipboardCheck,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  Maximize2,
  X,
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
  Area,
  AreaChart,
} from "recharts"

import { getManagerDashboardStats, ManagerDashboardResponse } from "../../../services/managerStatisticService"

export const Route = createFileRoute("/manager/_layout/")({
  component: StaffDashboard,
})

// Bảng màu phong phú hơn cho biểu đồ
const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]
const BAR_COLORS = ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"]

function StaffDashboard() {
  const [period, setPeriod] = useState<string>("daily")
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [stats, setStats] = useState<ManagerDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoomedChart, setZoomedChart] = useState<"partners" | "categories" | "revenue" | null>(null)

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    )
  }

  const totalPartners = stats.newPartnersGrowth.reduce((acc, curr) => acc + curr.newPartners, 0)
  const totalRevenue = stats.packageRevenue.reduce((acc, curr) => acc + curr.totalRevenue, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Thống kê tổng quan</h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="bg-transparent text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 block p-2 outline-none transition-all"
            />
            <span className="text-slate-300 font-light">→</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="bg-transparent text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 block p-2 outline-none transition-all"
            />
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 block w-full sm:w-auto p-2.5 outline-none font-medium shadow-sm transition-all cursor-pointer"
          >
            <option value="daily">📅 Theo ngày</option>
            <option value="monthly">📆 Theo tháng</option>
          </select>
        </div>
      </div>

      {/* Summary cards - Gradient style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GradientSummaryCard
          title="POI chờ duyệt"
          value={String(stats.pendingPois)}
          icon={<AlertCircle size={22} />}
          gradient="from-amber-400 to-orange-500"
          shadowColor="shadow-amber-500/20"
          iconBg="bg-white/20"
          trend={stats.pendingPois > 0 ? "warning" : "neutral"}
        />
        <GradientSummaryCard
          title="Quảng cáo chờ duyệt"
          value={String(stats.pendingAds)}
          icon={<ClipboardCheck size={22} />}
          gradient="from-blue-400 to-indigo-600"
          shadowColor="shadow-blue-500/20"
          iconBg="bg-white/20"
          trend={stats.pendingAds > 0 ? "warning" : "neutral"}
        />
        <GradientSummaryCard
          title="Đối tác mới"
          value={String(totalPartners)}
          icon={<Users size={22} />}
          gradient="from-emerald-400 to-teal-600"
          shadowColor="shadow-emerald-500/20"
          iconBg="bg-white/20"
          trend="up"
        />
        <GradientSummaryCard
          title="Doanh thu kỳ này"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUp size={22} />}
          gradient="from-violet-500 to-purple-700"
          shadowColor="shadow-violet-500/20"
          iconBg="bg-white/20"
          trend="up"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner Growth */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tăng trưởng đối tác</h3>
              <p className="text-xs text-slate-400 mt-1">Xu hướng đối tác mới theo thời gian</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomedChart("partners")}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                title="Phóng to biểu đồ"
              >
                <Maximize2 size={15} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Users size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className={`h-64 transition-opacity duration-300 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none ${isLoading ? "opacity-50" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.newPartnersGrowth} style={{ outline: "none" }}>
                <defs>
                  <linearGradient id="partnerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickMargin={10} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ color: "#334155", fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: "#06b6d4" }}
                />
                <Area
                  type="monotone"
                  dataKey="newPartners"
                  name="Đối tác mới"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#partnerGradient)"
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#06b6d4" }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#06b6d4" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Phân bổ danh mục POI</h3>
              <p className="text-xs text-slate-400 mt-1">Top danh mục địa điểm phổ biến</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomedChart("categories")}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                title="Phóng to biểu đồ"
              >
                <Maximize2 size={15} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className={`h-64 transition-opacity duration-300 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none ${isLoading ? "opacity-50" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topPoiCategories} layout="vertical" margin={{ left: 20 }} style={{ outline: "none" }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="categoryName" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} width={100} />
                <Tooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.04)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                />
                <Bar dataKey="count" name="Số lượng" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24}>
                  {stats.topPoiCategories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Ratios */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ClipboardCheck size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tỷ lệ phê duyệt</h3>
          </div>
          <div className="space-y-5">
            <ApprovalIndicator
              label="Địa điểm (POI)"
              approved={stats.poiApprovalRatio.approvedPercentage}
              rejected={stats.poiApprovalRatio.rejectedPercentage}
              total={stats.poiApprovalRatio.totalProcessed}
              approvedColor="bg-gradient-to-r from-emerald-400 to-emerald-500"
              rejectedColor="bg-gradient-to-r from-rose-400 to-rose-500"
            />
            <ApprovalIndicator
              label="Quảng cáo (Ads)"
              approved={stats.adApprovalRatio.approvedPercentage}
              rejected={stats.adApprovalRatio.rejectedPercentage}
              total={stats.adApprovalRatio.totalProcessed}
              approvedColor="bg-gradient-to-r from-blue-400 to-indigo-500"
              rejectedColor="bg-gradient-to-r from-orange-400 to-red-500"
            />
          </div>
          
          <div className="mt-7 pt-5 border-t border-slate-100">
             <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
               <Activity size={14} className="text-indigo-500" />
               Trạng thái quảng cáo
             </h4>
             <div className="grid grid-cols-2 gap-3">
                <StatusSmallCard label="Đang chạy" value={stats.adStatusBreakdown.active} color="bg-emerald-500" glowColor="shadow-emerald-500/10" emoji="🟢" />
                <StatusSmallCard label="Tạm dừng" value={stats.adStatusBreakdown.paused} color="bg-amber-500" glowColor="shadow-amber-500/10" emoji="🟡" />
                <StatusSmallCard label="Hết hạn" value={stats.adStatusBreakdown.expired} color="bg-slate-400" glowColor="shadow-slate-400/10" emoji="⚪" />
                <StatusSmallCard label="Từ chối" value={stats.adStatusBreakdown.rejected} color="bg-rose-500" glowColor="shadow-rose-500/10" emoji="🔴" />
             </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <TrendingUp size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Doanh thu theo gói dịch vụ</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tổng: {formatCurrency(totalRevenue)}</p>
              </div>
            </div>
            <button
              onClick={() => setZoomedChart("revenue")}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Phóng to biểu đồ"
            >
              <Maximize2 size={15} />
            </button>
          </div>
          <div className={`h-[350px] transition-opacity duration-300 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none ${isLoading ? "opacity-50" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: "none" }}>
                <defs>
                  {PIE_COLORS.map((color, index) => (
                    <linearGradient key={index} id={`pieGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={stats.packageRevenue}
                  dataKey="totalRevenue"
                  nameKey="packageName"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={125}
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="none"
                >
                  {stats.packageRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % PIE_COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px 16px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => <span style={{ color: "#475569", fontSize: 13, fontWeight: 500 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zoomed Chart Modal */}
      {zoomedChart && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.25s ease-out forwards" }}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 md:p-8 flex flex-col gap-6 relative"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            <button
              onClick={() => setZoomedChart(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all"
              title="Đóng"
            >
              <X size={20} />
            </button>

            {zoomedChart === "partners" && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-cyan-500" size={20} />
                    Tăng trưởng đối tác (Phóng to)
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Xu hướng đối tác mới đăng ký theo thời gian</p>
                </div>
                <div className="h-[450px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.newPartnersGrowth} style={{ outline: "none" }}>
                      <defs>
                        <linearGradient id="partnerGradientZoom" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} tickMargin={10} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickMargin={10} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                          padding: "12px 16px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="newPartners"
                        name="Đối tác mới"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        fill="url(#partnerGradientZoom)"
                        dot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#06b6d4" }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {zoomedChart === "categories" && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={20} />
                    Phân bổ danh mục POI (Phóng to)
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Biểu đồ cơ cấu số lượng POI theo từng danh mục</p>
                </div>
                <div className="h-[450px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topPoiCategories} margin={{ left: 20 }} style={{ outline: "none" }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="categoryName" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="count" name="Số lượng" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40}>
                        {stats.topPoiCategories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {zoomedChart === "revenue" && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-violet-500" size={20} />
                    Doanh thu theo gói dịch vụ (Phóng to)
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Tổng quan tỷ lệ đóng góp doanh thu của từng gói dịch vụ. Tổng: {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="h-[450px] w-full [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: "none" }}>
                      <defs>
                        {PIE_COLORS.map((color, index) => (
                          <linearGradient key={index} id={`pieGradZoom${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={stats.packageRevenue}
                        dataKey="totalRevenue"
                        nameKey="packageName"
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={160}
                        paddingAngle={4}
                        cornerRadius={8}
                        stroke="none"
                      >
                        {stats.packageRevenue.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#pieGradZoom${index % PIE_COLORS.length})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(Number(value || 0))}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={40}
                        formatter={(value: string) => <span style={{ color: "#475569", fontSize: 14, fontWeight: 500 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Summary Card với Gradient ────────────────────────────────────
function GradientSummaryCard({
  title,
  value,
  icon,
  gradient,
  shadowColor,
  iconBg = "bg-white/20",
  trend = "neutral",
}: {
  title: string
  value: string
  icon: React.ReactNode
  gradient: string
  shadowColor: string
  iconBg?: string
  trend?: "up" | "down" | "warning" | "neutral"
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg ${shadowColor} transition-all hover:scale-[1.02] hover:shadow-xl cursor-default group`}>
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
      
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/80 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2 text-white tracking-tight">{value}</p>
          {trend !== "neutral" && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" && <ArrowUpRight size={14} className="text-white/70" />}
              {trend === "down" && <ArrowDownRight size={14} className="text-white/70" />}
              {trend === "warning" && <AlertCircle size={14} className="text-white/70" />}
              <span className="text-xs text-white/60 font-medium">
                {trend === "up" ? "Tăng" : trend === "down" ? "Giảm" : "Cần xử lý"}
              </span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl ${iconBg} backdrop-blur-sm flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Approval Indicator ────────────────────────────────────────────
function ApprovalIndicator({
  label,
  approved,
  rejected,
  total,
  approvedColor = "bg-gradient-to-r from-emerald-400 to-emerald-500",
  rejectedColor = "bg-gradient-to-r from-rose-400 to-rose-500",
}: {
  label: string
  approved: number
  rejected: number
  total: number
  approvedColor?: string
  rejectedColor?: string
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-400 text-xs bg-slate-50 px-2 py-0.5 rounded-full">Tổng: {total}</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
        <div className={`h-full rounded-full ${approvedColor}`} style={{ width: `${approved}%`, transition: "width 0.8s ease" }} />
        <div className={`h-full rounded-full ${rejectedColor}`} style={{ width: `${rejected}%`, transition: "width 0.8s ease" }} />
      </div>
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-emerald-600 flex items-center gap-1">
          ✅ Được duyệt: {approved}%
        </span>
        <span className="text-rose-500 flex items-center gap-1">
          ❌ Từ chối: {rejected}%
        </span>
      </div>
    </div>
  )
}

// ─── Status Small Card ─────────────────────────────────────────────
function StatusSmallCard({ label, value, color, glowColor = "", emoji = "" }: { label: string, value: number, color: string, glowColor?: string, emoji?: string }) {
  return (
    <div className={`bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md ${glowColor} transition-all hover:scale-[1.02] cursor-default`}>
       <div className="flex items-center gap-2 mb-1.5">
          {emoji ? (
            <span className="text-xs">{emoji}</span>
          ) : (
            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
          )}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
       </div>
       <div className="text-xl font-bold text-slate-800">{value}</div>
    </div>
  )
}

function formatCurrency(amount: number) {
  return `${Math.round(amount).toLocaleString("vi-VN")} đ`
}