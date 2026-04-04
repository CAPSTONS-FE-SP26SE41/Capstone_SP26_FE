import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Plus, Search, ChevronDown } from "lucide-react"
import ToggleSwitch from "../../../components/ToggleSwitch"
import Modal from "../../../components/Modal"
import { useForm } from "react-hook-form"

import {
  getAccounts,
  filterAccounts,
  activateAccount,
  deactivateAccount,
  createAccount,
  importAccounts,
  exportAccounts
} from "../../../services/accountService"

// Route
export const Route = createFileRoute("/admin/_layout/accounts")({
  component: AccountsPage,
})

// Types
type Account = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: {
    id: string
    name: string
  }
  status: "Active" | "Inactive"
  createdAt: string
}

// Filter Dropdown component
function FilterDropdown({ label, value, options, onChange, isOpen, onToggle }: {
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
          {options.map(opt => (
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

// Main Component
function AccountsPage() {
  const itemsPerPage = 10

  // States
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

  // Create Account Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ name: string; email: string; password: string; role: "Admin" | "User" | "Staff" | "Partner" }>()

  // Import File
  const [importFile, setImportFile] = useState<File | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  // Fetch Accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      if (accounts.length === 0) setLoading(true)
      try {
        const trimmedKeyword = debouncedKeyword.trim()
        const hasSearch = trimmedKeyword.length >= 2
        const isFiltering = hasSearch || roleFilter !== "Role" || statusFilter !== "Status"

        let data
        if (isFiltering) {
          data = await filterAccounts({
            page: currentPage,
            pageSize: itemsPerPage,
            keyword: hasSearch ? trimmedKeyword : "",
            role: roleFilter,
            status: statusFilter
          })
        } else {
          data = await getAccounts(currentPage, itemsPerPage)
        }

        const listToMap = Array.isArray(data) ? data : (data?.items || data?.data || [])
        const _totalAccounts = data?.total || listToMap.length
        const _totalPages = data?.totalPages || Math.ceil(_totalAccounts / itemsPerPage)

        setTotalAccounts(_totalAccounts)
        setTotalPages(_totalPages)

        if (!Array.isArray(listToMap)) {
          console.error("Data is not array!", listToMap)
          setAccounts([])
          return
        }

        const formatted = listToMap.map((acc: any) => ({
          id: acc.id,
          name: acc.profile?.name || acc.name || acc.fullName || "User",
          email: acc.email,
          avatarUrl: acc.profile?.avtUrl || acc.avatarUrl || "",
          role: { id: acc.roleId || "", name: acc.roleName || "User" },
          status: acc.isActive ? "Active" : "Inactive",
          createdAt: acc.createdAt
        }))

        setAccounts(formatted)
      } catch (error) {
        console.error("Failed to fetch accounts", error)
      } finally {
        if (accounts.length === 0) setLoading(false)
      }
    }

    fetchAccounts()
  }, [currentPage, roleFilter, statusFilter, debouncedKeyword])

  // Toggle Status
  const handleDisable = async (id: string) => {
    try {
      await deactivateAccount(id)
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: "Inactive" } : acc))
    } catch (error) {
      console.error("Disable account failed", error)
    }
  }
  const handleActivate = async (id: string) => {
    try {
      await activateAccount(id)
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: "Active" } : acc))
    } catch (error) {
      console.error("Activate account failed", error)
    }
  }

  // Create Account
  const onCreateAccount = async (data: any) => {
    try {
      await createAccount(data)
      setShowCreateModal(false)
      reset()
      setCurrentPage(1)
      const updatedAccounts = await getAccounts(1, itemsPerPage)
      setAccounts(updatedAccounts?.items || [])
    } catch (error) {
      console.error("Create account failed", error)
    }
  }

  // Import Accounts
  const handleImport = async () => {
    if (!importFile) return
    try {
      await importAccounts(importFile)
      setImportFile(null)
      setCurrentPage(1)
      const updatedAccounts = await getAccounts(1, itemsPerPage)
      setAccounts(updatedAccounts?.items || [])
    } catch (error) {
      console.error("Import accounts failed", error)
    }
  }

  // Export Accounts
  const handleExport = async () => {
    try {
      const res = await exportAccounts()
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `accounts_${new Date().toISOString()}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export accounts failed", error)
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

  const startIndex = (currentPage - 1) * itemsPerPage

  if (loading) {
    return <div className="flex justify-center py-20 text-sm text-slate-500">Loading accounts...</div>
  }

  return (
    <div className="flex flex-col gap-6" onClick={() => setOpenFilter(null)}>

      {/* Filters & Actions */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm -mx-6 px-6 py-4 mb-2 border-b border-transparent transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="w-full md:max-w-md relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Search by name or email..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-[#5ab473] hover:bg-[#499A60] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors">
              <Plus size={18} /> Create
            </button>
            <input type="file" accept=".xlsx,.csv" onChange={e => e.target.files && setImportFile(e.target.files[0])} />
            <button onClick={handleImport} className="bg-[#3498DB] text-white px-3 py-1 rounded">Import</button>
            <button onClick={handleExport} className="bg-[#F39C12] text-white px-3 py-1 rounded">Export</button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#e7edf4]">
                <th className="px-6 py-4 text-text-secondary text-sm font-semibold">No.</th>
                <th className="px-6 py-4 text-text-secondary text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-text-secondary text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-text-secondary text-sm font-semibold">
                  <FilterDropdown
                    label="Role"
                    value={roleFilter}
                    options={["Role", "Admin", "User", "Staff", "Partner"]}
                    isOpen={openFilter === "role"}
                    onChange={val => { setRoleFilter(val); setOpenFilter(null); setCurrentPage(1) }}
                    onToggle={e => { e.stopPropagation(); setOpenFilter(openFilter === "role" ? null : "role") }}
                  />
                </th>
                <th className="px-6 py-4 text-text-secondary text-sm font-semibold">
                  <FilterDropdown
                    label="Status"
                    value={statusFilter}
                    options={["Status", "Active", "Inactive"]}
                    isOpen={openFilter === "status"}
                    onChange={val => { setStatusFilter(val); setOpenFilter(null); setCurrentPage(1) }}
                    onToggle={e => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status") }}
                  />
                </th>
                <th className="px-6 py-4 text-text-secondary text-sm font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7edf4]">
              {accounts.length > 0 ? accounts.map((acc, idx) => (
                <tr key={acc.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 text-sm">{startIndex + idx + 1}</td>
                  <td className="px-6 py-4 text-sm">{acc.email}</td>
                  <td className="px-6 py-4 text-sm font-medium">{acc.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase" style={getRoleStyle(acc.role.name)}>
                      {acc.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                      ${acc.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      <span className="size-1.5 rounded-full bg-current"></span>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <ToggleSwitch
                      initialState={acc.status === "Active"}
                      onChange={state => state ? handleActivate(acc.id) : handleDisable(acc.id)}
                    />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">group_off</span>
                      <p className="font-medium">No accounts found</p>
                      <p className="text-xs">Add a new account to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-white">
          <span className="text-sm text-text-secondary">
            Showing {accounts.length > 0 ? startIndex + 1 : 0} - {startIndex + accounts.length} of {totalAccounts} accounts
          </span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 text-sm border rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>Previous</button>
            <span className="px-3 py-1 text-sm">Page {currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-3 py-1 text-sm border rounded ${currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>Next</button>
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)} title="Create New Account">
          <form onSubmit={handleSubmit(onCreateAccount)} className="flex flex-col gap-4">
            <input {...register("name")} placeholder="Full Name" required className="px-3 py-2 border rounded" />
            <input {...register("email")} placeholder="Email" type="email" required className="px-3 py-2 border rounded" />
            <input {...register("password")} placeholder="Password" type="password" required className="px-3 py-2 border rounded" />
            <select {...register("role")} className="px-3 py-2 border rounded">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Partner">Partner</option>
            </select>
            <button type="submit" className="bg-[#5ab473] text-white px-4 py-2 rounded">Create</button>
          </form>
        </Modal>
      )}
    </div>
  )
}