import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/partner/_layout/revenue')({
  component: PartnerRevenue,
})

type Transaction = {
  id: string
  description: string
  date: string
  amount: string
  type: 'credit' | 'debit'
}

const transactions: Transaction[] = [
  {
    id: '1',
    description: 'Package payment — Standard Plan',
    date: '01 Mar 2026',
    amount: '-$99.00',
    type: 'debit',
  },
  {
    id: '2',
    description: 'Ad revenue — Summer Beach Campaign',
    date: '05 Mar 2026',
    amount: '+$340.00',
    type: 'credit',
  },
  {
    id: '3',
    description: 'Ad revenue — City Hotel Weekend Deal',
    date: '07 Mar 2026',
    amount: '+$120.00',
    type: 'credit',
  },
  {
    id: '4',
    description: 'Package renewal — Standard Plan',
    date: '01 Feb 2026',
    amount: '-$99.00',
    type: 'debit',
  },
  {
    id: '5',
    description: 'Ad revenue — Mountain Retreat Package',
    date: '25 Feb 2026',
    amount: '+$210.00',
    type: 'credit',
  },
]

const summaryCards = [
  { label: 'Total Revenue', value: '$2,450', color: 'text-emerald-600' },
  { label: 'This Month', value: '$460', color: 'text-blue-600' },
  { label: 'Total Spent', value: '$297', color: 'text-rose-500' },
  { label: 'Net Earnings', value: '$2,153', color: 'text-slate-800' },
]

export default function PartnerRevenue() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Revenue</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Track your earnings and transaction history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Monthly Earnings</h2>
          <span className="text-sm text-slate-400">Last 6 months</span>
        </div>
        <div className="h-56 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
          (Chart placeholder)
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Transaction History</h3>
          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${
                    tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {tx.amount}
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
