import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

export const Route = createFileRoute("/admin/_layout/analytics")({
  component: AdminAnalytics,
})

const COLORS = ["#258cf4", "#10b981", "#f59e0b", "#ef4444"]

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

      // ===== SUMMARY =====
      setSummary(summaryRes)

      // ===== REVENUE =====
      const mappedRevenue = revenueRes.map((item: any) => ({
        name: item.month,
        income: item.revenue,
        expense: item.revenue * 0.4, // fake nếu chưa có expense
      }))
      setRevenueData(mappedRevenue)

      // ===== ACCOUNT STATUS PIE =====
      setAccountStatus([
        { name: "Active", value: accountRes.activeUsers },
        { name: "Inactive", value: accountRes.inactiveUsers },
      ])

      // ===== SUBSCRIPTION =====
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
      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold mt-2">
            {summary.totalRevenue.toLocaleString()} VND
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-2xl font-bold mt-2">
            {summary.totalUsers}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Active Users</p>
          <p className="text-2xl font-bold mt-2">
            {summary.activeUsers}
          </p>
        </div>
      </div>

      {/* ================= CHART ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">
            Revenue
          </h3>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#258cf4" />
                <Bar dataKey="expense" fill="#cbd5e1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">
            Account Status
          </h3>

          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={accountStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                >
                  {accountStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= SUBSCRIPTION ================= */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-bold mb-4">
          Subscription Packages
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-xl font-bold">
              {subscriptionStats.totalPackages}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-sm text-emerald-600">Active</p>
            <p className="text-xl font-bold text-emerald-600">
              {subscriptionStats.activePackages}
            </p>
          </div>

          <div className="p-4 bg-rose-50 rounded-lg text-center">
            <p className="text-sm text-rose-600">Inactive</p>
            <p className="text-xl font-bold text-rose-600">
              {subscriptionStats.inactivePackages}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}