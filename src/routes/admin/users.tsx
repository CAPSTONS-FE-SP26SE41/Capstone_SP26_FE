import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/admin/users')({
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

      // Mock data
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

  if (loading) return <div>Loading users...</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-500">Manage access and user profiles</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${user.avatarUrl}")` }}
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-gray-100 text-xs">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold
                        ${
                          user.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : user.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastActive}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-blue-600">
                      ...
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">
            Showing {users.length} users
          </span>
        </div>
      </div>
    </div>
  )
}