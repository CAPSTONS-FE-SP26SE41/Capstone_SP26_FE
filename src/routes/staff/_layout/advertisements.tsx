import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Check, X, ExternalLink, ChevronUp, ChevronDown, Eye } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { createPortal } from "react-dom"
import {
  getManagerAccounts,
  getManagerAccountAdvertisements,
  approveAdvertisement,
  rejectAdvertisement,
  getAdvertisementById,
  type AdvertisementDetail
} from "../../../services/advertisementService"
import {
  approveManagerPendingPOI,
  getManagerPendingPOIs,
  getStaffPOIs,
  rejectManagerPendingPOI,
  getStaffPOIById,
  type StaffPOI,
} from "../../../services/poiService"

type Advertisement = {
  adId: string
  accountId: string
  packageId: string
  poiId: string
  title: string
  videoUrl: string
  content: string
  imageUrl: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
  poiName?: string
  poi?: {
    name: string
  }
}

export const Route = createFileRoute("/staff/_layout/advertisements")({
  component: AdvertisementsPage,
})

function AdvertisementsPage() {

  const [activeTab, setActiveTab] = useState<"poi" | "advertisement">("poi")
  const [ads, setAds] = useState<Advertisement[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAds, setLoadingAds] = useState(false)
  const [loadingPendingPois, setLoadingPendingPois] = useState(false)
  const [poiMap, setPoiMap] = useState<Record<string, string>>({})
  const [pendingPois, setPendingPois] = useState<StaffPOI[]>([])
  const [pendingPoiPage, setPendingPoiPage] = useState(1)
  const [pendingPoiPageSize] = useState(10)
  const [pendingPoiTotalPages, setPendingPoiTotalPages] = useState(1)
  const [selectedAdDetail, setSelectedAdDetail] = useState<AdvertisementDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [fetchingDetail, setFetchingDetail] = useState(false)

  const [selectedPoiDetail, setSelectedPoiDetail] = useState<StaffPOI | null>(null)
  const [isPoiDetailModalOpen, setIsPoiDetailModalOpen] = useState(false)
  const [fetchingPoiDetail, setFetchingPoiDetail] = useState(false)

  const handleShowPoiDetail = async (id: string) => {
    setFetchingPoiDetail(true)
    try {
      const detail = await getStaffPOIById(id)
      if (detail) {
        setSelectedPoiDetail(detail)
        setIsPoiDetailModalOpen(true)
      }
    } catch (error) {
      console.error("Fetch POI detail error", error)
    } finally {
      setFetchingPoiDetail(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, poisData] = await Promise.all([
          getManagerAccounts(),
          getStaffPOIs().catch(() => [])
        ])

        const accountsList = accountsData?.items || accountsData
        setAccounts(Array.isArray(accountsList) ? accountsList : [])

        const poiMapping: Record<string, string> = {}
        if (Array.isArray(poisData)) {
          poisData.forEach(poi => {
            poiMapping[poi.Id] = poi.Name
          })
        }
        setPoiMap(poiMapping)

      } catch (error) {
        console.error("Fetch initial data error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchAds = async () => {
      if (!selectedAccountId) {
        setAds([])
        return
      }
      setLoadingAds(true)
      try {
        const data = await getManagerAccountAdvertisements(selectedAccountId)
        const adsData = data?.items || data
        setAds(Array.isArray(adsData) ? adsData : [])
      } catch (error) {
        console.error("Fetch account ads error", error)
        setAds([])
      } finally {
        setLoadingAds(false)
      }
    }
    fetchAds()
  }, [selectedAccountId])

  useEffect(() => {
    const fetchPendingPois = async () => {
      setLoadingPendingPois(true)
      try {
        const data = await getManagerPendingPOIs(pendingPoiPage, pendingPoiPageSize)
        setPendingPois(data.items)
        setPendingPoiTotalPages(Math.max(1, data.totalPages || 1))
      } catch (error) {
        console.error("Fetch pending POIs error", error)
        setPendingPois([])
        setPendingPoiTotalPages(1)
      } finally {
        setLoadingPendingPois(false)
      }
    }

    if (activeTab === "poi") {
      fetchPendingPois()
    }
  }, [activeTab, pendingPoiPage, pendingPoiPageSize])

  const handleApprove = async (id: string) => {

    await approveAdvertisement(id)

    setAds(prev => prev.filter(ad => ad.adId !== id))

  }

  const handleReject = async (id: string) => {

    await rejectAdvertisement(id)

    setAds(prev => prev.filter(ad => ad.adId !== id))

  }

  const handleApprovePendingPoi = async (id: string) => {
    await approveManagerPendingPOI(id)
    setPendingPois((prev) => prev.filter((poi) => poi.Id !== id))
  }

  const handleRejectPendingPoi = async (id: string) => {
    await rejectManagerPendingPOI(id)
    setPendingPois((prev) => prev.filter((poi) => poi.Id !== id))
  }

  const handleShowDetail = async (id: string) => {
    setFetchingDetail(true)
    try {
      const detail = await getAdvertisementById(id)
      if (detail) {
        setSelectedAdDetail(detail)
        setIsDetailModalOpen(true)
      }
    } catch (error) {
      console.error("Fetch ad detail error", error)
    } finally {
      setFetchingDetail(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Đang tải quảng cáo...
      </div>
    )
  }

  return (

    <div className="flex flex-col h-[calc(100vh-185px)] gap-0 overflow-hidden">

      {/* Removed Header */}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-2 gap-8 flex-shrink-0">
        <button
          onClick={() => setActiveTab('poi')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'poi'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          Xét duyệt POI
        </button>
        <button
          onClick={() => setActiveTab('advertisement')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'advertisement'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
        >
          Xét duyệt Advertisement
        </button>
      </div>

      {/* Table Content */}
      {activeTab === 'advertisement' ? (
        <div className="flex-1 min-h-0 mt-6 overflow-hidden">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Danh sách Partner</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {accounts.length > 0 ? (
                <ul className="space-y-4">
                  {accounts.map((acc, idx) => {
                    const accId = acc?.accountId || acc?.id || (typeof acc === 'string' ? acc : idx.toString())
                    let displayValue = typeof acc === 'string' ? acc : 'Unknown Partner'
                    if (typeof acc === 'object' && acc !== null) {
                      const namePart = acc.name || acc.email || acc.accountId || 'Unknown'
                      const countPart = acc.pendingAdsCount !== undefined ? `(${acc.pendingAdsCount} ads pending)` : ''
                      displayValue = `${namePart} ${countPart}`.trim()
                    }

                    const isExpanded = selectedAccountId === accId

                    return (
                      <li key={idx} className="flex flex-col border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-emerald-300 shadow-sm">

                        {/* Partner Row */}
                        <div
                          className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                            }`}
                          onClick={() => setSelectedAccountId(isExpanded ? null : accId)}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-base">{displayValue}</span>
                            {acc?.email && acc?.name && <span className="text-sm text-slate-500 mt-0.5">{acc.email}</span>}
                          </div>

                          <button
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${isExpanded
                                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                          >
                            {isExpanded ? (
                              <>Thu gọn <ChevronUp size={16} /></>
                            ) : (
                              <>Xem chi tiết <ChevronDown size={16} /></>
                            )}
                          </button>
                        </div>

                        {/* Expanded Ads Container */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 bg-white">

                            {loadingAds ? (
                              <div className="px-6 py-10 text-center text-slate-500">
                                Đang tải quảng cáo...
                              </div>
                            ) : ads.length > 0 ? (

                              <div className="overflow-x-auto overflow-y-visible">
                                <table className="w-full text-left border-collapse table-fixed">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="w-[25%] px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Quảng cáo</th>
                                      <th className="w-[20%] px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">POI</th>
                                      <th className="w-[18%] px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Thời gian đăng</th>
                                      <th className="w-[10%] px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Video</th>
                                      <th className="w-[12%] px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Trạng thái</th>
                                      <th className="w-[15%] px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide text-right">Thao tác</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {ads.map(ad => (
                                      <tr key={ad.adId} className="hover:bg-slate-50/50">

                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                            {ad.imageUrl ? (
                                              <img
                                                src={ad.imageUrl}
                                                alt={ad.title}
                                                className="w-8 h-8 rounded border border-slate-200 object-cover flex-shrink-0"
                                              />
                                            ) : (
                                              <div className="w-8 h-8 rounded border border-slate-200 bg-slate-100 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-semibold text-slate-800 truncate" title={ad.title}>
                                                {ad.title}
                                              </p>
                                            </div>
                                          </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600 truncate" title={ad.poiName || ad.poi?.name || poiMap[ad.poiId] || ad.poiId}>
                                          {ad.poiName || ad.poi?.name || poiMap[ad.poiId] || ad.poiId}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                          <div>
                                            {new Date(ad.startDate).toLocaleDateString()}
                                          </div>
                                          <div className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                                            đến {new Date(ad.endDate).toLocaleDateString()}
                                          </div>
                                        </td>

                                        <td className="px-6 py-4">
                                          {ad.videoUrl && ad.videoUrl !== "string" ? (
                                            <a
                                              href={ad.videoUrl}
                                              target="_blank"
                                              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium transition-colors"
                                            >
                                              Xem <ExternalLink size={14} />
                                            </a>
                                          ) : (
                                            <span className="text-sm text-slate-300 flex items-center gap-1 font-medium cursor-not-allowed select-none">
                                              Xem <ExternalLink size={14} className="opacity-50" />
                                            </span>
                                          )}
                                        </td>

                                        <td className="px-6 py-4">
                                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${(ad.status === 'PendingApproval' || ad.status === 'Pending' || !ad.status) ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                              (ad.status === 'Active' || ad.status === 'Approved') ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                                "bg-rose-100 text-rose-700 border border-rose-200"
                                            }`}>
                                            {(ad.status === 'PendingApproval' || ad.status === 'Pending' || !ad.status) ? "Chờ xét duyệt" : (ad.status === 'Active' || ad.status === 'Approved') ? "Hoạt động" : "Từ chối"}
                                          </span>
                                        </td>

                                        <td className="px-6 py-4">
                                          <div className="flex justify-end pr-2 gap-2">
                                            <button
                                              onClick={() => handleShowDetail(ad.adId)}
                                              disabled={fetchingDetail}
                                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                            >
                                              <Eye size={16} />
                                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                                Xem chi tiết
                                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                                              </span>
                                            </button>
                                            <button
                                              onClick={() => handleApprove(ad.adId)}
                                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                            >
                                              <Check size={16} />
                                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                                Duyệt
                                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                                              </span>
                                            </button>
                                            <button
                                              onClick={() => handleReject(ad.adId)}
                                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                                            >
                                              <X size={16} />
                                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                                Từ chối
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

                            ) : (
                              <div className="px-6 py-10 text-center text-slate-500">
                                Chưa có quảng cáo nào.
                              </div>
                            )}

                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  Chưa có Partner nào.
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-6 overflow-hidden">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Danh sách POI chờ duyệt</h2>
              <span className="text-sm text-slate-500">Trang {pendingPoiPage}/{pendingPoiTotalPages}</span>
            </div>

          {loadingPendingPois ? (
            <div className="py-16 text-center text-slate-500">Đang tải danh sách POI chờ duyệt...</div>
          ) : pendingPois.length === 0 ? (
            <div className="py-16 text-center text-slate-500">Hiện không có POI nào đang chờ duyệt.</div>
          ) : (
            <>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="flex-shrink-0">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide w-[30%]">Tên POI</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide w-[30%]">Địa chỉ</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide w-[15%]">Thành phố</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide w-[12%]">Trạng thái</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide text-right w-[13%]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingPois.map((poi) => (
                      <tr key={poi.Id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{poi.Name || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 truncate" title={poi.Address}>
                          {poi.Address || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 truncate" title={poi.LocationName}>
                          {poi.LocationName || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-100 text-amber-700 border border-amber-200">
                            Chờ xét duyệt
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end pr-2 gap-2">
                            <button
                              onClick={() => void handleShowPoiDetail(poi.Id)}
                              disabled={fetchingPoiDetail}
                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                            >
                              <Eye size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                Xem chi tiết
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>
                            <button
                              onClick={() => void handleApprovePendingPoi(poi.Id)}
                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm"
                            >
                              <Check size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                Duyệt
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>
                            <button
                              onClick={() => void handleRejectPendingPoi(poi.Id)}
                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                            >
                              <X size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                Từ chối
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

              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 flex-shrink-0">
                <button
                  disabled={pendingPoiPage <= 1}
                  onClick={() => setPendingPoiPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  disabled={pendingPoiPage >= pendingPoiTotalPages}
                  onClick={() => setPendingPoiPage((p) => Math.min(pendingPoiTotalPages, p + 1))}
                  className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Tiếp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )}


    {/* Detail Modal */}
    <AnimatePresence>
      {isDetailModalOpen && selectedAdDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Chi tiết Quảng cáo</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Media & Basic Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Hình ảnh & Video</h4>
                    <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative group">
                      {selectedAdDetail.imageUrl ? (
                        <img
                          src={selectedAdDetail.imageUrl}
                          alt={selectedAdDetail.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Không có hình ảnh</div>
                      )}
                      {selectedAdDetail.videoUrl && selectedAdDetail.videoUrl !== "string" && (
                        <a
                          href={selectedAdDetail.videoUrl}
                          target="_blank"
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2">
                            <ExternalLink size={16} /> Xem Video
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Tiêu đề</label>
                      <p className="text-lg font-bold text-slate-800">{selectedAdDetail.title}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Nội dung</label>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {selectedAdDetail.content}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Ngày bắt đầu</label>
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(selectedAdDetail.startDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Ngày kết thúc</label>
                        <p className="text-sm font-semibold text-slate-700">
                          {new Date(selectedAdDetail.endDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Promotion Info */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Thông tin Khuyến mãi</h4>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${(selectedAdDetail.status === 'PendingApproval' || selectedAdDetail.status === 'Pending') ? "bg-amber-400" : "bg-emerald-400"}`} />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                          {(selectedAdDetail.status === 'PendingApproval' || selectedAdDetail.status === 'Pending' || !selectedAdDetail.status) ? "Chờ duyệt" : "Đã duyệt"}
                        </span>
                      </div>
                    </div>
                    {selectedAdDetail.promotion ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full -mr-12 -mt-12 blur-2xl" />
                        
                        <div>
                          <label className="text-xs font-bold text-emerald-600 uppercase">Tiêu đề khuyến mãi</label>
                          <p className="font-bold text-slate-800 text-lg">{selectedAdDetail.promotion.title}</p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-emerald-600 uppercase">Mô tả</label>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {selectedAdDetail.promotion.description}
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-emerald-600 uppercase">Điều khoản & Điều kiện</label>
                          <p className="text-sm text-slate-600 italic bg-white/50 p-3 rounded-lg border border-emerald-100 mt-1">
                            {selectedAdDetail.promotion.terms}
                          </p>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                        <div className="text-4xl mb-2">🎁</div>
                        <p className="text-sm font-medium">Không có khuyến mãi kèm theo</p>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              {(selectedAdDetail.status === 'PendingApproval' || selectedAdDetail.status === 'Pending' || !selectedAdDetail.status) && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedAdDetail.adId);
                      setIsDetailModalOpen(false);
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-bold bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedAdDetail.adId);
                      setIsDetailModalOpen(false);
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                  >
                    Phê duyệt ngay
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* POI Detail Modal */}
    <AnimatePresence>
      {isPoiDetailModalOpen && selectedPoiDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsPoiDetailModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Chi tiết POI chờ duyệt</h3>
              <button
                onClick={() => setIsPoiDetailModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Image */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 h-[280px]">
                  {selectedPoiDetail.POIImgUrl ? (
                    <img
                      src={selectedPoiDetail.POIImgUrl}
                      alt={selectedPoiDetail.Name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      Không có ảnh POI
                    </div>
                  )}
                </div>

                {/* Right side: Core Info */}
                <dl className="grid grid-cols-1 gap-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Tên POI</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{selectedPoiDetail.Name || "—"}</dd>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Địa chỉ</dt>
                    <dd className="mt-1 text-sm text-slate-800">{selectedPoiDetail.Address || "—"}</dd>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Thành phố / Khu vực</dt>
                    <dd className="mt-1 text-sm text-slate-800">{selectedPoiDetail.LocationName || "—"}</dd>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Google Maps</dt>
                    <dd className="mt-1 text-sm text-slate-800 truncate" title={selectedPoiDetail.GoogleMapLink}>
                      {selectedPoiDetail.GoogleMapLink ? (
                        <a
                          href={selectedPoiDetail.GoogleMapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          Xem trên bản đồ <ExternalLink size={12} />
                        </a>
                      ) : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Grid 2 Column for extra info */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Chi phí dự kiến</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoiDetail.ApproxCost || "—"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Loại địa điểm</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoiDetail.IsIndoor ? "Trong nhà (Indoor)" : "Ngoài trời (Outdoor)"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Giờ mở cửa</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoiDetail.OpenHour || "—"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Giờ đóng cửa</dt>
                  <dd className="mt-1 text-sm text-slate-800">{selectedPoiDetail.CloseHour || "—"}</dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Tọa độ (Latitude / Longitude)</dt>
                  <dd className="mt-1 text-sm text-slate-800">
                    {Number.isFinite(selectedPoiDetail.Latitude) ? selectedPoiDetail.Latitude.toFixed(6) : "—"}
                    {" / "}
                    {Number.isFinite(selectedPoiDetail.Longitude) ? selectedPoiDetail.Longitude.toFixed(6) : "—"}
                  </dd>
                </div>
                <div className="border-b border-slate-100 pb-2">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Đăng bởi đối tác</dt>
                  <dd className="mt-1 text-sm text-slate-800 break-all">{selectedPoiDetail.PartnerName || selectedPoiDetail.PartnerId || "—"}</dd>
                </div>
              </dl>

              {selectedPoiDetail.VisitRecommendation && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gợi ý tham quan</dt>
                  <dd className="text-sm text-slate-600 leading-relaxed">{selectedPoiDetail.VisitRecommendation}</dd>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => {
                  void handleRejectPendingPoi(selectedPoiDetail.Id);
                  setIsPoiDetailModalOpen(false);
                }}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
              >
                Từ chối
              </button>
              <button
                onClick={() => {
                  void handleApprovePendingPoi(selectedPoiDetail.Id);
                  setIsPoiDetailModalOpen(false);
                }}
                className="px-6 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                Phê duyệt ngay
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </div>
  )
}