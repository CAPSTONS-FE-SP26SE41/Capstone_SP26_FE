import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Plus, Pencil, Trash2, X, Search, ChevronDown, Upload, Download } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import ToggleSwitch from "../../../components/ToggleSwitch"
import { formatVND } from "../../../utils/format"
import {
  getSubscriptions,
  filterSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  activateSubscription,
  deactivateSubscription,
  importSubscriptionPackages,
  exportSubscriptionPackages,
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

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 scale-90 group-hover/tooltip:scale-100 z-50">
        <div className="bg-[#1e293b] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          {text}
        </div>
        <div className="w-2 h-2 bg-[#1e293b] rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
      </div>
    </div>
  )
}

// Filter dropdown
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
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width
    })
  }, [isOpen])

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex items-center gap-1.5 bg-transparent border-none outline-none hover:text-slate-800 transition-colors text-inherit font-inherit"
      >
        {value === label ? label : value}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && createPortal(
        <div
          className="fixed z-[9999] w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 overflow-hidden font-normal text-sm normal-case tracking-normal"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt)
              }}
              className={`w-full text-left px-4 py-2 hover:bg-[#e9f5ed] hover:text-[#5ab473] transition-colors ${value === opt ? "bg-[#e9f5ed]/50 text-[#5ab473] font-medium" : "text-slate-700"}`}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

// Expandable description
function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!text) return <span className="text-slate-400 italic text-xs">No description</span>
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 text-center max-w-full min-h-[40px]">
      <div className={`w-full text-sm ${isExpanded ? "" : "line-clamp-1"} break-words text-center`}>
        {text}
      </div>
      {text.length > 50 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          {isExpanded ? "View less" : "View all"}
        </button>
      )}
    </div>
  )
}

