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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts()
        setAccounts(data)
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

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-text-main">
            Account Management
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            Manage administrator accounts
          </p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg">
          <Plus size={18} />
          Add Account
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

        <table className="w-full text-left">

          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Created</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-slate-50">

                {/* Name */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">

                    <img
                      src={account.avatarUrl ? account.avatarUrl : undefined}
                      className="h-10 w-10 rounded-full"
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        {account.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {account.email}
                      </p>
                    </div>

                  </div>
                </td>

                {/* Role */}
                <td className="px-8 py-5">
                  <span className="px-3 py-1 rounded bg-slate-100 text-xs">
                    {account.role.name}
                  </span>
                </td>

                {/* Status */}
                <td className="px-8 py-5">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${account.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                      }`}
                  >
                    {account.status}
                  </span>

                </td>

                {/* Created */}
                <td className="px-8 py-5 text-sm text-slate-500">
                  {new Date(account.createdAt).toLocaleDateString("en-GB")}
                </td>

                {/* Actions */}
                <td className="px-8 py-5 text-right relative">

                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu === account.id ? null : account.id
                      )
                    }
                    className="p-2 hover:bg-slate-100 rounded"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === account.id && (

                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-50">

                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50">
                        <Eye size={16} />
                        View Profile
                      </button>

                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50">
                        <Pencil size={16} />
                        Edit Account
                      </button>

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

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}