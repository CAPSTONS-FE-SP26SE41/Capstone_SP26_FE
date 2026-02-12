import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    const fetchUsers = async () => {
      await new Promise((res) => setTimeout(res, 800))

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

  if (loading)
    return (
      <div className="flex justify-center items-center py-20 text-text-secondary">
        Loading users...
      </div>
    )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            User Management
          </h2>
          <p className="text-text-secondary">
            Manage access and user profiles
          </p>
        </div>

        <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
          <span className="material-symbols-outlined text-[20px]">
            add
          </span>
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-[#e7edf4]">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7edf4]">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${user.avatarUrl}")`,
                          }}
                        />
                        <div>
                          <p className="font-medium text-text-main">
                            {user.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                          ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : user.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        <span className="size-1.5 rounded-full bg-current"></span>
                        {user.status}
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.lastActive}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button className="text-text-secondary hover:text-primary p-2">
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-text-secondary"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">
                        group_off
                      </span>
                      <p className="font-medium">No users found</p>
                      <p className="text-xs">
                        Add a new user to get started
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-[#f8fafc]">
          <span className="text-sm text-text-secondary">
            Showing {users.length} of {users.length} users
          </span>

          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50 opacity-50 cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50 opacity-50 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
