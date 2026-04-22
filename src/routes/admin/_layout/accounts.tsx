import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  Plus,
  Search,
  ChevronDown
} from "lucide-react"
import ToggleSwitch from "../../../components/ToggleSwitch"

import {
  getAccounts,
  deactivateAccount,
  activateAccount,
  filterAccounts
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
  const [totalPages, setTotalPages] = useState(1)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState("Vai trò")
  const [statusFilter, setStatusFilter] = useState("Trạng thái")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")
  const itemsPerPage = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchKeyword])

  useEffect(() => {
    const fetchAccounts = async () => {
      if (accounts.length === 0) {
        setLoading(true)
      }
      try {
        const trimmedKeyword = debouncedKeyword.trim()
        const hasSearch = trimmedKeyword.length >= 2
        const isFiltering = hasSearch || roleFilter !== "Vai trò" || statusFilter !== "Trạng thái"
        let data

        if (isFiltering) {
          data = await filterAccounts({
            page: currentPage,
            pageSize: itemsPerPage,
            keyword: hasSearch ? trimmedKeyword : "",
            role: roleFilter === "Vai trò" ? undefined : roleFilter,
            status: statusFilter === "Trạng thái" ? undefined : (statusFilter === "Đang hoạt động" ? "Active" : "Inactive")
          })

        } else {
          data = await getAccounts(currentPage, itemsPerPage)
        }
        
        console.log("Raw data from API:", data)

        // Phân loại data có dùng items (Backend list)
        const listToMap = Array.isArray(data) ? data : (data?.items || data?.data || [])
        
        // Setup pagination numbers tu server trả ra, nếu ko có thì fallback
        const _totalAccounts = data?.total || listToMap.length;
        const _totalPages = data?.totalPages || Math.ceil(_totalAccounts / itemsPerPage);
        
        setTotalAccounts(_totalAccounts)
        setTotalPages(_totalPages)

        if (!Array.isArray(listToMap)) {
           console.error("Data is still not an array! Check the console.")
           setAccounts([])
           return
        }

        const formatted = listToMap.map((acc: any) => ({
          id: acc.id,
          name: acc.profile?.name || acc.name || acc.fullName || "User",
          email: acc.email,
          avatarUrl: acc.profile?.avtUrl || acc.avatarUrl || "",
          role: {
            id: "",
            name: acc.roleName || "User"
          },
          status: (acc.isActive ? "Active" : "Inactive") as "Active" | "Inactive",
          createdAt: acc.createdAt
        }))

        setAccounts(formatted)

      } catch (error) {
        console.error("Failed to fetch accounts", error)
      } finally {
        if (accounts.length === 0) {
          setLoading(false)
        }
      }
    }

    fetchAccounts()
  }, [currentPage, roleFilter, statusFilter, debouncedKeyword])

  const handleDisable = async (id: string) => {
    try {
      await deactivateAccount(id)

      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, status: "Inactive" } : acc
        )
      )
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
    } catch (error) {
      console.error("Activate account failed", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500">
        Đang tải danh sách tài khoản...
      </div>
    )
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  // No slice here: Backend đã trả sẵn 1 page rồi
  const currentAccounts = accounts

  const getRoleStyle = (roleName: string) => {
    switch (roleName.trim().toUpperCase()) {
      case "ADMIN":
        return { backgroundColor: "#F5EEF8", color: "#8E44AD" }
      case "USER":
        return { backgroundColor: "#EBF5FB", color: "#3498DB" }
      case "MANAGER":
        return { backgroundColor: "#FEF5E7", color: "#F39C12" }
      case "PARTNER":
        return { backgroundColor: "#EAFAF1", color: "#2ECC71" }
      default:
        return { backgroundColor: "#f8fafc", color: "#475569" }
    }

  }

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
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Action Button */}
          <button className="flex items-center gap-2 bg-[#5ab473] hover:bg-[#499A60] text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors">
            <Plus size={18} />
            <span className="text-sm">Tạo tài khoản mới</span>
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-center">


            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#e7edf4]">
                <th className="px-6 py-4 text-text-secondary text-sm tracking-wider font-semibold text-left w-16">STT</th>
                <th className="px-6 py-4 text-text-secondary text-sm tracking-wider font-semibold text-left">Email</th>
                <th className="px-6 py-4 text-text-secondary text-sm tracking-wider font-semibold text-left min-w-[200px]">Họ tên</th>
                <th className="px-6 py-4 text-text-secondary text-sm tracking-wider font-semibold text-left">
                  <FilterDropdown
                    label="Vai trò"
                    value={roleFilter}
                    options={["Vai trò", "Admin", "User", "Manager", "Partner"]}


                    isOpen={openFilter === "role"}
                    onChange={(val) => { setRoleFilter(val); setOpenFilter(null); setCurrentPage(1); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "role" ? null : "role"); }}
                  />
                </th>
                <th className="px-6 py-4 text-text-secondary text-sm tracking-wider font-semibold text-left">
                  <FilterDropdown
                    label="Trạng thái"
                    value={statusFilter}
                    options={["Trạng thái", "Đang hoạt động", "Ngừng hoạt động"]}

                    isOpen={openFilter === "status"}
                    onChange={(val) => { setStatusFilter(val); setOpenFilter(null); setCurrentPage(1); }}
                    onToggle={(e) => { e.stopPropagation(); setOpenFilter(openFilter === "status" ? null : "status"); }}
                  />
                </th>
                <th className="px-6 py-4 text-text-secondary text-sm tracking-wider font-semibold text-right pr-6">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7edf4]">

              {currentAccounts.length > 0 ? (
                currentAccounts.map((account, index) => (

                  <tr key={account.id} className="hover:bg-[#F9FAFB] transition-colors">

                    {/* STT */}
                    <td className="px-6 py-4 text-sm text-text-secondary text-left">
                      {startIndex + index + 1}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-text-secondary text-left">
                      {account.email}
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 text-left">
                      <span className="font-medium text-text-main break-words block">
                        {account.name}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 text-left">
                      <span 
                        className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase"
                        style={getRoleStyle(account.role.name)}
                      >
                        {account.role.name}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-left">

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                        ${account.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                          }`}
                      >
                        <span className="size-1.5 rounded-full bg-current"></span>
                        {account.status === "Active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right pr-6">

                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <ToggleSwitch
                          initialState={account.status === "Active"}
                          onChange={(state) => {
                            if (state) {
                              handleActivate(account.id)
                            } else {
                              handleDisable(account.id)
                            }
                          }}
                        />
                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">

                    <div className="flex flex-col items-center justify-center gap-2">

                      <span className="material-symbols-outlined text-4xl text-slate-300">
                        group_off
                      </span>

                      <p className="font-medium">
                        Không tìm thấy tài khoản nào
                      </p>

                      <p className="text-xs">
                        Tạo tài khoản mới để bắt đầu
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
            Hiển thị {accounts.length > 0 ? startIndex + 1 : 0} - {startIndex + accounts.length} trong tổng số {totalAccounts} tài khoản
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
    </div>
  )
}