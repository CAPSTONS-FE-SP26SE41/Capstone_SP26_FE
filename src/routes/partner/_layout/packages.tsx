import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/partner/_layout/packages')({
  component: PartnerPackages,
})

type Package = {
  id: string
  name: string
  price: string
  duration: string
  maxAds: number
  features: string[]
  highlighted?: boolean
}

const packages: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$49',
    duration: '/ month',
    maxAds: 1,
    features: [
      '1 active ad',
      'Standard placement',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$99',
    duration: '/ month',
    maxAds: 3,
    features: [
      '3 active ads',
      'Priority placement',
      'Full analytics dashboard',
      'Priority email support',
      'Monthly performance report',
    ],
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$199',
    duration: '/ month',
    maxAds: 10,
    features: [
      '10 active ads',
      'Featured placement',
      'Advanced analytics & export',
      'Dedicated account manager',
      'Weekly performance report',
      'Custom ad formats',
    ],
  },
]

export default function PartnerPackages() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Ad Packages</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Choose the best package for your business goals.
        </p>
      </div>

      {/* Current Package Banner */}
      <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">Current Active Package</p>
          <p className="text-xs text-emerald-600 mt-0.5">Standard Plan — Renews on 01 Apr 2026</p>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
          ACTIVE
        </span>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative rounded-2xl border p-6 flex flex-col shadow-sm transition-all ${
              pkg.highlighted
                ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/30'
                : 'border-slate-200 bg-white hover:border-emerald-300'
            }`}
          >
            {pkg.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                Most Popular
              </span>
            )}

            <h3 className="text-xl font-bold text-slate-800">{pkg.name}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-900">{pkg.price}</span>
              <span className="text-slate-500 text-sm mb-1">{pkg.duration}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Up to {pkg.maxAds} active {pkg.maxAds === 1 ? 'ad' : 'ads'}</p>

            <ul className="mt-6 flex-1 space-y-3">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`mt-8 w-full h-11 rounded-xl text-sm font-semibold transition-all ${
                pkg.highlighted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {pkg.highlighted ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
