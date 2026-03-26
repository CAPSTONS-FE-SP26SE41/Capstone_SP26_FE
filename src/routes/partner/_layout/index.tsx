import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Package, CreditCard, Loader2, Ban } from 'lucide-react'
import { getMySubscriptions, getSubscriptions } from '../../../services/subscriptionService'
import { createPayment, PaymentResponse } from '../../../services/paymentService'
import PaymentModal from '../../../components/partner/PaymentModal'

export const Route = createFileRoute('/partner/_layout/')({
  validateSearch: (search: Record<string, unknown>): { tab: string } => {
    return {
      tab: (search.tab as string) || 'my-packages',
    }
  },
  component: PartnerPackagePage,
})

function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight)
    }
  }, [text])

  if (!text) return <p className="italic text-slate-400">Không có mô tả</p>

  return (
    <div className="relative">
      <div 
        ref={textRef}
        className={`text-slate-600 transition-all duration-300 break-words ${!isExpanded ? 'line-clamp-2' : ''}`}
      >
        {text}
      </div>
      {(isTruncated || isExpanded) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors mt-1 font-medium underline underline-offset-2"
        >
          {isExpanded ? 'View less' : 'View all'}
        </button>
      )}
    </div>
  )
}

function PartnerPackagePage() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  
  const activeTab = tab === 'register' ? 'register' : 'my-packages'
  const setActiveTab = (newTab: 'my-packages' | 'register') => {
    navigate({ search: { tab: newTab } })
  }

  const [mySubs, setMySubs] = useState<any[]>([])
  const [availablePkgs, setAvailablePkgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const subsData = await getMySubscriptions()
      setMySubs(Array.isArray(subsData) ? subsData : subsData?.data || [])
    } catch (error) {
      console.warn("No active subscriptions found or API error:", error)
      setMySubs([])
    }

    try {
      const pkgsData = await getSubscriptions()
      const allReceivedPkgs = (Array.isArray(pkgsData) ? pkgsData : pkgsData?.data || pkgsData?.items || [])
      setAvailablePkgs(allReceivedPkgs)
    } catch (error) {
      console.error("Error fetching available packages:", error)
      setAvailablePkgs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBuyPackage = async (packageId: string) => {
    try {
      setIsProcessing(true)
      const res = await createPayment({ packageId: packageId })
      setPaymentData(res)
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error("Payment creation failed:", error)
      alert("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (sub: any) => {
    const status = sub.status?.toString().toLowerCase();
    const adsUsed = sub.adsUsed ?? sub.AdsUsed ?? 0;
    const maxAds = sub.maxAds ?? sub.MaxAds ?? 0;

    // 1. Kiểm tra nếu đã hết lượt quảng cáo
    if (adsUsed >= maxAds && maxAds > 0) {
      return (
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm">
          <Ban size={13} />
          Đã sử dụng hết
        </span>
      )
    }

    // 2. Kiểm tra theo trạng thái enum
    switch (status) {
      case 'active':
      case '0':
        return (
          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-100 flex items-center gap-1.5 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang hoạt động
          </span>
        )
      case 'expired':
      case '1':
        return (
          <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[11px] font-bold border border-rose-100 flex items-center gap-1.5 shadow-sm">
            <Ban size={13} />
            Hết hạn
          </span>
        )
      default:
        // Mặc định cho hiển thị list "Gói của tôi" là đang hoạt động nếu không khớp enum khác
        return (
          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-100 flex items-center gap-1.5 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang hoạt động
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my-packages')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'my-packages'
              ? 'text-[#e28743]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={18} />
            <span>Gói quảng cáo của tôi</span>
          </div>
          {activeTab === 'my-packages' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e28743]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'register'
              ? 'text-[#e28743]'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard size={18} />
            <span>Đăng ký gói quảng cáo</span>
          </div>
          {activeTab === 'register' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e28743]" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#e28743]" />
          <p className="font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : activeTab === 'my-packages' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {mySubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySubs.map((sub: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-slate-800">{sub.packageTitle || sub.SubscriptionPackage?.Title || "Gói quảng cáo"}</h4>
                    {getStatusBadge(sub)}
                  </div>
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngày đăng ký:</span>
                      <span className="font-semibold text-slate-700">{formatDate(sub.createdAt || sub.CreatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngày hết hạn:</span>
                      <span className="font-semibold text-slate-700">
                        {formatDate(sub.expiredAt || sub.ExpiredAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giới hạn quảng cáo:</span>
                      <span className={`font-semibold ${sub.adsUsed >= sub.maxAds ? 'text-amber-600' : 'text-slate-700'}`}>
                        {sub.adsUsed ?? sub.AdsUsed ?? 0} / {sub.maxAds || sub.MaxAds}
                      </span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors">
                    Chi tiết
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="bg-[#faeadd] h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-[#e28743]" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-8">Chưa có gói quảng cáo nào</h3>
              <button 
                onClick={() => setActiveTab('register')}
                className="bg-[#e28743] hover:bg-[#cf7632] text-white px-6 py-3 rounded-xl transition-colors font-semibold shadow-sm"
              >
                Xem các gói dịch vụ
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {availablePkgs.length > 0 ? availablePkgs.map((pkg: any, i: number) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow`}>
              <h4 className="text-xl font-bold text-slate-800 mb-1">{pkg.title || pkg.Title}</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-[#e28743]">{new Intl.NumberFormat('vi-VN').format(pkg.price || pkg.Price)} VND</span>
                <span className="text-slate-400 text-sm">/ {pkg.durationDays || pkg.DurationDays} ngày</span>
              </div>
              <p className="text-slate-600 font-medium mb-4">Tối đa {pkg.maxAdsPerPeriod || pkg.MaxAdsPerPeriod} quảng cáo</p>
              <div className="text-sm border border-slate-100 mb-6 bg-slate-50 p-4 rounded-xl min-h-[90px]">
                <ExpandableDescription text={pkg.description || pkg.Description || ""} />
              </div>
              <button 
                disabled={isProcessing}
                onClick={() => handleBuyPackage(pkg.packageId || pkg.PackageId || pkg.id)}
                className={`w-full py-3 rounded-xl font-bold transition-colors bg-[#e28743] text-white hover:bg-[#cf7632] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isProcessing && <Loader2 size={18} className="animate-spin" />}
                Mua gói
              </button>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 italic">Hiện tại chưa có gói dịch vụ nào được mở bán.</p>
            </div>
          )}
        </div>
      )}

      {paymentData && (
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            fetchData() // Refresh status
          }}
          paymentData={paymentData}
        />
      )}
    </div>
  )
}
