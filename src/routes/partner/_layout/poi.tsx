import { createFileRoute } from '@tanstack/react-router'
import { Plus, MapPin, Search, Edit2, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, X, ExternalLink, Clock, DollarSign, Navigation, Home } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import {
  getMyPartnerPOIs,
  createPartnerPOI,
  updateMyPartnerPOI,
  inactivateMyPartnerPOI,
  type PartnerPOI,
  type CreatePartnerPOIPayload,
  type UpdatePartnerPOIPayload,
  type POIType,
  type POIStatus,
} from '../../../services/partnerPoiService'

export const Route = createFileRoute('/partner/_layout/poi')({
  component: PartnerPOIPage,
})

// ── Status badge helper ─────────────────────────────────────────────
const statusStyles: Record<POIStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  Rejected: 'bg-red-50 text-red-500 border border-red-100',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
}

const statusLabels: Record<POIStatus, string> = {
  Active: 'Hoạt động',
  Pending: 'Chờ duyệt',
  Rejected: 'Bị từ chối',
  Inactive: 'Ngừng hoạt động',
}

const typeLabels: Record<POIType, string> = {
  Restaurant: 'Nhà hàng',
  Attraction: 'Điểm tham quan',
}

// ── Format time ─────────────────────────────────────────────────────
const formatTime = (t: string | null, is24: boolean) => {
  if (is24) return 'Mở 24 giờ'
  if (!t) return ''
  const s = String(t)
  return s.length >= 5 && s.includes(':') ? s.slice(0, 5) : s
}

