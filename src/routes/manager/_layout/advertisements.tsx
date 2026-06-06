import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Check, X, ExternalLink, ChevronUp, ChevronDown, Eye, Image, Maximize2 } from "lucide-react"
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

export const Route = createFileRoute("/manager/_layout/advertisements")({
  component: AdvertisementsPage,
})

function AdvertisementsPage() {

  const [activeTab, setActiveTab] = useState<"poi" | "advertisement">("poi")
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null)

  const [expandedAccountIds, setExpandedAccountIds] = useState<Record<string, boolean>>({})
  const [partnerAds, setPartnerAds] = useState<Record<string, Advertisement[]>>({})
  const [loadingAdsMap, setLoadingAdsMap] = useState<Record<string, boolean>>({})

  const handleToggleExpand = async (accId: string) => {
    const isNowExpanded = !expandedAccountIds[accId]
    setExpandedAccountIds(prev => ({
      ...prev,
      [accId]: isNowExpanded
    }))

    if (isNowExpanded && !partnerAds[accId]) {
      setLoadingAdsMap(prev => ({ ...prev, [accId]: true }))
      try {
        const data = await getManagerAccountAdvertisements(accId)
        const adsData = data?.items || data
        setPartnerAds(prev => ({
          ...prev,
          [accId]: Array.isArray(adsData) ? adsData : []
        }))
      } catch (error) {
        console.error("Fetch account ads error", error)
        setPartnerAds(prev => ({
          ...prev,
          [accId]: []
        }))
      } finally {
        setLoadingAdsMap(prev => ({ ...prev, [accId]: false }))
      }
    }
  }


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
    const originalBodyOverflow = document.body.style.overflow
    const originalBodyHeight = document.body.style.height

    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'

    const mainEl = document.querySelector('main')
    let originalMainOverflow = ''
    let originalMainHeight = ''
    if (mainEl) {
      originalMainOverflow = mainEl.style.overflow
      originalMainHeight = mainEl.style.height
      mainEl.style.overflow = 'hidden'
      mainEl.style.height = 'calc(100vh - 72px)'
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.body.style.height = originalBodyHeight
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow
        mainEl.style.height = originalMainHeight
      }
    }
  }, [])

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
    let targetAccountId: string | null = null
    setPartnerAds(prev => {
      const next = { ...prev }
      for (const accId in next) {
        const found = next[accId].some(ad => ad.adId === id)
        if (found) {
          targetAccountId = accId
          next[accId] = next[accId].filter(ad => ad.adId !== id)
        }
      }
      return next
    })

    if (targetAccountId) {
      setAccounts(prev => prev.map(acc => {
        const accId = acc?.accountId || acc?.id
        if (accId === targetAccountId && acc.pendingAdsCount !== undefined) {
          return {
            ...acc,
            pendingAdsCount: Math.max(0, acc.pendingAdsCount - 1)
          }
        }
        return acc
      }))
    }
  }

  const handleReject = async (id: string) => {
    await rejectAdvertisement(id)
    let targetAccountId: string | null = null
    setPartnerAds(prev => {
      const next = { ...prev }
      for (const accId in next) {
        const found = next[accId].some(ad => ad.adId === id)
        if (found) {
          targetAccountId = accId
          next[accId] = next[accId].filter(ad => ad.adId !== id)
        }
      }
      return next
    })

    if (targetAccountId) {
      setAccounts(prev => prev.map(acc => {
        const accId = acc?.accountId || acc?.id
        if (accId === targetAccountId && acc.pendingAdsCount !== undefined) {
          return {
            ...acc,
            pendingAdsCount: Math.max(0, acc.pendingAdsCount - 1)
          }
        }
        return acc
      }))
    }
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
              <h2 className="text-lg font-semibold text-slate-800">Danh sách quảng cáo chờ duyệt</h2>
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

                    const isExpanded = !!expandedAccountIds[accId]

                    return (
                      <li key={idx} className="flex flex-col border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-emerald-300 shadow-sm">

                        {/* Partner Row */}
                        <div
                          className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                            }`}
                          onClick={() => handleToggleExpand(accId)}
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

                            {loadingAdsMap[accId] ? (
                              <div className="px-6 py-10 text-center text-slate-500">
                                Đang tải quảng cáo...
                              </div>
                            ) : (partnerAds[accId] || []).length > 0 ? (

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
                                    {(partnerAds[accId] || []).map(ad => (
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
                  Không có quảng cáo chờ duyệt
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full h-full md:h-[90vh] md:max-w-6xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Chi tiết Quảng cáo</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative">
              {/* Left: Media */}
              <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col h-full">
                <span className="text-sm font-semibold text-slate-700 block">Hình ảnh quảng cáo</span>
                <div className="flex-1 min-h-[300px] md:min-h-0 w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
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
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2">
                        <ExternalLink size={16} /> Xem Video
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Info */}
              <div className="space-y-6 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4 flex flex-col h-full">
                {/* Header info */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tiêu đề</span>
                  <h4 className="text-2xl font-extrabold text-slate-900 break-words">{selectedAdDetail.title}</h4>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${(selectedAdDetail.status === 'PendingApproval' || selectedAdDetail.status === 'Pending') ? "bg-amber-400" : "bg-emerald-400"}`} />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        {(selectedAdDetail.status === 'PendingApproval' || selectedAdDetail.status === 'Pending' || !selectedAdDetail.status) ? "Chờ duyệt" : "Đã duyệt"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nội dung chi tiết</span>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                      {selectedAdDetail.content}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày bắt đầu</span>
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(selectedAdDetail.startDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày kết thúc</span>
                      <p className="text-sm font-semibold text-slate-800">
                        {new Date(selectedAdDetail.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promotion Info */}
                <div className="flex-1 flex flex-col min-h-[180px]">
                  <span className="text-sm font-semibold text-slate-700 block mb-2">Thông tin Khuyến mãi</span>
                  {selectedAdDetail.promotion ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-4 relative overflow-hidden flex-1">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/50 rounded-full -mr-12 -mt-12 blur-2xl" />
                      
                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase block mb-0.5">Tiêu đề khuyến mãi</span>
                        <p className="font-bold text-slate-800 text-base">{selectedAdDetail.promotion.title}</p>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase block mb-0.5">Mô tả</span>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedAdDetail.promotion.description}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-emerald-600 uppercase block mb-0.5">Điều khoản & Điều kiện</span>
                        <p className="text-xs text-emerald-700 italic bg-white/60 p-3 rounded-lg border border-emerald-100 mt-1 leading-relaxed">
                          {selectedAdDetail.promotion.terms}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                      <div className="text-3xl mb-2">🎁</div>
                      <p className="text-xs font-semibold">Không có khuyến mãi kèm theo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50/50 flex-shrink-0">
              {(selectedAdDetail.status === 'PendingApproval' || selectedAdDetail.status === 'Pending' || !selectedAdDetail.status) ? (
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
              ) : (
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Đóng
                </button>
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
            className="bg-white rounded-2xl shadow-2xl w-[800px] h-[700px] max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
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
            <div className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative">
              {/* Left side: Image */}
              <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col h-full">
                <span className="text-sm font-semibold text-slate-700 block">Hình ảnh POI</span>
                <div 
                  className="flex-1 min-h-[300px] md:min-h-0 w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group shadow-sm cursor-pointer"
                  onClick={() => setFullscreenImageUrl(selectedPoiDetail.POIImgUrl)}
                >
                  {selectedPoiDetail.POIImgUrl ? (
                    <>
                      <img
                        src={selectedPoiDetail.POIImgUrl}
                        alt={selectedPoiDetail.Name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-medium text-sm">
                        <Maximize2 size={24} className="animate-bounce" />
                        <span className="bg-slate-900/60 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">Xem ảnh đầy đủ</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <Image size={48} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">Không có hình ảnh</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Information */}
              <div className="space-y-6 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4 flex flex-col h-full">
                {/* Core Info */}
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

                {/* Extra info */}
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
                  <div className="border-b border-slate-100 pb-2 col-span-1 sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Tọa độ (Latitude / Longitude)</dt>
                    <dd className="mt-1 text-sm text-slate-800">
                      {Number.isFinite(selectedPoiDetail.Latitude) ? selectedPoiDetail.Latitude.toFixed(6) : "—"}
                      {" / "}
                      {Number.isFinite(selectedPoiDetail.Longitude) ? selectedPoiDetail.Longitude.toFixed(6) : "—"}
                    </dd>
                  </div>
                  <div className="border-b border-slate-100 pb-2 col-span-1 sm:col-span-2">
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

    {/* Fullscreen Image Preview Modal */}
    <AnimatePresence>
      {fullscreenImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 cursor-zoom-out"
          onClick={() => setFullscreenImageUrl(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreenImageUrl(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10001] cursor-pointer shadow-lg backdrop-blur-md"
          >
            <X size={24} />
          </button>
          
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            src={fullscreenImageUrl}
            alt="POI Fullscreen Preview"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10 cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>

    </div>
  )
}