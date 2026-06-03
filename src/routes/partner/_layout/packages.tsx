import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Package, CreditCard, Loader2, Ban, X, Sparkles, Check, AlertTriangle, CheckCircle2 } from 'lucide-react'
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

const getCardStyle = (index: number, title: string) => {
  const normalizedTitle = title?.toLowerCase() || '';
  if (normalizedTitle.includes('nâng cao') || normalizedTitle.includes('premium') || index === 2) {
    return {
      gradient: 'from-[#ff7e5f] via-[#feb47b] to-[#86a8e7]', // Sunset with sky breeze
      shadow: 'shadow-[#ff7e5f]/15 hover:shadow-[#feb47b]/25',
      btnText: 'text-[#ff7e5f]',
      tag: '🔥 Phổ biến nhất',
      circle: 'bg-violet-400/20'
    }
  }
  if (normalizedTitle.includes('dài hạn') || normalizedTitle.includes('pro') || index === 1) {
    return {
      gradient: 'from-[#ff4e50] to-[#f9d423]', // Warm fire glow
      shadow: 'shadow-[#ff4e50]/15 hover:shadow-[#f9d423]/25',
      btnText: 'text-[#ff4e50]',
      tag: '🌟 Đáng giá nhất',
      circle: 'bg-yellow-400/20'
    }
  }
  if (normalizedTitle.includes('khởi nghiệp') || index === 0) {
    return {
      gradient: 'from-[#e28743] via-[#e6985d] to-[#f2b98f]', // Warm gold/orange gradient
      shadow: 'shadow-[#e28743]/15 hover:shadow-[#e6985d]/25',
      btnText: 'text-[#e28743]',
      tag: '🌱 Khởi đầu tốt',
      circle: 'bg-amber-300/20'
    }
  }
  return {
    gradient: 'from-[#f857a6] to-[#ff5858]', // Elegant coral/pink red
    shadow: 'shadow-[#f857a6]/15 hover:shadow-[#ff5858]/25',
    btnText: 'text-[#f857a6]',
    tag: '⚡ Giá tốt nhất',
    circle: 'bg-pink-300/20'
  }
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
  const [errorModal, setErrorModal] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setErrorModal({ type, message })
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
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {mySubs.map((sub: any, i: number) => {
                const adsUsed = sub.adsUsed ?? sub.AdsUsed ?? 0
                const maxAds = sub.maxAds ?? sub.MaxAds ?? 0
                const adsPct = maxAds > 0 ? Math.min(Math.round(adsUsed / maxAds * 100), 100) : 0
                const startDate = sub.createdAt || sub.CreatedAt
                const expiredDate = sub.expiredAt || sub.ExpiredAt
                const daysLeft = expiredDate
                  ? Math.max(0, Math.ceil((new Date(expiredDate).getTime() - Date.now()) / 86400000))
                  : null
                const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0
                const isExpired = daysLeft === 0

                return (
                  <div key={i} className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50 overflow-hidden relative group">
                    {/* Glowing background highlights */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl opacity-10 pointer-events-none group-hover:opacity-15 transition-opacity" />
                    <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-5 pointer-events-none" />

                    {/* Gradient top bar */}
                    <div className="h-2 bg-gradient-to-r from-[#e28743] via-[#ff7e5f] to-[#feb47b]" />

                    <div className="p-8">
                      {/* Title & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
                            <Package size={26} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {sub.packageTitle || sub.SubscriptionPackage?.Title || "Gói quảng cáo"}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Gói dịch vụ đang kích hoạt trên hệ thống</p>
                          </div>
                        </div>
                        <div className="flex justify-start sm:justify-end">
                          {getStatusBadge(sub)}
                        </div>
                      </div>

                      {/* Main grid: Left details, Right circular/big status */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                        {/* Remaining days card */}
                        <div className={`md:col-span-2 rounded-2xl p-5 flex flex-col justify-center items-center text-center border ${
                          isExpired ? 'bg-rose-50/50 border-rose-100 text-rose-900'
                          : isExpiringSoon ? 'bg-amber-50/50 border-amber-100 text-amber-900'
                          : 'bg-emerald-50/50 border-emerald-100/80 text-emerald-950'
                        }`}>
                          <span className="text-3xl mb-2">{isExpired ? '⏰' : isExpiringSoon ? '⚠️' : '✅'}</span>
                          <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                            {isExpired ? 'Đã hết hạn' : isExpiringSoon ? 'Sắp hết hạn' : 'Thời gian còn lại'}
                          </span>
                          {!isExpired && daysLeft !== null ? (
                            <div className="mt-3">
                              <span className="text-4xl font-extrabold tracking-tight">
                                {daysLeft}
                              </span>
                              <span className="text-sm font-medium ml-1">ngày</span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold mt-2">0 ngày</span>
                          )}
                        </div>

                        {/* Date parameters */}
                        <div className="md:col-span-3 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-center space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                              📅 Ngày kích hoạt:
                            </span>
                            <span className="font-semibold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200/40 shadow-xs">
                              {formatDate(startDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                              📆 Ngày hết hạn:
                            </span>
                            <span className={`font-semibold bg-white px-3 py-1 rounded-xl border border-slate-200/40 shadow-xs ${isExpiringSoon || isExpired ? 'text-amber-600' : 'text-slate-700'}`}>
                              {formatDate(expiredDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress: Ads count */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn mức quảng cáo khả dụng</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Số lượng chiến dịch quảng cáo đã tạo trên tổng số tối đa</p>
                          </div>
                          <span className={`text-base font-extrabold ${adsPct >= 100 ? 'text-rose-600' : adsPct >= 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {adsUsed} / {maxAds} <span className="text-xs font-semibold text-slate-400">quảng cáo</span>
                          </span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              adsPct >= 100 ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                              : adsPct >= 70 ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            }`}
                            style={{ width: `${adsPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3 text-xs">
                          <span className="text-slate-500">Đã sử dụng: <strong className="text-slate-700 font-bold">{adsPct}%</strong></span>
                          <span className={`font-semibold ${adsPct >= 100 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {adsPct >= 100 ? 'Đã hết lượt' : `Còn lại ${maxAds - adsUsed} lượt`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
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
            
            const style = getCardStyle(i, pkg.title || pkg.Title)

            return (
              <div 
                key={i} 
                className={`bg-gradient-to-br ${style.gradient} rounded-[24px] p-7 flex flex-col shadow-xl ${style.shadow} transition-all duration-300 relative overflow-hidden h-full min-h-[420px] hover:scale-[1.02]`}
              >
                {/* Decorative glowing sphere in background */}
                <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-2xl pointer-events-none ${style.circle}`} />
                <div className="absolute -left-12 -bottom-12 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
                
                {/* Header row */}
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-white/20 backdrop-blur-sm text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-white/10">
                    {pkg.durationDays || pkg.DurationDays} Ngày
                  </span>
                  <span className="bg-white/25 backdrop-blur-sm text-white font-bold text-[11px] px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                    {style.tag}
                  </span>
                </div>
                
                {/* Title and Price */}
                <h4 className="text-2xl font-bold text-white mb-2 tracking-tight line-clamp-1 drop-shadow-sm" title={pkg.title || pkg.Title}>
                  {pkg.title || pkg.Title}
                </h4>
                
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-extrabold text-white drop-shadow-sm">
                    {new Intl.NumberFormat('vi-VN').format(pkg.price || pkg.Price)}
                  </span>
                  <span className="text-white/80 text-sm font-semibold">VNĐ</span>
                </div>

                <div className="border-t border-white/20 my-2" />

                {/* Features List */}
                <div className="space-y-3.5 my-6 flex-1">
                  <div className="flex items-start gap-3 text-white/95 text-sm">
                    <div className="h-5 w-5 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="leading-tight">
                      Số quảng cáo tối đa: <strong className="text-white font-bold">{pkg.maxAdsPerPeriod || pkg.MaxAdsPerPeriod}</strong>
                    </span>
                  </div>

                  {descLines.length > 0 ? (
                    descLines.map((line: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-white/95 text-sm">
                        <div className="h-5 w-5 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
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
                  className={`w-full py-4 bg-white hover:bg-slate-50 ${style.btnText} font-bold rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing && <Loader2 size={18} className={`animate-spin ${style.btnText}`} />}
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

      {errorModal && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setErrorModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal top color bar */}
            <div className={`h-1.5 w-full ${
              errorModal.type === 'error'
                ? 'bg-gradient-to-r from-rose-400 to-red-500'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
            }`} />

            <div className="p-8">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                errorModal.type === 'error'
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-emerald-50 text-emerald-500'
              }`}>
                {errorModal.type === 'error'
                  ? <AlertTriangle size={32} strokeWidth={1.8} />
                  : <CheckCircle2 size={32} strokeWidth={1.8} />
                }
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                {errorModal.type === 'error' ? 'Không thể thực hiện' : 'Thành công'}
              </h3>

              {/* Message */}
              <p className="text-sm text-slate-500 text-center leading-relaxed">
                {errorModal.message}
              </p>

              {/* Action button */}
              <button
                onClick={() => setErrorModal(null)}
                className={`mt-7 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${
                  errorModal.type === 'error'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                }`}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
