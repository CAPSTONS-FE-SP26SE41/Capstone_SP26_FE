import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { MoreVertical, Eye, Pencil } from "lucide-react"

import {
  getUsers,
  getUserById,
  updateUser,
} from "../../../services/userService"

export const Route = createFileRoute("/admin/_layout/users")({
  component: UsersPage,
})

type User = {
  id: string
  name: string
  phoneNumber: string
  address: string
  avatarUrl: string
  gender: string
  dateOfBirth: string
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState<any>({
    name: "",
    phoneNumber: "",
    address: "",
  })

  // Load users
  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // View user
  const handleView = async (id: string) => {
    const user = await getUserById(id)
    setSelectedUser(user)
    setEditing(false)
  }

  // Edit user
  const handleEdit = async (id: string) => {
    const user = await getUserById(id)

    setSelectedUser(user)
    setEditing(true)

    setForm({
      name: user.name,
      phoneNumber: user.phoneNumber,
      address: user.address,
    })
  }

  // Update user
  const handleUpdate = async () => {
    if (!selectedUser) return

    await updateUser({
      id: selectedUser.id,
      ...form,
    })

    setEditing(false)
    setSelectedUser(null)

    fetchUsers()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        Loading users...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      <h2 className="text-2xl font-semibold">
        User Management
      </h2>

      {/* Table */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-left">

          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {users.map((user) => (

              <tr key={user.id} className="hover:bg-slate-50">

                <td className="px-6 py-4 font-medium">
                  {user.name}
                </td>

                <td className="px-6 py-4">
                  {user.phoneNumber}
                </td>

                <td className="px-6 py-4">
                  {user.gender}
                </td>

                <td className="px-6 py-4">
                  {user.address}
                </td>

                <td className="px-6 py-4 text-right relative">

                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === user.id ? null : user.id)
                    }
                    className="p-2 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === user.id && (

                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow z-50">

                      <button
                        onClick={() => {
                          handleView(user.id)
                          setOpenMenu(null)
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        onClick={() => {
                          handleEdit(user.id)
                          setOpenMenu(null)
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                    </div>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* View / Edit Modal */}

      {selectedUser && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

            <h3 className="text-lg font-semibold">
              {editing ? "Edit User" : "User Detail"}
            </h3>

            <input
              disabled={!editing}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder="Name"
            />

            <input
              disabled={!editing}
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder="Phone"
            />

            <input
              disabled={!editing}
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="w-full border p-2 rounded"
              placeholder="Address"
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>

              {editing && (

                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  )
}