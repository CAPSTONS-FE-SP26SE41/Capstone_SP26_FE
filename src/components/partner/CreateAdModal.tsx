import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Ad } from '../../types/ad';
import { getMyPartnerPOIs } from '../../services/partnerPoiService';
import { CustomSelect } from '../ui/CustomSelect';
import { useAlert } from '../ui/AlertContext';
import { DateTimePicker } from '../ui/DateTimePicker';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ad: Omit<Ad, 'adId' | 'status'>, imageFile?: File | null, videoFile?: File | null) => void;
  initialData?: Ad | null;
}

export default function CreateAdModal({ isOpen, onClose, onSubmit, initialData }: CreateAdModalProps) {
  const { showWarning } = useAlert();
  const [newAdForm, setNewAdForm] = useState({
    poiId: '',
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    promoTitle: '',
    promoDescription: '',
    promoTerms: '',
    limitSaveCount: 0
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNewAdForm({
          poiId: initialData.poiId || '',
          title: initialData.title || '',
          content: initialData.content || '',
          startDate: initialData.startDate ? initialData.startDate.slice(0, 16) : '',
          endDate: initialData.endDate ? initialData.endDate.slice(0, 16) : '',
          promoTitle: initialData.promotion?.title || '',
          promoDescription: initialData.promotion?.description || '',
          promoTerms: initialData.promotion?.terms || '',
          limitSaveCount: initialData.promotion?.limitSaveCount || 0
        });
        setImagePreview(initialData.imageUrl || null);
      } else {
        setNewAdForm({
          poiId: '', title: '', content: '', startDate: '', endDate: '', promoTitle: '', promoDescription: '', promoTerms: '', limitSaveCount: 0
        });
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, initialData]);

  const [pois, setPois] = useState<{ value: string, label: string }[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPois = async () => {
        setLoadingPois(true);
        try {
          const res = await getMyPartnerPOIs(1, 1000); // Fetch a large chunk for Dropdown
          setPois((res.items || []).filter(p => p.status === 'Active').map(p => ({ value: p.id, label: `${p.name} - ${p.address}` })));
        } catch (error) {
          console.error("Lỗi khi tải danh sách POI", error);
        } finally {
          setLoadingPois(false);
        }
      };
      fetchPois();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.poiId) {
      showWarning("Vui lòng chọn Điểm tham quan (POI)!");
      return;
    }
    if (!newAdForm.startDate) {
      showWarning("Vui lòng chọn Ngày bắt đầu!");
      return;
    }
    if (!newAdForm.endDate) {
      showWarning("Vui lòng chọn Ngày kết thúc!");
      return;
    }
    if (newAdForm.startDate >= newAdForm.endDate) {
      showWarning("Ngày bắt đầu phải trước ngày kết thúc!");
      return;
    }
    onSubmit({
      poiId: newAdForm.poiId,
      title: newAdForm.title,
      content: newAdForm.content,
      startDate: newAdForm.startDate,
      endDate: newAdForm.endDate,
      promotion: newAdForm.promoTitle ? {
        title: newAdForm.promoTitle,
        description: newAdForm.promoDescription,
        terms: newAdForm.promoTerms,
        limitSaveCount: Number(newAdForm.limitSaveCount)
      } : undefined
    }, imageFile, null);

    // Reset form
    setNewAdForm({
      poiId: '', title: '', content: '', startDate: '', endDate: '', promoTitle: '', promoDescription: '', promoTerms: '', limitSaveCount: 0
    });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 p-0 md:p-4 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">{initialData ? "Cập nhật quảng cáo" : "Tạo quảng cáo mới"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form
          id="create-ad-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative"
        >
          {/* Cột trái: Media (Hình ảnh) */}
          <div className="space-y-6 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col justify-center">
            {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Hình ảnh quảng cáo *</label>
              <div className="flex flex-col gap-3">
                {imagePreview ? (
                  <div className="relative w-full h-72 md:h-[350px] rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-3 right-3 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-72 md:h-[350px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#e28743] transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <Plus className="w-10 h-10 text-slate-400 group-hover:text-[#e28743] mb-3 transition-colors" />
                      <p className="text-sm font-bold text-slate-500 group-hover:text-[#e28743] transition-colors">Tải lên hình ảnh quảng cáo</p>
                      <p className="text-xs text-slate-400 mt-1">Định dạng hỗ trợ: JPG, PNG, WEBP</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Các trường nhập thông tin */}
          <div className="space-y-6 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4 flex flex-col h-full animate-in fade-in duration-300">
            {/* Basic Info */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 block">Thông tin cơ bản</span>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Tiêu đề quảng cáo *</label>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {newAdForm.title.length}/100
                  </span>
                </div>
                <input 
                  required 
                  type="text" 
                  maxLength={100}
                  value={newAdForm.title} 
                  onChange={e => setNewAdForm({ ...newAdForm, title: e.target.value })} 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-medium text-slate-800" 
                  placeholder="VD: Khuyến mãi mùa hè rực rỡ" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Điểm tham quan (POI) *</label>
                <CustomSelect
                  value={newAdForm.poiId}
                  onChange={(val) => setNewAdForm({ ...newAdForm, poiId: val })}
                  options={pois}
                  placeholder={loadingPois ? "Đang tải danh sách POI..." : (pois.length > 0 ? "-- Chọn điểm tham quan --" : "Không có điểm tham quan nào")}
                  disabled={loadingPois}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Nội dung quảng cáo *</label>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {newAdForm.content.length}/1000
                  </span>
                </div>
                <textarea 
                  required 
                  rows={3} 
                  maxLength={1000}
                  value={newAdForm.content} 
                  onChange={e => setNewAdForm({ ...newAdForm, content: e.target.value })} 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none font-medium text-slate-800" 
                  placeholder="Nhập nội dung chi tiết quảng cáo..." 
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 block">Thời gian hiển thị</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày bắt đầu *</label>
                  <DateTimePicker
                    value={newAdForm.startDate}
                    onChange={(val) => setNewAdForm({ ...newAdForm, startDate: val })}
                    theme="orange"
                    placeholder="Chọn ngày bắt đầu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày kết thúc *</label>
                  <DateTimePicker
                    value={newAdForm.endDate}
                    onChange={(val) => setNewAdForm({ ...newAdForm, endDate: val })}
                    theme="orange"
                    placeholder="Chọn ngày kết thúc"
                    align="right"
                  />
                </div>
              </div>
            </div>
            {/* Promotion */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 block">Chương trình khuyến mãi</span>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Tên khuyến mãi</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {newAdForm.promoTitle.length}/100
                    </span>
                  </div>
                  <input 
                    type="text" 
                    maxLength={100}
                    value={newAdForm.promoTitle} 
                    onChange={e => setNewAdForm({ ...newAdForm, promoTitle: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-bold placeholder:font-normal" 
                    placeholder="VD: Giảm 20% tổng bill" 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Mô tả chi tiết</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {newAdForm.promoDescription.length}/500
                    </span>
                  </div>
                  <textarea 
                    rows={4} 
                    maxLength={500}
                    value={newAdForm.promoDescription} 
                    onChange={e => setNewAdForm({ ...newAdForm, promoDescription: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none text-sm font-medium" 
                    placeholder="Chi tiết về chương trình..." 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Điều kiện áp dụng</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {newAdForm.promoTerms.length}/500
                    </span>
                  </div>
                  <textarea 
                    rows={4} 
                    maxLength={500}
                    value={newAdForm.promoTerms} 
                    onChange={e => setNewAdForm({ ...newAdForm, promoTerms: e.target.value })} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none text-sm font-medium" 
                    placeholder="Điều kiện kèm theo..." 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-slate-700">Giới hạn lượt lưu</label>
                    <span className="text-[10px] font-bold text-[#e28743] bg-orange-50 px-2 py-0.5 rounded-full">
                      Số lượng
                    </span>
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={newAdForm.limitSaveCount === 0 ? '' : newAdForm.limitSaveCount} 
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      setNewAdForm({ ...newAdForm, limitSaveCount: val ? parseInt(val) : 0 })
                    }} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-bold" 
                    placeholder="VD: 100 (để trống nếu không giới hạn)" 
                  />
                  <p className="mt-1 text-[10px] text-slate-400 pl-1 italic">Nhập số lượng lượt lưu tối đa cho khuyến mãi này. Để trống nếu không giới hạn.</p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 flex justify-end gap-4 bg-slate-50/50 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors font-semibold"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="create-ad-form"
            className="px-6 py-2 rounded-xl bg-[#e28743] hover:bg-[#cf7632] text-white font-semibold transition-colors shadow-lg shadow-[#e28743]/20"
          >
            {initialData ? "Cập nhật" : "Tạo quảng cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}
