import { createFileRoute } from '@tanstack/react-router'
import {
  ChartBar,
  Eye,
  Bookmark,
  TrendingUp,
  Activity
} from 'lucide-react'

export const Route = createFileRoute('/partner/_layout/stats')({
  component: PartnerStatsPage,
})

function PartnerStatsPage() {
  const stats = [
    {
      title: 'Tổng lượt tiếp cận',
      value: '12,450',
      trend: '+15.2%',
      trendUp: true,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Ưu đãi đã lưu',
      value: '840',
      trend: '+12.5%',
      trendUp: true,
      icon: Bookmark,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Quảng cáo đang chạy',
      value: '5',
      trend: 'Không thay đổi',
      trendUp: true,
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Tỷ lệ tương tác',
      value: '4.2%',
      trend: '+0.8%',
      trendUp: true,
      icon: TrendingUp,
      color: 'text-[#e28743]',
      bg: 'bg-[#faeadd]',
    },
  ]

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl flex items-center justify-center`}>
                <stat.icon size={22} className="stroke-[2.5]" />
              </div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.trendUp
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {stat.trend}
              </div>
            </div>

            <div>
              <h4 className="text-slate-500 text-sm font-medium mb-1">
                {stat.title}
              </h4>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <ChartBar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Số liệu chi tiết (Sắp ra mắt)</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Các biểu đồ thống kê về lượt tiếp cận và chuyển đổi ưu đãi sẽ được hiển thị tại đây.
        </p>
      </div>
    </div>
  )
}
