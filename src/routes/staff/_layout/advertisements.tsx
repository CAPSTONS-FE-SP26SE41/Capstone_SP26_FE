import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Check, X, ExternalLink, ChevronUp, ChevronDown } from "lucide-react"
import {
  getManagerAccounts,
  getManagerAccountAdvertisements,
  approveAdvertisement,
  rejectAdvertisement
} from "../../../services/advertisementService"
import {
  approveManagerPendingPOI,
  getManagerPendingPOIs,
  getStaffPOIs,
  rejectManagerPendingPOI,
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

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Đang tải quảng cáo...
      </div>
    )
  }

  return (

    <div className="flex flex-col gap-6">

      {/* Removed Header */}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-2 gap-8">
        <button
          onClick={() => setActiveTab('poi')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'poi'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          Xét duyệt POI
        </button>
        <button
          onClick={() => setActiveTab('advertisement')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'advertisement'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          Xét duyệt Advertisement
        </button>
      </div>

      {/* Table Content */}
      {activeTab === 'advertisement' ? (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Danh sách Partner</h2>
            </div>
            
            <div className="p-4 sm:p-6">
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
                          className={`flex justify-between items-center p-4 cursor-pointer transition-colors ${
                            isExpanded ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                          }`}
                          onClick={() => setSelectedAccountId(isExpanded ? null : accId)}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-base">{displayValue}</span>
                            {acc?.email && acc?.name && <span className="text-sm text-slate-500 mt-0.5">{acc.email}</span>}
                          </div>
                          
                          <button
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                              isExpanded
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
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Quảng cáo</th>
                                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">POI</th>
                                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Thời gian đăng</th>
                                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Video</th>
                                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Trạng thái</th>
                                      <th className="px-8 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide text-right">Thao tác</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {ads.map(ad => (
                                      <tr key={ad.adId} className="hover:bg-slate-50/50">
                                        
                                        <td className="px-8 py-4">
                                          <div className="flex items-center gap-3">
                                            {ad.imageUrl ? (
                                              <img
                                                src={ad.imageUrl}
                                                alt={ad.title}
                                                className="w-10 h-10 rounded border border-slate-200 object-cover flex-shrink-0"
                                              />
                                            ) : (
                                              <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 flex-shrink-0" />
                                            )}
                                            <div>
                                              <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                                                {ad.title}
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]" title={ad.poiName || ad.poi?.name || poiMap[ad.poiId] || ad.poiId}>
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
                                        
                                        <td className="w-[160px] px-8 py-4">
                                          {ad.videoUrl && ad.videoUrl !== "string" ? (
                                            <a
                                              href={ad.videoUrl}
                                              target="_blank"
                                              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-medium transition-colors"
                                            >
                                              Xem
                                              <ExternalLink size={14}/>
                                            </a>
                                          ) : (
                                            <span className="text-sm text-slate-300 flex items-center gap-1 font-medium cursor-not-allowed select-none">
                                              Xem
                                              <ExternalLink size={14} className="opacity-50"/>
                                            </span>
                                          )}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                            (ad.status === 'PendingApproval' || ad.status === 'Pending' || !ad.status) ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                            (ad.status === 'Active' || ad.status === 'Approved') ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                            "bg-rose-100 text-rose-700 border border-rose-200"
                                          }`}>
                                            {(ad.status === 'PendingApproval' || ad.status === 'Pending' || !ad.status) ? "Chờ xét duyệt" : (ad.status === 'Active' || ad.status === 'Approved') ? "Hoạt động" : "Từ chối"}
                                          </span>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                          <div className="flex justify-end pr-2 gap-2">
                                            <button
                                              onClick={() => handleApprove(ad.adId)}
                                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                            >
                                              <Check size={16}/>
                                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                                Duyệt
                                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                                              </span>
                                            </button>
                                            <button
                                              onClick={() => handleReject(ad.adId)}
                                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                                            >
                                              <X size={16}/>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Danh sách POI chờ duyệt</h2>
            <span className="text-sm text-slate-500">Trang {pendingPoiPage}/{pendingPoiTotalPages}</span>
          </div>

          {loadingPendingPois ? (
            <div className="py-16 text-center text-slate-500">Đang tải danh sách POI chờ duyệt...</div>
          ) : pendingPois.length === 0 ? (
            <div className="py-16 text-center text-slate-500">Hiện không có POI nào đang chờ duyệt.</div>
          ) : (
            <>
              <div className="overflow-x-hidden overflow-y-visible">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide min-w-[280px]">Tên POI</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Địa chỉ</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Thành phố</th>
                      <th className="px-6 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide">Trạng thái</th>
                      <th className="w-[160px] px-8 py-3 text-xs uppercase text-slate-500 font-semibold tracking-wide text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingPois.map((poi) => (
                      <tr key={poi.Id} className="hover:bg-slate-50/60">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{poi.Name || "—"}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{poi.Address || "—"}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{poi.LocationName || poi.City || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-100 text-amber-700 border border-amber-200">
                            Chờ xét duyệt
                          </span>
                        </td>
                        <td className="w-[160px] px-8 py-4">
                          <div className="flex justify-end pr-2 gap-2">
                            <button
                              onClick={() => void handleApprovePendingPoi(poi.Id)}
                              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                            >
                              <Check size={16} />
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                                Duyệt
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                              </span>
                            </button>
                            <button
                              onClick={() => void handleRejectPendingPoi(poi.Id)}
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

              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
      )}

    </div>
  )
}