import { Link, useNavigate } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { Edit2, Eye, Plus, Search, Trash2, Upload } from "lucide-react"

import {
  createStaffPOI,
  deleteStaffPOI,
  getStaffLocations,
  getStaffPOIById,
  getStaffPOIs,
  importStaffPOIsExcel,
  type StaffLocationOption,
  type StaffPOI,
  updateStaffPOI,
  exportStaffPOIsExcel,
} from "../../../services/poiService"

export const Route = createFileRoute("/staff/_layout/pois")({
  component: StaffPOIsPage,
})

const POI_PREFERENCES_OPTIONS: Array<{ id: string; name: string }> = [
  { id: "4b16bf5c-c699-4a61-880f-98460a2d4daa", name: "Adventure" },
  { id: "4eb0fdb5-105d-40bd-9f5e-2df53b8ad9db", name: "Budget" },
  { id: "37e3b490-ad00-432d-8e35-c3dbc019630f", name: "Culture" },
  { id: "2c109efa-8ceb-4c56-b5b9-a1a2c82c91a1", name: "Food" },
  { id: "b43e3fc0-234a-45f3-8e27-10124cee0ee8", name: "Indoor" },
  { id: "9b9159e1-1b60-4a12-9607-1bcf02da3e50", name: "Luxury" },
  { id: "ce454660-2991-42ea-800c-b6853da8ba2c", name: "Nature" },
  { id: "b41066e4-7857-4a3d-b92d-b7c2aa113334", name: "Nightlife" },
  { id: "7bb12f2c-567d-4bc2-a715-037b7a195dc1", name: "Outdoor" },
  { id: "2cc0a43b-4d97-4d3d-8a3d-02af16d8999d", name: "Relax" },
  { id: "ab4509fd-4b2c-4705-bed3-afed9f51af78", name: "Shopping" },
]

