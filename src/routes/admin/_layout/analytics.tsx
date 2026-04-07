import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import {
  getSummary,
  getRevenue,
  getAccountsStatus,
  getSubscriptionStats,
} from "../../../services/analyticsService"

import { Wallet, BarChart3, ShieldCheck } from "lucide-react"

export const Route = createFileRoute("/admin/_layout/analytics")({
  component: AdminAnalytics,
})

function AdminAnalytics() {
  const [loading, setLoading] = useState(true)

  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
  })

  const [revenueData, setRevenueData] = useState<any[]>([])
  const [accountStatus, setAccountStatus] = useState<any[]>([])
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    inactivePackages: 0,
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [summaryRes, revenueRes, accountRes, subRes] =
        await Promise.all([
          getSummary(),
          getRevenue(),
          getAccountsStatus(),
          getSubscriptionStats(),
        ])

      setSummary(summaryRes)

      const mappedRevenue = revenueRes.map((item: any) => ({
        name: item.month,
        income: item.revenue,
      }))
      setRevenueData(mappedRevenue)

      setAccountStatus(
        accountRes.map((item: any) => ({
          name: item.status,
          value: item.count,
        }))
      )

      setSubscriptionStats(subRes)
    } catch (err) {
      console.error("Analytics error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Loading analytics...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi hệ thống và hiệu suất
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Doanh thu"
          value={`${summary.totalRevenue.toLocaleString()} VND`}
          icon={<Wallet size={18} className="text-emerald-700" />}
        />
        <SummaryCard
          title="Tổng người dùng"
          value={String(summary.totalUsers)}
          icon={<BarChart3 size={18} className="text-emerald-700" />}
        />
        <SummaryCard
          title="Đang hoạt động"
          value={String(summary.activeUsers)}
          icon={<ShieldCheck size={18} className="text-emerald-700" />}
        />
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Doanh thu theo tháng
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar
                  dataKey="income"
                  fill="#059669"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Trạng thái tài khoản
          </h2>

          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={accountStatus}
                  dataKey="value"
                  innerRadius={70}
                  outerRadius={100}
                >
                  {accountStatus.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? "#059669" : "#e5e7eb"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Gói đăng ký
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <MiniWalletCard
            title="Tổng"
            value={String(subscriptionStats.totalPackages)}
            tag="Packages"
            active
          />
          <MiniWalletCard
            title="Đang hoạt động"
            value={String(subscriptionStats.activePackages)}
            tag="Active"
          />
          <MiniWalletCard
            title="Ngừng"
            value={String(subscriptionStats.inactivePackages)}
            tag="Inactive"
          />
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
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
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${active
          ? "bg-emerald-50 border-emerald-200"
          : "bg-slate-50 border-slate-200"
        }`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{tag}</p>
      </div>
      <p
        className={`text-sm font-bold ${active ? "text-emerald-700" : "text-slate-700"
          }`}
      >
        {value}
      </p>
    </div>
  )
}