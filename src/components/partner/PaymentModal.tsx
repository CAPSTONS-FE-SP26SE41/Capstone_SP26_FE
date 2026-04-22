import { X, CheckCircle2, Loader2, Copy, ExternalLink, ShieldCheck } from 'lucide-react'
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
  }
}

export default function PaymentModal({ isOpen, onClose, paymentData }: PaymentModalProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'checking'>('pending')
  const [copied, setCopied] = useState(false)

  // Polling for payment status
  useEffect(() => {
    let intervalId: any
    if (isOpen && status !== 'success') {
      intervalId = setInterval(async () => {
        try {
          const res = await getPaymentStatus(paymentData.paymentId)
          if (res.status === 'Completed' || res.status === 1) {
             setStatus('success')
             clearInterval(intervalId)
          }
        } catch (error) {
           console.warn("Retrying status check...")
        }
      }, 5000) // check every 5s
    }
    return () => clearInterval(intervalId)
  }, [isOpen, status, paymentData.paymentId])

  if (!isOpen) return null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#faeadd] rounded-lg flex items-center justify-center text-[#e28743]">
                <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Thanh toán an toàn</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-xl">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-10 flex flex-col items-center">
            {status === 'success' ? (
                <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 ring-8 ring-emerald-50/50">
                        <CheckCircle2 size={48} />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h4>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Gói quảng cáo của bạn đã được kích hoạt. Bạn có thể bắt đầu tạo quảng cáo ngay bây giờ.</p>
                    <button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                        Quay lại trang quản lý
                    </button>
                </div>
            ) : (
                <div className="w-full space-y-8 animate-in delay-100">
                    <div className="text-center">
                        <p className="text-slate-500 mb-1 text-sm font-medium">Số tiền cần thanh toán</p>
                        <h4 className="text-3xl font-black text-[#e28743]">{new Intl.NumberFormat('vi-VN').format(paymentData.amount)} VND</h4>
                    </div>

                    {/* QR Section */}
                    <div className="bg-[#faeadd]/30 p-4 rounded-3xl border border-[#faeadd] relative group mx-auto max-w-[240px]">
                        <img src={paymentData.qrCodeUrl} alt="Payment QR" className="w-full aspect-square rounded-2xl bg-white shadow-sm" />
                        <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 shadow-sm uppercase tracking-wider">Mở ứng dụng ngân hàng và quét</span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Nội dung chuyển khoản</p>
                                    <p className="font-mono font-bold text-slate-800 text-sm tracking-tight">{paymentData.transactionContent}</p>
                                </div>
                                <button onClick={() => handleCopy(paymentData.transactionContent)} className="p-2 text-slate-400 hover:text-[#e28743] hover:bg-white rounded-lg transition-all shadow-sm">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="h-px bg-slate-200/50" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Thông tin ngân hàng</p>
                                <p className="text-sm font-bold text-slate-700 leading-tight">{paymentData.bank}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 text-[13px] font-semibold text-slate-400 italic bg-white py-1">
                            <Loader2 size={16} className="animate-spin text-[#e28743]" />
                            <span>Đang chờ bạn thực hiện thanh toán...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Info label */}
        {status !== 'success' && (
            <div className="bg-slate-50 p-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 border-t border-slate-100">
                <ExternalLink size={12} />
                <span>Thanh toán tự động qua hệ thống SePay an toàn</span>
            </div>
        )}

      </div>
      {copied && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            Đã sao chép nội dung!
        </div>
      )}
    </div>
  )
}
