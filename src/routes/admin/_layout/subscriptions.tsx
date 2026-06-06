import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Plus, Pencil, Trash2, X, Search, ChevronDown, Sparkles, DollarSign, Calendar, Flame, FileText, CheckCircle2, Layers } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import ToggleSwitch from "../../../components/ToggleSwitch"

import {
  getSubscriptions,
  filterSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  activateSubscription,
  deactivateSubscription
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

// Custom Tooltip component
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
              className={`w-full text-left px-4 py-2 hover:bg-[#e6f0fa] hover:text-[#258cf4] transition-colors ${value === opt ? "bg-[#e6f0fa]/50 text-[#258cf4] font-medium" : "text-slate-700"}`}
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

function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return <span className="text-slate-400 italic text-xs">Không có mô tả</span>

  return (
    <div className="flex flex-col items-start justify-start gap-0.5 text-left max-w-full min-h-[40px]">
      <div className={`w-full text-sm ${isExpanded ? "" : "line-clamp-1"} break-words text-left`}>
        {text}
      </div>
      {text.length > 50 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  )
}

const formatCurrency = (val: number | string) => {
  if (val === "" || val === undefined || val === null) return "0"
  const num = Number(val)
  if (isNaN(num)) return "0"
  return num.toLocaleString("vi-VN")
}

function SubscriptionsPage() {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("Trạng thái")
  const [priceSort, setPriceSort] = useState("Giá")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const itemsPerPage = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState<{
    title: string;
    description: string;
    price: number | string;
    durationDays: number | string;
    maxAdsPerPeriod: number | string;
    status: string;
    currency: string;
  }>({
    title: "",
    description: "",
    price: "",
    durationDays: "",
    maxAdsPerPeriod: "",
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
      const isFiltering = debouncedKeyword.trim().length > 0 || statusFilter !== "Trạng thái" || priceSort !== "Giá"
      let data

      if (isFiltering) {
        data = await filterSubscriptions({
          title: debouncedKeyword.trim(),
          status: statusFilter === "Trạng thái" ? undefined : (statusFilter === "Đang hoạt động" ? "active" : "inactive"),
          sortPrice: priceSort === "Giá" ? undefined : (priceSort === "Cao đến Thấp" ? "desc" : "asc")
        })
      } else {


        data = await getSubscriptions()
      }

      console.log("Subscriptions API Response:", data)
      setSubscriptions(data || [])
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

    setForm({
      title: "",
      description: "",
      price: "",
      durationDays: "",
      maxAdsPerPeriod: "",
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

      const submissionData = {
        ...form,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        maxAdsPerPeriod: Number(form.maxAdsPerPeriod)
      }

      if (editing) {
        await updateSubscription(editing.packageId, submissionData as any)
      } else {
        await createSubscription(submissionData as any)
      }

      setModalOpen(false)

      fetchSubscriptions()

    } catch (err) {

      console.error(err)

    }

  }

  const handleDelete = async (id: string) => {

    try {

      await deleteSubscription(id)

      setSubscriptions((prev) =>
        prev.filter((s) => s.packageId !== id)
      )

      setDeleteId(null)

    } catch (err) {

      console.error(err)

    }

  }

  const handleActivate = async (id: string) => {
    try {
      await activateSubscription(id)
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.packageId === id ? { ...s, status: "active" } : s
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateSubscription(id)
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.packageId === id ? { ...s, status: "inactive" } : s
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Đang tải danh sách gói dịch vụ...
      </div>
    )
  }

  const totalPages = Math.ceil(subscriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSubscriptions = subscriptions.slice(startIndex, startIndex + itemsPerPage)

  return (

    <div className="flex flex-col gap-6" onClick={() => { setOpenFilter(null); }}>

      {/* Filters & Control Panel - STICKY */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 mb-2 border-b border-transparent transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Search */}
          <div className="w-full md:max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Tìm kiếm gói dịch vụ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#258cf4] hover:bg-[#1d72cb] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm">Thêm gói</span>
          </button>

        </div>
      </div>

      {/* Table - single overflow-x:auto container so sticky right column works */}
      <div
        className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-x-auto"
      >
        <table className="w-full text-left table-fixed min-w-[1100px] border-separate border-spacing-0">


          <thead>
            <tr>
              <th className="w-[5%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc]">STT</th>
              <th className="w-[18%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc] min-w-[150px]">Gói dịch vụ</th>
              <th className="w-[22%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc] min-w-[200px]">Mô tả</th>
              <th className="w-[10%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc]">
                <FilterDropdown
                  label="Giá"
                  value={priceSort}
                  options={["Giá", "Thấp đến Cao", "Cao đến Thấp"]}
                  isOpen={openFilter === "price"}
                  onChange={(val) => { setPriceSort(val); setOpenFilter(null); }}
                  onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "price" ? null : "price"); }}
                />
              </th>
              <th className="w-[10%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc]">Thời hạn</th>
              <th className="w-[9%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc]">QC tối đa</th>
              <th className="w-[13%] px-4 py-4 text-text-secondary text-sm font-semibold text-left border-b border-[#e7edf4] bg-[#f8fafc]">
                <FilterDropdown
                  label="Trạng thái"
                  value={statusFilter}
                  options={["Trạng thái", "Đang hoạt động", "Ngừng hoạt động"]}

                  isOpen={openFilter === "status"}
                  onChange={(val) => { setStatusFilter(val); setOpenFilter(null); }}
                  onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status"); }}
                />
              </th>
              <th
                className="w-[13%] px-4 py-4 text-text-secondary text-sm font-semibold text-left pr-6 border-b border-[#e7edf4] bg-[#f8fafc] sticky right-0 z-20"


                style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}
              >Hành động</th>
            </tr>
          </thead>

          <tbody>

            {currentSubscriptions.length > 0 ? (

              currentSubscriptions.map((sub, index) => (

                <tr
                  key={sub.packageId}
                  className="hover:bg-[#f8fafc] transition-colors group"
                >

                  <td className="px-4 py-3 text-sm text-text-secondary text-left border-b border-[#e7edf4]">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-4 py-3 font-medium text-text-main text-left border-b border-[#e7edf4] truncate">
                    {sub.title}
                  </td>

                  <td className="px-4 py-3 text-sm text-text-secondary text-left border-b border-[#e7edf4]">
                    <ExpandableDescription text={sub.description} />
                  </td>

                  <td className="px-4 py-3 text-sm text-text-secondary text-left border-b border-[#e7edf4]">
                    {sub.price} {sub.currency}
                  </td>

                  <td className="px-4 py-3 text-sm text-text-secondary text-left border-b border-[#e7edf4]">
                    {sub.durationDays} ngày
                  </td>

                  <td className="px-4 py-3 text-sm text-text-secondary text-left border-b border-[#e7edf4]">
                    {sub.maxAdsPerPeriod}
                  </td>

                  <td className="px-4 py-3 text-left border-b border-[#e7edf4]">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap
                      ${sub.status?.toLowerCase() === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                        }`}
                    >
                      <span className="size-1.5 rounded-full bg-current"></span>
                      {sub.status?.toLowerCase() === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>


                  <td
                    className="px-4 py-3 text-left pr-4 border-b border-[#e7edf4] sticky right-0 bg-white group-hover:bg-[#f8fafc] z-10 hover:z-30 transition-colors"

                    style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}
                  >
                    <div className="inline-flex items-center justify-start gap-2">


                      {/* Edit */}
                      <Tooltip text="Chỉnh sửa">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(sub); }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip text="Xóa">
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
                    <p className="font-medium">Chưa có gói dịch vụ nào</p>
                  </div>
                </td>
              </tr>

            )}

          </tbody>

        </table>

        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-white">
          <span className="text-sm text-text-secondary">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, subscriptions.length)} trong tổng số {subscriptions.length} gói
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">
              Trang {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50
              ${currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Sau
            </button>
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
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white w-full max-w-4xl rounded-3xl flex flex-col shadow-2xl border border-slate-100/80 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-[#258cf4] rounded-xl">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {editing ? "Chỉnh sửa gói dịch vụ" : "Tạo gói dịch vụ mới"}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto max-h-[calc(85vh-140px)]">
                {/* Form column (Left) */}
                <div className="lg:col-span-7 p-8 flex flex-col gap-5 border-r border-slate-100">
                  {/* Tên gói */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên gói dịch vụ</label>
                    <div className="relative">
                      <Layers size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        placeholder="Ví dụ: Gói Cao Cấp"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#258cf4]/20 focus:border-[#258cf4] transition-all font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả đặc quyền</label>
                      <span className="text-xs text-slate-400 font-semibold">{form.description?.length || 0}/500</span>
                    </div>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-3 text-slate-400" />
                      <textarea
                        placeholder="Mô tả các tính năng của gói này..."
                        value={form.description}
                        maxLength={500}
                        rows={4}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#258cf4]/20 focus:border-[#258cf4] transition-all resize-none font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Giá & Thời hạn */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá (VNĐ)</label>
                      <div className="relative">
                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          placeholder="0"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#258cf4]/20 focus:border-[#258cf4] transition-all font-medium text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thời hạn (Ngày)</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          placeholder="30"
                          value={form.durationDays}
                          onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#258cf4]/20 focus:border-[#258cf4] transition-all font-medium text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Số lượng QC tối đa */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số lượng quảng cáo tối đa</label>
                    <div className="relative">
                      <Flame size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        placeholder="0"
                        value={form.maxAdsPerPeriod}
                        onChange={(e) => setForm({ ...form, maxAdsPerPeriod: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#258cf4]/20 focus:border-[#258cf4] transition-all font-medium text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Column (Right) */}
                <div className="lg:col-span-5 p-8 bg-slate-50/70 flex flex-col justify-center items-center gap-6">

                  {/* The Preview Card */}
                  <div className="w-full max-w-[290px] min-h-[380px] bg-gradient-to-br from-[#1d4ed8] via-[#258cf4] to-[#4f46e5] rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between relative overflow-hidden group">
                    {/* Decorative glass circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    
                    <div className="z-10">
                      {/* Badge */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                          {form.durationDays ? `${form.durationDays} Ngày` : "30 Ngày"}
                        </span>
                        <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                      </div>

                      {/* Title */}
                      <h4 className="text-xl font-bold tracking-wide mb-1 truncate">
                        {form.title || "Tên Gói Dịch Vụ"}
                      </h4>
                      
                      {/* Price */}
                      <div className="flex items-baseline gap-1 my-3">
                        <span className="text-2xl font-black">{formatCurrency(form.price)}</span>
                        <span className="text-xs font-medium text-blue-100">{form.currency || "VNĐ"}</span>
                      </div>

                      {/* Divider */}
                      <div className="h-[1px] bg-white/20 my-4"></div>

                      {/* Features */}
                      <div className="flex flex-col gap-2.5 my-2 max-h-[160px] overflow-y-auto pr-1">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                          <span className="text-xs text-blue-50 font-medium">
                            Số quảng cáo tối đa: <strong className="text-white font-bold">{form.maxAdsPerPeriod || 0}</strong>
                          </span>
                        </div>
                        {form.description ? (
                          form.description.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={15} className="text-emerald-300 shrink-0 mt-0.5" />
                              <span className="text-xs text-blue-50 font-medium line-clamp-2 break-words">{line}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-start gap-2 opacity-60 italic">
                            <CheckCircle2 size={15} className="text-white/60 shrink-0 mt-0.5" />
                            <span className="text-xs text-blue-100 font-medium">Chưa có mô tả đặc quyền...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 z-10">
                      <button type="button" className="w-full py-2.5 bg-white text-[#258cf4] font-bold text-xs rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 active:scale-95 transition-all uppercase tracking-wider">
                        Đăng ký ngay
                      </button>
                    </div>
                  </div>


                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all active:scale-98"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-[#258cf4] hover:bg-[#1d72cb] active:scale-98 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  {editing ? "Lưu thay đổi" : "Tạo gói dịch vụ"}
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
              <h3 className="font-bold text-xl text-slate-800">Xóa gói dịch vụ?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Bạn có chắc chắn muốn xóa gói dịch vụ này không? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex justify-center gap-3 w-full mt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm transition-colors"
              >
                Xóa
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  )

}