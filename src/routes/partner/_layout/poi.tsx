import { createFileRoute } from '@tanstack/react-router'
import { Plus, MapPin, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/partner/_layout/poi')({
  component: PartnerPOIPage,
})

function PartnerPOIPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Placeholder data
  const pois = [
    { id: 1, name: 'Bảo tàng Lịch sử', type: 'Museum', address: '123 Đường Nguyễn Huệ, Quận 1', status: 'Active' },
    { id: 2, name: 'Công viên Tao Đàn', type: 'Park', address: '55 Trương Định, Quận 3', status: 'Active' },
    { id: 3, name: 'Chợ Bến Thành', type: 'Market', address: 'Lê Lợi, Quận 1', status: 'Pending Review' },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />
        <button className="flex items-center gap-2 bg-[#e28743] hover:bg-[#cf7632] text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-sm hover:shadow-md">
          <Plus size={20} />
          <span>Thêm POI mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm POI..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 focus:border-[#e28743] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e28743]/20 text-slate-600 font-medium">
          <option>Tất cả loại hình</option>
          <option>Museum</option>
          <option>Park</option>
          <option>Market</option>
          <option>Restaurant</option>
        </select>
      </div>

      {/* POI List */}
      <div className="grid grid-cols-1 gap-4">
        {pois.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Tên POI</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Loại hình</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pois.map((poi) => (
                  <tr key={poi.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#faeadd] rounded-xl flex items-center justify-center text-[#e28743]">
                          <MapPin size={20} />
                        </div>
                        <span className="font-bold text-slate-800">{poi.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{poi.type}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{poi.address}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        poi.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {poi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#e28743] hover:bg-[#faeadd] rounded-lg transition-all" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có POI nào</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Bạn chưa tạo điểm tham quan nào. Hãy thêm POI đầu tiên để bắt đầu quản lý.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
