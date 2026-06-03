import { createFileRoute } from '@tanstack/react-router'
import {
  ChartBar,
  Bookmark,
  TrendingUp,
  Activity,
  MapPin,
  AlertCircle,
  BarChart3,
  X,
  Maximize2,
  ArrowUpRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  Area, AreaChart
} from 'recharts'
import { getPartnerDashboardStats, PartnerDashboardStats } from '../../../services/partnerStatisticService'

export const Route = createFileRoute('/partner/_layout/stats')({
  component: PartnerStatsPage,
})

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#64748b']
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

function PartnerStatsPage() {
  const [statsData, setStatsData] = useState<PartnerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [zoomedChart, setZoomedChart] = useState<'poi-status' | 'interactions' | 'poi-type' | 'ad-perf' | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPartnerDashboardStats()
        setStatsData(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }
    void fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    )
  }

  // Biểu đồ Pie - trạng thái POI
  const poiStatusData = [
    { name: 'Hoạt động', value: statsData?.poiStatusStats.active || 0 },
    { name: 'Chờ duyệt', value: statsData?.poiStatusStats.pending || 0 },
    { name: 'Bị từ chối', value: statsData?.poiStatusStats.rejected || 0 },
    { name: 'Ngưng hoạt động', value: statsData?.poiStatusStats.inactive || 0 },
  ].filter(item => item.value > 0)

  const translateType = (type: string) => {
    const map: Record<string, string> = {
      'Restaurant': 'Nhà hàng',
      'Attraction': 'Điểm tham quan',
      'Hotel': 'Khách sạn',
      'Shopping': 'Mua sắm',
      'Cafe': 'Cà phê',
      'Cinema': 'Rạp phim',
      'Park': 'Công viên',
      'Museum': 'Bảo tàng',
      'Other': 'Khác'
    }
    return map[type] || type
  }

  // Biểu đồ Bar - loại hình POI
  const poiTypeData = statsData?.poiTypeStats.map(t => ({
    name: translateType(t.type),
    count: t.count
  })) || []

  // Biểu đồ tương tác
  const interactionData = statsData?.topInteractedPois.map(p => ({
    name: p.poiName.length > 15 ? p.poiName.substring(0, 15) + '...' : p.poiName,
    "Lượt lưu": p.totalSaveCount
  })) || []

  const overviewStats = [
    {
      title: 'Địa điểm hoạt động',
      value: statsData?.poiStatusStats.active || 0,
      icon: <MapPin size={22} />,
      gradient: 'from-emerald-400 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
      description: `${statsData?.poiStatusStats.pending || 0} đang chờ duyệt`,
      trend: 'up' as const,
    },
    {
      title: 'Ưu đãi đã lưu',
      value: statsData?.totalPromotionSaveCount || 0,
      icon: <Bookmark size={22} />,
      gradient: 'from-cyan-400 to-blue-600',
      shadowColor: 'shadow-cyan-500/20',
      description: 'Tổng lượt lưu toàn bộ',
      trend: 'up' as const,
    },
    {
      title: 'Quảng cáo đang chạy',
      value: statsData?.adStatusStats.active || 0,
      icon: <Activity size={22} />,
      gradient: 'from-violet-500 to-purple-700',
      shadowColor: 'shadow-violet-500/20',
      description: `${statsData?.adStatusStats.pendingApproval || 0} đang chờ duyệt`,
      trend: 'neutral' as const,
    },
    {
      title: 'Quảng cáo bị từ chối',
      value: statsData?.adStatusStats.rejected || 0,
      icon: <AlertCircle size={22} />,
      gradient: 'from-rose-400 to-red-600',
      shadowColor: 'shadow-rose-500/20',
      description: 'Cần kiểm tra lại',
      trend: (statsData?.adStatusStats.rejected || 0) > 0 ? 'warning' as const : 'neutral' as const,
    },
  ]

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
    padding: '12px 16px',
  }

  return (
    <div className="space-y-6 pb-10">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .recharts-wrapper, .recharts-surface, .recharts-responsive-container { outline: none !important; }
        path.recharts-sector, .recharts-bar-rectangle { outline: none !important; }
      `}</style>

      {/* Summary Cards — Gradient */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewStats.map((stat, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 shadow-lg ${stat.shadowColor} transition-all hover:scale-[1.02] hover:shadow-xl cursor-default group`}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white/80 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-2 text-white tracking-tight">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' && <ArrowUpRight size={13} className="text-white/70" />}
                  {stat.trend === 'warning' && <AlertCircle size={13} className="text-white/70" />}
                  <span className="text-xs text-white/60 font-medium">{stat.description}</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Pie + Bar tương tác */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POI Status Pie */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trạng thái Địa điểm</h3>
              <p className="text-xs text-slate-400 mt-1">Phân bổ trạng thái POI của bạn</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoomedChart('poi-status')} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm" title="Phóng to">
                <Maximize2 size={15} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MapPin size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className="h-64 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: 'none' }}>
                <defs>
                  {PIE_COLORS.map((color, idx) => (
                    <linearGradient key={idx} id={`poiPieGrad${idx}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie data={poiStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                  {poiStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#poiPieGrad${index % PIE_COLORS.length})`} style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Interaction Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top tương tác theo địa điểm</h3>
              <p className="text-xs text-slate-400 mt-1">Các địa điểm được lưu nhiều nhất</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoomedChart('interactions')} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm" title="Phóng to">
                <Maximize2 size={15} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <TrendingUp size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className="h-64 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interactionData} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="interactionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(99,102,241,0.04)' }} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="Lượt lưu" stroke="#6366f1" strokeWidth={3} fill="url(#interactionGrad)" dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} activeDot={{ r: 7 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Phân bổ loại hình + Hiệu năng quảng cáo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POI Type Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Phân bổ loại hình dịch vụ</h3>
              <p className="text-xs text-slate-400 mt-1">Số lượng POI theo từng loại hình</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoomedChart('poi-type')} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm" title="Phóng to">
                <Maximize2 size={15} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <BarChart3 size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className="h-64 [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={poiTypeData} style={{ outline: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={100} />
                <RechartsTooltip cursor={{ fill: 'rgba(168,85,247,0.04)' }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Số lượng" radius={[0, 8, 8, 0]} barSize={22}>
                  {poiTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ad Status Summary — Redesigned */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ChartBar size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hiệu năng Quảng cáo</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tổng quan các trạng thái quảng cáo</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Đang hoạt động', count: statsData?.adStatusStats.active ?? 0, color: 'bg-gradient-to-r from-emerald-400 to-emerald-500', badge: 'bg-emerald-50 text-emerald-700', emoji: '🟢' },
              { label: 'Chờ duyệt', count: statsData?.adStatusStats.pendingApproval ?? 0, color: 'bg-gradient-to-r from-amber-400 to-amber-500', badge: 'bg-amber-50 text-amber-700', emoji: '🟡' },
              { label: 'Đã tạm dừng', count: statsData?.adStatusStats.paused ?? 0, color: 'bg-gradient-to-r from-slate-300 to-slate-400', badge: 'bg-slate-50 text-slate-600', emoji: '⚪' },
              { label: 'Đã hết hạn', count: statsData?.adStatusStats.expired ?? 0, color: 'bg-gradient-to-r from-slate-400 to-slate-600', badge: 'bg-slate-50 text-slate-700', emoji: '🔘' },
              { label: 'Bị từ chối', count: statsData?.adStatusStats.rejected ?? 0, color: 'bg-gradient-to-r from-rose-400 to-rose-600', badge: 'bg-rose-50 text-rose-700', emoji: '🔴' },
            ].map((item, idx) => {
              const total = (statsData?.adStatusStats.active ?? 0) + (statsData?.adStatusStats.pendingApproval ?? 0) + (statsData?.adStatusStats.paused ?? 0) + (statsData?.adStatusStats.expired ?? 0) + (statsData?.adStatusStats.rejected ?? 0)
              const pct = total > 0 ? Math.round(item.count / total * 100) : 0
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{item.emoji}</span>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badge}`}>{pct}%</span>
                      <span className="font-bold text-slate-800 w-6 text-right">{item.count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%`, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedChart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.25s ease-out forwards' }}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 md:p-8 flex flex-col gap-6 relative" style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <button onClick={() => setZoomedChart(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-all">
              <X size={20} />
            </button>

            {zoomedChart === 'poi-status' && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="text-emerald-500" size={20} /> Trạng thái Địa điểm (Phóng to)</h3>
                  <p className="text-sm text-slate-500 mt-1">Phân bổ chi tiết trạng thái các địa điểm (POI) của bạn</p>
                </div>
                <div className="h-[450px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                      <defs>
                        {PIE_COLORS.map((color, idx) => (
                          <linearGradient key={idx} id={`poiPieGradZ${idx}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie data={poiStatusData} cx="50%" cy="50%" innerRadius={100} outerRadius={160} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={8}>
                        {poiStatusData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#poiPieGradZ${index % PIE_COLORS.length})`} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={tooltipStyle} />
                      <Legend verticalAlign="bottom" height={40} formatter={(value: string) => <span style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {zoomedChart === 'interactions' && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="text-cyan-500" size={20} /> Top tương tác theo địa điểm (Phóng to)</h3>
                  <p className="text-sm text-slate-500 mt-1">Các địa điểm được khách hàng lưu lại nhiều nhất</p>
                </div>
                <div className="h-[450px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={interactionData} style={{ outline: 'none' }}>
                      <defs>
                        <linearGradient id="interactionGradZ" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="Lượt lưu" stroke="#6366f1" strokeWidth={3} fill="url(#interactionGradZ)" dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} activeDot={{ r: 7 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {zoomedChart === 'poi-type' && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><BarChart3 className="text-violet-500" size={20} /> Phân bổ loại hình dịch vụ (Phóng to)</h3>
                  <p className="text-sm text-slate-500 mt-1">Số lượng địa điểm theo từng loại hình kinh doanh</p>
                </div>
                <div className="h-[450px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={poiTypeData} style={{ outline: 'none' }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <RechartsTooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" name="Số lượng" radius={[8, 8, 0, 0]} barSize={48}>
                        {poiTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
