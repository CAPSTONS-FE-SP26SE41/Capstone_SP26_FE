import { createFileRoute } from '@tanstack/react-router'
import { User, Store, Settings, Mail, Phone, MapPin } from 'lucide-react'

export const Route = createFileRoute('/partner/_layout/profile')({
  component: PartnerProfilePage,
})

function PartnerProfilePage() {
  const profile = {
    name: 'Acme Travel Group',
    email: 'contact@acmetravel.com',
    phone: '+84 123 456 789',
    address: '123 Business Avenue, Tech District, City',
    registeredSince: 'January 2026',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/120'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors font-medium">
          <Settings size={18} />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar and Basic info */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-w-48">
            <img 
              src={profile.avatar} 
              alt="Profile avatar" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4"
            />
            <h2 className="text-lg font-bold text-slate-800 text-center">{profile.name}</h2>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#e28743] bg-[#faeadd] px-2 py-1 rounded-full mt-2">
              <Store size={12} />
              Partner Account
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex-1 w-full space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Business Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Mail size={16} />
                  <span className="text-sm font-medium">Email Address</span>
                </div>
                <p className="font-semibold text-slate-800">{profile.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Phone size={16} />
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                <p className="font-semibold text-slate-800">{profile.phone}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="font-semibold text-slate-800">{profile.address}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <User size={16} />
                  <span className="text-sm font-medium">Account Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="font-semibold text-slate-800">{profile.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