// ── Main Component ──────────────────────────────────────────────────
function PartnerPOIPage() {
  const [pois, setPois] = useState<PartnerPOI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoi, setEditingPoi] = useState<PartnerPOI | null>(null)
  const [detailPoi, setDetailPoi] = useState<PartnerPOI | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // ── Fetch data ────────────────────────────────────────────────────
  const fetchPois = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getMyPartnerPOIs(page, pageSize)
      setPois(result.items)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (error) {
      console.error('Error fetching POIs:', error)
      setPois([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchPois()
  }, [fetchPois])

  // ── Filtered list ─────────────────────────────────────────────────
  const filteredPois = pois.filter((poi) => {
    const matchSearch =
      !searchTerm ||
      poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poi.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || poi.type === filterType
    return matchSearch && matchType
  })

  // ── Handlers ──────────────────────────────────────────────────────
  const handleCreate = () => {
    setEditingPoi(null)
    setIsModalOpen(true)
  }

  const handleEdit = (poi: PartnerPOI) => {
    setEditingPoi(poi)
    setIsModalOpen(true)
  }

  const handleInactivate = async (poi: PartnerPOI) => {
    if (!confirm(`Bạn có chắc muốn ngừng hoạt động POI "${poi.name}"? Các quảng cáo liên quan cũng sẽ bị ảnh hưởng.`)) return
    try {
      const result = await inactivateMyPartnerPOI(poi.id, true)
      alert(result.message)
      fetchPois()
    } catch (error: any) {
      alert(error?.message || 'Có lỗi xảy ra khi ngừng hoạt động POI.')
    }
  }

  const handleSubmit = async (
    payload: CreatePartnerPOIPayload | UpdatePartnerPOIPayload,
    imageFile?: File | null
  ) => {
    try {
      setSubmitting(true)
      if (editingPoi) {
        await updateMyPartnerPOI(editingPoi.id, payload as UpdatePartnerPOIPayload, imageFile)
      } else {
        await createPartnerPOI(payload as CreatePartnerPOIPayload, imageFile)
      }
      setIsModalOpen(false)
      setEditingPoi(null)
      fetchPois()
    } catch (error: any) {
      throw error // Let the modal handle it to show inline errors
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm text-slate-500 font-medium">
          {totalItems > 0 && `Tổng: ${totalItems} POI`}
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#e28743] hover:bg-[#cf7632] text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>Thêm POI mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm POI..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 text-slate-600 font-medium"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại hình</option>
          <option value="Restaurant">Nhà hàng</option>
          <option value="Attraction">Điểm tham quan</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#e28743]" />
          <p className="font-medium">Đang tải danh sách POI...</p>
        </div>
      ) : filteredPois.length > 0 ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Tên POI</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Loại hình</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Giờ mở cửa</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPois.map((poi) => (
                  <tr key={poi.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {poi.poiImgUrl ? (
                          <img
                            src={poi.poiImgUrl}
                            alt={poi.name}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-[#faeadd] rounded-xl flex items-center justify-center text-[#e28743]">
                            <MapPin size={20} />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800">{poi.name}</span>
                          {poi.city && (
                            <p className="text-xs text-slate-400">{poi.city}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {typeLabels[poi.type] || poi.type}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{poi.address}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {poi.is24Hours
                        ? 'Mở 24 giờ'
                        : poi.openHour && poi.closeHour
                          ? `${formatTime(poi.openHour, false)} - ${formatTime(poi.closeHour, false)}`
                          : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[poi.status] || 'bg-slate-100 text-slate-500'}`}>
                        {statusLabels[poi.status] || poi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailPoi(poi)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(poi)}
                          className="p-2 text-slate-400 hover:text-[#e28743] hover:bg-[#faeadd] rounded-lg transition-all"
                          title="Sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        {poi.status === 'Active' && (
                          <button
                            onClick={() => handleInactivate(poi)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Ngừng hoạt động"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-3">
              <span className="text-sm text-slate-500">
                Trang {page} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có POI nào</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Bạn chưa tạo điểm tham quan nào. Hãy thêm POI đầu tiên để bắt đầu quản lý.
          </p>
          <button
            onClick={handleCreate}
            className="bg-[#e28743] hover:bg-[#cf7632] text-white px-8 py-3 rounded-2xl transition-all font-bold shadow-md hover:shadow-lg"
          >
            Bắt đầu tạo ngay
          </button>
        </div>
      )}

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <POIFormModal
          poi={editingPoi}
          submitting={submitting}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPoi(null)
          }}
          onSubmit={handleSubmit}
        />
      )}

      {/* Modal Detail */}
      {detailPoi && (
        <POIDetailModal
          poi={detailPoi}
          onClose={() => setDetailPoi(null)}
          onEdit={(poi) => {
            setDetailPoi(null)
            handleEdit(poi)
          }}
        />
      )}
    </div>
  )
}

// ── Modal Form Component ────────────────────────────────────────────
import { getLocations, getDistrictsByLocationId, type LocationOption, type District } from '../../../services/partnerPoiService'
import { CustomSelect } from '../../../components/ui/CustomSelect'

interface POIFormModalProps {
  poi: PartnerPOI | null
  submitting: boolean
  onClose: () => void
  onSubmit: (
    payload: CreatePartnerPOIPayload | UpdatePartnerPOIPayload,
    imageFile?: File | null
  ) => Promise<void>
}

function POIFormModal({ poi, submitting, onClose, onSubmit }: POIFormModalProps) {
  const isEditing = !!poi

  const [name, setName] = useState(poi?.name ?? '')
  const [address, setAddress] = useState(poi?.address ?? '')
  const [approxCost, setApproxCost] = useState(poi?.approxCost ?? '')
  const [openHour, setOpenHour] = useState(poi?.openHour ? String(poi.openHour).slice(0, 5) : '')
  const [closeHour, setCloseHour] = useState(poi?.closeHour ? String(poi.closeHour).slice(0, 5) : '')
  const [is24Hours, setIs24Hours] = useState(poi?.is24Hours ?? false)
  const [visitRecommendation, setVisitRecommendation] = useState(poi?.visitRecommendation ?? '')
  const [googleMapLink, setGoogleMapLink] = useState(poi?.googleMapLink ?? '')
  const [isIndoor, setIsIndoor] = useState(poi?.isIndoor ?? false)
  const [type, setType] = useState<POIType>(poi?.type ?? 'Attraction')
  const [locationId, setLocationId] = useState(poi?.locationId ?? '')
  const [districtId, setDistrictId] = useState(poi?.districtId ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(poi?.poiImgUrl ?? null)

  const [locations, setLocations] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  const [formErrors, setFormErrors] = useState<{locationId?: string, districtId?: string}>({})

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true)
      try {
        const data = await getLocations()
        setLocations(data)
      } catch (e) {
        console.error("Lỗi khi tải danh sách City", e)
      } finally {
        setLoadingLocations(false)
      }
    }
    fetchLocations()
  }, [])

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!locationId) {
        setDistricts([])
        return
      }
      setLoadingDistricts(true)
      setFormErrors(prev => ({ ...prev, locationId: undefined }))
      try {
        const data = await getDistrictsByLocationId(locationId)
        setDistricts(data)
        // Check if districtId exists in new list, if not, reset it
        if (districtId && !data.some(d => d.id === districtId)) {
           setDistrictId('') // auto reset
        }
      } catch (e) {
        console.error("Lỗi khi tải danh sách District", e)
      } finally {
        setLoadingDistricts(false)
      }
    }
    fetchDistricts()
  }, [locationId])

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationId(e.target.value)
    setDistrictId('') // reset district when location changes
    setDistricts([]) // clear old districts while loading
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: {locationId?: string, districtId?: string} = {}
    if (!locationId) {
      errors.locationId = "Vui lòng chọn City"
    }
    if (!districtId) {
      errors.districtId = "Vui lòng chọn District"
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const locName = locations.find(l => l.id === locationId)?.name || ''

    try {
      if (isEditing) {
        const payload: UpdatePartnerPOIPayload = {
          Name: name,
          Address: address,
          City: locName,
          ApproxCost: approxCost,
          OpenHour: is24Hours ? '00:00' : openHour,
          CloseHour: is24Hours ? '23:59' : closeHour,
          Is24Hours: is24Hours,
          VisitRecommendation: visitRecommendation,
          GoogleMapLink: googleMapLink,
          IsIndoor: isIndoor,
          Type: type,
          LocationId: locationId,
          DistrictId: districtId,
        }
        await onSubmit(payload, imageFile)
      } else {
        if (!name || !address || !locationId || !districtId) {
          alert('Vui lòng điền đầy đủ thông tin bắt buộc.')
          return
        }
        const payload: CreatePartnerPOIPayload = {
          Name: name,
          Address: address,
          City: locName,
          ApproxCost: approxCost,
          OpenHour: is24Hours ? '00:00' : openHour,
          CloseHour: is24Hours ? '23:59' : closeHour,
          Is24Hours: is24Hours,
          VisitRecommendation: visitRecommendation,
          GoogleMapLink: googleMapLink,
          IsIndoor: isIndoor,
          Type: type,
          LocationId: locationId,
          DistrictId: districtId,
          PoiPreferences: [],
        }
        await onSubmit(payload, imageFile)
      }
    } catch (error: any) {
      const msg = error?.message || ""
      if (msg.toLowerCase().includes("district") || msg.toLowerCase().includes("không thuộc")) {
        setFormErrors({ districtId: "District không thuộc City đã chọn" })
      } else {
        alert(msg || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    }
  }

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700"
  const selectClasses = "w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 transition-all text-slate-700 disabled:opacity-60"
  const labelClasses = "block text-sm font-semibold text-slate-600 mb-1.5"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {isEditing ? 'Chỉnh sửa POI' : 'Thêm POI mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5 flex-1 relative">
          {/* Image */}
          <div>
            <label className={labelClasses}>Hình ảnh</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-slate-200" />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ImageIcon size={28} className="text-slate-300" />
                </div>
              )}
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                Chọn ảnh
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Tên POI <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Nhập tên POI" required />
            </div>
            <div>
              <label className={labelClasses}>Loại hình <span className="text-red-400">*</span></label>
              <select value={type} onChange={(e) => setType(e.target.value as POIType)} className={inputClasses}>
                <option value="Restaurant">Nhà hàng</option>
                <option value="Attraction">Điểm tham quan</option>
              </select>
            </div>
          </div>

          {/* Location ID & District ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Thành phố (City) <span className="text-red-400">*</span></label>
              <CustomSelect 
                value={locationId} 
                onChange={(val) => {
                  setLocationId(val)
                  setDistrictId('') // reset district when location changes
                  setDistricts([]) // clear old districts while loading
                }}
                options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                placeholder={loadingLocations ? 'Đang tải...' : '-- Chọn Thành phố --'}
                error={!!formErrors.locationId}
              />
              {formErrors.locationId && <p className="text-red-500 text-xs mt-1">{formErrors.locationId}</p>}
            </div>
            <div>
              <label className={labelClasses}>Quận huyện (District) <span className="text-red-400">*</span></label>
              <CustomSelect 
                value={districtId} 
                onChange={(val) => {
                  setDistrictId(val)
                  setFormErrors(prev => ({ ...prev, districtId: undefined }))
                }}
                options={districts.map(dist => ({ value: dist.id, label: dist.name }))}
                placeholder={loadingDistricts ? 'Đang tải...' : (!locationId ? '-- Chọn City trước --' : (districts.length === 0 ? 'City này chưa có district' : '-- Chọn District --'))}
                disabled={!locationId || loadingDistricts}
                error={!!formErrors.districtId}
              />
              {formErrors.districtId && <p className="text-red-500 text-xs mt-1">{formErrors.districtId}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className={labelClasses}>Địa chỉ <span className="text-red-400">*</span></label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} placeholder="Nhập số nhà, tên đường..." required />
          </div>

          {/* Cost & Google Map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Chi phí ước tính</label>
              <input type="text" value={approxCost} onChange={(e) => setApproxCost(e.target.value)} className={inputClasses} placeholder="VD: 100,000 - 200,000 VND" />
            </div>
            <div>
              <label className={labelClasses}>Link Google Map</label>
              <input type="text" value={googleMapLink} onChange={(e) => setGoogleMapLink(e.target.value)} className={inputClasses} placeholder="https://maps.google.com/..." />
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <label className={labelClasses}>Thời gian mở cửa</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={is24Hours}
                  onChange={(e) => setIs24Hours(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#e28743] focus:ring-[#e28743]"
                />
                <span className="text-sm text-slate-600 font-medium">Mở 24 giờ</span>
              </label>
            </div>
            {!is24Hours && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Giờ mở</label>
                  <input type="time" value={openHour} onChange={(e) => setOpenHour(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Giờ đóng</label>
                  <input type="time" value={closeHour} onChange={(e) => setCloseHour(e.target.value)} className={inputClasses} />
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isIndoor}
                onChange={(e) => setIsIndoor(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#e28743] focus:ring-[#e28743]"
              />
              <span className="text-sm text-slate-600 font-medium">Trong nhà</span>
            </label>
          </div>

          {/* Visit Recommendation */}
          <div>
            <label className={labelClasses}>Gợi ý tham quan</label>
            <textarea
              value={visitRecommendation}
              onChange={(e) => setVisitRecommendation(e.target.value)}
              className={`${inputClasses} resize-none`}
              rows={3}
              placeholder="Nhập gợi ý cho du khách..."
            />
          </div>

          {/* Actions - Sticky bottom */}
          <div className="sticky bottom-0 -mx-6 -mb-6 bg-white border-t border-slate-200 p-4 mt-6 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#e28743] hover:bg-[#cf7632] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Tạo POI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Detail Modal Component ──────────────────────────────────────────
interface POIDetailModalProps {
  poi: PartnerPOI
  onClose: () => void
  onEdit: (poi: PartnerPOI) => void
}

function POIDetailModal({ poi, onClose, onEdit }: POIDetailModalProps) {
  const openingHours = poi.is24Hours
    ? 'Mở 24 giờ'
    : poi.openHour && poi.closeHour
      ? `${formatTime(poi.openHour, false)} – ${formatTime(poi.closeHour, false)}`
      : 'Chưa cập nhật'

  const infoRows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    { icon: <MapPin size={16} />, label: 'Địa chỉ', value: poi.address || '—' },
    { icon: <Navigation size={16} />, label: 'Thành phố', value: poi.city || '—' },
    { icon: <Clock size={16} />, label: 'Giờ mở cửa', value: openingHours },
    { icon: <DollarSign size={16} />, label: 'Chi phí ước tính', value: poi.approxCost || '—' },
    { icon: <Home size={16} />, label: 'Trong nhà / Ngoài trời', value: poi.isIndoor ? 'Trong nhà' : 'Ngoài trời' },
    {
      icon: <ExternalLink size={16} />,
      label: 'Google Map',
      value: poi.googleMapLink ? (
        <a href={poi.googleMapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-xs">
          Xem trên bản đồ
        </a>
      ) : '—',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">Chi tiết POI</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image + Name header */}
          <div className="flex items-start gap-4">
            {poi.poiImgUrl ? (
              <img src={poi.poiImgUrl} alt={poi.name} className="h-24 w-24 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-[#faeadd] flex items-center justify-center flex-shrink-0">
                <MapPin size={32} className="text-[#e28743]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{poi.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[poi.status] || 'bg-slate-100 text-slate-500'}`}>
                  {statusLabels[poi.status] || poi.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  {typeLabels[poi.type] || poi.type}
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-3">
            {infoRows.map((row, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="text-slate-400 mt-0.5 flex-shrink-0">{row.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{row.label}</p>
                  <div className="text-sm text-slate-700 font-medium">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Visit Recommendation */}
          {poi.visitRecommendation && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-600 font-bold mb-1">Gợi ý tham quan</p>
              <p className="text-sm text-amber-800">{poi.visitRecommendation}</p>
            </div>
          )}

          {/* Coordinates */}
          {(poi.latitude !== 0 || poi.longitude !== 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-bold mb-1">Tọa độ</p>
              <p className="text-sm text-slate-700 font-mono">{poi.latitude}, {poi.longitude}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Đóng
            </button>
            <button
              onClick={() => onEdit(poi)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#e28743] hover:bg-[#cf7632] text-white rounded-xl font-semibold transition-all shadow-sm"
            >
              <Edit2 size={16} />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
