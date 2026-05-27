import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Edit2, Eye, Plus, Search, Trash2, Upload, X } from "lucide-react"

import {
  createStaffLocation,
  deleteStaffLocation,
  getStaffLocationById,
  getStaffLocationsList,
  importStaffLocationsExcel,
  type StaffLocation,
  updateStaffLocation,
} from "../../../services/poiService"

export const Route = createFileRoute("/staff/_layout/locations")({
  component: StaffLocationsPage,
})

function StaffLocationsPage() {
  const [locations, setLocations] = useState<StaffLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<StaffLocation | null>(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [form, setForm] = useState({
    LocationName: "",
    Latitude: "",
    Longitude: "",
  })

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
  }

  const resetForm = () => {
    setForm({
      LocationName: "",
      Latitude: "",
      Longitude: "",
    })
  }

  const reloadLocations = async () => {
    const data = await getStaffLocationsList()
    setLocations(data)
  }

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        await reloadLocations()
      } catch (e) {
        console.error("Failed to fetch locations", e)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    setPage(1)
  }, [query, pageSize])

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) =>
      [l.LocationId, l.LocationName, String(l.Latitude), String(l.Longitude)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [locations, query])

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const pagedLocations = useMemo(() => {
    return filteredLocations.slice(startIndex, startIndex + pageSize)
  }, [filteredLocations, startIndex, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  const openDetail = async (locationId: string) => {
    try {
      const data = await getStaffLocationById(locationId)
      if (!data) {
        showToast("error", "Không tìm thấy location")
        return
      }
      setSelectedLocation(data)
      setShowDetailModal(true)
    } catch (e) {
      console.error("Failed to fetch location detail", e)
      showToast("error", "Không tải được chi tiết location")
    }
  }

  const openEdit = async (locationId: string) => {
    try {
      const data = await getStaffLocationById(locationId)
      if (!data) {
        showToast("error", "Không tìm thấy location")
        return
      }
      setSelectedLocation(data)
      setForm({
        LocationName: data.LocationName ?? "",
        Latitude: String(data.Latitude ?? ""),
        Longitude: String(data.Longitude ?? ""),
      })
      setShowEditModal(true)
    } catch (e) {
      console.error("Failed to fetch location", e)
      showToast("error", "Không tải được dữ liệu")
    }
  }

  const submitCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const latitude = Number(form.Latitude)
    const longitude = Number(form.Longitude)

    if (!form.LocationName.trim()) {
      showToast("error", "LocationName không được để trống")
      return
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      showToast("error", "Latitude/Longitude không hợp lệ")
      return
    }

    try {
      setSaving(true)
      await createStaffLocation({
        LocationName: form.LocationName.trim(),
        Latitude: latitude,
        Longitude: longitude,
      })
      await reloadLocations()
      setShowCreateModal(false)
      resetForm()
      showToast("success", "Tạo location thành công")
    } catch (e) {
      console.error("Failed to create location", e)
      showToast("error", "Tạo location thất bại")
    } finally {
      setSaving(false)
    }
  }

  const submitEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedLocation) return

    const latitude = Number(form.Latitude)
    const longitude = Number(form.Longitude)

    if (!form.LocationName.trim()) {
      showToast("error", "LocationName không được để trống")
      return
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      showToast("error", "Latitude/Longitude không hợp lệ")
      return
    }

    try {
      setSaving(true)
      await updateStaffLocation(selectedLocation.LocationId, {
        LocationName: form.LocationName.trim(),
        Latitude: latitude,
        Longitude: longitude,
      })
      await reloadLocations()
      setShowEditModal(false)
      setSelectedLocation(null)
      resetForm()
      showToast("success", "Cập nhật location thành công")
    } catch (e) {
      console.error("Failed to update location", e)
      showToast("error", "Cập nhật location thất bại")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (location: StaffLocation) => {
    const ok = window.confirm(
      `Bạn có chắc muốn xóa location này ? "${location.LocationName}"?`
    )
    if (!ok) return

    try {
      await deleteStaffLocation(location.LocationId)
      setLocations((prev) =>
        prev.filter((x) => x.LocationId !== location.LocationId)
      )
      showToast("success", "Xóa location thành công")
    } catch (e) {
      console.error("Failed to delete location", e)
      showToast("error", "Xóa location thất bại")
    }
  }

  const handleImportFile = async (file: File | null) => {
    if (!file) return

    const lowerName = file.name.toLowerCase()
    const isExcel = lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")
    if (!isExcel) {
      showToast("error", "Chỉ hỗ trợ file Excel (.xlsx hoặc .xls)")
      return
    }

    try {
      setImporting(true)
      const message = await importStaffLocationsExcel(file)
      await reloadLocations()
      showToast("success", message || "Import locations thành công")
    } catch (e) {
      console.error("Failed to import locations", e)
      showToast("error", "Import locations thất bại")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      {/* Removed Title */}

        <div className="w-full sm:w-auto flex items-center gap-2">
          <div className="relative w-full sm:w-[360px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200"
              placeholder="Tim theo id, tên, tọa độ..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-900">Danh sách Locations</p>
          <p className="text-xs text-slate-500 mt-1">
            {loading ? "Đang tải..." : `${filteredLocations.length} locations`}
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Dang tai dia diem...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
          Không có Location phù hợp với bộ lọc
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="max-h-[560px] overflow-y-auto">
                <table className="min-w-[1100px] w-full table-auto border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="px-6 py-4 text-left w-16">STT</th>
                      <th className="px-6 py-4 text-left min-w-[320px]">Tên địa điểm</th>
                      <th className="px-6 py-4 text-left">Vĩ độ</th>
                      <th className="px-6 py-4 text-left">Kinh độ</th>
                      <th className="px-6 py-4 text-right pr-12">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pagedLocations.map((loc, idx) => (
                      <tr
                        key={loc.LocationId}
                        className="hover:bg-slate-100 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 break-words">
                          {loc.LocationName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {Number.isFinite(loc.Latitude) ? loc.Latitude.toFixed(6) : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {Number.isFinite(loc.Longitude)
                            ? loc.Longitude.toFixed(6)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDetail(loc.LocationId)}
                              className="group relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors"
                            >
                              <Eye size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                Xem chi tiết
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>

                            <button
                              onClick={() => handleDelete(loc)}
                              className="group relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                            >
                              <Trash2 size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                Xóa
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                Trang <span className="font-semibold text-slate-800">{page}</span> /{" "}
                <span className="font-semibold text-slate-800">{totalPages}</span> • Tong:{" "}
                <span className="font-semibold text-slate-800">
                  {filteredLocations.length}
                </span>{" "}
                locations
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm px-3 outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>

                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Trước
                </button>

                {visiblePages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-colors ${
                      p === page
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Tạo mới Location</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitCreate} className="p-6 space-y-4">
              <label className="text-sm text-slate-700 block">
                Tên địa điểm
                <input
                  value={form.LocationName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, LocationName: e.target.value }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700 block">
                  Vĩ độ
                  <input
                    type="number"
                    step="any"
                    value={form.Latitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Latitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </label>
                <label className="text-sm text-slate-700 block">
                  Kinh độ
                  <input
                    type="number"
                    step="any"
                    value={form.Longitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Longitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
                >
                  {saving ? "Đang tạo..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal && selectedLocation ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Chỉnh sửa Location</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedLocation(null)
                  resetForm()
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEdit} className="p-6 space-y-4">
              <label className="text-sm text-slate-700 block">
                LocationName
                <input
                  value={form.LocationName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, LocationName: e.target.value }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700 block">
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={form.Latitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Latitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </label>
                <label className="text-sm text-slate-700 block">
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={form.Longitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Longitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedLocation(null)
                    resetForm()
                  }}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
                >
                  {saving ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDetailModal && selectedLocation ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Chi tiết Location</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedLocation(null)
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Location Id
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800 break-all">
                    {selectedLocation.LocationId}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Tên địa điểm
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {selectedLocation.LocationName}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Vĩ độ
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {selectedLocation.Latitude}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">
                    Kinh độ
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {selectedLocation.Longitude}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  )
}

export default StaffLocationsPage
