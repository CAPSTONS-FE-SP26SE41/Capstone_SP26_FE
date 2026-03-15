import { createFileRoute } from "@tanstack/react-router"
import StatCard from "../../../components/admin/StatCard"

export const Route = createFileRoute("/staff/_layout/")({
  component: StaffDashboard,
})

type Activity = {
  id: string
  title: string
  campaign: string
  date: string
  status: "Approved" | "Pending" | "Rejected"
}

function StaffDashboard() {

  const recentAds: Activity[] = [
    {
      id: "1",
      title: "Summer Travel Sale",
      campaign: "Europe Tour",
      date: "10 Feb 2026",
      status: "Approved",
    },
    {
      id: "2",
      title: "Cherry Blossom Promo",
      campaign: "Japan Tour",
      date: "15 Feb 2026",
      status: "Pending",
    },
    {
      id: "3",
      title: "Korea Winter Event",
      campaign: "Seoul Trip",
      date: "20 Feb 2026",
      status: "Rejected",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Staff Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your advertisement campaigns
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Ads" value="24" />
        <StatCard title="Approved" value="12" />
        <StatCard title="Pending" value="7" />
        <StatCard title="Rejected" value="5" />
      </div>

      {/* Chart placeholder */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Advertisement Performance
          </h2>
          <span className="text-sm text-slate-400">
            Last 30 days
          </span>
        </div>

        <div className="h-56 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
          (Chart placeholder)
        </div>
      </div>

      {/* Recent Ads */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Recent Advertisements
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">

            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Campaign</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">

              {recentAds.map((row) => (

                <tr key={row.id} className="hover:bg-slate-50 transition-colors">

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {row.title}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {row.campaign}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {row.date}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        row.status === "Approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {row.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        </div>

      </div>

    </div>
  )
}