function StaffPOIsPage() {
  const navigate = useNavigate()
  const [pois, setPois] = useState<StaffPOI[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedPoi, setSelectedPoi] = useState<StaffPOI | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [locationOptions, setLocationOptions] = useState<StaffLocationOption[]>([])
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [createForm, setCreateForm] = useState({
    Name: "",
    Address: "",
    ApproxCost: "",
    OpenHour: "",
    CloseHour: "",
    GoogleMapLink: "",
    VisitRecommendation: "",
    IsIndoor: false,
    PoiPreferences: [] as Array<{ id: string; name: string }>,
    POIImgUrl: "",
    LocationId: "",
  })
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [editingPoiId, setEditingPoiId] = useState("")
  const [editForm, setEditForm] = useState({
    Name: "",
    Address: "",
    ApproxCost: "",
    OpenHour: "",
    CloseHour: "",
    GoogleMapLink: "",
    VisitRecommendation: "",
    IsIndoor: false,
    PoiPreferences: [] as Array<{ id: string; name: string }>,
    POIImgUrl: "",
    LocationId: "",
    Status: "",
    PartnerId: "",
  })

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
  }

  const resetCreateForm = () => {
    setCreateForm({
      Name: "",
      Address: "",
      ApproxCost: "",
      OpenHour: "",
      CloseHour: "",
      GoogleMapLink: "",
      VisitRecommendation: "",
      IsIndoor: false,
      PoiPreferences: [],
      POIImgUrl: "",
      LocationId: "",
    })
    setCreateImageFile(null)
  }

  useEffect(() => {
    const fetchPois = async () => {
      try {
        const data = await getStaffPOIs()
        setPois(data)
      } catch (e) {
        const status = (e as any)?.status
        console.error("Failed to fetch staff POIs", e)

        if (status === 401) {
          // Token hết hạn/không hợp lệ -> ép đăng nhập lại.
          localStorage.removeItem("manager_token")
          localStorage.removeItem("admin_token")
          navigate({ to: "/staff/login" })
          return
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPois()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [query, pageSize])

  const filteredPois = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pois

    return pois.filter((p) => {
      const haystack = [
        p.Name,
        p.ApproxCost,
        p.Address,
        String(p.Latitude),
        String(p.Longitude),
        p.IsIndoor ? "Trong nhà" : "Ngoài trời",
        p.LocationId,
        p.OpenHour,
        p.CloseHour,
        p.Is24Hours ? "24 giờ" : "",
        p.VisitRecommendation,
        p.ApproxCost,
        p.GoogleMapLink,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [pois, query])

  useEffect(() => {
    if (!showEditModal) {
      setEditImagePreviewUrl("")
      return
    }

    if (editImageFile) {
      const url = URL.createObjectURL(editImageFile)
      setEditImagePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }

    setEditImagePreviewUrl(editForm.POIImgUrl ?? "")
  }, [showEditModal, editImageFile, editForm.POIImgUrl])

  const fallbackLocationOptions = useMemo(() => {
    const seen = new Set<string>()
    return pois
      .map((p) => ({
        Id: String(p.LocationId ?? "").trim(),
        Name: String(p.LocationName ?? "").trim(),
      }))
      .filter((x) => {
        if (!x.Id || seen.has(x.Id)) return false
        seen.add(x.Id)
        return true
      })
  }, [pois])

  const mergedLocationOptions = useMemo(() => {
    const map = new Map<string, StaffLocationOption>()

    for (const loc of fallbackLocationOptions) {
      map.set(loc.Id, loc)
    }

    for (const loc of locationOptions) {
      if (!loc.Id) continue
      const existing = map.get(loc.Id)
      map.set(loc.Id, {
        Id: loc.Id,
        Name: loc.Name || existing?.Name || "",
      })
    }

    return Array.from(map.values())
  }, [fallbackLocationOptions, locationOptions])

  const totalPages = Math.max(1, Math.ceil(filteredPois.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const pagedPois = useMemo(() => {
    return filteredPois.slice(startIndex, startIndex + pageSize)
  }, [filteredPois, startIndex, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => {
      setToast(null)
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const successMessage = sessionStorage.getItem("staff_poi_success_message")
    if (successMessage) {
      showToast("success", successMessage)
      sessionStorage.removeItem("staff_poi_success_message")
    }
  }, [])

  useEffect(() => {
    if (!showCreateModal || locationOptions.length > 0 || loadingLocations) return

    const fetchLocations = async () => {
      try {
        setLoadingLocations(true)
        const data = await getStaffLocations()
        setLocationOptions(data)
      } catch (e) {
        console.error("Failed to fetch locations", e)
        showToast("error", "Không tải được danh sách location")
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [showCreateModal, locationOptions.length, loadingLocations])

  const handleDelete = async (poi: StaffPOI) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa POI "${poi.Name}"?`)
    if (!ok) return
    try {
      await deleteStaffPOI(poi.Id)
      setPois((prev) => prev.filter((x) => x.Id !== poi.Id))
      showToast("success", "Xóa POI thành công")
    } catch (e) {
      console.error("Failed to delete POI", e)
      showToast("error", "Xóa POI thất bại")
    }
  }

  const openDetailModal = async (poiId: string) => {
    try {
      const detail = await getStaffPOIById(poiId)
      if (!detail) {
        showToast("error", "Không tìm thấy POI")
        return
      }
      setSelectedPoi(detail)
    } catch (e) {
      console.error("Failed to fetch POI detail", e)
      const status = (e as any)?.status
      if (status === 401) {
        localStorage.removeItem("manager_token")
        localStorage.removeItem("admin_token")
        navigate({ to: "/staff/login" })
        return
      }
      showToast("error", "Không tải được chi tiết POI")
    }
  }

  const openEditModal = async (poiId: string) => {
    try {
      const detail = await getStaffPOIById(poiId)
      if (!detail) {
        showToast("error", "Không tìm thấy POI")
        return
      }

      const normalizedEditPrefs: Array<{ id: string; name: string }> = (() => {
        const raw = detail.PoiPreferences ?? []
        if (!Array.isArray(raw) || raw.length === 0) return []
        return raw
          .map((v) => String(v ?? "").trim())
          .filter(Boolean)
          .map((v) => {
            const byId = POI_PREFERENCES_OPTIONS.find((o) => o.id === v)
            if (byId) return byId
            const byName = POI_PREFERENCES_OPTIONS.find(
              (o) => o.name.toLowerCase() === v.toLowerCase()
            )
            if (byName) return byName
            // fallback: keep something visible/selectable
            return { id: v, name: v }
          })
      })()

      setEditingPoiId(detail.Id)
      setEditForm({
        Name: detail.Name ?? "",
        Address: detail.Address ?? "",
        ApproxCost: detail.ApproxCost ?? "",
        OpenHour: detail.OpenHour ?? "",
        CloseHour: detail.CloseHour ?? "",
        GoogleMapLink: detail.GoogleMapLink ?? "",
        VisitRecommendation: detail.VisitRecommendation ?? "",
        IsIndoor: Boolean(detail.IsIndoor),
        PoiPreferences: normalizedEditPrefs,
        POIImgUrl: detail.POIImgUrl ?? "",
        LocationId: detail.LocationId ?? "",
        Status: detail.Status !== undefined ? String(detail.Status) : "",
        PartnerId: detail.PartnerId ?? "",
      })
      setEditImageFile(null)
      setShowEditModal(true)
    } catch (e) {
      console.error("Failed to load POI for edit", e)
      const status = (e as any)?.status
      if (status === 401) {
        localStorage.removeItem("manager_token")
        localStorage.removeItem("admin_token")
        navigate({ to: "/staff/login" })
        return
      }
      showToast("error", "Không tải được dữ liệu chỉnh sửa")
    }
  }

  const visiblePages = useMemo(() => {
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }, [page, totalPages])

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!createForm.Name.trim()) {
      showToast("error", "Tên POI không được để trống")
      return
    }
    if (!createForm.LocationId.trim()) {
      showToast("error", "LocationId không được để trống")
      return
    }
    const isValidLocationId = mergedLocationOptions.some(
      (loc) => loc.Id === createForm.LocationId.trim()
    )
    if (!isValidLocationId) {
      showToast("error", "Vui lòng chọn LocationId hợp lệ từ danh sách")
      return
    }

    try {
      setCreating(true)
      await createStaffPOI({
        Name: createForm.Name.trim(),
        Address: createForm.Address.trim(),
        ApproxCost: createForm.ApproxCost.trim(),
        OpenHour: createForm.OpenHour.trim(),
        CloseHour: createForm.CloseHour.trim(),
        GoogleMapLink: createForm.GoogleMapLink.trim(),
        VisitRecommendation: createForm.VisitRecommendation.trim(),
        IsIndoor: createForm.IsIndoor,
        PoiPreferences: createForm.PoiPreferences.length
          ? createForm.PoiPreferences
          : undefined,
        LocationId: createForm.LocationId.trim(),
      }, createImageFile)

      const refreshedData = await getStaffPOIs()
      setPois(refreshedData)
      setShowCreateModal(false)
      resetCreateForm()
      showToast("success", "Tạo POI thành công")
    } catch (e) {
      console.error("Failed to create POI", e)
      const message = e instanceof Error ? e.message : String(e)
      if (message.includes("FK_pois_locations_LocationId")) {
        showToast("error", "LocationId không tồn tại trong hệ thống")
      } else {
        showToast("error", "Tạo POI thất bại")
      }
    } finally {
      setCreating(false)
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
      const message = await importStaffPOIsExcel(file)
      const refreshedData = await getStaffPOIs()
      setPois(refreshedData)
      showToast("success", message || "Import POIs thành công")
    } catch (e) {
      console.error("Failed to import POIs", e)
      showToast("error", "Import POIs thất bại")
    } finally {
      setImporting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPoiId) return

    if (!editForm.Name.trim()) {
      showToast("error", "Tên POI không được để trống")
      return
    }
    if (!editForm.LocationId.trim()) {
      showToast("error", "LocationId không được để trống")
      return
    }

    try {
      setEditing(true)
      await updateStaffPOI(editingPoiId, {
        Name: editForm.Name.trim(),
        Address: editForm.Address.trim(),
        ApproxCost: editForm.ApproxCost.trim(),
        OpenHour: editForm.OpenHour.trim(),
        CloseHour: editForm.CloseHour.trim(),
        GoogleMapLink: editForm.GoogleMapLink.trim(),
        VisitRecommendation: editForm.VisitRecommendation.trim(),
        IsIndoor: editForm.IsIndoor,
        PoiPreferences: editForm.PoiPreferences,
        POIImgUrl: editForm.POIImgUrl.trim(),
        LocationId: editForm.LocationId.trim(),
        Status: editForm.Status || undefined,
        PartnerId: editForm.PartnerId || undefined,
      }, editImageFile)

      const refreshedData = await getStaffPOIs()
      // Nếu backend lưu ảnh tại cùng 1 URL, browser có thể cache -> thêm query để luôn thấy ảnh mới
      const cacheBust = Date.now()
      const withCacheBust = (url: string) => {
        if (!url) return url
        const hasQuery = url.includes("?")
        return `${url}${hasQuery ? "&" : "?"}v=${cacheBust}`
      }

      setPois(
        editImageFile
          ? refreshedData.map((p) =>
            p.Id === editingPoiId && p.POIImgUrl
              ? { ...p, POIImgUrl: withCacheBust(p.POIImgUrl) }
              : p
          )
          : refreshedData
      )
      setShowEditModal(false)
      setEditingPoiId("")
      setEditImageFile(null)
      showToast("success", "Cập nhật POI thành công")
    } catch (e) {
      console.error("Failed to update POI", e)
      showToast("error", "Cập nhật POI thất bại")
    } finally {
      setEditing(false)
    }
  }

  const handleSelectEditImage = (file: File | null) => {
    if (!file) return
    setEditImageFile(file)
    showToast("success", `Đã chọn ảnh: ${file.name}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Quản lí POIs
          </h2>

        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <div className="relative w-full sm:w-[360px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200"
              placeholder="Tìm theo tên, địa chỉ..."
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Tạo mới
          </button>
          <label className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${importing
            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
            }`}>
            <Upload size={16} />
            {importing ? "Đang import..." : "Import Excel"}
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              disabled={importing}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                void handleImportFile(file)
                e.currentTarget.value = ""
              }}
            />
          </label>
          <button
            disabled={exporting}
            onClick={async () => {
              try {
                setExporting(true)
                await exportStaffPOIsExcel() // 👈 nhớ dùng đúng API POI
                showToast("success", "Export POIs thành công")
              } catch (e) {
                console.error(e)
                showToast("error", "Export POIs thất bại")
              } finally {
                setExporting(false)
              }
            }}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap ${exporting
                ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm"
              }`}
          >
            <span className="text-lg">⬇</span>
            {exporting ? "Đang export..." : "Export Excel"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Danh sách POIs
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {loading ? "Đang tải..." : `${filteredPois.length} POIs`}
            </p>
          </div>
          <Link
            to="/staff/pois"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold"
          >
            Làm mới
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải POIs...</div>
        ) : filteredPois.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            Không có POIs phù hợp với bộ lọc.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="max-h-[560px] overflow-y-auto">
                <table className="min-w-[880px] w-full table-auto border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="px-6 py-4 text-center w-16">STT</th>
                      <th className="px-6 py-4 text-center w-40">Tên</th>
                      <th className="px-6 py-4 text-center">Trong nhà</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {pagedPois.map((p, idx) => (
                      <tr
                        key={p.Id}
                        className="transition-shadow hover:shadow-[inset_0_0_0_2px_#3b82f6]"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap text-center">
                          {startIndex + idx + 1}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="font-medium text-slate-900 max-w-[180px] overflow-x-auto whitespace-nowrap mx-auto">
                            {p.Name}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${p.IsIndoor
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                          >
                            {p.IsIndoor ? "Trong nhà" : "Ngoài trời"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* Nút Xem Chi Tiết */}
                            <button
                              onClick={() => void openDetailModal(p.Id)}
                              title="Xem chi tiết"
                              className="flex items-center justify-center h-9 w-9 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                            >
                              <Eye size={18} />
                            </button>

                            {/* Nút Chỉnh Sửa */}
                            <button
                              onClick={() => void openEditModal(p.Id)}
                              title="Chỉnh sửa"
                              className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>

                            {/* Nút Xóa */}
                            <button
                              onClick={() => handleDelete(p)}
                              title="Xóa"
                              className="flex items-center justify-center h-9 w-9 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 size={18} />
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
                Trang{" "}
                <span className="font-semibold text-slate-800">
                  {page}
                </span>{" "}
                /{" "}
                <span className="font-semibold text-slate-800">
                  {totalPages}
                </span>{" "}
                • Tổng:{" "}
                <span className="font-semibold text-slate-800">
                  {filteredPois.length}
                </span>{" "}
                POIs
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
                    className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-colors ${p === page
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedPoi ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Chi tiết POI
              </h3>
              <button
                onClick={() => setSelectedPoi(null)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  {selectedPoi.POIImgUrl ? (
                    <img
                      src={selectedPoi.POIImgUrl}
                      alt={selectedPoi.Name}
                      className="w-full h-[280px] object-cover"
                    />
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                      Không có ảnh POI
                    </div>
                  )}
                </div>

                <dl className="grid grid-cols-1 gap-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Tên</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{selectedPoi.Name || "—"}</dd>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Địa chỉ</dt>
                    <dd className="mt-1 text-sm text-slate-800">{selectedPoi.Address || "—"}</dd>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Google Maps</dt>
                    <dd className="mt-1 text-sm text-slate-800 break-all">{selectedPoi.GoogleMapLink || "—"}</dd>
                  </div>
                </dl>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="border-b border-slate-100 pb-2 text-center">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Chi phí</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoi.ApproxCost || "—"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2 text-center">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Trong nhà</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoi.IsIndoor ? "Có" : "Không"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2 text-center">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Mở cửa</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoi.OpenHour || "—"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2 text-center">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Đóng cửa</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoi.CloseHour || "—"}</dd>
                </div>

                <div className="border-b border-slate-100 pb-2 text-center">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
                  <dd className="mt-1 text-sm text-slate-800 break-all">{selectedPoi.Status ?? "—"}</dd>
                </div>

                <div className="border-b border-slate-100 pb-2 text-center">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Latitude / Longitude</dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {Number.isFinite(selectedPoi.Latitude) ? selectedPoi.Latitude.toFixed(6) : "—"}
                    {" / "}
                    {Number.isFinite(selectedPoi.Longitude) ? selectedPoi.Longitude.toFixed(6) : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : null}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Tạo mới POI
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetCreateForm()
                }}
                className="h-9 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="p-6 max-h-[75vh] overflow-y-auto space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700">
                  Tên
                  <input
                    value={createForm.Name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, Name: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Name"
                    required
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Địa chỉ
                  <input
                    value={createForm.Address}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, Address: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Address"
                  />
                </label>


                <label className="text-sm text-slate-700">
                  Chi phí gần đúng
                  <input
                    value={createForm.ApproxCost}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        ApproxCost: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="ApproxCost"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Giờ mở cửa
                  <input
                    type="time"
                    value={createForm.OpenHour}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        OpenHour: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="OpenHour"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Giờ đóng cửa
                  <input
                    type="time"
                    value={createForm.CloseHour}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        CloseHour: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="CloseHour"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Google map link
                  <input
                    value={createForm.GoogleMapLink}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        GoogleMapLink: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="GoogleMapLink"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  VisitRecommendation
                  <input
                    value={createForm.VisitRecommendation}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        VisitRecommendation: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="VisitRecommendation"
                  />
                </label>

                <div className="text-sm text-slate-700">
                  <div>PoiPreferences</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {POI_PREFERENCES_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={createForm.PoiPreferences.some(
                            (x) => x.id === opt.id,
                          )}
                          onChange={(e) => {
                            setCreateForm((prev) => {
                              const exists = prev.PoiPreferences.some(
                                (x) => x.id === opt.id,
                              )
                              const next = e.target.checked
                                ? exists
                                  ? prev.PoiPreferences
                                  : [
                                    ...prev.PoiPreferences,
                                    { id: opt.id, name: opt.name },
                                  ]
                                : prev.PoiPreferences.filter(
                                  (x) => x.id !== opt.id,
                                )

                              return { ...prev, PoiPreferences: next }
                            })
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                        />
                        {opt.name}
                      </label>
                    ))}
                  </div>
                </div>

                <label className="text-sm text-slate-700">
                  LocationId
                  <select
                    value={createForm.LocationId}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        LocationId: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                    disabled={loadingLocations}
                  >
                    <option value="">
                      {loadingLocations
                        ? "Đang tải location..."
                        : "Chọn LocationId"}
                    </option>
                    {mergedLocationOptions.map((loc) => (
                      <option key={loc.Id} value={loc.Id}>
                        {loc.Name ? `${loc.Name} (${loc.Id})` : loc.Id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={createForm.IsIndoor}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, IsIndoor: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                IsIndoor
              </label>

              <div className="space-y-2">
                <label className="text-sm text-slate-700 block">
                  POIImgUrl
                  <input
                    value={createImageFile?.name ?? createForm.POIImgUrl}
                    readOnly
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                    placeholder="Chọn file ảnh"
                  />
                </label>

                <label className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 cursor-pointer hover:bg-slate-100">
                  <Upload size={16} />
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null
                      setCreateImageFile(file)
                    }}
                  />
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateForm()
                  }}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
                >
                  {creating ? "Đang tạo..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Chỉnh sửa POI
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPoiId("")
                }}
                className="h-9 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="p-6 max-h-[75vh] overflow-y-auto space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700">
                  Tên
                  <input
                    value={editForm.Name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, Name: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Địa chỉ
                  <input
                    value={editForm.Address}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, Address: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>


                <label className="text-sm text-slate-700">
                  Chi phí gần đúng
                  <input
                    value={editForm.ApproxCost}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        ApproxCost: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Giờ mở cửa
                  <input
                    type="time"
                    value={editForm.OpenHour}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, OpenHour: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Giờ đóng cửa
                  <input
                    type="time"
                    value={editForm.CloseHour}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, CloseHour: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Google map link
                  <input
                    value={editForm.GoogleMapLink}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        GoogleMapLink: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700 sm:col-span-2">
                  Gợi ý tham quan (VisitRecommendation)
                  <input
                    value={editForm.VisitRecommendation}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        VisitRecommendation: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="VD: Nên đi buổi sáng / mùa khô..."
                  />
                </label>

                <label className="text-sm text-slate-700">
                  LocationId
                  <select
                    value={editForm.LocationId}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        LocationId: e.target.value,
                      }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                    disabled={loadingLocations}
                  >
                    <option value="">
                      {loadingLocations
                        ? "Đang tải location..."
                        : "Chọn LocationId"}
                    </option>
                    {mergedLocationOptions.map((loc) => (
                      <option key={loc.Id} value={loc.Id}>
                        {loc.Name ? `${loc.Name} (${loc.Id})` : loc.Id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">PoiPreferences</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POI_PREFERENCES_OPTIONS.map((opt) => {
                    const checked = editForm.PoiPreferences.some((p) => p.id === opt.id)
                    return (
                      <label
                        key={opt.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const nextChecked = e.target.checked
                            setEditForm((prev) => {
                              const next = nextChecked
                                ? [...prev.PoiPreferences, opt]
                                : prev.PoiPreferences.filter((p) => p.id !== opt.id)
                              return { ...prev, PoiPreferences: next }
                            })
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                        />
                        <span className="truncate">{opt.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editForm.IsIndoor}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, IsIndoor: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                IsIndoor
              </label>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                {editImagePreviewUrl ? (
                  <img
                    src={editImagePreviewUrl}
                    alt={editForm.Name || "POI"}
                    className="w-full h-[220px] object-cover"
                  />
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                    Không có ảnh
                  </div>
                )}
              </div>

              <label className="text-sm text-slate-700 block">
                POIImgUrl
                <input
                  value={editImageFile?.name ?? editForm.POIImgUrl}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, POIImgUrl: e.target.value }))
                  }
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="POIImgUrl"
                />
              </label>

              <label className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 cursor-pointer hover:bg-slate-100">
                <Upload size={16} />
                Chọn ảnh mới
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleSelectEditImage(e.target.files?.[0] ?? null)
                    e.currentTarget.value = ""
                  }}
                />
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPoiId("")
                  }}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
                >
                  {editing ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={`fixed top-4 right-4 z-60 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${toast.type === "success"
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

export default StaffPOIsPage

