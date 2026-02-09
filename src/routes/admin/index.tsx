import StatCard from "../../components/admin/StatCard"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Users" value="12,345" />
        <StatCard title="Active Trips" value="432" />
        <StatCard title="Revenue" value="$45,290" />
        <StatCard title="Pending" value="18" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">User Growth Trends</h2>
        <div className="h-40 flex items-center justify-center text-gray-400">
          (Chart placeholder)
        </div>
      </div>
    </div>
  )
}
