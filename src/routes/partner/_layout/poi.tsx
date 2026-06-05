import { createFileRoute } from '@tanstack/react-router'
import { Plus, MapPin, Search, Edit2, Eye, EyeOff, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, X, ExternalLink, Clock, DollarSign, Navigation, Home, Ban, RotateCw, Upload } from 'lucide-react'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { useState, useEffect, useCallback } from 'react'
import { ConfirmModal } from '../../../components/ui/ConfirmModal'
import {
  getMyPartnerPOIs,
  createPartnerPOI,
  updateMyPartnerPOI,
  inactivateMyPartnerPOI,
  requestReactivationMyPartnerPOI,
  getPOITypes,
  type PartnerPOI,
  type CreatePartnerPOIPayload,
  type UpdatePartnerPOIPayload,
  type POIType,
  type POIStatus,
  type POITypeOption,
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

const fallbackTypeLabels: Record<POIType, string> = {
  Restaurant: 'Nhà hàng',
  Attraction: 'Điểm tham quan',
  Cafe: 'Quán cà phê',
  Hotel: 'Khách sạn',
  Museum: 'Bảo tàng',
  Park: 'Công viên',
  Shopping: 'Mua sắm',
  StreetFood: 'Ẩm thực đường phố',
  Landmark: 'Biểu tượng nổi bật',
  Viewpoint: 'Điểm ngắm cảnh',
  Beach: 'Bãi biển',
  CulturalSite: 'Di tích văn hóa',
  HistoricalSite: 'Di tích lịch sử',
  Temple: 'Chùa/Đền',
  Church: 'Nhà thờ',
  Nature: 'Thiên nhiên',
  Waterfall: 'Thác nước',
  Market: 'Chợ',
  NightMarket: 'Chợ đêm',
  Bar: 'Quán bar',
  Nightlife: 'Giải trí về đêm',
  Resort: 'Khu nghỉ dưỡng',
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
  const [confirmPoi, setConfirmPoi] = useState<PartnerPOI | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [poiTypeOptions, setPoiTypeOptions] = useState<POITypeOption[]>([])
  const [loadingPoiTypes, setLoadingPoiTypes] = useState(false)
  const [preferencesList, setPreferencesList] = useState<POIPreference[]>([])
  const [loadingPreferences, setLoadingPreferences] = useState(false)


  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch data ────────────────────────────────────────────────────
  const fetchPois = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true)
      const result = await getMyPartnerPOIs(page, pageSize)
      setPois(result.items)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (error) {
      console.error('Error fetching POIs:', error)
      setPois([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchPois()

    const token = localStorage.getItem("partner_token")
    if (token) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5246/api'
      const hubUrl = baseUrl.replace('/api', '') + '/hubs/notification'
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build()

      connection.on("ReceiveNotification", (notification) => {
        if (notification?.Type === "POI_UPDATED" || notification?.type === "POI_UPDATED") {
          fetchPois(false)
        }
      })

      connection.start().catch(err => console.error("SignalR POI Error: ", err))

      return () => {
        connection.stop()
      }
    }
  }, [fetchPois])

  useEffect(() => {
    const loadPoiTypes = async () => {
      try {
        setLoadingPoiTypes(true)
        const data = await getPOITypes()
        setPoiTypeOptions(data)
      } catch (error) {
        console.error('Error fetching POI types:', error)
        setPoiTypeOptions([])
      } finally {
        setLoadingPoiTypes(false)
      }
    }

    loadPoiTypes()
  }, [])

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        setLoadingPreferences(true)
        const data = await getPreferences()
        setPreferencesList(data)
      } catch (e) {
        console.error("Lỗi khi tải danh sách Preferences:", e)
      } finally {
        setLoadingPreferences(false)
      }
    }
    fetchPrefs()
  }, [])


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

  const handleInactivate = (poi: PartnerPOI) => {
    setConfirmPoi(poi)
  }

  const handleRequestReactivation = async (poi: PartnerPOI) => {
    try {
      setSubmitting(true)
      const updated = await requestReactivationMyPartnerPOI(poi.id)
      showToast("success", `Đã gửi POI \"${updated.name || poi.name}\" để Manager duyệt lại.`)
      fetchPois(false)
    } catch (error: any) {
      showToast("error", error?.message || 'Có lỗi xảy ra khi gửi request mở lại POI.')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmInactivate = async () => {
    if (!confirmPoi) return
    try {
      setSubmitting(true)
      const result = await inactivateMyPartnerPOI(confirmPoi.id, true)
      showToast("success", result.message)
      setConfirmPoi(null)
      fetchPois(false)
    } catch (error: any) {
      showToast("error", error?.message || 'Có lỗi xảy ra khi ngừng hoạt động POI.')
    } finally {
      setSubmitting(false)
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
      
      // Tải lại dữ liệu mới từ API
      const result = await getMyPartnerPOIs(page, pageSize)
      
      // Nếu có chỉnh sửa ảnh, thêm cache-buster để tránh trình duyệt cache ảnh cũ
      const cacheBust = Date.now()
      const withCacheBust = (url: string) => {
        if (!url) return url
        const hasQuery = url.includes("?")
        return `${url}${hasQuery ? "&" : "?"}v=${cacheBust}`
      }

      setPois(
        imageFile && editingPoi
          ? result.items.map((p) =>
              p.id === editingPoi.id && p.poiImgUrl
                ? { ...p, poiImgUrl: withCacheBust(p.poiImgUrl) }
                : p
            )
          : result.items
      )
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
    } catch (error: any) {
      throw error // Let the modal handle it to show inline errors
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">

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
          {poiTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[980px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider min-w-[280px]">Tên POI</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Loại hình</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Giờ mở cửa</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right pr-12">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPois.map((poi) => (
                  <tr key={poi.id} className="hover:bg-slate-50/50 transition-colors">
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
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 break-words block">{poi.name}</span>
                          {poi.locationName && (
                            <p className="text-xs text-slate-400">{poi.locationName}</p>
                          )}

                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {poiTypeOptions.find((item) => item.value === poi.type)?.label || fallbackTypeLabels[poi.type] || poi.type}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusStyles[poi.status] || 'bg-slate-100 text-slate-500'}`}>
                        {statusLabels[poi.status] || poi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-12">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailPoi(poi)}
                          className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                            Xem chi tiết
                            <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(poi)}
                          className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-[#e28743] hover:bg-[#faeadd] hover:border-[#f2c9a9] rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                            Chỉnh sửa
                            <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                          </span>
                        </button>
                        {poi.status === 'Active' && (
                          <button
                            onClick={() => handleInactivate(poi)}
                            className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-all"
                          >
                            <EyeOff size={16} />
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                              Ngừng hoạt động
                              <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                            </span>
                          </button>
                        )}
                        {poi.status === 'Inactive' && (
                          <button
                            onClick={() => handleRequestReactivation(poi)}
                            disabled={submitting}
                            className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <RotateCw size={16} className={submitting ? 'animate-spin' : ''} />
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-50">
                              Gửi request mở lại
                              <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {toast && (
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-3">
              <span className="text-sm text-slate-500">
                Trang {page} / {totalPages} • Tổng: {totalItems} POIs
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
          showToast={showToast}
          poiTypeOptions={poiTypeOptions}
          loadingPoiTypes={loadingPoiTypes}
          preferencesList={preferencesList}
          loadingPreferences={loadingPreferences}
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
          poiTypeOptions={poiTypeOptions}
          preferencesList={preferencesList}
          onClose={() => setDetailPoi(null)}
          onEdit={(poi) => {
            setDetailPoi(null)
            handleEdit(poi)
          }}
        />
      )}

      {/* Confirm Inactivate Modal */}
      <ConfirmModal
        isOpen={!!confirmPoi}
        onClose={() => setConfirmPoi(null)}
        onConfirm={confirmInactivate}
        loading={submitting}
        title="Xác nhận ngừng hoạt động"
        subtitle="POI MANAGEMENT"
        confirmLabel="Ngừng hoạt động"
        message={
          <>
            Bạn có chắc muốn ngừng hoạt động POI <span className="font-bold text-[#e28743]">'{confirmPoi?.name}'</span>?
            <div className="flex gap-2 mt-3 text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-100">
              <X size={14} className="shrink-0 mt-0.5 text-slate-400" />
              <span>Lưu ý: Các quảng cáo liên quan cũng sẽ bị ảnh hưởng và ngừng hiển thị với người dùng ngay lập tức.</span>
            </div>
          </>
        }
      />
    </div>
  )
}

// ── Modal Form Component ────────────────────────────────────────────
import { getLocations, getDistrictsByLocationId, getPreferences, type LocationOption, type District, type POIPreference } from '../../../services/partnerPoiService'
import { CustomSelect } from '../../../components/ui/CustomSelect'

const MAX_PREFERENCES = 4

interface POIFormModalProps {
  poi: PartnerPOI | null
  submitting: boolean
  poiTypeOptions: POITypeOption[]
  loadingPoiTypes: boolean
  preferencesList: POIPreference[]
  loadingPreferences: boolean
  onClose: () => void
  showToast: (type: "success" | "error", message: string) => void
  onSubmit: (
    payload: CreatePartnerPOIPayload | UpdatePartnerPOIPayload,
    imageFile?: File | null
  ) => Promise<void>
}

function POIFormModal({ 
  poi, 
  submitting, 
  poiTypeOptions, 
  loadingPoiTypes, 
  preferencesList,
  loadingPreferences,
  onClose, 
  showToast, 
  onSubmit 
}: POIFormModalProps) {
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
  const [type, setType] = useState<POIType | ''>(poi?.type ?? '')
  const [locationId, setLocationId] = useState(poi?.locationId ?? '')
  const [districtId, setDistrictId] = useState(poi?.districtId ?? '')
  const [poiPreferences, setPoiPreferences] = useState<string[]>(poi?.poiPreferences ?? [])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(poi?.poiImgUrl ?? null)

  const [locations, setLocations] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)


  useEffect(() => {
    if (poi?.poiPreferences && preferencesList.length > 0) {
      const mappedIds = poi.poiPreferences.map(prefVal => {
        const byId = preferencesList.find(p => p.id === prefVal)
        if (byId) return byId.id
        const byName = preferencesList.find(p => p.name.toLowerCase() === prefVal.toLowerCase())
        if (byName) return byName.id
        return prefVal
      })
      setPoiPreferences(mappedIds)
    }
  }, [poi?.poiPreferences, preferencesList])

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

    if (poiPreferences.length > MAX_PREFERENCES) {
      showToast("error", `Mỗi user chỉ được chọn tối đa ${MAX_PREFERENCES} preference`)
      return
    }

    try {
      if (isEditing) {
        const payload: UpdatePartnerPOIPayload = {
          Name: name,
          Address: address,
          ApproxCost: approxCost,
          OpenHour: is24Hours ? '00:00' : openHour,
          CloseHour: is24Hours ? '23:59' : closeHour,
          Is24Hours: is24Hours,
          VisitRecommendation: visitRecommendation,
          GoogleMapLink: googleMapLink,
          IsIndoor: isIndoor,
          Type: type === '' ? undefined : type,
          LocationId: locationId,
          DistrictId: districtId,
          PoiPreferences: poiPreferences,
        }

        await onSubmit(payload, imageFile)
      } else {
        if (!name || !address || !locationId || !districtId || !type) {
          showToast("error", 'Vui lòng điền đầy đủ thông tin bắt buộc.')
          return
        }
        const payload: CreatePartnerPOIPayload = {
          Name: name,
          Address: address,
          ApproxCost: approxCost,
          OpenHour: is24Hours ? '00:00' : openHour,
          CloseHour: is24Hours ? '23:59' : closeHour,
          Is24Hours: is24Hours,
          VisitRecommendation: visitRecommendation,
          GoogleMapLink: googleMapLink,
          IsIndoor: isIndoor,
          Type: type as POIType,
          LocationId: locationId,
          DistrictId: districtId,
          PoiPreferences: poiPreferences,
        }

        await onSubmit(payload, imageFile)
      }
    } catch (error: any) {
      const msg = error?.message || ""
      if (msg.toLowerCase().includes("district") || msg.toLowerCase().includes("không thuộc")) {
        setFormErrors({ districtId: "District không thuộc City đã chọn" })
      } else {
        showToast("error", msg || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    }
  }

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700"
  const labelClasses = "block text-sm font-semibold text-slate-600 mb-1.5"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full h-full md:h-[90vh] md:max-w-6xl overflow-hidden mx-0 md:mx-4 flex flex-col z-10 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-[#1e293b]">
            {isEditing ? 'Chỉnh sửa POI' : 'Thêm POI mới'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleFormSubmit} 
          className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 overflow-hidden relative bg-white"
        >
          {/* Cột trái: Hình ảnh, Preferences */}
          <div className="p-8 space-y-6 overflow-y-auto border-r border-slate-100 flex flex-col h-full scrollbar-thin">
            {/* Hình ảnh */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 font-bold block">Hình ảnh</span>
                <label className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
                  <Upload size={14} />
                  Chọn ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              
              {/* Image preview box */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 h-[300px] w-full relative shadow-inner flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon size={40} className="mx-auto mb-2 text-slate-300" />
                    <span className="text-xs">Không có hình ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nhãn Preferences */}
            <div className="space-y-3">
              <label className="text-sm text-slate-700 font-bold block">
                Nhãn (Preferences) <span className="text-slate-400 font-normal text-xs">(tối đa {MAX_PREFERENCES})</span>
              </label>
              {loadingPreferences ? (
                <p className="text-xs text-slate-500">Đang tải...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {preferencesList.map(pref => {
                    const isSelected = poiPreferences.includes(pref.id)
                    const isDisable = !isSelected && poiPreferences.length >= MAX_PREFERENCES
                    return (
                      <button
                        type="button"
                        key={pref.id}
                        disabled={isDisable}
                        onClick={() => {
                          setPoiPreferences(prev => {
                            if (isSelected) {
                              return prev.filter(p => p !== pref.id)
                            } else {
                              return [...prev, pref.id]
                            }
                          })
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected 
                            ? 'bg-[#e28743] text-white border-transparent hover:bg-[#cf7632] shadow-sm' 
                            : isDisable
                              ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-[#e28743] hover:text-[#e28743]'
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
          <div className="p-8 space-y-5 overflow-y-auto flex flex-col h-full scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-bold block">Tên POI <span className="text-red-500">*</span></span>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm" 
                  placeholder="Nhập tên POI" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-bold block">Loại hình <span className="text-red-500">*</span></span>
                <CustomSelect
                  value={type}
                  onChange={(val: string) => setType(val as POIType)}
                  options={
                    poiTypeOptions.length > 0 
                      ? poiTypeOptions 
                      : Object.entries(fallbackTypeLabels).map(([value, label]) => ({ value, label }))
                  }
                  placeholder={loadingPoiTypes ? "Đang tải..." : "-- Chọn Loại hình --"}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-bold block">Thành phố (City) <span className="text-red-500">*</span></span>
                <CustomSelect 
                  value={locationId} 
                  onChange={(val) => {
                    setLocationId(val)
                    setDistrictId('') 
                    setDistricts([]) 
                  }}
                  options={locations.map(loc => ({ value: loc.id, label: loc.name }))}
                  placeholder={loadingLocations ? 'Đang tải...' : '-- Chọn Thành phố --'}
                  error={!!formErrors.locationId}
                />
                {formErrors.locationId && <p className="text-red-500 text-xs mt-1">{formErrors.locationId}</p>}
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-bold block">Quận huyện (District) <span className="text-red-500">*</span></span>
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

            <div className="space-y-1.5">
              <span className="text-xs text-slate-500 font-bold block">Địa chỉ <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm" 
                placeholder="Nhập số nhà, tên đường..." 
                required 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-bold block">Chi phí ước tính</span>
                <input 
                  type="text" 
                  value={approxCost} 
                  onChange={(e) => setApproxCost(e.target.value)} 
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm" 
                  placeholder="VD: 100,000 - 200,000 VND" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-bold block">Link Google Map</span>
                <input 
                  type="text" 
                  value={googleMapLink} 
                  onChange={(e) => setGoogleMapLink(e.target.value)} 
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm" 
                  placeholder="https://maps.google.com/..." 
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500 font-bold block">Thời gian mở cửa</span>
              
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is24Hours}
                    onChange={(e) => setIs24Hours(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#e28743] focus:ring-[#e28743]"
                  />
                  <span className="text-xs font-semibold text-slate-600">Mở 24 giờ</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIndoor}
                    onChange={(e) => setIsIndoor(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#e28743] focus:ring-[#e28743]"
                  />
                  <span className="text-xs font-semibold text-slate-600">Trong nhà (Indoor)</span>
                </label>
              </div>

              <div className={`grid grid-cols-2 gap-4 transition-opacity duration-200 ${is24Hours ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="space-y-1.5 relative">
                  <span className="text-[11px] text-slate-400 font-bold block">Giờ mở</span>
                  <div className="relative">
                    <input 
                      type="time" 
                      value={openHour} 
                      disabled={is24Hours}
                      onChange={(e) => setOpenHour(e.target.value)} 
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <span className="text-[11px] text-slate-400 font-bold block">Giờ đóng</span>
                  <div className="relative">
                    <input 
                      type="time" 
                      value={closeHour} 
                      disabled={is24Hours}
                      onChange={(e) => setCloseHour(e.target.value)} 
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gợi ý tham quan */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <label className="text-xs text-slate-500 font-bold block">
                Gợi ý tham quan (VisitRecommendation)
              </label>
              <textarea
                value={visitRecommendation}
                onChange={(e) => setVisitRecommendation(e.target.value)}
                className="w-full p-3 h-20 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all text-slate-700 text-sm resize-none"
                placeholder="Nhập gợi ý cho du khách..."
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="col-span-2 flex-shrink-0 px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-semibold text-sm shadow-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 h-10 rounded-xl bg-[#e28743] hover:bg-[#cf7632] text-white font-semibold disabled:opacity-60 transition-colors text-sm shadow-sm"
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
  poiTypeOptions: POITypeOption[]
  preferencesList: POIPreference[]
  onClose: () => void
  onEdit: (poi: PartnerPOI) => void
}

function POIDetailModal({ poi, poiTypeOptions, preferencesList, onClose, onEdit }: POIDetailModalProps) {
  const openingHours = poi.is24Hours
    ? 'Mở 24 giờ'
    : poi.openHour && poi.closeHour
      ? `${formatTime(poi.openHour, false)} - ${formatTime(poi.closeHour, false)}`
      : 'Chưa cập nhật'

  // Map preferences IDs/Names to clear labels
  const mappedPreferences = (poi.poiPreferences || []).map(prefVal => {
    const found = preferencesList.find(p => p.id === prefVal || p.name.toLowerCase() === prefVal.toLowerCase())
    return found ? found.name : prefVal
  })

  const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5"
  const valClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-700 font-semibold break-words leading-relaxed"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full h-full md:h-[90vh] md:max-w-6xl overflow-hidden mx-0 md:mx-4 flex flex-col z-10 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">Chi tiết POI</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyles[poi.status] || 'bg-slate-100 text-slate-500'}`}>
              {statusLabels[poi.status] || poi.status}
            </span>
          </div>
          <button onClick={onClose} className="group p-2 hover:bg-red-100 rounded-lg transition-all">
            <X size={20} className="text-slate-400 transition-colors" />
          </button>
        </div>

        {/* Body 2 cột */}
        <div className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative">
          
          {/* Cột trái: Hình ảnh */}
          <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col h-full">
            <label className={labelClasses}>Hình ảnh</label>
            <div className="flex-1 min-h-[300px] md:min-h-0 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative shadow-sm">
              {poi.poiImgUrl ? (
                <img src={poi.poiImgUrl} alt={poi.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Cột phải: Các trường thông tin */}
          <div className="space-y-4 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4 flex flex-col">
            
            {/* Tên POI & Loại hình */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Tên POI</label>
                <div className={`${valClasses} font-bold text-slate-800 text-base`}>{poi.name}</div>
              </div>
              <div>
                <label className={labelClasses}>Loại hình</label>
                <div className={`${valClasses} text-[#e28743] font-bold`}>
                  {poiTypeOptions.find((item) => item.value === poi.type)?.label || fallbackTypeLabels[poi.type] || poi.type}
                </div>
              </div>
            </div>

            {/* Thành phố */}
            <div>
              <label className={labelClasses}>Thành phố (City)</label>
              <div className={valClasses}>{poi.locationName || '—'}</div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className={labelClasses}>Địa chỉ</label>
              <div className={valClasses}>{poi.address || '—'}</div>
            </div>

            {/* Chi phí & Link Google Map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Chi phí ước tính</label>
                <div className={valClasses}>{poi.approxCost || '—'}</div>
              </div>
              <div>
                <label className={labelClasses}>Link Google Map</label>
                <div className={valClasses}>
                  {poi.googleMapLink ? (
                    <a href={poi.googleMapLink} target="_blank" rel="noopener noreferrer" className="text-[#e28743] hover:text-[#cf7632] hover:underline flex items-center gap-1">
                      Xem trên bản đồ <ExternalLink size={14} />
                    </a>
                  ) : '—'}
                </div>
              </div>
            </div>

            {/* Giờ mở cửa */}
            <div>
              <label className={labelClasses}>Thời gian mở cửa</label>
              <div className={valClasses}>{openingHours}</div>
            </div>

            {/* Trong nhà / Ngoài trời */}
            <div>
              <label className={labelClasses}>Môi trường</label>
              <div className={valClasses}>{poi.isIndoor ? 'Trong nhà' : 'Ngoài trời'}</div>
            </div>

            {/* Nhãn Preferences */}
            <div>
              <label className={labelClasses}>Nhãn (Preferences)</label>
              {mappedPreferences.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {mappedPreferences.map((prefVal, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#faeadd]/60 text-[#e28743] border border-[#f2c9a9]/30"
                    >
                      {prefVal}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm font-medium italic pl-1">Không có nhãn nào</div>
              )}
            </div>

            {/* Gợi ý tham quan */}
            {poi.visitRecommendation && (
              <div className="flex flex-col">
                <label className={labelClasses}>Gợi ý tham quan</label>
                <div className="px-4 py-3 bg-amber-50/50 border border-amber-100/60 rounded-xl text-sm text-slate-700 font-medium leading-relaxed max-h-[150px] overflow-y-auto">
                  {poi.visitRecommendation}
                </div>
              </div>
            )}

            {/* Tọa độ */}
            {(poi.latitude !== 0 || poi.longitude !== 0) && (
              <div>
                <label className={labelClasses}>Tọa độ địa lý</label>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-700 font-mono">
                  {poi.latitude}, {poi.longitude}
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="col-span-2 flex-shrink-0 bg-white border-t border-slate-200 pt-4 mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Hủy
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

