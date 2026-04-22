import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Mail, Shield } from 'lucide-react'


import { getMe } from '@/services/authService'

export const Route = createFileRoute('/admin/_layout/profile')({
  component: AdminProfile,
})

function AdminProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe()
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const name = profile?.name || profile?.profile?.name || 'Admin'
  const email = profile?.email || ''
  const role = profile?.roleName || localStorage.getItem('user_role') || 'Admin'
  const avatarUrl = profile?.profile?.avtUrl || profile?.avatarUrl || profile?.profile?.avatarUrl
  const hasAvatar = avatarUrl && avatarUrl !== ''


  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Hồ sơ cá nhân</h2>
      </div>

      <div className="flex justify-center">
        {/* Profile Card */}
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={hasAvatar ? avatarUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2E8F0&color=475569&size=160`}
                alt="Avatar"
                className="w-40 h-40 rounded-full object-cover border-4 border-emerald-50 shadow-sm"
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-slate-800">{name}</h3>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mt-3">
                <Shield size={14} />
                {role}
              </div>
            </div>
            
            <div className="w-full border-t border-slate-100 my-8"></div>
            
            <div className="w-full space-y-5 text-left px-4">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email</span>
                  <span className="text-sm font-medium text-slate-700 truncate">{email}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Shield size={18} className="text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Trạng thái</span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
