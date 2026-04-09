import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import {
  BarChart3,
  Building2,
  MapPin,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
} from "recharts"

import { getStaffPOIs, type StaffPOI } from "../../../services/poiService"

export const Route = createFileRoute("/staff/_layout/")({
  component: StaffDashboard,
})

function StaffDashboard() {
  const [pois, setPois] = useState<StaffPOI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPois = async () => {
      try {
        const data = await getStaffPOIs()
        setPois(data)
      } catch (e) {
        console.error("Failed to fetch staff POIs", e)
      } finally {
        setLoading(false)
      }
    }

    fetchPois()
  }, [])

  const stats = useMemo(() => {
    const total = pois.length
    const indoor = pois.filter((p) => p.IsIndoor).length
    const outdoor = total - indoor
    const distinctLocationsCount = new Set(
      pois.map((p) => String(p.LocationId ?? p.LocationName ?? ""))
    ).size

    const totalEstimate = pois.reduce(
      (sum, p) => sum + parseApproxCost(p.ApproxCost),
      0
    )

    const indoorRatio = total === 0 ? 0 : Math.round((indoor / total) * 100)

    return {
      total,
      indoor,
      outdoor,
      distinctLocationsCount,
      totalEstimate,
      indoorRatio,
    }
  }, [pois])

  const recentPois = useMemo(() => pois.slice(0, 6), [pois])

  return (
    <div className="flex flex-col gap-6">
      {/* Removed Header */}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Tổng số POIs"
          value={loading ? "..." : String(stats.total)}
          icon={<MapPin size={18} className="text-emerald-700" />}
        />
        <SummaryCard
          title="POIs trong nhà"
          value={loading ? "..." : String(stats.indoor)}
          icon={<Building2 size={18} className="text-emerald-700" />}
        />
        <SummaryCard
          title="POIs ngoài trời"
          value={loading ? "..." : String(stats.outdoor)}
          icon={<Wallet size={18} className="text-emerald-700" />}
        />
        <SummaryCard
          title="Địa điểm liên kết"
          value={loading ? "..." : String(stats.distinctLocationsCount)}
          icon={<BarChart3 size={18} className="text-emerald-700" />}
        />
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Số liệu POIs
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Tổng chi phí ước tính từ các POIs
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-bold text-slate-900">
                {loading ? "..." : formatCurrency(stats.totalEstimate)}
              </div>
              <div className="text-sm text-slate-500 mt-1">(ước tính)</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Wallet size={20} className="text-emerald-700" />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <MiniWalletCard
              title="Trong nhà"
              value={loading ? "..." : `${stats.indoor}/${stats.total}`}
              tag="Bên trong"
              active
            />
            <MiniWalletCard
              title="Ngoài trời"
              value={loading ? "..." : `${stats.outdoor}/${stats.total}`}
              tag="Bên ngoài"
            />
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Thống kê tổng quan
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Biểu đồ minh họa theo tuần (giao diện)
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Xanh lá
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Kế hoạch tối ưu
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Tỉ lệ POIs trong nhà hiện tại
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {loading ? "..." : `${stats.indoorRatio}%`}
            </span>
          </div>

          <div className="mt-2 h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{
                width: `${loading ? 0 : Math.min(100, stats.indoorRatio)}%`,
              }}
            />
          </div>

          <div className="mt-5 space-y-3">
            <PlanRow
              label="Tăng POIs trong nhà"
              value={loading ? "..." : `${Math.max(0, 70 - stats.indoorRatio)}%`}
            />
            <PlanRow label="Giữ chất lượng dữ liệu" value="Ổn định" variant="ok" />
            <PlanRow label="Kiểm tra giờ mở cửa" value="Định kì" variant="neutral" />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-emerald-100 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">POIs gần đây</h3>
            <Link
              to="/staff/pois"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-800 text-xs uppercase tracking-wider font-semibold border-b border-emerald-100">
                  <th className="px-6 py-4 text-left">Tên</th>
                  <th className="px-6 py-4 text-left">Địa chỉ</th>
                  <th className="px-6 py-4 text-left">Thành phố</th>
                  <th className="px-6 py-4 text-left">Giờ mở cửa</th>
                  <th className="px-6 py-4 text-left">Loại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {recentPois.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Chưa có POIs nào
                    </td>
                  </tr>
                ) : (
                  recentPois.map((poi) => (
                    <tr
                      key={poi.Id}
                      className="hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 truncate">
                        {poi.Name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 truncate">
                        {poi.Address}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {poi.City}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 truncate">
                        {poi.OpeningHours}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            poi.IsIndoor
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {poi.IsIndoor ? "Trong nhà" : "Ngoài trời"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const chartData = [
  { name: "T2", value: 30 },
  { name: "T3", value: 48 },
  { name: "T4", value: 36 },
  { name: "T5", value: 60 },
  { name: "T6", value: 42 },
  { name: "T7", value: 55 },
]

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: JSX.Element
}) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  )
}

function MiniWalletCard({
  title,
  value,
  tag,
  active,
}: {
  title: string
  value: string
  tag: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
        active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{tag}</p>
      </div>
      <p
        className={`text-sm font-bold ${
          active ? "text-emerald-700" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function PlanRow({
  label,
  value,
  variant = "neutral",
}: {
  label: string
  value: string
  variant?: "ok" | "neutral"
}) {
  const valueClass =
    variant === "ok" ? "text-emerald-700" : "text-slate-800"

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

function parseApproxCost(input: string) {
  if (!input) return 0
  const cleaned = input.replace(/[^0-9.]/g, "")
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function formatCurrency(amount: number) {
  const rounded = Math.round(amount)
  return `${rounded.toLocaleString("vi-VN")} đ`
}