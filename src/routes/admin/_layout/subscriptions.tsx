import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Plus, MoreVertical, Eye, Pencil, Trash2, X } from 'lucide-react'

export const Route = createFileRoute('/admin/_layout/subscriptions')({
  component: SubscriptionsPage,
})

type Subscription = {
  id: string
  name: string
  price: number
  billing: 'Monthly' | 'Yearly'
  users: number
  status: 'Active' | 'Inactive'
}

function SubscriptionsPage() {

  const API = 'https://localhost:7176/api/ad-subscription-packages'

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const [form, setForm] = useState({
    name: '',
    price: 0,
    billing: 'Monthly',
    status: 'Active',
  })

  // ================= FETCH =================

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(API)
      const data = await res.json()
      setSubscriptions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  // ================= CREATE / UPDATE =================

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      price: 0,
      billing: 'Monthly',
      status: 'Active',
    })
    setModalOpen(true)
  }

  const openEdit = (sub: Subscription) => {
    setEditing(sub)
    setForm({
      name: sub.name,
      price: sub.price,
      billing: sub.billing,
      status: sub.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {

    try {

      if (editing) {

        await fetch(`${API}/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        })

      } else {

        await fetch(API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        })

      }

      setModalOpen(false)
      fetchSubscriptions()

    } catch (err) {
      console.error(err)
    }
  }

  // ================= DELETE =================

  const deleteSubscription = async (id: string) => {

    if (!confirm('Delete this package?')) return

    try {

      await fetch(`${API}/${id}`, {
        method: 'DELETE',
      })

      setSubscriptions((prev) => prev.filter((s) => s.id !== id))

    } catch (err) {
      console.error(err)
    }
  }

  // ================= VIEW =================

  const viewPackage = async (id: string) => {

    const res = await fetch(`${API}/${id}`)
    const data = await res.json()

    alert(JSON.stringify(data, null, 2))
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Loading subscriptions...
      </div>
    )
  }

  // ================= UI =================

  return (
    <div className="flex flex-col gap-8">

      {/* HEADER */}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">
            Subscription Packages
          </h2>
          <p className="text-sm text-slate-500">
            Manage subscription plans
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl"
        >
          <Plus size={18} />
          Add Package
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-white border rounded-xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Billing</th>
              <th className="px-6 py-4">Users</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {subscriptions.map((sub) => (

              <tr key={sub.id} className="hover:bg-slate-50">

                <td className="px-6 py-4 font-semibold">
                  {sub.name}
                </td>

                <td className="px-6 py-4">
                  ${sub.price}
                </td>

                <td className="px-6 py-4">
                  {sub.billing}
                </td>

                <td className="px-6 py-4">
                  {sub.users}
                </td>

                <td className="px-6 py-4">

                  <span className={`px-3 py-1 text-xs rounded-full ${
                    sub.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {sub.status}
                  </span>

                </td>

                <td className="px-6 py-4 text-right relative">

                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === sub.id ? null : sub.id)
                    }
                    className="p-2 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === sub.id && (

                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow">

                      <button
                        onClick={() => viewPackage(sub.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        onClick={() => openEdit(sub)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteSubscription(sub.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>

                    </div>
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {modalOpen && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white w-96 rounded-xl p-6 flex flex-col gap-4">

            <div className="flex justify-between items-center">

              <h3 className="font-semibold text-lg">
                {editing ? 'Edit Package' : 'Create Package'}
              </h3>

              <button onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>

            </div>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border px-3 py-2 rounded"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded"
            />

            <select
              value={form.billing}
              onChange={(e) =>
                setForm({ ...form, billing: e.target.value as any })
              }
              className="border px-3 py-2 rounded"
            >
              <option>Monthly</option>
              <option>Yearly</option>
            </select>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as any })
              }
              className="border px-3 py-2 rounded"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white py-2 rounded"
            >
              {editing ? 'Update' : 'Create'}
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

