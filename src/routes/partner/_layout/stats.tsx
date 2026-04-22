import { createFileRoute } from '@tanstack/react-router'
import {
  ChartBar,
  Bookmark,
  TrendingUp,
  Activity,
  MapPin,
  AlertCircle,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts'
import { getPartnerDashboardStats, PartnerDashboardStats } from '../../../services/partnerStatisticService'

export const Route = createFileRoute('/partner/_layout/stats')({
  component: PartnerStatsPage,
})

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#64748b'];

function PartnerStatsPage() {
  const [statsData, setStatsData] = useState<PartnerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  // Chuẩn bị dữ liệu cho biểu đồ Pie (Trạng thái POI)
  const poiStatusData = [
    { name: 'Hoạt động', value: statsData?.poiStatusStats.active || 0 },
    { name: 'Chờ duyệt', value: statsData?.poiStatusStats.pending || 0 },
    { name: 'Bị từ chối', value: statsData?.poiStatusStats.rejected || 0 },
    { name: 'Ngưng hoạt động', value: statsData?.poiStatusStats.inactive || 0 },
  ].filter(item => item.value > 0);

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
    };
    return map[type] || type;
  };

  // Chuẩn bị dữ liệu cho biểu đồ Bar (Loại hình POI)
  const poiTypeData = statsData?.poiTypeStats.map(t => ({
    name: translateType(t.type),
    count: t.count
  })) || [];


  // Chuẩn bị dữ liệu cho biểu đồ tương tác
  const interactionData = statsData?.topInteractedPois.map(p => ({
    name: p.poiName.length > 15 ? p.poiName.substring(0, 15) + '...' : p.poiName,
    "Lượt lưu": p.totalSaveCount
  })) || [];

  const overviewStats = [
    {
      title: 'Địa điểm hoạt động',
      value: statsData?.poiStatusStats.active || 0,
      icon: MapPin,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      description: `${statsData?.poiStatusStats.pending || 0} đang chờ duyệt`
    },
    {
      title: 'Ưu đãi đã lưu',
      value: statsData?.totalPromotionSaveCount || 0,
      icon: Bookmark,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      description: 'Tổng lượt lưu toàn bộ'
    },

    {
      title: 'Quảng cáo đang chạy',
      value: statsData?.adStatusStats.active || 0,
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      description: `${statsData?.adStatusStats.pendingApproval || 0} đang chờ duyệt`
    },
    {
      title: 'Quảng cáo bị từ chối',
      value: statsData?.adStatusStats.rejected || 0,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      description: 'Cần kiểm tra lại'
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <style>{`
        .recharts-wrapper, .recharts-surface, .recharts-responsive-container {
          outline: none !important;
          border: none !important;
          -webkit-tap-highlight-color: transparent;
        }
        path.recharts-sector, .recharts-bar-rectangle {
          outline: none !important;
        }
        :focus {
          outline: none !important;
        }
      `}</style>

      {/* Overview Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl flex items-center justify-center`}>
                <stat.icon size={22} className="stroke-[2.5]" />
              </div>
            </div>
            <div>
              <h4 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h4>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POI Status Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieIcon size={20} className="text-emerald-500" />
            Trạng thái Địa điểm
          </h3>
          <div className="flex-1 h-64 min-h-[250px] outline-none">
            <ResponsiveContainer width="100%" height="100%" className="outline-none">
              <PieChart style={{ outline: 'none' }}>
                <Pie
                  data={poiStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {poiStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Interaction Top POIs - Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            Top tương tác theo địa điểm
          </h3>

          <div className="h-64 min-h-[250px] outline-none">
            <ResponsiveContainer width="100%" height="100%" className="outline-none">
              <BarChart data={interactionData} style={{ outline: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  allowDecimals={false}
                />

                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Lượt lưu" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} style={{ outline: 'none' }} />

              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POI Type Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-500" />
            Phân bổ loại hình dịch vụ
          </h3>
          <div className="h-64 min-h-[250px] outline-none">
            <ResponsiveContainer width="100%" height="100%" className="outline-none">
              <BarChart layout="vertical" data={poiTypeData} style={{ outline: 'none' }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={100}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Số lượng" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20} style={{ outline: 'none' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Ad Status Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ChartBar size={20} className="text-[#e28743]" />
            Hiệu năng Quảng cáo
          </h3>
          <div className="space-y-5">
            {[
              { label: 'Đang hoạt động', count: statsData?.adStatusStats.active, color: 'bg-emerald-500' },
              { label: 'Chờ duyệt', count: statsData?.adStatusStats.pendingApproval, color: 'bg-amber-500' },
              { label: 'Đã tạm dừng', count: statsData?.adStatusStats.paused, color: 'bg-slate-400' },
              { label: 'Đã hết hạn', count: statsData?.adStatusStats.expired, color: 'bg-slate-600' },
              { label: 'Bị từ chối', count: statsData?.adStatusStats.rejected, color: 'bg-rose-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                </div>
                <span className="font-bold text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
