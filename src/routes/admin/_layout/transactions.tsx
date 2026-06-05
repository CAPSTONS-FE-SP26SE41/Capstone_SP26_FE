import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Search, ChevronDown, ChevronLeft, ChevronRight, Receipt, Eye, X, Copy, Check, ArrowUpDown, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { getAllTransactions, type PaymentHistoryItem, type TransactionPagedResponse } from "../../../services/paymentService"

export const Route = createFileRoute("/admin/_layout/transactions")({
  component: TransactionsPage,
})

function FilterDropdown({
  label, value, options, onChange, isOpen, onToggle
}: {
  label: string, value: string, options: { label: string, value: string }[],
  onChange: (val: string) => void, isOpen: boolean, onToggle: (e: React.MouseEvent) => void
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setMenuPosition({ top: rect.bottom + 8, left: rect.left })
  }, [isOpen])

  const displayLabel = options.find(o => o.value === value)?.label || label

  return (
    <div className="relative inline-block">
      <button ref={buttonRef} onClick={onToggle}
        className="flex items-center gap-1.5 bg-transparent border-none outline-none hover:text-slate-800 transition-colors text-inherit font-inherit">
        {displayLabel}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && createPortal(
        <div className="fixed z-[9999] w-44 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 text-sm"
          style={{ top: menuPosition.top, left: menuPosition.left }}>
          {options.map((opt) => (
            <button key={opt.value} onClick={() => onChange(opt.value)}
              className={`w-full text-left px-4 py-2 hover:bg-[#e6f0fa] hover:text-[#258cf4] transition-colors ${value === opt.value ? "bg-[#e6f0fa]/50 text-[#258cf4] font-medium" : "text-slate-700"}`}>
              {opt.label}
            </button>
          ))}
        </div>, document.body
      )}
    </div>
  )
}

const statusConfig: Record<string, { label: string, color: string, bg: string, icon: React.ReactNode }> = {
  Completed: { label: "Thành công", color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 size={13} /> },
  Pending: { label: "Đang chờ", color: "text-amber-700", bg: "bg-amber-100", icon: <Clock size={13} /> },
  Failed: { label: "Thất bại", color: "text-red-600", bg: "bg-red-100", icon: <XCircle size={13} /> },
}

