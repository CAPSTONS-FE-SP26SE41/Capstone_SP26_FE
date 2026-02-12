import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

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

function AdminAnalytics() {
  const [revenueData] = useState<Revenue[]>([
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 5000, expense: 2800 },
  ])

  const [deviceData] = useState<Device[]>([
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 200 },
  ])

  const [topPages] = useState<PageMetric[]>([
    { page: '/home', views: 1200, bounce: '45%', conv: '12%' },
    { page: '/booking', views: 850, bounce: '38%', conv: '18%' },
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-text-main">
          Analytics
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Performance metrics and insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl border border-[#e7edf4]">
          <p className="text-text-secondary text-sm font-medium">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-text-main mt-1">
            $12,500
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e7edf4]">
          <p className="text-text-secondary text-sm font-medium">
            Total Bookings
          </p>
          <p className="text-2xl font-bold text-text-main mt-1">
            320
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e7edf4]">
          <p className="text-text-secondary text-sm font-medium">
            Active Users
          </p>
          <p className="text-2xl font-bold text-text-main mt-1">
            89
          </p>
        </div>
      </div>

      {/* Revenue Table (giữ style giống booking list) */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm flex flex-col">
        {revenueData.length > 0 ? (
          revenueData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-6 border-b border-[#e7edf4] last:border-0"
            >
              <div>
                <p className="font-bold text-lg text-text-main">
                  {item.name}
                </p>
                <p className="text-sm text-text-secondary">
                  Monthly Overview
                </p>
              </div>

              <div className="flex gap-10">
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Income
                  </p>
                  <p className="text-sm font-medium text-emerald-600">
                    ${item.income}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Expense
                  </p>
                  <p className="text-sm font-medium text-rose-600">
                    ${item.expense}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-text-secondary">
            No revenue data
          </div>
        )}
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm flex flex-col">
        {topPages.length > 0 ? (
          topPages.map((page, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-6 border-b border-[#e7edf4] last:border-0"
            >
              <div>
                <p className="font-bold text-lg text-text-main">
                  {page.page}
                </p>
                <p className="text-sm text-text-secondary">
                  Views: {page.views}
                </p>
              </div>

              <div className="flex gap-10">
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Bounce
                  </p>
                  <p className="text-sm font-medium text-text-main">
                    {page.bounce}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Conversion
                  </p>
                  <p className="text-sm font-medium text-emerald-600">
                    {page.conv}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-text-secondary">
            No page data
          </div>
        )}
      </div>
    </div>
  )
}
