import React, { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { User, Store, Settings, Mail, Phone, MapPin } from 'lucide-react'
import { getMe } from '@/services/authService'

export const Route = createFileRoute('/partner/_layout/profile')({
  component: PartnerProfilePage,
})

function PartnerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e28743]"></div>
      </div>
    );
  }

  const profileData = {
    name: profile?.name || 'Tên doanh nghiệp',
    email: profile?.email || 'Chưa có email',
    phone: profile?.phoneNumber || 'Chưa có số điện thoại',
    address: profile?.address || 'Chưa có địa chỉ',
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
              src={profileData.avatar} 
              alt="Profile avatar" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4"
            />
            <h2 className="text-lg font-bold text-slate-800 text-center">{profileData.name}</h2>
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
                <p className="font-semibold text-slate-800">{profileData.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Phone size={16} />
                  <span className="text-sm font-medium">Phone Number</span>
                </div>
                <p className="font-semibold text-slate-800">{profileData.phone}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="font-semibold text-slate-800">{profileData.address}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
