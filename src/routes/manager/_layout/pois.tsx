import { Link, useNavigate } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { Edit2, Eye, Plus, Search, Trash2, Upload, X, ImageIcon, Tag, MapPin, Clock, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  inactivateStaffPOI,
  activateStaffPOI,
} from "../../../services/poiService"
import { getDistrictsByLocationId, getPreferences, type District, type POIPreference, getPOITypes, type POIType, type POITypeOption } from "../../../services/partnerPoiService"
import { CustomSelect } from "../../../components/ui/CustomSelect"

export const Route = createFileRoute("/manager/_layout/pois")({
  component: StaffPOIsPage,
})


const MAX_PREFERENCES = 4

function StaffPOIsPage() {
  const navigate = useNavigate()
  const [pois, setPois] = useState<StaffPOI[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedCityId, setSelectedCityId] = useState("")
  const [filterType, setFilterType] = useState<"system" | "partner">("system")
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
  const [locationOptions, setLocationOptions] = useState<StaffLocationOption[]>([])
  const [preferencesList, setPreferencesList] = useState<POIPreference[]>([])
  const [loadingPreferences, setLoadingPreferences] = useState(false)
  const [poiTypesList, setPoiTypesList] = useState<POITypeOption[]>([])
  const [loadingPoiTypes, setLoadingPoiTypes] = useState(false)
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
    PoiPreferences: [] as string[],
    POIImgUrl: "",
    LocationId: "",
    DistrictId: "",
    Type: "Attraction" as POIType,
  })

  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [createImagePreviewUrl, setCreateImagePreviewUrl] = useState<string>("")
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
    DistrictId: "",
    Status: "",
    PartnerId: "",
    Type: "Attraction" as POIType,
  })


  const [districts, setDistricts] = useState<District[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [formErrors, setFormErrors] = useState<{ districtId?: string }>({})
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null)

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
      PoiPreferences: [] as string[],
      POIImgUrl: "",
      LocationId: "",
      DistrictId: "",
      Type: "Attraction" as POIType,
    })

    setDistricts([])
    setFormErrors({})
    setCreateImageFile(null)
    setCreateImagePreviewUrl("")
  }

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoadingPreferences(true)
      try {
        const data = await getPreferences()
        setPreferencesList(data)
      } catch (e) {
        console.error("Failed to fetch preferences", e)
      } finally {
        setLoadingPreferences(false)
      }
    }
    const fetchPoiTypes = async () => {
      setLoadingPoiTypes(true)
      try {
        const data = await getPOITypes()
        setPoiTypesList(data)
      } catch (e) {
        console.error("Failed to fetch POI types", e)
      } finally {
        setLoadingPoiTypes(false)
      }
    }
    fetchPreferences()
    fetchPoiTypes()
  }, [])

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
          navigate({ to: "/manager/login" })
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
  }, [query, pageSize, filterType, selectedCityId])

  const filteredPois = useMemo(() => {
    // 1. Lọc theo filterType trước
    let result = pois
    if (filterType === "system") {
      result = pois.filter((p) => !p.PartnerId)
    } else if (filterType === "partner") {
      result = pois.filter((p) => !!p.PartnerId)
    }

    // Lọc theo thành phố
    if (selectedCityId) {
      result = result.filter((p) => String(p.LocationId) === selectedCityId)
    }

    // 2. Sau đó lọc theo query tìm kiếm
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((p) => {
        const haystack = [
          p.Id,
          p.Name,
          p.LocationName,
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
    }

    // Sắp xếp theo thứ tự chữ cái alphabet tiếng Việt (tránh phân biệt chữ hoa thường)
    return [...result].sort((a, b) => a.Name.localeCompare(b.Name, "vi", { sensitivity: "base" }))
  }, [pois, query, filterType, selectedCityId])

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

  useEffect(() => {
    if (!showCreateModal) {
      setCreateImagePreviewUrl("")
      return
    }

    if (createImageFile) {
      const url = URL.createObjectURL(createImageFile)
      setCreateImagePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }

    setCreateImagePreviewUrl("")
  }, [showCreateModal, createImageFile])

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
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true)
        const data = await getStaffLocations()
        setLocationOptions(data)
      } catch (e) {
        console.error("Failed to fetch locations", e)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    const locId = showCreateModal ? createForm.LocationId : (showEditModal ? editForm.LocationId : null)
    if (!locId) {
      setDistricts([])
      return
    }
    const fetchDistricts = async () => {
      setLoadingDistricts(true)
      try {
        const data = await getDistrictsByLocationId(locId)
        setDistricts(data)
        if (showCreateModal && createForm.DistrictId && !data.some(d => d.id === createForm.DistrictId)) {
          setCreateForm(prev => ({ ...prev, DistrictId: "" }))
        }
        if (showEditModal && editForm.DistrictId && !data.some(d => d.id === editForm.DistrictId)) {
          setEditForm(prev => ({ ...prev, DistrictId: "" }))
        }
      } catch (e) {
        console.error("Failed to fetch districts", e)
      } finally {
        setLoadingDistricts(false)
      }
    }
    fetchDistricts()
  }, [showCreateModal, showEditModal, createForm.LocationId, editForm.LocationId])

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

  const handleToggleStatus = async (poi: StaffPOI) => {
    // Đối với các POI của đối tác, manager khi đã chuyển trạng thái thì không có quyền bật lại
    if (poi.PartnerId && poi.Status !== "Active") {
      showToast("error", "Đối tác cần phải gửi yêu cầu mở lại POI này")
      return
    }

    const currentStatus = poi.Status === "Active" ? "Active" : "Inactive"
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active"
    try {
      setToggleLoadingId(poi.Id)
      
      if (nextStatus === "Inactive") {
        await inactivateStaffPOI(poi.Id, true)
      } else {
        await activateStaffPOI(poi.Id)
      }

      setPois((prev) =>
        prev.map((x) => (x.Id === poi.Id ? { ...x, Status: nextStatus } : x))
      )
      showToast("success", `Đổi trạng thái POI "${poi.Name}" thành công`)
    } catch (e) {
      console.error("Failed to toggle POI status", e)
      showToast("error", "Đổi trạng thái POI thất bại")
    } finally {
      setToggleLoadingId(null)
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
        navigate({ to: "/manager/login" })
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
            const byId = preferencesList.find((o) => o.id === v)
            if (byId) return byId
            const byName = preferencesList.find(
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
        DistrictId: detail.DistrictId ?? "",
        Status: detail.Status !== undefined ? String(detail.Status) : "",
        PartnerId: detail.PartnerId ?? "",
        Type: detail.Type || ("Attraction" as POIType),
      })

      setEditImageFile(null)
      setShowEditModal(true)
    } catch (e) {
      console.error("Failed to load POI for edit", e)
      const status = (e as any)?.status
      if (status === 401) {
        localStorage.removeItem("manager_token")
        localStorage.removeItem("admin_token")
        navigate({ to: "/manager/login" })
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
    setFormErrors({})

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
      showToast("error", "Vui lòng chọn Location hợp lệ từ danh sách")
      return
    }
    if (!createForm.DistrictId.trim()) {
      showToast("error", "Vui lòng chọn District")
      return
    }

    if (createForm.PoiPreferences.length > MAX_PREFERENCES) {
      showToast("error", `Mỗi user chỉ được chọn tối đa ${MAX_PREFERENCES} preference`)
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
        DistrictId: createForm.DistrictId.trim(),
        Type: createForm.Type,
      }, createImageFile)


      const refreshedData = await getStaffPOIs()
      setPois(refreshedData)
      setShowCreateModal(false)
      resetCreateForm()
      showToast("success", "Tạo POI thành công")
    } catch (e) {
      console.error("Failed to create POI", e)
      const message = e instanceof Error ? e.message : String(e)
      if (message.toLowerCase().includes("district") || message.toLowerCase().includes("không thuộc")) {
        setFormErrors({ districtId: "District không thuộc City đã chọn" })
      } else if (message.includes("FK_pois_locations_LocationId")) {
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
    setFormErrors({})
    if (!editingPoiId) return

    if (!editForm.Name.trim()) {
      showToast("error", "Tên POI không được để trống")
      return
    }
    if (!editForm.LocationId.trim()) {
      showToast("error", "LocationId không được để trống")
      return
    }
    if (!editForm.DistrictId.trim()) {
      showToast("error", "DistrictId không được để trống")
      return
    }

    if (editForm.PoiPreferences.length > MAX_PREFERENCES) {
      showToast("error", `Mỗi user chỉ được chọn tối đa ${MAX_PREFERENCES} preference`)
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
        DistrictId: editForm.DistrictId.trim(),
        Status: editForm.Status || undefined,
        PartnerId: editForm.PartnerId || undefined,
        Type: editForm.Type,
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
      const message = e instanceof Error ? e.message : String(e)
      if (message.toLowerCase().includes("district") || message.toLowerCase().includes("không thuộc")) {
        setFormErrors({ districtId: "District không thuộc City đã chọn" })
      } else {
        showToast("error", "Cập nhật POI thất bại")
      }
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side: Search & Action Buttons */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200"
              placeholder="Tìm theo tên, địa chỉ, thành phố..."
            />
          </div>
          <div className="relative w-full sm:w-[200px]">
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer text-slate-700"
            >
              <option value="">Tất cả thành phố</option>
              {mergedLocationOptions.map((loc) => (
                <option key={loc.Id} value={loc.Id}>
                  {loc.Name || "Không rõ"}
                </option>
              ))}
            </select>
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
        </div>

        {/* Right side: Subtabs Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 h-10 items-center shadow-inner self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setFilterType("system")}
            className={`h-8 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center whitespace-nowrap ${
              filterType === "system"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            POI hệ thống
          </button>
          <button
            type="button"
            onClick={() => setFilterType("partner")}
            className={`h-8 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out flex items-center justify-center whitespace-nowrap ${
              filterType === "partner"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            POI đối tác
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
            to="/manager/pois"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold"
          >
            Làm mới
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải POIs...</div>
        ) : filteredPois.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            Không có POIs phù hợp.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="max-h-[560px] overflow-y-auto">
                <table className="min-w-[880px] w-full table-auto border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="px-6 py-4 text-left w-16">STT</th>
                      <th className="px-6 py-4 text-left min-w-[280px]">Tên</th>
                      <th className="px-6 py-4 text-left">Thành phố</th>
                      {filterType === "partner" && (
                        <th className="px-6 py-4 text-left">Đối tác</th>
                      )}
                      <th className="px-6 py-4 text-left">Trong nhà</th>
                      <th className="px-6 py-4 text-right pr-12">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {pagedPois.map((p, idx) => (
                      <tr
                        key={p.Id}
                        className="hover:bg-slate-100 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {startIndex + idx + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 break-words">
                            {p.Name}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {p.LocationName || "—"}
                        </td>

                        {filterType === "partner" && (
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">
                            {p.PartnerName || "—"}
                          </td>
                        )}


                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${p.IsIndoor
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                          >
                            {p.IsIndoor ? "Trong nhà" : "Ngoài trời"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => void openDetailModal(p.Id)}
                              className="group relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-colors"
                            >
                              <Eye size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                Xem chi tiết
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>
                            {!p.PartnerId && (
                              <button
                                onClick={() => void openEditModal(p.Id)}
                                className="group relative inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                              >
                                <Edit2 size={16} />
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                  Chỉnh sửa
                                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                                </span>
                              </button>
                            )}
                            <div className="group relative inline-flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => void handleToggleStatus(p)}
                                disabled={toggleLoadingId === p.Id}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  p.Status === "Active" ? "bg-emerald-600" : "bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    p.Status === "Active" ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                                {p.Status === "Active" ? "Ngừng hoạt động" : "Kích hoạt"}
                                <span className="absolute right-[18px] top-full border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </div>
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
        <div className="fixed inset-0 z-50 p-0 md:p-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPoi(null)} />
          <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Chi tiết POI</h2>
              <button
                onClick={() => setSelectedPoi(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative">
              {/* Cột trái: Hình ảnh POI */}
              <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col">
                <span className="text-sm font-semibold text-slate-700 block">Hình ảnh POI</span>
                <div className="flex-1 min-h-[300px] md:min-h-0 w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group shadow-sm">
                  {selectedPoi.POIImgUrl ? (
                    <img
                      src={selectedPoi.POIImgUrl}
                      alt={selectedPoi.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">Không có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Thông tin chi tiết */}
              <div className="space-y-6 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4 flex flex-col h-full">
                {/* Header info */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Địa điểm tham quan</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 break-words">{selectedPoi.Name || "—"}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedPoi.Status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {selectedPoi.Status === "Active" ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200`}>
                      {selectedPoi.IsIndoor ? "Trong nhà" : "Ngoài trời"}
                    </span>
                  </div>
                </div>

                {/* Chi tiết từng hàng thông tin */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Địa chỉ</span>
                    <div className="text-sm text-slate-800 font-medium break-words leading-relaxed flex items-start gap-2">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{selectedPoi.Address || "—"}</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Thành phố</span>
                    <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                      {selectedPoi.LocationName || "—"}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Loại POI</span>
                    <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                      {poiTypesList.find(t => t.value === selectedPoi.Type)?.label || selectedPoi.Type || "—"}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Chi phí gần đúng</span>
                    <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                      {selectedPoi.ApproxCost || "—"}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ hoạt động</span>
                    <div className="text-sm text-slate-800 font-medium break-words leading-relaxed flex items-center gap-2">
                      <Clock size={16} className="text-slate-400 shrink-0" />
                      <span>
                        {selectedPoi.Is24Hours ? "Mở cửa 24/7" : (selectedPoi.OpenHour && selectedPoi.CloseHour ? `${selectedPoi.OpenHour} - ${selectedPoi.CloseHour}` : "—")}
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Google Maps</span>
                    <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                      {selectedPoi.GoogleMapLink ? (
                        <a href={selectedPoi.GoogleMapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1.5">
                          <ExternalLink size={16} />
                          <span>Xem trên bản đồ</span>
                        </a>
                      ) : "—"}
                    </div>
                  </div>

                  {selectedPoi.PartnerName && (
                    <div className="border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Đối tác sở hữu</span>
                      <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                        {selectedPoi.PartnerName}
                      </div>
                    </div>
                  )}

                  {Number.isFinite(selectedPoi.Latitude) && Number.isFinite(selectedPoi.Longitude) && (
                    <div className="border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tọa độ (Latitude / Longitude)</span>
                      <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">
                        {selectedPoi.Latitude.toFixed(6)} / {selectedPoi.Longitude.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferences & Recommendation */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-3 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Tag size={16} />
                    <span>Thông tin bổ sung</span>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-emerald-600 uppercase block mb-1">Nhãn (Preferences)</label>
                    {selectedPoi.PoiPreferences && selectedPoi.PoiPreferences.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPoi.PoiPreferences.map((pref, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-white text-emerald-700"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">Không có nhãn</p>
                    )}
                  </div>

                  {selectedPoi.VisitRecommendation && (
                    <div>
                      <label className="text-xs font-bold text-emerald-600 uppercase block mb-1">Gợi ý tham quan</label>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-emerald-100">
                        {selectedPoi.VisitRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50/50 z-10">
              <button
                type="button"
                onClick={() => setSelectedPoi(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 p-0 md:p-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
            setShowCreateModal(false)
            resetCreateForm()
          }} />
          <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10">
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                Tạo mới POI
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  resetCreateForm()
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative"
            >
              {/* Cột trái: Hình ảnh, Preferences, Gợi ý tham quan */}
              <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col h-full">
                {/* Hình ảnh */}
                <div className="space-y-2">
                  <span className="text-sm text-slate-700 font-semibold block">Hình ảnh</span>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 transition-all font-semibold">
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
                    {createImageFile && (
                      <span className="text-xs text-slate-500 truncate max-w-[200px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                        {createImageFile.name}
                      </span>
                    )}
                  </div>
                  {/* Image preview box */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 h-[280px] w-full relative">
                    {createImagePreviewUrl ? (
                      <img
                        src={createImagePreviewUrl}
                        alt={createForm.Name || "POI"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                </div>

                {/* Nhãn Preferences */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-700 font-semibold block">
                    Nhãn (Preferences) <span className="text-slate-400 font-normal">(tối đa {MAX_PREFERENCES})</span>
                  </label>
                  {loadingPreferences ? (
                    <p className="text-sm text-slate-500">Đang tải...</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {preferencesList.map((pref) => {
                        const isSelected = createForm.PoiPreferences.includes(pref.id)
                        const canSelectMore = createForm.PoiPreferences.length < MAX_PREFERENCES
                        const isDisabled = !isSelected && !canSelectMore
                        return (
                          <button
                            type="button"
                            key={pref.id}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return
                              setCreateForm((prev) => ({
                                ...prev,
                                PoiPreferences: isSelected
                                  ? prev.PoiPreferences.filter((p) => p !== pref.id)
                                  : [...prev.PoiPreferences, pref.id],
                              }))
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                              : isDisabled
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-600 hover:text-emerald-600'
                              }`}
                          >
                            {pref.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Các trường thông tin */}
              <div className="space-y-4 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-700 font-semibold block">
                    Tên <span className="text-red-400">*</span>
                    <input
                      value={createForm.Name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, Name: e.target.value }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                      placeholder="Nhập tên"
                      required
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Địa chỉ <span className="text-red-400">*</span>
                    <input
                      value={createForm.Address}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, Address: e.target.value }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                      placeholder="Nhập địa chỉ"
                      required
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Thành phố (City) <span className="text-red-400">*</span>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={createForm.LocationId}
                        onChange={(val: string) => {
                          const selName = mergedLocationOptions.find(l => l.Id === val)?.Name || "";
                          setCreateForm((prev) => ({
                            ...prev,
                            LocationId: val,
                            City: selName,
                            DistrictId: ""
                          }))
                        }}
                        options={mergedLocationOptions.map(l => ({ value: l.Id, label: l.Name || l.Id }))}
                        placeholder={loadingLocations ? "Đang tải..." : "-- Chọn Thành phố --"}
                      />
                    </div>
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Quận huyện (District) <span className="text-red-400">*</span>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={createForm.DistrictId}
                        onChange={(val: string) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            DistrictId: val,
                          }))
                          setFormErrors({})
                        }}
                        options={districts.map(d => ({ value: d.id, label: d.name }))}
                        placeholder={loadingDistricts ? "Đang tải..." : (!createForm.LocationId ? "-- Chọn City trước --" : (districts.length === 0 ? "City này chưa có district" : "-- Chọn District --"))}
                        disabled={!createForm.LocationId || loadingDistricts}
                        error={!!formErrors.districtId}
                      />
                    </div>
                    {formErrors.districtId && <p className="text-red-500 text-xs mt-1">{formErrors.districtId}</p>}
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Loại POI <span className="text-red-400">*</span>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={createForm.Type}
                        onChange={(val: string) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            Type: val as POIType,
                          }))
                        }}
                        options={poiTypesList}
                        placeholder={loadingPoiTypes ? "Đang tải..." : "-- Chọn Loại POI --"}
                      />
                    </div>
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Chi phí gần đúng
                    <input
                      value={createForm.ApproxCost}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          ApproxCost: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                      placeholder="VD: 50.000 - 100.000 VND"
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Google map link
                    <input
                      value={createForm.GoogleMapLink}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          GoogleMapLink: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                      placeholder="https://maps.google.com/..."
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
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
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
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
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createForm.IsIndoor}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, IsIndoor: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                    />
                    Trong nhà
                  </label>
                </div>

                {/* Gợi ý tham quan */}
                <div className="flex flex-col">
                  <label className="text-sm text-slate-700 font-semibold block mb-1.5">
                    Gợi ý tham quan (VisitRecommendation)
                  </label>
                  <textarea
                    value={createForm.VisitRecommendation}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        VisitRecommendation: e.target.value,
                      }))
                    }
                    className="w-full p-3 h-24 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700 resize-none"
                    placeholder="VD: Nên đi vào buổi sáng để ngắm cảnh đẹp nhất..."
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="col-span-2 flex-shrink-0 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50/50 z-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateForm()
                  }}
                  className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                  {creating ? "Đang tạo..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 z-50 p-0 md:p-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
            setShowEditModal(false)
            setEditingPoiId("")
          }} />
          <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10">
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                Chỉnh sửa POI
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPoiId("")
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative"
            >
              {/* Cột trái: Hình ảnh, Preferences, Gợi ý tham quan */}
              <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col h-full">
                {/* Hình ảnh */}
                <div className="space-y-2">
                  <span className="text-sm text-slate-700 font-semibold block">Hình ảnh</span>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 transition-all font-semibold">
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
                    {editImageFile && (
                      <span className="text-xs text-slate-500 truncate max-w-[200px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                        {editImageFile.name}
                      </span>
                    )}
                  </div>
                  {/* Image preview box */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 h-[280px] w-full relative">
                    {editImagePreviewUrl ? (
                      <img
                        src={editImagePreviewUrl}
                        alt={editForm.Name || "POI"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                </div>

                {/* Nhãn Preferences */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-700 font-semibold block">
                    PoiPreferences <span className="text-slate-400 font-normal">(tối đa {MAX_PREFERENCES})</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {preferencesList.map((opt) => {
                      const checked = editForm.PoiPreferences.some((p) => p.id === opt.id)
                      const canSelectMore = editForm.PoiPreferences.length < MAX_PREFERENCES
                      const isDisabled = !checked && !canSelectMore
                      return (
                        <label
                          key={opt.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs cursor-pointer transition-all ${isDisabled
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : checked
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isDisabled}
                            onChange={(e) => {
                              const nextChecked = e.target.checked
                              setEditForm((prev) => {
                                const next = nextChecked
                                  ? [...prev.PoiPreferences, opt]
                                  : prev.PoiPreferences.filter((p) => p.id !== opt.id)
                                return { ...prev, PoiPreferences: next }
                              })
                            }}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                          />
                          <span className="truncate">{opt.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Cột phải: Các trường thông tin */}
              <div className="space-y-4 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm text-slate-700 font-semibold block">
                    Tên <span className="text-red-400">*</span>
                    <input
                      value={editForm.Name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, Name: e.target.value }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                      required
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Địa chỉ <span className="text-red-400">*</span>
                    <input
                      value={editForm.Address}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, Address: e.target.value }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Thành phố (City) <span className="text-red-400">*</span>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={editForm.LocationId}
                        onChange={(val: string) => {
                          const selName = mergedLocationOptions.find(l => l.Id === val)?.Name || "";
                          setEditForm((prev) => ({
                            ...prev,
                            LocationId: val,
                            City: selName,
                            DistrictId: ""
                          }))
                        }}
                        options={mergedLocationOptions.map(l => ({ value: l.Id, label: l.Name || l.Id }))}
                        placeholder={loadingLocations ? "Đang tải..." : "-- Chọn Thành phố --"}
                      />
                    </div>
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Quận huyện (District) <span className="text-red-400">*</span>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={editForm.DistrictId}
                        onChange={(val: string) => {
                          setEditForm((prev) => ({
                            ...prev,
                            DistrictId: val,
                          }))
                          setFormErrors({})
                        }}
                        options={districts.map(d => ({ value: d.id, label: d.name }))}
                        placeholder={loadingDistricts ? "Đang tải..." : (!editForm.LocationId ? "-- Chọn City trước --" : (districts.length === 0 ? "City này chưa có district" : "-- Chọn District --"))}
                        disabled={!editForm.LocationId || loadingDistricts}
                        error={!!formErrors.districtId}
                      />
                    </div>
                    {formErrors.districtId && <p className="text-red-500 text-xs mt-1">{formErrors.districtId}</p>}
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Loại POI <span className="text-red-400">*</span>
                    <div className="mt-1.5">
                      <CustomSelect
                        value={editForm.Type}
                        onChange={(val: string) => {
                          setEditForm((prev) => ({
                            ...prev,
                            Type: val as POIType,
                          }))
                        }}
                        options={poiTypesList}
                        placeholder={loadingPoiTypes ? "Đang tải..." : "-- Chọn Loại POI --"}
                      />
                    </div>
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Chi phí gần đúng
                    <input
                      value={editForm.ApproxCost}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          ApproxCost: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Google map link
                    <input
                      value={editForm.GoogleMapLink}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          GoogleMapLink: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Giờ mở cửa
                    <input
                      type="time"
                      value={editForm.OpenHour}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, OpenHour: e.target.value }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>

                  <label className="text-sm text-slate-700 font-semibold block">
                    Giờ đóng cửa
                    <input
                      type="time"
                      value={editForm.CloseHour}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, CloseHour: e.target.value }))
                      }
                      className="mt-1.5 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700"
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.IsIndoor}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, IsIndoor: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                    />
                    Trong nhà
                  </label>
                </div>

                {/* Gợi ý tham quan */}
                <div className="flex flex-col">
                  <label className="text-sm text-slate-700 font-semibold block mb-1.5">
                    Gợi ý tham quan (VisitRecommendation)
                  </label>
                  <textarea
                    value={editForm.VisitRecommendation}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        VisitRecommendation: e.target.value,
                      }))
                    }
                    className="w-full p-3 h-24 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700 resize-none"
                    placeholder="VD: Nên đi vào buổi sáng để ngắm cảnh đẹp nhất..."
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="col-span-2 flex-shrink-0 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50/50 z-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingPoiId("")
                  }}
                  className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                  {editing ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="fixed top-4 left-0 right-0 flex justify-center pointer-events-none z-[9999]">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={
                toast.type === "error"
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      x: [0, -12, 12, -12, 12, -6, 6, 0],
                      transition: {
                        x: { duration: 0.5, ease: "easeInOut" },
                        default: { duration: 0.2 }
                      }
                    }
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.2 }
                    }
              }
              exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto px-5 py-3.5 rounded-2xl border shadow-xl text-sm font-semibold flex items-center gap-2.5 backdrop-blur-md max-w-[90vw] ${
                toast.type === "success"
                  ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/60 shadow-emerald-100/50"
                  : "bg-rose-50/90 text-rose-800 border-rose-200/60 shadow-rose-100/50"
              }`}
            >
              {toast.type === "error" ? (
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default StaffPOIsPage

