import { createFileRoute } from '@tanstack/react-router'
import { Megaphone, Plus, Loader2, PackageX } from 'lucide-react'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { useState, useEffect } from 'react'
import { getMyPartnerPOIs } from '../../../services/partnerPoiService'
import AdsTable from '../../../components/partner/AdsTable'
import CreateAdModal from '../../../components/partner/CreateAdModal'
import { Ad } from '../../../types/ad'
import { getMyAdvertisements, createAdvertisement, updateAdvertisement } from '../../../services/advertisementService'
import { getMyActiveSubscription } from '../../../services/subscriptionService'

export const Route = createFileRoute('/partner/_layout/advertisement')({
  component: PartnerAdvertisementPage,
})

function PartnerAdvertisementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [poiNameMap, setPoiNameMap] = useState<Record<string, string>>({})
  const [checkingSubscription, setCheckingSubscription] = useState(false)
  const [showNoSubWarning, setShowNoSubWarning] = useState(false)

  const fetchAds = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const data = await getMyAdvertisements()
      setAds(Array.isArray(data) ? data : data?.data || [])
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()

    const fetchPoiNames = async () => {
      try {
        const result = await getMyPartnerPOIs(1, 1000)
        const map: Record<string, string> = {}
        result.items.forEach((poi) => {
          if (poi.id) map[poi.id] = poi.name
        })
        setPoiNameMap(map)
      } catch (error) {
        console.error('Error fetching POI names:', error)
        setPoiNameMap({})
      }
    }

    fetchPoiNames()

    const token = localStorage.getItem("partner_token")
    if (token) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5246/api'
      const hubUrl = baseUrl.replace('/api', '') + '/hubs/notification'
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build()

      connection.on("ReceiveNotification", (notification) => {
        if (notification?.Type === "AD_UPDATED" || notification?.type === "AD_UPDATED") {
          fetchAds(false)
        }
      })

      connection.start().catch(err => console.error("SignalR Ad Error: ", err))

      return () => {
        connection.stop()
      }
    }
  }, [])

  const handleAdSubmit = async (formData: Omit<Ad, 'adId' | 'status'>, imageFile?: File | null, videoFile?: File | null) => {
    try {
      if (editingAd && editingAd.adId) {
        await updateAdvertisement(editingAd.adId, {
          title: formData.title,
          content: formData.content,
          startDate: formData.startDate,
          endDate: formData.endDate,
          promotion: {
            title: formData.promotion?.title ?? "",
            description: formData.promotion?.description,
            terms: formData.promotion?.terms,
            limitSaveCount: formData.promotion?.limitSaveCount,
          },

        }, imageFile, videoFile)
      } else {
        await createAdvertisement({
          poiId: formData.poiId,
          title: formData.title,
          content: formData.content,
          startDate: formData.startDate,
          endDate: formData.endDate,
          promotion: {
            title: formData.promotion?.title ?? "",
            description: formData.promotion?.description,
            terms: formData.promotion?.terms,
            limitSaveCount: formData.promotion?.limitSaveCount,
          },

        }, imageFile, videoFile)
      }
      setIsModalOpen(false)
      setEditingAd(null)
      fetchAds()
    } catch (error) {
      console.error("Error submitting ad:", error)
      alert("Có lỗi xảy ra khi xử lý quảng cáo. Vui lòng thử lại.")
    }
  }

  const handleEditClick = (ad: Ad) => {
    setEditingAd(ad)
    setIsModalOpen(true)
  }

  const handleOpenCreateAdModal = async () => {
    setCheckingSubscription(true)
    try {
      await getMyActiveSubscription()
      // Nếu thành công -> có gói Active -> mở form
      setIsModalOpen(true)
    } catch (_) {
      // 404 hoặc lỗi -> không có gói Active -> hiển thị cảnh báo
      setShowNoSubWarning(true)
    } finally {
      setCheckingSubscription(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />
        <button
          onClick={handleOpenCreateAdModal}
          disabled={checkingSubscription}
          className="flex items-center gap-2 bg-[#e28743] hover:bg-[#cf7632] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-[#e28743]/20"
        >
          {checkingSubscription ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
          <span>Tạo quảng cáo</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#e28743]" />
          <p className="font-medium">Đang tải danh sách quảng cáo...</p>
        </div>
      ) : ads.length > 0 ? (
        <AdsTable 
          ads={ads} 
          poiNameMap={poiNameMap} 
          onRefresh={() => fetchAds(false)} 
          onEdit={handleEditClick}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-16 text-center">
          <div className="bg-[#faeadd] h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Megaphone className="h-10 w-10 text-[#e28743]" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-8">Chưa có quảng cáo nào</h3>
          <button
            onClick={handleOpenCreateAdModal}
            disabled={checkingSubscription}
            className="bg-[#e28743] hover:bg-[#cf7632] disabled:opacity-60 text-white px-8 py-3 rounded-2xl transition-all font-bold shadow-md hover:shadow-lg"
          >
            {checkingSubscription ? "Đang kiểm tra..." : "Bắt đầu tạo ngay"}
          </button>
        </div>
      )}

      <CreateAdModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAd(null)
        }}
        onSubmit={handleAdSubmit}
        initialData={editingAd}
      />

      {/* Modal cảnh báo chưa có gói Active */}
      {showNoSubWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center">
              <PackageX className="h-8 w-8 text-amber-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có gói quảng cáo</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Bạn chưa đăng kí gói quảng cáo nào đang hoạt động.<br />
                Vui lòng đăng kí gói trước khi tạo quảng cáo.
              </p>
            </div>
            <button
              onClick={() => {
                setShowNoSubWarning(false)
                window.location.href = '/partner'
              }}
              className="w-full py-3 rounded-2xl bg-[#e28743] hover:bg-[#cf7632] text-white font-bold transition-all"
            >
              Đăng kí ngay
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