const formatCurrency = (val: number) => {
  if (!val && val !== 0) return "0"
  return val.toLocaleString("vi-VN")
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function TransactionsPage() {
  const [data, setData] = useState<TransactionPagedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<PaymentHistoryItem | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const itemsPerPage = 15

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getAllTransactions(currentPage, itemsPerPage, statusFilter || undefined, sortOrder)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [currentPage, statusFilter, sortOrder])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Đang tải lịch sử giao dịch...
      </div>
    )
  }

  const transactions = data?.items || []
  const totalPages = data?.totalPages || 1
  const totalItems = data?.totalItems || 0

  return (
    <div className="flex flex-col gap-6" onClick={() => setOpenFilter(null)}>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-x-auto">
        <table className="w-full text-left table-fixed min-w-[1100px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-[5%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">STT</th>
              <th className="w-[14%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">Mã giao dịch</th>
              <th className="w-[16%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">Email tài khoản</th>
              <th className="w-[14%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">Gói dịch vụ</th>
              <th className="w-[11%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">Số tiền</th>
              <th className="w-[14%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">
                <button onClick={(e) => { e.stopPropagation(); setSortOrder(prev => prev === "desc" ? "asc" : "desc"); setCurrentPage(1) }}
                  className="flex items-center gap-1.5 bg-transparent border-none outline-none hover:text-slate-800 transition-colors text-inherit font-inherit cursor-pointer">
                  Ngày tạo <ArrowUpDown size={14} className={sortOrder === "asc" ? "text-blue-500" : ""} />
                </button>
              </th>
              <th className="w-[12%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc]">
                <FilterDropdown label="Trạng thái" value={statusFilter}
                  options={[
                    { label: "Tất cả", value: "" },
                    { label: "Thành công", value: "Completed" },
                    { label: "Đang chờ", value: "Pending" },
                    { label: "Thất bại", value: "Failed" },
                  ]}
                  isOpen={openFilter === "status"}
                  onChange={(val) => { setStatusFilter(val); setOpenFilter(null); setCurrentPage(1) }}
                  onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status") }}
                />
              </th>
              <th className="w-[8%] px-4 py-4 text-text-secondary text-sm font-semibold border-b border-[#e7edf4] bg-[#f8fafc] sticky right-0 z-20"
                style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => {
                const sc = statusConfig[tx.status] || statusConfig.Pending
                return (
                  <tr key={tx.paymentId} className="hover:bg-[#f8fafc] transition-colors group">
                    <td className="px-4 py-3 text-sm text-text-secondary border-b border-[#e7edf4]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary border-b border-[#e7edf4] font-mono truncate" title={tx.transactionContent}>
                      {tx.transactionContent?.length > 20 ? tx.transactionContent.slice(0, 20) + "..." : tx.transactionContent || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-main border-b border-[#e7edf4] truncate" title={tx.accountEmail}>
                      {tx.accountEmail || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-main border-b border-[#e7edf4] truncate">
                      {tx.packageTitle || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-main border-b border-[#e7edf4]">
                      {formatCurrency(tx.amount)} <span className="text-xs font-normal text-slate-400">{tx.currency || "VNĐ"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary border-b border-[#e7edf4]">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3 border-b border-[#e7edf4]">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${sc.bg} ${sc.color}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-[#e7edf4] sticky right-0 bg-white group-hover:bg-[#f8fafc] z-10 transition-colors"
                      style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedTx(tx) }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle size={32} className="text-slate-300" />
                    <p className="font-medium">Không tìm thấy giao dịch nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-white">
          <span className="text-sm text-text-secondary">
            Trang {currentPage} / {totalPages || 1} — Tổng {totalItems} giao dịch
          </span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className={`px-3 py-1.5 text-sm border border-[#e7edf4] bg-white rounded-lg hover:bg-slate-50 flex items-center gap-1 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
              <ChevronLeft size={14} /> Trước
            </button>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages}
              className={`px-3 py-1.5 text-sm border border-[#e7edf4] bg-white rounded-lg hover:bg-slate-50 flex items-center gap-1 ${currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""}`}>
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={() => setSelectedTx(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-[#258cf4] rounded-xl">
                    <Receipt size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">Chi tiết giao dịch</h3>
                </div>
                <button onClick={() => setSelectedTx(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {(() => {
                  const sc = statusConfig[selectedTx.status] || statusConfig.Pending
                  const rows = [
                    { label: "Mã giao dịch", value: selectedTx.transactionContent, copyable: true },
                    { label: "Email tài khoản", value: selectedTx.accountEmail },
                    { label: "Gói dịch vụ", value: selectedTx.packageTitle },
                    { label: "Số tiền", value: `${formatCurrency(selectedTx.amount)} ${selectedTx.currency || "VNĐ"}` },
                    { label: "Phương thức", value: selectedTx.paymentMethod || "SePay" },
                    { label: "Ngày tạo", value: formatDate(selectedTx.createdAt) },
                    { label: "Ngày thanh toán", value: formatDate(selectedTx.paidAt) },
                    { label: "Ngày giao dịch", value: formatDate(selectedTx.transactionDate) },
                    { label: "STK chuyển", value: selectedTx.accountNumber || "—" },
                    { label: "Gateway", value: selectedTx.gateway || "—" },
                  ]
                  return (
                    <>
                      <div className="flex justify-center mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${sc.bg} ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      {rows.map((r, i) => (
                        <div key={i} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%] pt-0.5">{r.label}</span>
                          <div className="flex items-center gap-1.5 w-[60%] justify-end">
                            <span className="text-sm font-medium text-slate-800 text-right break-all">{r.value || "—"}</span>
                            {r.copyable && r.value && r.value !== "—" && (
                              <button onClick={() => handleCopy(r.value!, r.label)}
                                className="p-1 text-slate-400 hover:text-blue-500 transition-colors shrink-0">
                                {copiedField === r.label ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )
                })()}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button onClick={() => setSelectedTx(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
