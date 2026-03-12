import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Plus, MoreVertical, Eye, Pencil, Trash2, X } from "lucide-react"

import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription
} from "../../../services/subscriptionService"

export const Route = createFileRoute("/admin/_layout/subscriptions")({
  component: SubscriptionsPage,
})

type Subscription = {
  packageId: string
  title: string
  description: string
  price: number
  durationDays: number
  maxAdsPerPeriod: number
  status: string
  currency: string
}

function SubscriptionsPage() {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    durationDays: 30,
    maxAdsPerPeriod: 5,
    status: "active",
    currency: "VNĐ"
  })

  const fetchSubscriptions = async () => {

    try {

      const data = await getSubscriptions()

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

  const openCreate = () => {

    setEditing(null)

    setForm({
      title: "",
      description: "",
      price: 0,
      durationDays: 30,
      maxAdsPerPeriod: 5,
      status: "active",
      currency: "VNĐ"
    })

    setModalOpen(true)

  }

  const openEdit = (sub: Subscription) => {

    setEditing(sub)

    setForm({
      title: sub.title,
      description: sub.description,
      price: sub.price,
      durationDays: sub.durationDays,
      maxAdsPerPeriod: sub.maxAdsPerPeriod,
      status: sub.status,
      currency: sub.currency
    })

    setModalOpen(true)

  }

  const handleSubmit = async () => {

    try {

      if (editing) {

        await updateSubscription(editing.packageId, form)

      } else {

        await createSubscription(form)

      }

      setModalOpen(false)

      fetchSubscriptions()

    } catch (err) {

      console.error(err)

    }

  }

  const handleDelete = async (id: string) => {

    if (!confirm("Delete this package?")) return

    try {

      await deleteSubscription(id)

      setSubscriptions((prev) =>
        prev.filter((s) => s.packageId !== id)
      )

    } catch (err) {

      console.error(err)

    }

  }

  const viewPackage = async (id: string) => {

    const data = await getSubscriptionById(id)

    alert(JSON.stringify(data, null, 2))

  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Loading subscriptions...
      </div>
    )
  }

  return (

    <div className="flex flex-col gap-8">

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

      <div className="bg-white border rounded-xl overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-slate-50 text-xs uppercase text-slate-500">

            <tr>
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Max Ads</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>

          </thead>

          <tbody className="divide-y">

            {subscriptions.map((sub) => (

              <tr key={sub.packageId} className="hover:bg-slate-50">

                <td className="px-6 py-4 font-semibold">
                  {sub.title}
                </td>

                <td className="px-6 py-4">
                  {sub.price} {sub.currency}
                </td>

                <td className="px-6 py-4">
                  {sub.durationDays} days
                </td>

                <td className="px-6 py-4">
                  {sub.maxAdsPerPeriod}
                </td>

                <td className="px-6 py-4">

                  <span className={`px-3 py-1 text-xs rounded-full ${
                    sub.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>

                    {sub.status}

                  </span>

                </td>

                <td className="px-6 py-4 text-right relative">

                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === sub.packageId ? null : sub.packageId)
                    }
                    className="p-2 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === sub.packageId && (

                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow z-10">

                      

                      <button
                        onClick={() => openEdit(sub)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(sub.packageId)}
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

      {modalOpen && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white w-96 rounded-xl p-6 flex flex-col gap-4">

            <div className="flex justify-between items-center">

              <h3 className="font-semibold text-lg">
                {editing ? "Edit Package" : "Create Package"}
              </h3>

              <button onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>

            </div>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="border px-3 py-2 rounded"
            />

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
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

            <input
              type="number"
              placeholder="Duration Days"
              value={form.durationDays}
              onChange={(e) =>
                setForm({ ...form, durationDays: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded"
            />

            <input
              type="number"
              placeholder="Max Ads"
              value={form.maxAdsPerPeriod}
              onChange={(e) =>
                setForm({ ...form, maxAdsPerPeriod: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded"
            />

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white py-2 rounded"
            >
              {editing ? "Update" : "Create"}
            </button>

          </div>

        </div>

      )}

    </div>

  )

}