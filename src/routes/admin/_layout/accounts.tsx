import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  UserX,
  UserCheck,
} from "lucide-react"

import {
  getAccounts,
  deactivateAccount,
  activateAccount,
} from "../../../services/accountService"

export const Route = createFileRoute("/admin/_layout/accounts")({
  component: AccountsPage,
})

type Account = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: {
    id: string
    name: string
  }
  status: "Active" | "Suspended"
  createdAt: string
}

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts()

        const formatted = data.map((acc: any) => ({
          ...acc,
          status: acc.isActive ? "Active" : "Suspended"
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
          acc.id === id ? { ...acc, status: "Suspended" } : acc
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

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            Account Management
          </h2>

          <p className="text-text-secondary">
            Manage administrator accounts
          </p>
        </div>


      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm ">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">


            <thead>
              <tr className="bg-[#f8fafc] text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-[#e7edf4]">
                <th className="px-8 py-4">Name</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Created</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e7edf4]">

              {accounts.length > 0 ? (
                accounts.map((account) => (

                  <tr key={account.id} className="hover:bg-[#f8fafc] transition-colors">

                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div
                          className="size-10 rounded-full bg-cover bg-center"
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
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
                          className="text-text-secondary hover:text-primary p-2"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === account.id && (

                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-40 bg-white border border-[#e7edf4] rounded-xl shadow-lg z-[999]">

                            <button
                              onClick={() => handleActivate(account.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                            >
                              <UserCheck size={16} />
                              Activate
                            </button>

                            <button
                              onClick={() => handleDisable(account.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <UserX size={16} />
                              Disable
                            </button>

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