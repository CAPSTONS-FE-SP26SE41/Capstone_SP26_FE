import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Plus, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/admin/_layout/subscriptions')({
  component: SubscriptionsPage,
})

type Subscription = {
  id: string
  name: string
  price: string
  billing: 'Monthly' | 'Yearly'
  users: number
  status: 'Active' | 'Inactive'
}

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      await new Promise((res) => setTimeout(res, 600))

      setSubscriptions([
        {
          id: '1',
          name: 'Free',
          price: '$0',
          billing: 'Monthly',
          users: 1240,
          status: 'Active',
        },
        {
          id: '2',
          name: 'Premium',
          price: '$9',
          billing: 'Monthly',
          users: 540,
          status: 'Active',
        },
        {
          id: '3',
          name: 'Business',
          price: '$29',
          billing: 'Yearly',
          users: 80,
          status: 'Inactive',
        },
      ])

      setLoading(false)
    }

    fetchSubscriptions()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Loading subscriptions...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-text-main">
            Subscription Packages
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage subscription plans for users
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg">
          <Plus size={18} />
          Add Package
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
              <th className="px-8 py-4">Package</th>
              <th className="px-8 py-4">Price</th>
              <th className="px-8 py-4">Billing</th>
              <th className="px-8 py-4">Users</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50">

                {/* Package */}
                <td className="px-8 py-5">
                  <p className="font-semibold">{sub.name}</p>
                </td>

                {/* Price */}
                <td className="px-8 py-5 text-sm text-slate-600">
                  {sub.price}
                </td>

                {/* Billing */}
                <td className="px-8 py-5 text-sm text-slate-600">
                  {sub.billing}
                </td>

                {/* Users */}
                <td className="px-8 py-5 text-sm text-slate-600">
                  {sub.users}
                </td>

                {/* Status */}
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sub.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-8 py-5 text-right relative">

                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === sub.id ? null : sub.id)
                    }
                    className="p-2 rounded hover:bg-slate-100"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === sub.id && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg">

                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50">
                        <Eye size={16} />
                        View Package
                      </button>

                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50">
                        <Pencil size={16} />
                        Edit Package
                      </button>

                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
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

    </div>
  )
}