import { createFileRoute } from '@tanstack/react-router'
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
import { useState } from 'react'

export const Route = createFileRoute('/admin/analytics')({
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

type Page = {
  page: string
  views: number
  bounce: string
  conv: string
}

function AdminAnalytics() {
  // Sau này fetch API bằng React Query
  const [revenueData] = useState<Revenue[]>([])
  const [deviceData] = useState<Device[]>([])
  const [topPages] = useState<Page[]>([])

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Report</h2>
        <p className="text-gray-500">
          Performance metrics and insights
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4">
            Revenue vs Expenses
          </h3>

          <div className="h-75">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#2563eb" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" fill="#cbd5e1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
                📊 No revenue data
              </div>
            )}
          </div>
        </div>

        {/* Device Chart */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4">
            Traffic by Device
          </h3>

          <div className="h-75">
            {deviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                  >
                    {deviceData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
                🥧 No device data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4">
          Top Performing Pages
        </h3>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500 text-sm">
              <th className="pb-3 font-medium">Page Name</th>
              <th className="pb-3 font-medium">Views</th>
              <th className="pb-3 font-medium">Bounce Rate</th>
              <th className="pb-3 font-medium text-right">
                Conversion
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {topPages.length > 0 ? (
              topPages.map((row, i) => (
                <tr key={i}>
                  <td className="py-4 font-medium">
                    {row.page}
                  </td>
                  <td className="py-4 text-gray-500">
                    {row.views}
                  </td>
                  <td className="py-4 text-gray-500">
                    {row.bounce}
                  </td>
                  <td className="py-4 text-right text-emerald-600 font-bold">
                    {row.conv}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No page data recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
