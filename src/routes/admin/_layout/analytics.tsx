import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
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
} from 'recharts'

export const Route = createFileRoute('/admin/_layout/analytics')({
  component: AdminAnalytics,
})

type Revenue = {
  name: string
  income: number
  expense: number
}

type Device = {
  name: string
  value: number
}

type PageMetric = {
  page: string
  views: number
  bounce: string
  conv: string
}

const COLORS = ['#258cf4', '#10b981', '#f59e0b', '#ef4444']

function AdminAnalytics() {
  const [revenueData] = useState<Revenue[]>([
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 5000, expense: 2800 },
    { name: 'Apr', income: 4200, expense: 2100 },
  ])

  const [deviceData] = useState<Device[]>([
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 200 },
  ])

  const [topPages] = useState<PageMetric[]>([
    { page: '/home', views: 1200, bounce: '45%', conv: '12%' },
    { page: '/booking', views: 850, bounce: '38%', conv: '18%' },
    { page: '/destinations', views: 620, bounce: '52%', conv: '9%' },
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-text-main mt-2">
            $18,200
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Total Bookings
          </p>
          <p className="text-2xl font-bold text-text-main mt-2">
            540
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7edf4] shadow-sm">
          <p className="text-text-secondary text-sm font-medium">
            Active Users
          </p>
          <p className="text-2xl font-bold text-text-main mt-2">
            126
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-[#e7edf4] shadow-sm">
          <h3 className="text-lg font-bold text-text-main mb-4">
            Revenue vs Expenses
          </h3>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow:
                      '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#258cf4"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#cbd5e1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Pie */}
        <div className="bg-white p-6 rounded-xl border border-[#e7edf4] shadow-sm">
          <h3 className="text-lg font-bold text-text-main mb-4">
            Traffic by Device
          </h3>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {deviceData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white p-6 rounded-xl border border-[#e7edf4] shadow-sm">
        <h3 className="text-lg font-bold text-text-main mb-4">
          Top Performing Pages
        </h3>

        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-[#e7edf4] text-text-secondary text-sm">
              <th className="pb-3 font-medium w-[40%]">
                Page Name
              </th>
              <th className="pb-3 font-medium w-[20%]">
                Views
              </th>
              <th className="pb-3 font-medium w-[20%]">
                Bounce Rate
              </th>
              <th className="pb-3 font-medium text-right w-[20%]">
                Conversion
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e7edf4]">
            {topPages.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition">
                <td className="py-4 font-medium text-text-main">
                  {row.page}
                </td>
                <td className="py-4 text-text-secondary">
                  {row.views}
                </td>
                <td className="py-4 text-text-secondary">
                  {row.bounce}
                </td>
                <td className="py-4 text-right text-emerald-600 font-bold">
                  {row.conv}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

