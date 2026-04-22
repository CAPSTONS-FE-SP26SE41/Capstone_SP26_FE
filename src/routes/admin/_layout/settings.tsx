import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/_layout/settings')({
  component: AdminSettings,
})

function AdminSettings() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    notifications: {
      booking: false,
      signup: false,
      reports: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckbox = (key: string) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications],
      },
    }))
  }

  const handleSubmit = () => {
    console.log('Saved settings:', form)
    alert('Đã lưu cài đặt!')
  }


  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold text-text-main">Cài đặt</h2>
        <p className="text-sm text-text-secondary mt-1">
          Quản lý các tùy chọn tài khoản và cấu hình hệ thống
        </p>
      </div>


      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e7edf4]">
          <h3 className="text-lg font-bold text-text-main">
            Thông tin cá nhân
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Cập nhật thông tin hồ sơ và địa chỉ email của bạn.
          </p>
        </div>


        <div className="p-6 grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Tên
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Nhập tên"
                className="w-full rounded-lg border-slate-200 focus:border-primary focus:ring-primary placeholder:text-slate-400"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-text-main mb-2">
                Họ
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Nhập họ"
                className="w-full rounded-lg border-slate-200 focus:border-primary focus:ring-primary placeholder:text-slate-400"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Địa chỉ Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập địa chỉ email"
              className="w-full rounded-lg border-slate-200 focus:border-primary focus:ring-primary placeholder:text-slate-400"
            />
          </div>


          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Lưu thay đổi
            </button>

          </div>
        </div>
      </div>

      {/* Notification Section */}
      <div className="bg-white rounded-xl border border-[#e7edf4] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#e7edf4]">
          <h3 className="text-lg font-bold text-text-main">
            Thông báo
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Kiểm soát các thông báo bạn nhận được.
          </p>
        </div>


        <div className="p-6 flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.notifications.booking}
              onChange={() => handleCheckbox('booking')}
              className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-text-main">
              Gửi email cho tôi khi có đơn đặt chỗ mới
            </span>
          </label>


          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.notifications.signup}
              onChange={() => handleCheckbox('signup')}
              className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-text-main">
              Gửi email cho tôi khi có người dùng đăng ký
            </span>
          </label>


          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.notifications.reports}
              onChange={() => handleCheckbox('reports')}
              className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-text-main">
              Thông báo trình duyệt cho các báo cáo hàng ngày
            </span>
          </label>

        </div>
      </div>
    </div>
  )
}
