import { Bell, Search } from 'lucide-react'

type AppTopbarProps = {
  userName?: string
  userRole?: string
  userAvatarUrl?: string
  searchPlaceholder?: string
}

export default function AppTopbar({
  userName = 'Profile',
  userRole = 'User',
  userAvatarUrl = 'https://i.pravatar.cc/40',
  searchPlaceholder = 'Search...',
}: AppTopbarProps) {
  return (
    <header className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8">

      {/* Search */}
      <div className="relative w-[320px]">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button className="relative text-slate-500 hover:text-blue-600 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {userName}
            </p>
            <p className="text-xs text-slate-500">
              {userRole}
            </p>
          </div>

          <img
            src={userAvatarUrl}
            className="h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 ring-blue-200 transition-all"
            alt={userName}
          />
        </div>
      </div>
    </header>
  )
}
