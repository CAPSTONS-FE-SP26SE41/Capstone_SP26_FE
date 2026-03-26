import { createFileRoute } from '@tanstack/react-router'
import { Megaphone, Plus, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import AdsTable from '../../../components/partner/AdsTable'
import CreateAdModal from '../../../components/partner/CreateAdModal'
import { Ad } from '../../../types/ad'
import { getMyAdvertisements, createAdvertisement } from '../../../services/advertisementService'

export const Route = createFileRoute('/partner/_layout/advertisement')({
  component: PartnerAdvertisementPage,
})

function PartnerAdvertisementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAds = async () => {
    try {
      setLoading(true)
      const data = await getMyAdvertisements()
      setAds(Array.isArray(data) ? data : data?.data || [])
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleCreateAd = async (newAdData: Omit<Ad, 'adId' | 'status'>) => {
    try {
      await createAdvertisement(newAdData)
      setIsModalOpen(false)
      fetchAds() // Refresh list
    } catch (error) {
      console.error("Error creating ad:", error)
      alert("Có lỗi xảy ra khi tạo quảng cáo. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#e28743] hover:bg-[#cf7632] text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-[#e28743]/20"
        >
          <Plus size={20} />
          <span>Tạo quảng cáo</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#e28743]" />
          <p className="font-medium">Đang tải danh sách quảng cáo...</p>
        </div>
      ) : ads.length > 0 ? (
        <AdsTable ads={ads} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-16 text-center">
          <div className="bg-[#faeadd] h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Megaphone className="h-10 w-10 text-[#e28743]" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-8">Chưa có quảng cáo nào</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#e28743] hover:bg-[#cf7632] text-white px-8 py-3 rounded-2xl transition-all font-bold shadow-md hover:shadow-lg"
          >
            Bắt đầu tạo ngay
          </button>
        </div>
      )}

      <CreateAdModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAd}
      />
    </div>
  )
}
