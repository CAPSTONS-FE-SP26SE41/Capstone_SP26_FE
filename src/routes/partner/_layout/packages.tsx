import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Package, CreditCard, Loader2, Ban, X, Sparkles, Check } from 'lucide-react'
import { getMySubscriptions, getSubscriptions } from '../../../services/subscriptionService'
import { createPayment, PaymentResponse } from '../../../services/paymentService'
import PaymentModal from '../../../components/partner/PaymentModal'

export const Route = createFileRoute('/partner/_layout/packages')({
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
          {isExpanded ? 'Thu gọn' : 'Xem tất cả'}
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
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

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
    } catch (error: any) {
      console.error("Payment creation failed:", error)
      let customMsg = ""
      try {
        const errorData = JSON.parse(error.message)
        customMsg = errorData.message || errorData
      } catch {
        customMsg = error.message
      }
      
      if (customMsg.includes("đang hoạt động")) {
        customMsg = "Bạn đã có gói đang hoạt động. Vui lòng sử dụng hết hoặc đợi gói cũ hết hạn trước khi đăng ký mới."
      }
      showToast("error", customMsg || "Không thể khởi tạo thanh toán. Vui lòng thử lại sau.")
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
          {availablePkgs.length > 0 ? availablePkgs.map((pkg: any, i: number) => {
            const descLines = (pkg.description || pkg.Description || "")
              .split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line.length > 0);
            
            return (
              <div 
                key={i} 
                className="bg-gradient-to-br from-[#258cf4] to-[#3b59e9] rounded-[24px] p-7 flex flex-col shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden h-full min-h-[420px]"
              >
                {/* Decorative glowing sphere in background */}
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Header row */}
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-white/20 backdrop-blur-sm text-white font-semibold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                    {pkg.durationDays || pkg.DurationDays} Ngày
                  </span>
                  <Sparkles size={20} className="text-yellow-300 animate-pulse" />
                </div>
                
                {/* Title and Price */}
                <h4 className="text-2xl font-bold text-white mb-2 tracking-tight line-clamp-1" title={pkg.title || pkg.Title}>
                  {pkg.title || pkg.Title}
                </h4>
                
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-extrabold text-white">
                    {new Intl.NumberFormat('vi-VN').format(pkg.price || pkg.Price)}
                  </span>
                  <span className="text-white/80 text-sm font-semibold">VNĐ</span>
                </div>

                <div className="border-t border-white/20 my-2" />

                {/* Features List */}
                <div className="space-y-3.5 my-6 flex-1">
                  <div className="flex items-start gap-3 text-white/95 text-sm">
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="leading-tight">
                      Số quảng cáo tối đa: <strong className="text-white font-bold">{pkg.maxAdsPerPeriod || pkg.MaxAdsPerPeriod}</strong>
                    </span>
                  </div>

                  {descLines.length > 0 ? (
                    descLines.map((line: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-white/95 text-sm">
                        <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="leading-normal">{line}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 text-white/70 text-sm italic">
                      <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/5">
                        <Check size={12} className="text-white/70" />
                      </div>
                      <span className="leading-tight">Chưa có mô tả đặc quyền...</span>
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <button 
                  disabled={isProcessing}
                  onClick={() => handleBuyPackage(pkg.packageId || pkg.PackageId || pkg.id)}
                  className="w-full py-4 bg-white hover:bg-slate-50 text-[#258cf4] font-bold rounded-2xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing && <Loader2 size={18} className="animate-spin text-[#258cf4]" />}
                  ĐĂNG KÝ NGAY
                </button>
              </div>
            )
          }) : (
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
    </div>
  )
}
