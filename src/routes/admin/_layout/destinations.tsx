import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Edit2, Eye, Plus, Search, Trash2, Upload, X, MapPin } from "lucide-react"

import {
  createStaffLocation,
  deleteStaffLocation,
  getStaffLocationById,
  getStaffLocationsList,
  importStaffLocationsExcel,
  type StaffLocation,
  updateStaffLocation,
} from "../../../services/poiService"
import {
  getDistrictsByLocationId,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  type District,
} from "../../../services/partnerPoiService"

export const Route = createFileRoute("/admin/_layout/destinations")({
  component: AdminDestinations,
})

function AdminDestinations() {
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

  // District state
  const [showDistrictModal, setShowDistrictModal] = useState(false)
  const [selectedLocForDistrict, setSelectedLocForDistrict] = useState<StaffLocation | null>(null)
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [districtNameInput, setDistrictNameInput] = useState("")
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null)
  const [editingDistrictName, setEditingDistrictName] = useState("")
  const [savingDistrict, setSavingDistrict] = useState(false)

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

  const openDistrictModal = async (loc: StaffLocation) => {
    setSelectedLocForDistrict(loc)
    setShowDistrictModal(true)
    setLoadingDistricts(true)
    setDistrictNameInput("")
    setEditingDistrict(null)
    try {
      const data = await getDistrictsByLocationId(loc.LocationId)
      setDistricts(data)
    } catch (e) {
      console.error("Failed to fetch districts", e)
      showToast("error", "Không tải được danh sách quận huyện")
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleCreateDistrict = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedLocForDistrict) return
    const name = districtNameInput.trim()
    if (!name) {
      showToast("error", "Tên quận huyện không được để trống")
      return
    }

    try {
      setSavingDistrict(true)
      const newD = await createDistrict(name, selectedLocForDistrict.LocationId)
      setDistricts((prev) => [...prev, newD])
      setDistrictNameInput("")
      showToast("success", "Thêm quận huyện thành công")
    } catch (e) {
      console.error("Failed to create district", e)
      showToast("error", "Thêm quận huyện thất bại")
    } finally {
      setSavingDistrict(false)
    }
  }

  const handleUpdateDistrict = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedLocForDistrict || !editingDistrict) return
    const name = editingDistrictName.trim()
    if (!name) {
      showToast("error", "Tên quận huyện không được để trống")
      return
    }

    try {
      setSavingDistrict(true)
      const updated = await updateDistrict(editingDistrict.id, name, selectedLocForDistrict.LocationId)
      setDistricts((prev) => prev.map((d) => (d.id === editingDistrict.id ? updated : d)))
      setEditingDistrict(null)
      setEditingDistrictName("")
      showToast("success", "Cập nhật quận huyện thành công")
    } catch (e) {
      console.error("Failed to update district", e)
      showToast("error", "Cập nhật quận huyện thất bại")
    } finally {
      setSavingDistrict(false)
    }
  }

  const handleDeleteDistrict = async (district: District) => {
    const ok = window.confirm(`Bạn có chắc chắn muốn xóa quận huyện "${district.name}"?`)
    if (!ok) return

    try {
      await deleteDistrict(district.id)
      setDistricts((prev) => prev.filter((d) => d.id !== district.id))
      showToast("success", "Xóa quận huyện thành công")
    } catch (e) {
      console.error("Failed to delete district", e)
      showToast("error", "Xóa quận huyện thất bại")
    }
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
        showToast("error", "Không tìm thấy địa điểm")
        return
      }
      setSelectedLocation(data)
      setShowDetailModal(true)
    } catch (e) {
      console.error("Failed to fetch location detail", e)
      showToast("error", "Không tải được chi tiết địa điểm")
    }
  }

  const openEdit = async (locationId: string) => {
    try {
      const data = await getStaffLocationById(locationId)
      if (!data) {
        showToast("error", "Không tìm thấy địa điểm")
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
      showToast("error", "Không tải được dữ liệu địa điểm")
    }
  }

  const submitCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const latitude = Number(form.Latitude)
    const longitude = Number(form.Longitude)

    if (!form.LocationName.trim()) {
      showToast("error", "Tên địa điểm không được để trống")
      return
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      showToast("error", "Kinh độ/Vĩ độ không hợp lệ")
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
      showToast("success", "Tạo địa điểm thành công")
    } catch (e) {
      console.error("Failed to create location", e)
      showToast("error", "Tạo địa điểm thất bại")
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
      showToast("error", "Tên địa điểm không được để trống")
      return
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      showToast("error", "Kinh độ/Vĩ độ không hợp lệ")
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
      showToast("success", "Cập nhật địa điểm thành công")
    } catch (e) {
      console.error("Failed to update location", e)
      showToast("error", "Cập nhật địa điểm thất bại")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (location: StaffLocation) => {
    const ok = window.confirm(
      `Bạn có chắc muốn xóa địa điểm này? "${location.LocationName}"?`
    )
    if (!ok) return

    try {
      await deleteStaffLocation(location.LocationId)
      setLocations((prev) =>
        prev.filter((x) => x.LocationId !== location.LocationId)
      )
      showToast("success", "Xóa địa điểm thành công")
    } catch (e) {
      console.error("Failed to delete location", e)
      showToast("error", "Xóa địa điểm thất bại")
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
      showToast("success", message || "Import danh sách địa điểm thành công")
    } catch (e) {
      console.error("Failed to import locations", e)
      showToast("error", "Import danh sách địa điểm thất bại")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#258cf4] transition-all border border-slate-200"
            placeholder="Tìm theo ID, tên, tọa độ..."
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#258cf4] hover:bg-[#1d72cb] text-white text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
        >
          <Plus size={16} />
          Tạo mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-900">Danh sách Tỉnh thành / Địa điểm</p>
          <p className="text-xs text-slate-500 mt-1">
            {loading ? "Đang tải..." : `${filteredLocations.length} địa điểm`}
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải địa điểm...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            Không có địa điểm phù hợp với bộ lọc
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="max-h-[560px] overflow-y-auto">
                <table className="min-w-[1000px] w-full table-auto border-collapse">
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
                        <td className="px-6 py-4 text-sm text-slate-800 break-words font-medium">
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
                              onClick={() => openEdit(loc.LocationId)}
                              className="group relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            >
                              <Edit2 size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                Chỉnh sửa
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>

                            <button
                              onClick={() => openDistrictModal(loc)}
                              className="group relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                            >
                              <MapPin size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                Quản lý quận huyện
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
                <span className="font-semibold text-slate-800">{totalPages}</span> • Tổng:{" "}
                <span className="font-semibold text-slate-800">
                  {filteredLocations.length}
                </span>{" "}
                địa điểm
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm px-3 outline-none focus:ring-2 focus:ring-[#258cf4]"
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
                        ? "bg-[#258cf4] border-[#258cf4] text-white"
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
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Tạo mới địa điểm</h3>
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
              <label className="text-sm text-slate-700 block font-semibold">
                Tên địa điểm / Tỉnh thành
                <input
                  value={form.LocationName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, LocationName: e.target.value }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none font-normal focus:ring-2 focus:ring-[#258cf4]/30 focus:border-[#258cf4]"
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700 block font-semibold">
                  Vĩ độ (Latitude)
                  <input
                    type="number"
                    step="any"
                    value={form.Latitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Latitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none font-normal focus:ring-2 focus:ring-[#258cf4]/30 focus:border-[#258cf4]"
                    required
                  />
                </label>
                <label className="text-sm text-slate-700 block font-semibold">
                  Kinh độ (Longitude)
                  <input
                    type="number"
                    step="any"
                    value={form.Longitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Longitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none font-normal focus:ring-2 focus:ring-[#258cf4]/30 focus:border-[#258cf4]"
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
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-4 rounded-xl bg-[#258cf4] hover:bg-[#1d72cb] text-white font-semibold disabled:opacity-60"
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
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Chỉnh sửa địa điểm</h3>
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
              <label className="text-sm text-slate-700 block font-semibold">
                Tên địa điểm
                <input
                  value={form.LocationName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, LocationName: e.target.value }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none font-normal focus:ring-2 focus:ring-[#258cf4]/30 focus:border-[#258cf4]"
                  required
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700 block font-semibold">
                  Vĩ độ
                  <input
                    type="number"
                    step="any"
                    value={form.Latitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Latitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none font-normal focus:ring-2 focus:ring-[#258cf4]/30 focus:border-[#258cf4]"
                    required
                  />
                </label>
                <label className="text-sm text-slate-700 block font-semibold">
                  Kinh độ
                  <input
                    type="number"
                    step="any"
                    value={form.Longitude}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Longitude: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none font-normal focus:ring-2 focus:ring-[#258cf4]/30 focus:border-[#258cf4]"
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
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-4 rounded-xl bg-[#258cf4] hover:bg-[#1d72cb] text-white font-semibold disabled:opacity-60"
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
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Chi tiết địa điểm</h3>
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
                  <dt className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Mã địa điểm (ID)
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800 break-all select-all font-mono">
                    {selectedLocation.LocationId}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Tên địa điểm
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800 font-medium">
                    {selectedLocation.LocationName}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Vĩ độ (Latitude)
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {selectedLocation.Latitude}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Kinh độ (Longitude)
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

      {showDistrictModal && selectedLocForDistrict ? (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#258cf4] flex items-center justify-center border border-blue-100/50 shadow-inner">
                  <MapPin size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Quản lý Quận/Huyện</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-400">Tỉnh thành:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50/80 text-[#258cf4] border border-blue-100/30">
                      {selectedLocForDistrict.LocationName}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDistrictModal(false)
                  setSelectedLocForDistrict(null)
                  setDistricts([])
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200/50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Form to add district */}
              <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-2xl">
                <form onSubmit={handleCreateDistrict} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      value={districtNameInput}
                      onChange={(e) => setDistrictNameInput(e.target.value)}
                      placeholder="Nhập tên quận/huyện mới..."
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-[#258cf4]/20 focus:border-[#258cf4] text-sm transition-all placeholder:text-slate-400"
                      disabled={savingDistrict}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingDistrict}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#258cf4] hover:bg-[#1d72cb] text-white text-sm font-semibold transition-all shadow-sm shadow-blue-100 hover:shadow-md hover:shadow-blue-200/50 active:scale-[0.98] disabled:opacity-60"
                  >
                    <Plus size={16} />
                    Thêm mới
                  </button>
                </form>
              </div>

              {/* Districts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    Danh sách quận huyện
                  </p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {districts.length} đơn vị
                  </span>
                </div>
                
                {loadingDistricts ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                    <div className="h-6 w-6 border-2 border-[#258cf4] border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                ) : districts.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                    <MapPin size={24} className="text-slate-300" />
                    <span>Chưa có quận/huyện nào được tạo.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white max-h-[300px] overflow-y-auto shadow-sm shadow-slate-100/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {districts.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors group">
                        {editingDistrict?.id === d.id ? (
                          <form onSubmit={handleUpdateDistrict} className="flex-1 flex gap-2 mr-2">
                            <input
                              value={editingDistrictName}
                              onChange={(e) => setEditingDistrictName(e.target.value)}
                              className="flex-1 h-9 px-3 rounded-xl border border-[#258cf4] bg-white outline-none focus:ring-2 focus:ring-[#258cf4]/20 text-sm"
                              required
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={savingDistrict}
                              className="h-9 px-3.5 rounded-xl bg-[#258cf4] text-white text-xs font-semibold hover:bg-[#1d72cb] transition-colors shadow-sm active:scale-[0.98]"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDistrict(null)
                                setEditingDistrictName("")
                              }}
                              className="h-9 px-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                            >
                              Hủy
                            </button>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-[#258cf4] transition-colors"></div>
                              <span className="text-sm font-semibold text-slate-700">{d.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDistrict(d)
                                  setEditingDistrictName(d.name)
                                }}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100/50 transition-all"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDistrict(d)}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100/50 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed top-4 left-0 right-0 flex justify-center pointer-events-none z-[9999]">
          <div
            className={`pointer-events-auto px-5 py-3 rounded-2xl border shadow-xl text-sm font-semibold flex items-center gap-2.5 backdrop-blur-md max-w-[90vw] ${
              toast.type === "success"
                ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/60 shadow-emerald-100/50"
                : "bg-rose-50/90 text-rose-800 border-rose-200/60 shadow-rose-100/50 animate-toast-shake"
            }`}
          >
            {toast.type === "error" ? (
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminDestinations