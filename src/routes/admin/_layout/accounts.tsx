import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  Plus,
  Search,
  Pencil,
  UserX,
  UserCheck,
  MoreVertical,
  ChevronDown
} from "lucide-react"

import {
  getAccounts,
  deactivateAccount,
  activateAccount,
} from "../../../services/accountService"

export const Route = createFileRoute("/admin/_layout/accounts")({
  component: AccountsPage,
})

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
              onClick={() => {
                onChange(opt)
              }}
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

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState("Role")
  const [statusFilter, setStatusFilter] = useState("Status")
  const itemsPerPage = 10

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts()

        const formatted = data.map((acc: any) => ({
          ...acc,
          status: acc.isActive ? "Active" : "Inactive"
        }))

        setAccounts(formatted)

      } catch (error) {
        console.error("Failed to fetch accounts", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleDisable = async (id: string) => {
    try {
      await deactivateAccount(id)

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, status: "Inactive" } : acc
        )
      )

      setOpenMenu(null)
    } catch (error) {
      console.error("Disable account failed", error)
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activateAccount(id)

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, status: "Active" } : acc
        )
      )

      setOpenMenu(null)
    } catch (error) {
      console.error("Activate account failed", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Loading accounts...
      </div>
    )
  }

  const totalPages = Math.ceil(accounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentAccounts = accounts.slice(startIndex, startIndex + itemsPerPage)

  const getRoleStyle = (roleName: string) => {
    switch (roleName.trim().toUpperCase()) {
      case "ADMIN":
        return { backgroundColor: "#F5EEF8", color: "#8E44AD" }
      case "USER":
        return { backgroundColor: "#EBF5FB", color: "#3498DB" }
      case "STAFF":
        return { backgroundColor: "#FEF5E7", color: "#F39C12" }
      case "PARTNER":
        return { backgroundColor: "#EAFAF1", color: "#2ECC71" }
      default:
        return { backgroundColor: "#f8fafc", color: "#475569" }
    }
  }

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
              placeholder="Search by name or email..."
            />
          </div>
        </div>

        {/* Action Button */}
        <button className="flex items-center gap-2 bg-[#5ab473] hover:bg-[#499A60] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors">
          <Plus size={18} />
          <span className="text-sm">Create New Account</span>
        </button>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">


            <thead>
              <tr className="bg-[#f8fafc] text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-[#e7edf4]">
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">
                  <FilterDropdown
                    label="Role"
                    value={roleFilter}
                    options={["Role", "Admin", "User", "Staff", "Partner"]}
                    isOpen={openFilter === "role"}
                    onChange={(val) => { setRoleFilter(val); setOpenFilter(null); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "role" ? null : "role"); setOpenMenu(null); }}
                  />
                </th>
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
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7edf4]">

              {currentAccounts.length > 0 ? (
                currentAccounts.map((account) => (

                  <tr key={account.id} className="hover:bg-[#f8fafc] transition-colors">

                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div
                          className="size-10 rounded-full bg-cover bg-center border border-slate-100"
                          style={{
                            backgroundImage: `url("${account.avatarUrl}")`
                          }}
                        ></div>

                        <div>
                          <p className="font-medium text-text-main">
                            {account.name}
                          </p>

                          <p className="text-xs text-text-secondary">
                            {account.email}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase"
                        style={getRoleStyle(account.role.name)}
                      >
                        {account.role.name}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                        ${account.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                          }`}
                      >
                        <span className="size-1.5 rounded-full bg-current"></span>
                        {account.status}
                      </span>

                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(account.createdAt).toLocaleDateString("en-GB")}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">

                      <div className="relative inline-block">

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenu(openMenu === account.id ? null : account.id)
                          }}
                          className="text-text-secondary hover:text-primary p-2 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === account.id && (

                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-32 bg-white border border-[#e7edf4] rounded-xl shadow-lg z-[999]">

                            <button
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>

                            {account.status === "Inactive" ? (
                              <button
                                onClick={() => handleActivate(account.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <UserCheck size={16} />
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDisable(account.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <UserX size={16} />
                                Deactive
                              </button>
                            )}

                          </div>

                        )}

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">

                    <div className="flex flex-col items-center justify-center gap-2">

                      <span className="material-symbols-outlined text-4xl text-slate-300">
                        group_off
                      </span>

                      <p className="font-medium">
                        No accounts found
                      </p>

                      <p className="text-xs">
                        Add a new account to get started
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
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, accounts.length)} of {accounts.length} accounts
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
    </div>
  )
}