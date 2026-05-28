import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  getStaffLocations,
  getStaffPOIById,
  type StaffLocationOption,
  updateStaffPOI,
  uploadStaffPOIImage,
} from "../../../services/poiService"

export const Route = createFileRoute("/staff/_layout/pois/$id")({
  component: StaffPOIDetailPage,
})

function StaffPOIDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [locationOptions, setLocationOptions] = useState<StaffLocationOption[]>([])
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [form, setForm] = useState({
    Name: "",
    Address: "",
    City: "",
    ApproxCost: "",
    OpenHour: "",
    CloseHour: "",
    GoogleMapLink: "",
    IsIndoor: false,
    POIImgUrl: "",
    LocationId: "",
    DistrictId: "",
    Status: "",
    PartnerId: "",
  })

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const poi = await getStaffPOIById(id)
        if (!poi) {
          showToast("error", "Không tìm thấy POI")
          return
        }

        setForm({
          Name: poi.Name ?? "",
          Address: poi.Address ?? "",
          City: poi.LocationName ?? "",
          ApproxCost: poi.ApproxCost ?? "",
          OpenHour: poi.OpenHour ?? "",
          CloseHour: poi.CloseHour ?? "",
          GoogleMapLink: poi.GoogleMapLink ?? "",
          IsIndoor: Boolean(poi.IsIndoor),
          POIImgUrl: poi.POIImgUrl ?? "",
          LocationId: poi.LocationId ?? "",
          DistrictId: poi.DistrictId ?? "",
          Status: poi.Status !== undefined ? String(poi.Status) : "",
          PartnerId: poi.PartnerId ?? "",
        })
      } catch (e) {
        console.error("Failed to fetch POI detail", e)
        showToast("error", "Không tải được chi tiết POI")
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getStaffLocations()
        setLocationOptions(data)
      } catch (e) {
        console.error("Failed to fetch locations", e)
      }
    }
    fetchLocations()
  }, [])

  const validLocationIds = useMemo(
    () => new Set(locationOptions.map((x) => x.Id)),
    [locationOptions]
  )

  const handleUploadImage = async (file: File | null) => {
    if (!file) return
    setSelectedImageFile(file)
    const url = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, POIImgUrl: url }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.Name.trim()) {
      showToast("error", "Tên POI không được để trống")
      return
    }

    if (!form.LocationId.trim()) {
      showToast("error", "LocationId không được để trống")
      return
    }

    if (locationOptions.length > 0 && !validLocationIds.has(form.LocationId.trim())) {
      showToast("error", "LocationId không hợp lệ")
      return
    }

    try {
      setSaving(true)
      await updateStaffPOI(id, {
        Name: form.Name.trim(),
        Address: form.Address.trim(),
        ApproxCost: form.ApproxCost.trim(),
        OpenHour: form.OpenHour.trim(),
        CloseHour: form.CloseHour.trim(),
        GoogleMapLink: form.GoogleMapLink.trim(),
        IsIndoor: form.IsIndoor,
        POIImgUrl: form.POIImgUrl.trim(),
        LocationId: form.LocationId.trim(),
        DistrictId: form.DistrictId,
        Status: form.Status || undefined,
        PartnerId: form.PartnerId || undefined,
      }, selectedImageFile)

      sessionStorage.setItem("staff_poi_success_message", "Cập nhật POI thành công")
      navigate({ to: "/staff/pois" })
    } catch (e) {
      console.error("Failed to update POI", e)
      const message = e instanceof Error ? e.message : String(e)
      if (message.includes("FK_pois_locations_LocationId")) {
        showToast("error", "LocationId không tồn tại trong hệ thống")
      } else {
        showToast("error", "Cập nhật POI thất bại")
      }
    } finally {
      setSaving(false)
    }
  }

  const isPartnerPoi = !!form.PartnerId

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Chi tiết POI</h2>
          <p className="text-sm text-slate-500 mt-1">ID: {id}</p>
        </div>
        <Link
          to="/staff/pois"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải chi tiết...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {isPartnerPoi && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-semibold">
                POI này thuộc sở hữu của đối tác. Bạn chỉ có quyền xem chi tiết và thay đổi trạng thái hoạt động ở danh sách, không có quyền chỉnh sửa thông tin.
              </div>
            )}
            <fieldset disabled={isPartnerPoi} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700">
                  Tên
                  <input
                    value={form.Name}
                    onChange={(e) => setForm((prev) => ({ ...prev, Name: e.target.value }))}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Địa chỉ
                  <input
                    value={form.Address}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, Address: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Thành phố
                  <input
                    value={form.City}
                    onChange={(e) => setForm((prev) => ({ ...prev, City: e.target.value }))}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Chi phí gần đúng
                  <input
                    value={form.ApproxCost}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ApproxCost: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Giờ mở cửa
                  <input
                    type="time"
                    value={form.OpenHour}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, OpenHour: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Giờ đóng cửa
                  <input
                    type="time"
                    value={form.CloseHour}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, CloseHour: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  Google map link
                  <input
                    value={form.GoogleMapLink}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, GoogleMapLink: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  LocationId
                  <select
                    value={form.LocationId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, LocationId: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                    required
                  >
                    <option value="">Chọn LocationId</option>
                    {locationOptions.map((loc) => (
                      <option key={loc.Id} value={loc.Id}>
                        {loc.Name ? `${loc.Name} (${loc.Id})` : loc.Id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-slate-700">
                  Status
                  <input
                    value={form.Status}
                    onChange={(e) => setForm((prev) => ({ ...prev, Status: e.target.value }))}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  PartnerId
                  <input
                    value={form.PartnerId}
                    onChange={(e) => setForm((prev) => ({ ...prev, PartnerId: e.target.value }))}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.IsIndoor}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, IsIndoor: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
                />
                IsIndoor
              </label>

              <div className="space-y-2">
                <label className="text-sm text-slate-700 block">
                  POIImgUrl
                  <input
                    value={form.POIImgUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, POIImgUrl: e.target.value }))
                    }
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </label>

                <label className={`inline-flex items-center gap-2 h-10 px-3 rounded-xl border text-sm text-slate-700 font-medium transition-all ${
                  isPartnerPoi
                    ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed pointer-events-none"
                    : "bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100"
                }`}>
                  <Upload size={16} />
                  {uploadingImage ? "Đang upload..." : "Upload ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage || isPartnerPoi}
                    onChange={(e) => handleUploadImage(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </fieldset>

            {!isPartnerPoi && (
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

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

export default StaffPOIDetailPage
