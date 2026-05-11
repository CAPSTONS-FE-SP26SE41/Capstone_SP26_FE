import React, { useState, useEffect } from 'react';
import { X, Plus, Megaphone } from 'lucide-react';
import { Ad } from '../../types/ad';
import { getMyPartnerPOIs } from '../../services/partnerPoiService';
import { CustomSelect } from '../ui/CustomSelect';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ad: Omit<Ad, 'adId' | 'status'>, imageFile?: File | null, videoFile?: File | null) => void;
  initialData?: Ad | null;
}

export default function CreateAdModal({ isOpen, onClose, onSubmit, initialData }: CreateAdModalProps) {
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
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
        setVideoFile(null);
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.poiId) {
      alert("Vui lòng chọn Điểm tham quan (POI)!");
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
    }, imageFile, videoFile);

    // Reset form
    setNewAdForm({
      poiId: '', title: '', content: '', startDate: '', endDate: '', promoTitle: '', promoDescription: '', promoTerms: '', limitSaveCount: 0
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-800">{initialData ? "Cập nhật quảng cáo" : "Tạo quảng cáo mới"}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form id="create-ad-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Thông tin cơ bản</h4>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-2">
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
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Điểm tham quan (POI) *</label>
                  <CustomSelect
                    value={newAdForm.poiId}
                    onChange={(val) => setNewAdForm({ ...newAdForm, poiId: val })}
                    options={pois}
                    placeholder={loadingPois ? "Đang tải danh sách POI..." : (pois.length > 0 ? "-- Chọn điểm tham quan --" : "Không có điểm tham quan nào")}
                    disabled={loadingPois}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Nội dung quảng cáo *</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {newAdForm.content.length}/1000
                    </span>
                  </div>
                  <textarea 
                    required 
                    rows={4} 
                    maxLength={1000}
                    value={newAdForm.content} 
                    onChange={e => setNewAdForm({ ...newAdForm, content: e.target.value })} 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none font-medium text-slate-800" 
                    placeholder="Nhập nội dung chi tiết quảng cáo..." 
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-5 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 text-[10px]">HÌNH ẢNH & VIDEO</h4>
              <div className="grid grid-cols-2 gap-6">
                
                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Chọn hình ảnh</label>
                  <div className="flex flex-col gap-3">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 group">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#e28743] transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-8 h-8 text-slate-400 group-hover:text-[#e28743] mb-2" />
                          <p className="text-xs font-semibold text-slate-500 group-hover:text-[#e28743]">Bấm để tải ảnh</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700">Chọn video (tối đa 50MB)</label>
                  <div className="flex flex-col gap-3">
                    {videoFile ? (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <Megaphone size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-700 truncate">{videoFile.name}</p>
                          <p className="text-xs text-slate-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setVideoFile(null)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#e28743] transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Plus className="w-8 h-8 text-slate-400 group-hover:text-[#e28743] mb-2" />
                          <p className="text-xs font-semibold text-slate-500 group-hover:text-[#e28743]">Bấm để tải video</p>
                        </div>
                        <input type="file" className="hidden" accept="video/*" onChange={handleVideoChange} />
                      </label>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Duration */}
            <div className="space-y-5 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Thời gian hiển thị</h4>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngày bắt đầu *</label>
                  <input required type="datetime-local" value={newAdForm.startDate} onChange={e => setNewAdForm({ ...newAdForm, startDate: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-medium text-[#e28743]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngày kết thúc *</label>
                  <input required type="datetime-local" value={newAdForm.endDate} onChange={e => setNewAdForm({ ...newAdForm, endDate: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-medium text-[#e28743]" />
                </div>
              </div>
            </div>

            {/* Promotion */}
            <div className="space-y-5 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Chương trình khuyến mãi</h4>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
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
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-bold placeholder:font-normal" 
                    placeholder="VD: Giảm 20% tổng bill" 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Mô tả chi tiết</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {newAdForm.promoDescription.length}/500
                    </span>
                  </div>
                  <textarea 
                    rows={3} 
                    maxLength={500}
                    value={newAdForm.promoDescription} 
                    onChange={e => setNewAdForm({ ...newAdForm, promoDescription: e.target.value })} 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none text-sm font-medium" 
                    placeholder="Chi tiết về chương trình..." 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Điều kiện áp dụng</label>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                      {newAdForm.promoTerms.length}/500
                    </span>
                  </div>
                  <textarea 
                    rows={2} 
                    maxLength={500}
                    value={newAdForm.promoTerms} 
                    onChange={e => setNewAdForm({ ...newAdForm, promoTerms: e.target.value })} 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none text-sm font-medium" 
                    placeholder="Điều kiện kèm theo..." 
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">Giới hạn lượt lưu</label>
                    <span className="text-[10px] font-bold text-[#e28743] bg-orange-50 px-2 py-0.5 rounded-full">
                      Số lượng
                    </span>
                  </div>
                  <input 
                    type="number" 
                    min={0}
                    value={newAdForm.limitSaveCount} 
                    onChange={e => setNewAdForm({ ...newAdForm, limitSaveCount: parseInt(e.target.value) || 0 })} 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-bold" 
                    placeholder="VD: 100 (0 là không giới hạn)" 
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400 pl-1 italic">Nhập số lượng lượt lưu tối đa cho khuyến mãi này. Để 0 nếu không giới hạn.</p>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0 flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="create-ad-form"
            className="bg-[#e28743] hover:bg-[#cf7632] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#e28743]/20"
          >
            {initialData ? "Cập nhật" : "Tạo quảng cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}
