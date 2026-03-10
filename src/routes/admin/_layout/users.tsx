import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { Plus, MoreVertical, Eye, Pencil, UserX } from 'lucide-react'

export const Route = createFileRoute('/admin/_layout/users')({
  component: UsersPage,
})

type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: string
  status: 'Active' | 'Pending' | 'Inactive'
  lastActive: string
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      await new Promise((res) => setTimeout(res, 600))

      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: 'https://i.pravatar.cc/100?img=1',
          role: 'Admin',
          status: 'Active',
          lastActive: '2 hours ago',
        },
        {
          id: '2',
          name: 'Anna Smith',
          email: 'anna@example.com',
          avatarUrl: 'https://i.pravatar.cc/100?img=2',
          role: 'User',
          status: 'Pending',
          lastActive: '1 day ago',
        },
      ])

      setLoading(false)
    }

    fetchUsers()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-sm text-text-secondary">
        Loading users...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-text-main">
            User Management
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage access and user profiles
          </p>
        </div>

        <button
          className="flex items-center gap-2 
            bg-blue-600 hover:bg-blue-700 
            text-white font-semibold
            px-6 py-3 
            rounded-2xl 
            shadow-lg hover:shadow-xl
            transition-all duration-200"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-8 py-4 font-semibold w-[30%]">Name</th>
                <th className="px-8 py-4 font-semibold w-[15%]">Role</th>
                <th className="px-8 py-4 font-semibold w-[15%]">Status</th>
                <th className="px-8 py-4 font-semibold w-[20%]">
                  Last Active
                </th>
                <th className="px-8 py-4 font-semibold text-right w-[20%]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  {/* Name */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatarUrl}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-text-main">
                          {user.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-8 py-5">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : user.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current"></span>
                      {user.status}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-8 py-5 text-sm text-text-secondary">
                    {user.lastActive}
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-5 text-right relative">
                    <div ref={menuRef} className="inline-block relative">
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === user.id ? null : user.id
                          )
                        }
                        className="p-2 rounded-lg hover:bg-slate-100 transition"
                      >
                        <MoreVertical
                          size={18}
                          className="text-slate-500"
                        />
                      </button>

                      {openMenu === user.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50">
                            <Eye size={16} /> View Profile
                          </button>

                          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50">
                            <Pencil size={16} /> Edit User
                          </button>

                          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                            <UserX size={16} /> Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <span className="text-sm text-text-secondary">
            Showing {users.length} of {users.length} users
          </span>

          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-sm border border-slate-200 bg-white rounded-md text-slate-500 opacity-50 cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-1.5 text-sm border border-slate-200 bg-white rounded-md text-slate-500 opacity-50 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
