import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { useAlert } from '@/components/ui/AlertContext'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  getPreferences,
  createPreference,
  updatePreference,
  deletePreference,
  type Preference
} from '@/services/preferenceService'

export const Route = createFileRoute('/admin/_layout/preferences')({
  component: PreferencesPage,
})

function PreferencesPage() {
  const { showSuccess, showError } = useAlert()
  const [preferences, setPreferences] = useState<Preference[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'edit'>('create')
  const [selectedPref, setSelectedPref] = useState<Preference | null>(null)
  const [prefNameInput, setPrefNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Confirm delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [prefToDelete, setPrefToDelete] = useState<Preference | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPreferences = async () => {
    try {
      const data = await getPreferences()
      setPreferences(data)
    } catch (error: any) {
      console.error('Failed to fetch preferences', error)
      showError('Không thể tải danh sách sở thích.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  const handleOpenCreate = () => {
    setModalType('create')
    setSelectedPref(null)
    setPrefNameInput('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (pref: Preference) => {
    setModalType('edit')
    setSelectedPref(pref)
    setPrefNameInput(pref.name)
    setIsModalOpen(true)
  }

  const handleSavePreference = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prefNameInput.trim()) return

    setSubmitting(true)
    try {
      if (modalType === 'create') {
        await createPreference(prefNameInput.trim())
        showSuccess('Tạo sở thích mới thành công!')
      } else if (modalType === 'edit' && selectedPref) {
        await updatePreference(selectedPref.id, prefNameInput.trim())
        showSuccess('Cập nhật sở thích thành công!')
      }
      setIsModalOpen(false)
      fetchPreferences()
    } catch (error: any) {
      showError(error?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenDelete = (pref: Preference) => {
    setPrefToDelete(pref)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!prefToDelete) return
    setDeleting(true)
    try {
      await deletePreference(prefToDelete.id)
      showSuccess('Xóa sở thích thành công!')
      setIsDeleteOpen(false)
      fetchPreferences()
    } catch (error: any) {
      showError(error?.message || 'Không thể xóa sở thích này.')
    } finally {
      setDeleting(false)
      setPrefToDelete(null)
    }
  }

  // Filter preferences based on search
  const filteredPreferences = preferences.filter((pref) =>
    pref.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPreferences.length / itemsPerPage)
  const displayedPreferences = filteredPreferences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const startIndex = (currentPage - 1) * itemsPerPage

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">Đang tải danh sách sở thích...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Control Panel */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full md:max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all"
              placeholder="Tìm kiếm sở thích theo tên..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleOpenCreate}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#258cf4] hover:bg-[#1d72cb] text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          <span className="text-sm">Thêm sở thích mới</span>
        </button>
      </div>

      {/* Table / Grid */}
      <div className="bg-white rounded-2xl border border-[#e7edf4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#e7edf4]">
                <th className="px-6 py-4 text-slate-600 text-sm tracking-wider font-semibold w-24">STT</th>
                <th className="px-6 py-4 text-slate-600 text-sm tracking-wider font-semibold">Tên sở thích</th>
                <th className="px-6 py-4 text-slate-600 text-sm tracking-wider font-semibold text-right pr-8 w-40">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7edf4]">
              {displayedPreferences.length > 0 ? (
                displayedPreferences.map((pref, index) => (
                  <tr key={pref.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {pref.name}
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(pref)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(pref)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={32} className="text-slate-300" />
                      <p className="font-medium">Không tìm thấy sở thích nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#e7edf4] flex justify-between items-center bg-white">
          <span className="text-sm text-slate-500">
            Hiển thị {displayedPreferences.length > 0 ? startIndex + 1 : 0} - {startIndex + displayedPreferences.length} trong tổng số {filteredPreferences.length} sở thích
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50 transition-colors
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed text-slate-300" : "text-slate-600 font-medium"}`}
            >
              Trước
            </button>

            <span className="px-3 py-1 text-sm text-slate-600 font-semibold">
              Trang {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 text-sm border border-[#e7edf4] bg-white rounded hover:bg-slate-50 transition-colors
              ${currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed text-slate-300" : "text-slate-600 font-medium"}`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#e7edf4] flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {modalType === 'create' ? 'Thêm sở thích mới' : 'Chỉnh sửa sở thích'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSavePreference}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên sở thích
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 transition-all"
                    placeholder="Nhập tên sở thích (ví dụ: Ẩm thực, Khám phá...)"
                    value={prefNameInput}
                    onChange={(e) => setPrefNameInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-[#e7edf4] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || !prefNameInput.trim()}
                  className="flex items-center gap-2 bg-[#258cf4] hover:bg-[#1d72cb] text-white font-semibold px-5 py-2 rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {submitting && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa sở thích"
        message={
          <>
            Bạn có chắc chắn muốn xóa sở thích <span className="font-bold text-slate-800">"{prefToDelete?.name}"</span> khỏi hệ thống? 
            Hành động này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu liên kết.
          </>
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}
