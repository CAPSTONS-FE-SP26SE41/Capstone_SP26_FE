import { X, CheckCircle2, Loader2, Copy, ExternalLink, ShieldCheck, Check, AlertCircle, Smartphone, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getPaymentStatus } from '../../services/paymentService'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentData: {
    paymentId: string
    qrCodeUrl: string
    amount: number
    transactionContent: string
    bank: string
    expiresAt?: string
  }
}

export default function PaymentModal({ isOpen, onClose, paymentData }: PaymentModalProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'checking' | 'failed' | 'expired'>('pending')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('15:00')

  // Polling for payment status
  useEffect(() => {
    let intervalId: any
    if (isOpen && status !== 'success' && status !== 'failed' && status !== 'expired') {
      intervalId = setInterval(async () => {
        try {
          const res = await getPaymentStatus(paymentData.paymentId)
          if (res.status === 'Completed' || res.status === 1) {
             setStatus('success')
             clearInterval(intervalId)
          } else if (res.status === 'Failed' || res.status === 2) {
             setStatus('failed')
             clearInterval(intervalId)
          }
        } catch (error) {
           console.warn("Retrying status check...")
        }
      }, 5000) // check every 5s
    }
    return () => clearInterval(intervalId)
  }, [isOpen, status, paymentData.paymentId])

  // Countdown timer logic
  useEffect(() => {
    if (!isOpen || status === 'success' || status === 'failed' || status === 'expired') return

    // Calculate expiration time (from paymentData.expiresAt or fallback to 15m from now)
    const targetTime = paymentData.expiresAt 
      ? new Date(paymentData.expiresAt).getTime() 
      : Date.now() + 15 * 60 * 1000

    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = targetTime - now

      if (distance <= 0) {
        setTimeLeft('00:00')
        setStatus('expired')
        return true
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const mStr = minutes.toString().padStart(2, '0')
      const sStr = seconds.toString().padStart(2, '0')
      setTimeLeft(`${mStr}:${sStr}`)
      return false
    }

    // Run immediately and set interval
    const expired = updateTimer()
    if (expired) return

    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [isOpen, status, paymentData.expiresAt])

  if (!isOpen) return null

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const bankParts = paymentData.bank.includes(' - ') ? paymentData.bank.split(' - ') : [paymentData.bank, '']
  const bankName = bankParts[0]?.trim() || 'MBBank'
  const bankAccount = bankParts[1]?.trim() || ''

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      {/* CSS Styles injection for Scan Animation and glow effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-vertical {
          0% { top: 0%; opacity: 0.3; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.3; }
        }
        .animate-scan-line {
          animation: scan-vertical 2.5s infinite ease-in-out;
        }
        .qr-scanner-corner {
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: #f59e0b; /* Amber-500 */
          border-style: solid;
        }
        .qr-scanner-top-left { top: 0; left: 0; border-width: 3px 0 0 3px; border-top-left-radius: 8px; }
        .qr-scanner-top-right { top: 0; right: 0; border-width: 3px 3px 0 0; border-top-right-radius: 8px; }
        .qr-scanner-bottom-left { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-bottom-left-radius: 8px; }
        .qr-scanner-bottom-right { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-bottom-right-radius: 8px; }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}} />

      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
              <ShieldCheck size={22} className="stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight">Thanh toán an toàn</h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-xl border border-transparent hover:border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {status === 'success' ? (
          <div className="p-8 md:p-12 text-center py-16 animate-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto flex flex-col items-center">
            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500 ring-8 ring-emerald-50/50 animate-bounce-subtle">
              <CheckCircle2 size={52} className="stroke-[2.5]" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h4>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              Giao dịch của bạn đã được xác minh thành công. Gói dịch vụ đã được kích hoạt trên hệ thống của bạn.
            </p>
            <button 
              onClick={onClose} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-8 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Quay lại trang quản lý
            </button>
          </div>
        ) : status === 'failed' || status === 'expired' ? (
          <div className="p-8 md:p-12 text-center py-16 animate-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto flex flex-col items-center">
            <div className="h-24 w-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500 ring-8 ring-rose-50/50">
              <AlertCircle size={52} className="stroke-[2.5]" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">
              {status === 'expired' ? 'Giao dịch đã hết hạn!' : 'Thanh toán thất bại!'}
            </h4>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              {status === 'expired' 
                ? 'Thời hạn thanh toán 15 phút đã kết thúc. Vui lòng tạo lại yêu cầu thanh toán mới để tiếp tục.' 
                : 'Yêu cầu thanh toán của bạn đã bị hủy hoặc thất bại. Vui lòng kiểm tra lại thông tin hoặc thử lại.'}
            </p>
            <button 
              onClick={onClose} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-8 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Đóng và thử lại
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Left Column: Billing & Bank Information */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">Chi tiết thanh toán</h4>
                  
                  {/* Premium Amount Card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden shadow-lg border border-slate-800">
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                      <Lock size={120} />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Số tiền cần thanh toán</span>
                        <h4 className="text-3xl font-extrabold tracking-tight text-amber-400 mt-1">
                          {new Intl.NumberFormat('vi-VN').format(paymentData.amount)} <span className="text-lg font-bold text-white">VND</span>
                        </h4>
                      </div>
                      <button 
                        onClick={() => handleCopy(paymentData.amount.toString(), 'amount')}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-slate-300 hover:text-white border border-white/5 active:scale-95 cursor-pointer"
                        title="Sao chép số tiền"
                      >
                        {copiedField === 'amount' ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <Check size={14} /> Đã sao chép
                          </span>
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Details List */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Thông tin chuyển khoản thủ công</h4>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 divide-y divide-slate-200/60">
                    {/* Bank Name */}
                    <div className="py-3 flex justify-between items-center first:pt-0">
                      <span className="text-xs font-semibold text-slate-500">Ngân hàng thụ hưởng</span>
                      <span className="text-sm font-bold text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                        {bankName}
                      </span>
                    </div>

                    {/* Bank Account */}
                    {bankAccount && (
                      <div className="py-3 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 block">Số tài khoản</span>
                          <span className="text-sm font-bold text-slate-800 font-mono mt-0.5 block">{bankAccount}</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(bankAccount, 'bankAccount')}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer"
                          title="Sao chép số tài khoản"
                        >
                          {copiedField === 'bankAccount' ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <Check size={14} /> Đã sao chép
                            </span>
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Transaction Content (Memo) - CRITICAL */}
                    <div className="py-3 last:pb-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-slate-500">Nội dung chuyển khoản</span>
                        <button 
                          onClick={() => handleCopy(paymentData.transactionContent, 'memo')}
                          className="p-2 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200/50 shadow-sm transition-all active:scale-95 cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          {copiedField === 'memo' ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <Check size={14} /> Đã sao chép
                            </span>
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </div>
                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-center">
                        <span className="text-base font-mono font-extrabold text-amber-800 tracking-wider block break-all selection:bg-amber-200">
                          {paymentData.transactionContent}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-700 mt-2 flex items-start gap-1.5 leading-relaxed font-medium">
                        <AlertCircle size={12} className="shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>Chú ý: Bạn cần nhập chính xác nội dung này để hệ thống tự động duyệt giao dịch nhanh chóng.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Scan */}
            <div className="w-full md:w-[380px] p-6 md:p-8 flex flex-col items-center justify-center bg-slate-50/50">
              {/* Countdown Timer Badge */}
              <div className="mb-4 bg-amber-50 text-amber-800 border border-amber-200/50 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm animate-pulse">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Thời gian thanh toán còn lại: <span className="font-bold font-mono">{timeLeft}</span>
              </div>

              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 text-center md:text-left w-full">Quét mã VietQR thanh toán nhanh</h4>
              
              {/* QR Container */}
              <div className="bg-white p-5 rounded-[28px] shadow-lg border border-slate-100 relative max-w-[210px] w-full aspect-square flex items-center justify-center group mb-5 hover:shadow-xl transition-shadow duration-300">
                {/* QR Scanner Corners */}
                <div className="qr-scanner-corner qr-scanner-top-left"></div>
                <div className="qr-scanner-corner qr-scanner-top-right"></div>
                <div className="qr-scanner-corner qr-scanner-bottom-left"></div>
                <div className="qr-scanner-corner qr-scanner-bottom-right"></div>

                {/* Scanning Vertical Line */}
                <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/80 to-amber-500/0 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-scan-line pointer-events-none" style={{ top: '10%' }}></div>
                
                <img 
                  src={paymentData.qrCodeUrl} 
                  alt="Payment QR" 
                  className="w-full h-full object-contain rounded-xl bg-white relative z-10 transition-all duration-300 group-hover:scale-[1.02]" 
                />
              </div>

              {/* Supported details */}
              <div className="text-center space-y-1 mb-6">
                <p className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5">
                  <Smartphone size={14} className="text-slate-500" />
                  Mở ứng dụng Ngân hàng để Quét
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Hỗ trợ tất cả ứng dụng ngân hàng và Ví điện tử tại Việt Nam</p>
              </div>

              {/* Polling Live Badge */}
              <div className="w-full bg-emerald-50/80 border border-emerald-100/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 leading-tight">Đang chờ giao dịch...</p>
                  <p className="text-[10px] text-emerald-600/90 font-medium mt-0.5 leading-tight">Hệ thống sẽ tự động duyệt ngay sau khi nhận được tiền</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {status !== 'success' && status !== 'failed' && status !== 'expired' && (
          <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Lock size={12} className="stroke-[2]" />
              Giao dịch an toàn & bảo mật
            </span>
            <span className="flex items-center gap-1">
              Hệ thống thanh toán tự động qua cổng <strong className="text-slate-600">SePay</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
