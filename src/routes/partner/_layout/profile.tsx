import React, { useState, useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { User, Store, Settings, Mail, Phone, MapPin, Calendar, Camera, Save, X, UserCircle } from 'lucide-react'
import { getMe } from '@/services/authService'
import { updateUser } from '@/services/userService'

export const Route = createFileRoute('/partner/_layout/profile')({
  component: PartnerProfilePage,
})

function PartnerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const data = await getMe();
      setProfile(data);
      // Initialize form data using nested profile object
      setFormData({
        name: data.name || data.profile?.name || '',
        address: data.profile?.address || '',
        phoneNumber: data.profile?.phoneNumber || '',
        dateOfBirth: data.profile?.dateOfBirth && data.profile?.dateOfBirth !== '0001-01-01T00:00:00' 
          ? data.profile.dateOfBirth.split('T')[0] 
          : '',
        gender: data.profile?.gender || '',
      });
      // Handle potential field name variations and empty strings
      const avatar = data.profile?.avtUrl || data.avatarUrl || data.profile?.avatarUrl;
      setPreviewUrl(avatar && avatar !== "" ? avatar : null);

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const uploadData = new FormData();
      uploadData.append('Name', formData.name);
      uploadData.append('Address', formData.address);
      uploadData.append('PhoneNumber', formData.phoneNumber);
      uploadData.append('DateOfBirth', formData.dateOfBirth);
      uploadData.append('Gender', formData.gender);
      
      if (selectedFile) {
        uploadData.append('AvatarUrl', selectedFile);
      }

      await updateUser(uploadData);
      await fetchProfile(); // Refresh profile data
      setIsEditing(false);
      alert('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e28743]"></div>
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
              // Get avatar using the same logic as fetchProfile
              const avatar = profile?.profile?.avtUrl || profile?.avatarUrl || profile?.profile?.avatarUrl;
              const currentAvatar = avatar && avatar !== "" ? avatar : null;

              // Reset form data to current profile state before editing
              setFormData({
                name: profile?.name || profile?.profile?.name || '',
                address: profile?.profile?.address || '',
                phoneNumber: profile?.profile?.phoneNumber || '',
                dateOfBirth: profile?.profile?.dateOfBirth && profile?.profile?.dateOfBirth !== '0001-01-01T00:00:00'
                  ? profile.profile.dateOfBirth.split('T')[0] 
                  : '',
                gender: profile?.profile?.gender || '',
              });
              setPreviewUrl(currentAvatar);
              setSelectedFile(null);
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
              onClick={() => {
                const avatar = profile?.profile?.avtUrl || profile?.avatarUrl || profile?.profile?.avatarUrl;
                setPreviewUrl(avatar && avatar !== "" ? avatar : null);
                setIsEditing(false);
                setSelectedFile(null);
              }}

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
                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <UserCircle size={80} />
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
                  <h2 className="text-2xl font-bold text-slate-800">{profile?.name || 'Chưa cập nhật tên'}</h2>
                  <p className="text-[#e28743] font-medium flex items-center gap-1.5 mt-1">
                    <Store size={16} />
                    Đối tác chính thức
                  </p>
                </div>
                
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{profile?.profile?.phoneNumber || 'Chưa có SĐT'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{profile?.profile?.address || 'Chưa có địa chỉ'}</span>
                  </div>

                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <User size={16} />
                    Thông tin cá nhân
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Họ và tên</p>
                      <p className="font-semibold text-slate-700">{profile?.name || '---'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Giới tính</p>
                      <p className="font-semibold text-slate-700">
                        {profile?.profile?.gender === 'Male' ? 'Nam' : 
                         profile?.profile?.gender === 'Female' ? 'Nữ' : 
                         profile?.profile?.gender || '---'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Ngày sinh</p>
                      <p className="font-semibold text-slate-700">
                        {profile?.profile?.dateOfBirth && profile?.profile?.dateOfBirth !== '0001-01-01T00:00:00'
                          ? new Date(profile.profile.dateOfBirth).toLocaleDateString('vi-VN') 
                          : '---'}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-400 uppercase">Trạng thái tài khoản</p>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Đang hoạt động
                      </div>
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
                    <User size={16} className="text-slate-400" />
                    Họ và tên / Tên doanh nghiệp
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập tên của bạn"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Phone size={16} className="text-slate-400" />
                    Số điện thoại
                  </label>
                  <input 
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    Ngày sinh
                  </label>
                  <input 
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <UserCircle size={16} className="text-slate-400" />
                    Giới tính
                  </label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    Địa chỉ
                  </label>
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#e28743] focus:border-transparent outline-none transition-all"
                    placeholder="Nhập địa chỉ của bạn"
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