function SubscriptionsPage() {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("Status")
  const [priceSort, setPriceSort] = useState("Price (VNĐ)")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")

  // Fix cứng phân trang
  const itemsPerPage = 4
  const totalPages = Math.max(1, Math.ceil(subscriptions.length / itemsPerPage))

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    durationDays: 30,
    maxAdsPerPeriod: 5,
    status: "Active",
    currency: "VNĐ"
  })

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  const fetchSubscriptions = async () => {
    try {
      const isFiltering = debouncedKeyword.trim().length > 0 || statusFilter !== "Status" || priceSort !== "Price"
      let data
      if (isFiltering) {
        data = await filterSubscriptions({
          title: debouncedKeyword.trim(),
          status: statusFilter,
          sortPrice: priceSort === "Price" ? undefined : (priceSort === "High to Low" ? "desc" : "asc")
        })
      } else {
        data = await getSubscriptions()
      }
      setSubscriptions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [debouncedKeyword, statusFilter, priceSort])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: "", description: "", price: 0, durationDays: 30, maxAdsPerPeriod: 5, status: "Active", currency: "VNĐ" })
    setModalOpen(true)
  }

  const openEdit = (sub: Subscription) => {
    setEditing(sub)
    setForm({ title: sub.title, description: sub.description, price: sub.price, durationDays: sub.durationDays, maxAdsPerPeriod: sub.maxAdsPerPeriod, status: sub.status, currency: sub.currency })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) await updateSubscription(editing.packageId, form)
      else await createSubscription(form)
      setModalOpen(false)
      fetchSubscriptions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id)
      setSubscriptions((prev) => prev.filter((s) => s.packageId !== id))
      setDeleteId(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateSubscription(id)
      setSubscriptions((prev) => prev.map((s) => s.packageId === id ? { ...s, status: "active" } : s))
    } catch (err) { console.error(err) }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateSubscription(id)
      setSubscriptions((prev) => prev.map((s) => s.packageId === id ? { ...s, status: "inactive" } : s))
    } catch (err) { console.error(err) }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      await importSubscriptionPackages(file)
      await fetchSubscriptions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportSubscriptionPackages()
      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "AdSubscriptionPackages.xlsx"
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-sm text-slate-500">Loading subscriptions...</div>

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSubscriptions = subscriptions.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col gap-6" onClick={() => { setOpenFilter(null); }}>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Filters & Control Panel - STICKY */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 mb-2 border-b border-transparent transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Search */}
          <div className="w-full md:max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Search packages..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#5ab473] hover:bg-[#499A60] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm">Add Package</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              <Upload size={18} />
              Import
            </button>
            <button
              type="button"
              onClick={() => void handleExport()}
              className="flex items-center gap-2 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              <Download size={18} />
              Export
            </button>
          </div>

        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-center table-fixed min-w-[900px] border-separate border-spacing-0">

            <thead>
              <tr>
                <th className="w-[5%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">No.</th>
                <th className="w-[15%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">Package</th>
                <th className="w-[28%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">Description</th>
                <th className="w-[10%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">
                  <div className="flex items-center justify-center gap-1">
                    <FilterDropdown
                      label="Price (VNĐ)"
                      value={priceSort}
                      /* Simplified options to avoid "Price (VNĐ) VND" */
                      options={["Price (VNĐ)", "Low to High", "High to Low"]}
                      isOpen={openFilter === "price"}
                      onChange={(val) => {
                        setPriceSort(val);
                        setOpenFilter(null);
                      }}
                      onToggle={(e) => {
                        e.stopPropagation();
                        setOpenFilter(openFilter === "price" ? null : "price");
                      }}
                    />
                  </div>
                </th>
                <th className="w-[10%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">Duration Days</th>
                <th className="w-[9%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">Max Ads</th>
                <th className="w-[10%] sticky top-0 z-20 px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">
                  <FilterDropdown
                    label="Status"
                    value={statusFilter}
                    options={["Status", "Active", "Inactive"]}
                    isOpen={openFilter === "status"}
                    onChange={(val) => { setStatusFilter(val); setOpenFilter(null); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status"); }}
                  />
                </th>
                <th
                  className="w-[170px] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc] sticky top-0 right-0 z-30"
                  style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}
                >Actions</th>
              </tr>
            </thead>

            <tbody>

              {currentSubscriptions.length > 0 ? (

                currentSubscriptions.map((sub, index) => (

                  <tr
                    key={sub.packageId}
                    className="hover:bg-[#f8fafc] transition-colors group"
                  >

                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4]">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-text-main text-center border-b border-[#e7edf4] truncate">
                      {sub.title}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4]">
                      <ExpandableDescription text={sub.description} />
                    </td>

                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4]">
                      {formatVND(sub.price)}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4]">
                      {sub.durationDays} days
                    </td>

                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4]">
                      {sub.maxAdsPerPeriod}
                    </td>

                    <td className="px-4 py-3 text-center border-b border-[#e7edf4]">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                      ${sub.status?.toLowerCase() === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                          }`}
                      >
                        <span className="size-1.5 rounded-full bg-current"></span>
                        {sub.status?.toLowerCase() === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td
                      className="px-4 py-3 text-center border-b border-[#e7edf4] sticky right-0 bg-white group-hover:bg-[#f8fafc] z-10 transition-colors"
                      style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}
                    >
                      <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">

                        {/* Edit */}
                        <Tooltip text="Edit">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(sub); }}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip text="Delete">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteId(sub.packageId); }}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Tooltip>

                        {/* Activate / Deactivate */}
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <ToggleSwitch
                            initialState={sub.status?.toLowerCase() === "active"}
                            onChange={(state) => {
                              if (state) {
                                handleActivate(sub.packageId)
                              } else {
                                handleDeactivate(sub.packageId)
                              }
                            }}
                          />
                        </div>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl text-slate-300">📦</span>
                      <p className="font-medium">No subscription packages</p>
                      <p className="text-xs">Create your first subscription plan</p>
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
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>Previous</button>
            <span className="px-3 py-1 text-sm">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}>Next</button>
          </div>
        </div>

      </div>


      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white w-full max-w-md rounded-2xl p-6 flex flex-col gap-6 shadow-2xl border border-slate-100"
            >

              {/* Header */}
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-800">
                  {editing ? "Edit Package" : "Create Package"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Package Title</label>
                  <input
                    placeholder="e.g. Premium Plan"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5ab473]/20 focus:border-[#5ab473] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700">Description</label>
                    <span className="text-xs text-slate-400 font-medium">{form.description?.length || 0}/500</span>
                  </div>
                  <textarea
                    placeholder="Describe this package's features..."
                    value={form.description}
                    maxLength={500}
                    rows={3}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5ab473]/20 focus:border-[#5ab473] transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Price (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5ab473]/20 focus:border-[#5ab473] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Duration (Days)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={form.durationDays}
                      onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5ab473]/20 focus:border-[#5ab473] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Max Ads Allowed</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={form.maxAdsPerPeriod}
                    onChange={(e) => setForm({ ...form, maxAdsPerPeriod: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5ab473]/20 focus:border-[#5ab473] transition-all"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#5ab473] hover:bg-[#499A60] rounded-xl shadow-sm transition-colors"
                >
                  {editing ? "Save Changes" : "Create Package"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 flex flex-col gap-6 shadow-2xl border border-slate-100 items-center text-center"
            >

              <div className="w-14 h-14 bg-red-100/80 text-red-600 rounded-full flex items-center justify-center mb-1">
                <Trash2 size={26} strokeWidth={2.5} />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-xl text-slate-800">Delete Package?</h3>
                <p className="text-sm text-slate-500 font-medium">
                  Are you sure you want to delete this subscription package? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-center gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  )

}
