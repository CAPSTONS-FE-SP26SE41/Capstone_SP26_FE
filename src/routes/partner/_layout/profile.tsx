import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Building2, Mail, Phone, Globe, Save } from 'lucide-react'

export const Route = createFileRoute('/partner/_layout/profile')({
  component: PartnerProfile,
})

export default function PartnerProfile() {
  const [form, setForm] = useState({
    businessName: 'Sunset Resorts Ltd.',
    contactName: 'Nguyen Van A',
    email: 'partner@sunsetresorts.com',
    phone: '+84 901 234 567',
    website: 'https://sunsetresorts.com',
    description: 'We provide premium beach resort experiences across Vietnam.',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Partner Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your business information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Building2 size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{form.businessName}</h3>
            <p className="text-sm text-slate-500 mt-1">{form.contactName}</p>
            <span className="mt-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              Business Partner
            </span>

            <div className="mt-6 w-full space-y-3 text-sm text-slate-600 text-left">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-slate-400 shrink-0" />
                <span className="truncate">{form.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-slate-400 shrink-0" />
                <span>{form.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-slate-400 shrink-0" />
                <span className="truncate text-emerald-600">{form.website}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Edit Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Business Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Business Name</label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                className="h-11 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Contact Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Contact Name</label>
              <input
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                className="h-11 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="h-11 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="h-11 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Website */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                className="h-11 px-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Business Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
