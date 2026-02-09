import { Bell, Search } from 'lucide-react'

export default function AdminTopbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-72">
        <Search size={18} />
        <input
          className="bg-transparent outline-none text-sm w-full"
          placeholder="Search users, bookings..."
        />
      </div>

      <div className="flex items-center gap-4">
        <Bell size={20} />
        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/32"
            className="rounded-full"
          />
          <div className="text-sm">
            <div className="font-medium">Admin Profile</div>
            <div className="text-gray-500 text-xs">Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}
