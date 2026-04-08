import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  Plus,
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  Upload,
  Download,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import ToggleSwitch from "../../../components/ToggleSwitch"

import {
  getAccounts,
  deactivateAccount,
  activateAccount,
  filterAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  importAccounts,
  exportAccounts,
} from "../../../services/accountService"

export const Route = createFileRoute("/admin/_layout/accounts")({
  component: AccountsPage,
})

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
  onToggle,
}: {
  label: string
  value: string
  options: string[]
  onChange: (val: string) => void
  isOpen: boolean
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
      width: rect.width,
    })
  }, [isOpen])

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="flex items-center gap-1.5 bg-transparent border-none outline-none hover:text-slate-800 transition-colors text-inherit font-inherit whitespace-nowrap"
      >
        {value === label ? label : value}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed z-[9999] w-36 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 overflow-hidden font-normal text-sm normal-case tracking-normal"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
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

type Account = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: { id: string; name: string }
  status: "Active" | "Inactive"
  createdAt: string
}
const ROLE_MAP: Record<string, number> = {
  Admin: 1,
  User: 2,
  Staff: 3,
  Partner: 4,
}
const ROLE_OPTIONS = ["Admin", "User", "Staff", "Partner"] as const

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState("Role")
  const [statusFilter, setStatusFilter] = useState("Status")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const itemsPerPage = 6

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ email: "", fullName: "", roleName: "User" })
  const [errors, setErrors] = useState({ email: "", fullName: "" })
  const DEFAULT_PASSWORD = "123456"

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const trimmed = debouncedKeyword.trim()
      const isFiltering = trimmed.length > 0 || roleFilter !== "Role" || statusFilter !== "Status"
      let data

      if (isFiltering) {
        data = await filterAccounts({ page: currentPage, pageSize: itemsPerPage, keyword: trimmed || undefined, role: roleFilter, status: statusFilter })
      } else {
        data = await getAccounts(currentPage, itemsPerPage)
      }

      const listToMap = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])
      const _totalAccounts = data?.total ?? listToMap.length
      const _totalPages = data?.totalPages ?? Math.max(1, Math.ceil(_totalAccounts / itemsPerPage))

      setTotalAccounts(_totalAccounts)
      setTotalPages(_totalPages)

      const formatted: Account[] = listToMap.map((acc: any) => {
        const roleRaw = acc.roleName ?? acc.role
        let roleName = "User"
        if (typeof roleRaw === "string") roleName = roleRaw
        else if (roleRaw && typeof roleRaw === "object" && "name" in roleRaw) roleName = String(roleRaw.name ?? "User")
        const id = String(acc.id ?? acc.userId ?? acc.accountId ?? "")
        const active = acc.isActive === true || acc.isActive === "true" || String(acc.status ?? "").toLowerCase() === "active"
        return {
          id,
          name: acc.name || acc.fullName || (acc.profile as any)?.name || "User",
          email: String(acc.email ?? ""),
          avatarUrl: String((acc.profile as any)?.avtUrl ?? acc.avatarUrl ?? ""),
          role: { id: String(acc.roleId ?? ""), name: roleName },
          status: active ? "Active" : "Inactive",
          createdAt: String(acc.createdAt ?? ""),
        }
      })
      setAccounts(formatted)
    } catch (error) {
      console.error("Failed to fetch accounts", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [currentPage, roleFilter, statusFilter, debouncedKeyword])

  const validateForm = () => {
    let valid = true
    const newErrors = { email: "", fullName: "" }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format"
      valid = false
    }

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      valid = false
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ email: "", fullName: "", roleName: "User" })
    setErrors({ email: "", fullName: "" })
    setModalOpen(true)
  }

  const openEdit = (acc: Account) => {
    setEditing(acc)
    setForm({ email: acc.email, fullName: acc.name, roleName: acc.role.name })
    setErrors({ email: "", fullName: "" })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      if (editing) {
        await updateAccount(editing.id, { email: form.email.trim(), name: form.fullName.trim(), roleId: ROLE_MAP[form.roleName] })
      } else {
        await createAccount({ email: form.email.trim(), password: DEFAULT_PASSWORD, name: form.fullName.trim(), roleId: ROLE_MAP[form.roleName] })
      }
      setModalOpen(false)
      await fetchAccounts()
    } catch (err: any) {
      if (err.response?.status === 409 || err.message?.toLowerCase().includes("exist")) {
        setErrors(prev => ({ ...prev, email: "This email is already registered." }))
      } else {
        console.error(err)
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id)
      setDeleteId(null)
      if (accounts.length <= 1 && currentPage > 1) setCurrentPage((p) => Math.max(1, p - 1))
      else await fetchAccounts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDisable = async (id: string) => {
    try {
      await deactivateAccount(id)
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, status: "Inactive" } : acc)))
    } catch (error) {
      console.error("Disable account failed", error)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateAccount(id)
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, status: "Active" } : acc)))
    } catch (error) {
      console.error("Activate account failed", error)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      await importAccounts(file)
      await fetchAccounts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportAccounts()
      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `accounts-export-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  const getRoleStyle = (roleName: string) => {
    switch (roleName.trim().toUpperCase()) {
      case "ADMIN": return { backgroundColor: "#F5EEF8", color: "#8E44AD" }
      case "USER": return { backgroundColor: "#EBF5FB", color: "#3498DB" }
      case "STAFF": return { backgroundColor: "#FEF5E7", color: "#F39C12" }
      case "PARTNER": return { backgroundColor: "#EAFAF1", color: "#2ECC71" }
      default: return { backgroundColor: "#f8fafc", color: "#475569" }
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-sm text-slate-500">Loading accounts...</div>

  const startIndex = (currentPage - 1) * itemsPerPage

  return (
    <div className="flex flex-col gap-6" onClick={() => setOpenFilter(null)}>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImportFile} />

      {/* Header Panel */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 mb-2 border-b border-transparent transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-full md:max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Search by name or email..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={openCreate} className="flex items-center gap-2 bg-[#5ab473] hover:bg-[#499A60] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors">
              <Plus size={18} /> <span className="text-sm">Create New Account</span>
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              <Upload size={18} /> Import
            </button>
            <button type="button" onClick={handleExport} className="flex items-center gap-2 border border-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              <Download size={18} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Section with Scroll */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-hidden flex flex-col max-h-[600px]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-center table-fixed min-w-[880px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="w-[6%] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">No.</th>
                <th className="w-[24%] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">Email</th>
                <th className="w-[18%] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">Name</th>
                <th className="w-[14%] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">
                  <FilterDropdown
                    label="Role"
                    value={roleFilter}
                    options={["Role", "Admin", "User", "Staff", "Partner"]}
                    isOpen={openFilter === "role"}
                    onChange={(val) => { setRoleFilter(val); setOpenFilter(null); setCurrentPage(1); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "role" ? null : "role"); }}
                  />
                </th>
                <th className="w-[12%] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc]">
                  <FilterDropdown
                    label="Status"
                    value={statusFilter}
                    options={["Status", "Active", "Inactive"]}
                    isOpen={openFilter === "status"}
                    onChange={(val) => { setStatusFilter(val); setOpenFilter(null); setCurrentPage(1); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status"); }}
                  />
                </th>
                <th
                  className="w-[26%] px-4 py-4 text-text-secondary text-sm font-semibold text-center border-b border-[#e7edf4] bg-[#f8fafc] sticky right-0 z-20"
                  style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}
                >Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account, index) => (
                  <tr key={account.id} className="hover:bg-[#f8fafc] transition-colors group">
                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4]">{startIndex + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary text-center border-b border-[#e7edf4] truncate">{account.email}</td>
                    <td className="px-4 py-3 font-medium text-text-main text-center border-b border-[#e7edf4] truncate">{account.name}</td>
                    <td className="px-4 py-3 text-center border-b border-[#e7edf4]">
                      <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase" style={getRoleStyle(account.role.name)}>{account.role.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center border-b border-[#e7edf4]">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${account.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        <span className="size-1.5 rounded-full bg-current"></span>{account.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center border-b border-[#e7edf4] sticky right-0 bg-white group-hover:bg-[#f8fafc] z-10 transition-colors" style={{ boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.06)" }}>
                      <div className="inline-flex items-center justify-center gap-2">
                        <Tooltip text="Edit"><button onClick={(e) => { e.stopPropagation(); openEdit(account); }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button></Tooltip>
                        <Tooltip text="Delete"><button onClick={(e) => { e.stopPropagation(); setDeleteId(account.id); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></Tooltip>
                        <ToggleSwitch initialState={account.status === "Active"} onChange={(state) => state ? handleActivate(account.id) : handleDisable(account.id)} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-text-secondary font-medium">No accounts found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-white sticky bottom-0">
          <span className="text-sm text-text-secondary">Showing {totalAccounts > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalAccounts)} of {totalAccounts} accounts</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded disabled:opacity-50">Previous</button>
            <span className="px-3 py-1 text-sm">Page {currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Modal Create/Edit */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-800">{editing ? "Edit Account" : "Create Account"}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-[#5ab473]/20 focus:border-[#5ab473]"}`}
                    placeholder="user@example.com"
                  />
                  {errors.email && <span className="text-red-500 text-[11px] font-medium">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setErrors({ ...errors, fullName: "" }); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${errors.fullName ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-[#5ab473]/20 focus:border-[#5ab473]"}`}
                    placeholder="Display name"
                  />
                  {errors.fullName && <span className="text-red-500 text-[11px] font-medium">{errors.fullName}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <select value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#5ab473]">
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl">Cancel</button>
                <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold text-white bg-[#5ab473] hover:bg-[#499A60] rounded-xl shadow-sm">
                  {editing ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-2xl p-6 flex flex-col gap-6 shadow-2xl items-center text-center">
              <div className="w-14 h-14 bg-red-100/80 text-red-600 rounded-full flex items-center justify-center"><Trash2 size={26} /></div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-xl text-slate-800">Delete account?</h3>
                <p className="text-sm text-slate-500">This action cannot be undone. User access will be revoked immediately.</p>
              </div>
              <div className="flex justify-center gap-3 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={() => deleteId && handleDelete(deleteId)} className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}