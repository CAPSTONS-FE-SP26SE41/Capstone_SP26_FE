import React, { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Store, Settings, Mail, Phone, MapPin, Camera, Save, X, UserCircle, Building2, FileText, Clock } from 'lucide-react'
import {
  getMyPartnerProfile,
  updateMyPartnerProfile,
  updatePartnerAvatar,
  type PartnerProfileData,
} from '@/services/partnerProfileService'

export const Route = createFileRoute('/partner/_layout/profile')({
  component: PartnerProfilePage,
})

function PartnerProfilePage() {
  const [profile, setProfile] = useState<PartnerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state — chỉ chứa các trường doanh nghiệp
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setError(null);
      const data = await getMyPartnerProfile();
      setProfile(data);
      setFormData({
        businessName: data.businessName || '',
        businessAddress: data.businessAddress || '',
        businessPhone: data.businessPhone || '',
        businessEmail: data.businessEmail || '',
      });
      const avatar = data.businessAvatarUrl && data.businessAvatarUrl !== '' ? data.businessAvatarUrl : null;
      setPreviewUrl(avatar);
      
      // Đồng bộ thông tin lên Sidebar/Layout
      if (data.businessName) localStorage.setItem("user_name", data.businessName);
      
      const syncAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.businessName || "Doanh nghiệp đối tác")}&background=FDBA74&color=7C2D12`;
      localStorage.setItem("user_avatar", syncAvatar);
    } catch (err: any) {
      console.error("Error fetching partner profile:", err);
      setError("Không thể tải thông tin hồ sơ doanh nghiệp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Cập nhật thông tin text
      await updateMyPartnerProfile({
        businessName: formData.businessName || undefined,
        businessAddress: formData.businessAddress || undefined,
        businessPhone: formData.businessPhone || undefined,
        businessEmail: formData.businessEmail || undefined,
      });

      // Nếu có chọn file ảnh mới → gọi API riêng upload avatar
      if (selectedFile) {
        await updatePartnerAvatar(selectedFile);
      }

      await fetchProfile(); // Refresh lại data
      setIsEditing(false);
      setSelectedFile(null);
      alert('Cập nhật hồ sơ doanh nghiệp thành công!');
    } catch (err: any) {
      console.error("Error updating partner profile:", err);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ doanh nghiệp.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || '',
        businessAddress: profile.businessAddress || '',
        businessPhone: profile.businessPhone || '',
        businessEmail: profile.businessEmail || '',
      });
      setPreviewUrl(profile.businessAvatarUrl && profile.businessAvatarUrl !== '' ? profile.businessAvatarUrl : null);
    }
    setIsEditing(false);
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e28743]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
        <button
          onClick={() => { setLoading(true); fetchProfile(); }}
          className="px-5 py-2.5 bg-[#e28743] text-white rounded-xl hover:bg-[#d47935] transition-all font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div />

        {!isEditing ? (
          <button 
            onClick={() => {
              if (profile) {
                setFormData({
                  businessName: profile.businessName || '',
                  businessAddress: profile.businessAddress || '',
                  businessPhone: profile.businessPhone || '',
                  businessEmail: profile.businessEmail || '',
                });
                setPreviewUrl(profile.businessAvatarUrl && profile.businessAvatarUrl !== '' ? profile.businessAvatarUrl : null);
                setSelectedFile(null);
              }
              setIsEditing(true);
            }}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl transition-all shadow-sm font-semibold"
          >
            <Settings size={18} className="text-slate-400" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCancelEdit}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-500 px-5 py-2.5 rounded-xl transition-all font-semibold border border-slate-200"
            >
              <X size={18} />
              <span>Hủy</span>
            </button>

            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#e28743] hover:bg-[#d47935] text-white px-6 py-2.5 rounded-xl transition-all shadow-md shadow-orange-100 font-semibold disabled:opacity-50"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={18} />
              )}
              <span>Lưu thay đổi</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#e28743] to-[#efb28c]"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-8 inline-block">
            <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-slate-100">
              {previewUrl ? (
                <img src={previewUrl} alt="Business Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Building2 size={60} />
                </div>
              )}
            </div>
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 -right-1 p-2.5 bg-white rounded-2xl shadow-lg border border-slate-100 text-[#e28743] hover:scale-110 transition-transform"
              >
                <Camera size={20} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{profile?.businessName || 'Chưa cập nhật tên doanh nghiệp'}</h2>
                  <p className="text-[#e28743] font-medium flex items-center gap-1.5 mt-1">
                    <Store size={16} />
                    Đối tác chính thức
                  </p>
                </div>
                
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{profile?.businessEmail || 'Chưa có email doanh nghiệp'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{profile?.businessPhone || 'Chưa có SĐT doanh nghiệp'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{profile?.businessAddress || 'Chưa có địa chỉ doanh nghiệp'}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Building2 size={16} />
                    Thông tin doanh nghiệp
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Tên doanh nghiệp</p>
                      <p className="font-semibold text-slate-700">{profile?.businessName || '---'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Email doanh nghiệp</p>
                      <p className="font-semibold text-slate-700">{profile?.businessEmail || '---'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Số điện thoại</p>
                      <p className="font-semibold text-slate-700">{profile?.businessPhone || '---'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Địa chỉ</p>
                      <p className="font-semibold text-slate-700">{profile?.businessAddress || '---'}</p>
                    </div>
                    {profile?.businessLicenseUrl && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-400 uppercase">Giấy phép kinh doanh</p>
                        <a 
                          href={profile.businessLicenseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-[#e28743] hover:underline flex items-center gap-1.5"
                        >
                          <FileText size={16} />
                          Xem giấy phép
                        </a>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Ngày tạo hồ sơ</p>
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {profile?.createdAt 
                          ? new Date(profile.createdAt).toLocaleDateString('vi-VN') 
                          : '---'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Building2 size={16} className="text-slate-400" />
                    Tên doanh nghiệp
                  </label>
                  <input 
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập tên doanh nghiệp"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    Số điện thoại doanh nghiệp
                  </label>
                  <input 
                    type="text"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập số điện thoại doanh nghiệp"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    Email doanh nghiệp
                  </label>
                  <input 
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập email doanh nghiệp"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    Địa chỉ doanh nghiệp
                  </label>
                  <input 
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập địa chỉ doanh nghiệp"
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
