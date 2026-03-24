import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Check, X, ExternalLink } from "lucide-react"

import {
  getPendingAdvertisements,
  approveAdvertisement,
  rejectAdvertisement
} from "../../../services/advertisementService"

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
  status: number
  createdAt: string
}

export const Route = createFileRoute("/staff/_layout/advertisements")({
  component: AdvertisementsPage,
})

function AdvertisementsPage() {

  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchAds = async () => {

      try {

        const data = await getPendingAdvertisements()
        setAds(data)

      } catch (error) {

        console.error("Fetch advertisements error", error)

      } finally {

        setLoading(false)

      }

    }

    fetchAds()

  }, [])

  const handleApprove = async (id: string) => {

    await approveAdvertisement(id)

    setAds(prev => prev.filter(ad => ad.adId !== id))

  }

  const handleReject = async (id: string) => {

    await rejectAdvertisement(id)

    setAds(prev => prev.filter(ad => ad.adId !== id))

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

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-slate-800">Duyệt quảng cáo</h1>

        <p className="text-slate-500 text-sm mt-1">
          Staff duyệt các quảng cáo đang chờ xử lí
        </p>

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">

                <th className="px-6 py-4">Quảng cáo</th>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Gói</th>
                <th className="px-6 py-4">POI</th>
                <th className="px-6 py-4">Bắt đầu</th>
                <th className="px-6 py-4">Kết thúc</th>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-200">

              {ads.map(ad => (

                <tr key={ad.adId} className="hover:bg-slate-50">

                  {/* Image + Title */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <img
                        src={ad.imageUrl}
                        className="w-10 h-10 rounded object-cover"
                      />

                      <div>

                        <p className="font-medium text-slate-800">
                          {ad.title}
                        </p>

                        <p className="text-xs text-slate-400">
                          {ad.adId}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* Tài khoản */}

                  <td className="px-6 py-4 text-sm">
                    {ad.accountId}
                  </td>

                  {/* Gói */}

                  <td className="px-6 py-4 text-sm">
                    {ad.packageId}
                  </td>

                  {/* POI */}

                  <td className="px-6 py-4 text-sm">
                    {ad.poiId}
                  </td>

                  {/* Bắt đầu */}

                  <td className="px-6 py-4 text-sm">
                    {new Date(ad.startDate).toLocaleDateString()}
                  </td>

                  {/* Kết thúc */}

                  <td className="px-6 py-4 text-sm">
                    {new Date(ad.endDate).toLocaleDateString()}
                  </td>

                  {/* Video */}

                  <td className="px-6 py-4">

                    <a
                      href={ad.videoUrl}
                      target="_blank"
                      className="text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      Xem
                      <ExternalLink size={14}/>
                    </a>

                  </td>

                  {/* Trạng thái */}

                  <td className="px-6 py-4">

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Đang chờ
                    </span>

                  </td>

                  {/* Thao tác */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleApprove(ad.adId)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                      >
                        <Check size={16}/>
                        Duyệt
                      </button>

                      <button
                        onClick={() => handleReject(ad.adId)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200"
                      >
                        <X size={16}/>
                        Từ chối
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}