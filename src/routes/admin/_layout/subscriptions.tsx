import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Plus, MoreVertical, Pencil, Trash2, X, Search, ChevronDown } from "lucide-react"

import {
  getSubscriptions,
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

// Custom reusable Filter Dropdown component
function FilterDropdown({ 
  label, 
  value, 
  options, 
  onChange, 
  isOpen, 
  onToggle 
}: { 
  label: string, 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  isOpen: boolean,
  onToggle: (e: React.MouseEvent) => void
}) {
  return (
    <div className="relative inline-block">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 bg-transparent border-none outline-none font-semibold text-text-secondary hover:text-slate-800 transition-colors uppercase tracking-wider text-xs"
      >
        {value === label ? label : value}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-lg z-[999] py-1.5 overflow-hidden font-normal text-sm normal-case tracking-normal">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`w-full text-left px-4 py-2 hover:bg-[#e9f5ed] hover:text-[#5ab473] transition-colors ${value === opt ? "bg-[#e9f5ed]/50 text-[#5ab473] font-medium" : "text-slate-700"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SubscriptionsPage() {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("Status")
  const itemsPerPage = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    durationDays: 30,
    maxAdsPerPeriod: 5,
    status: "Active",
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
      status: "Active",
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

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Loading subscriptions...
      </div>
    )
  }

  const totalPages = Math.ceil(subscriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSubscriptions = subscriptions.slice(startIndex, startIndex + itemsPerPage)

  return (

    <div className="flex flex-col gap-6" onClick={() => { setOpenMenu(null); setOpenFilter(null); }}>

      {/* Filters & Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="w-full md:max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Search packages..."
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#5ab473] hover:bg-[#499A60] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors"
        >
          <Plus size={18} />
          <span className="text-sm">Add Package</span>
        </button>

      </div>

      {/* Table */}

      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-[#f8fafc] text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-[#e7edf4]">
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Max Ads</th>
                <th className="px-6 py-4">
                  <FilterDropdown
                    label="Status"
                    value={statusFilter}
                    options={["Status", "Active", "Inactive"]}
                    isOpen={openFilter === "status"}
                    onChange={(val) => { setStatusFilter(val); setOpenFilter(null); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status"); setOpenMenu(null); }}
                  />
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7edf4]">

              {currentSubscriptions.length > 0 ? (

                currentSubscriptions.map((sub) => (

                  <tr
                    key={sub.packageId}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >

                    <td className="px-6 py-4 font-medium text-text-main">
                      {sub.title}
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {sub.price} {sub.currency}
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {sub.durationDays} days
                    </td>

                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {sub.maxAdsPerPeriod}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                        ${sub.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                          }`}
                      >

                        <span className="size-1.5 rounded-full bg-current"></span>

                        {sub.status === "active" ? "Active" : sub.status}

                      </span>

                    </td>

                    <td className="px-6 py-4 text-right">

                      <div className="relative inline-block">

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenu(openMenu === sub.packageId ? null : sub.packageId)
                          }}
                          className="text-text-secondary hover:text-primary p-2"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === sub.packageId && (

                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-40 bg-white border border-[#e7edf4] rounded-xl shadow-lg z-[999]">

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

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">

                    <div className="flex flex-col items-center gap-2">

                      <span className="text-4xl text-slate-300">📦</span>

                      <p className="font-medium">
                        No subscription packages
                      </p>

                      <p className="text-xs">
                        Create your first subscription plan
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>
        
        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-white">
          <span className="text-sm text-text-secondary">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, subscriptions.length)} of {subscriptions.length} packages
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50
              ${currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Next
            </button>
          </div>
        </div>

      </div>


      {/* Modal */}

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

export default SubscriptionsPage