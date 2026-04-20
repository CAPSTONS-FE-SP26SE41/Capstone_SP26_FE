import { createFileRoute } from '@tanstack/react-router'
import { History, Loader2, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPaymentHistory, type PaymentHistoryItem } from '../../../services/paymentService'

export const Route = createFileRoute('/partner/_layout/history')({
  component: PartnerHistoryPage,
})

function PartnerHistoryPage() {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const data = await getPaymentHistory()
        setHistory(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Fetch payment history error', error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const formatCurrency = (amount?: number, currency: string = 'VNĐ') => {
    if (amount === undefined || amount === null) return '—'
    const displayCurrency = (!currency || currency === 'string') ? 'VNĐ' : currency
    return `${new Intl.NumberFormat('vi-VN').format(amount)} ${displayCurrency}`
  }

  const formatDate = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN')
  }

  const getStatusLabel = (status?: string) => {
    const normalized = (status || '').toLowerCase()
    if (normalized.includes('completed') || normalized.includes('success')) return 'Thành công'
    if (normalized.includes('pending')) return 'Chờ thanh toán'
    return status || 'Thất bại'
  }

  const getStatusClass = (status?: string) => {
    const normalized = (status || '').toLowerCase()
    if (normalized.includes('completed') || normalized.includes('success')) {
      return 'text-emerald-600 bg-emerald-50'
    }
    if (normalized.includes('pending')) {
      return 'text-amber-600 bg-amber-50'
    }
    return 'text-rose-600 bg-rose-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch sử giao dịch</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi các lần mua gói của bạn</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#e28743]" />
            Đang tải lịch sử giao dịch...
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Ngày giao dịch</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Mã đơn hàng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Gói dịch vụ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Phương thức</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((t) => (
                  <tr key={t.paymentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{formatDate(t.paidAt || t.transactionDate)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      <span className="text-xs font-mono text-slate-400">#{t.paymentId.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800">{t.packageTitle || 'Đang tải tên gói...'}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(t.amount, t.currency)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600 font-medium">{t.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusClass(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có giao dịch</h3>
            <p className="text-slate-500 text-sm">Lịch sử giao dịch mua các gói của bạn sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </div>
    </div>
  )
}
