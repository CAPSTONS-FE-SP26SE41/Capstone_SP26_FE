import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ad } from '../../types/ad';
import { getMyPartnerPOIs } from '../../services/partnerPoiService';
import { CustomSelect } from '../ui/CustomSelect';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ad: Omit<Ad, 'adId' | 'status'>) => void;
}

export default function CreateAdModal({ isOpen, onClose, onSubmit }: CreateAdModalProps) {
  const [newAdForm, setNewAdForm] = useState({
    poiId: '',
    title: '',
    videoUrl: '',
    content: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    promoTitle: '',
    promoDescription: '',
    promoTerms: ''
  });

  const [pois, setPois] = useState<{ value: string, label: string }[]>([]);
  const [loadingPois, setLoadingPois] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPois = async () => {
        setLoadingPois(true);
        try {
          const res = await getMyPartnerPOIs(1, 1000); // Fetch a large chunk for Dropdown
          setPois((res.items || []).map(p => ({ value: p.id, label: `${p.name} - ${p.address}` })));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.poiId) {
      alert("Vui lòng chọn Điểm tham quan (POI)!");
      return;
    }
    onSubmit({
      poiId: newAdForm.poiId,
      title: newAdForm.title,
      videoUrl: newAdForm.videoUrl,
      content: newAdForm.content,
      imageUrl: newAdForm.imageUrl,
      startDate: newAdForm.startDate,
      endDate: newAdForm.endDate,
      promotion: newAdForm.promoTitle ? {
        title: newAdForm.promoTitle,
        description: newAdForm.promoDescription,
        terms: newAdForm.promoTerms
      } : undefined
    });

    // Reset form
    setNewAdForm({
      poiId: '', title: '', videoUrl: '', content: '', imageUrl: '', startDate: '', endDate: '', promoTitle: '', promoDescription: '', promoTerms: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-800">Tạo quảng cáo mới</h3>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề quảng cáo *</label>
                  <input required type="text" value={newAdForm.title} onChange={e => setNewAdForm({ ...newAdForm, title: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-medium text-slate-800" placeholder="VD: Khuyến mãi mùa hè rực rỡ" />
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung quảng cáo *</label>
                  <textarea required rows={4} value={newAdForm.content} onChange={e => setNewAdForm({ ...newAdForm, content: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none font-medium text-slate-800" placeholder="Nhập nội dung chi tiết quảng cáo..." />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-5 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Hình ảnh & Video</h4>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Đường dẫn hình ảnh</label>
                  <input type="url" value={newAdForm.imageUrl} onChange={e => setNewAdForm({ ...newAdForm, imageUrl: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all text-sm font-medium" placeholder="https://..." />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Đường dẫn video</label>
                  <input type="url" value={newAdForm.videoUrl} onChange={e => setNewAdForm({ ...newAdForm, videoUrl: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all text-sm font-medium" placeholder="https://..." />
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tên khuyến mãi</label>
                  <input type="text" value={newAdForm.promoTitle} onChange={e => setNewAdForm({ ...newAdForm, promoTitle: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all font-bold placeholder:font-normal" placeholder="VD: Giảm 20% tổng bill" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chi tiết</label>
                  <textarea rows={3} value={newAdForm.promoDescription} onChange={e => setNewAdForm({ ...newAdForm, promoDescription: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none text-sm font-medium" placeholder="Chi tiết về chương trình..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Điều kiện áp dụng</label>
                  <textarea rows={2} value={newAdForm.promoTerms} onChange={e => setNewAdForm({ ...newAdForm, promoTerms: e.target.value })} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e28743]/10 focus:border-[#e28743] transition-all resize-none text-sm font-medium" placeholder="Điều kiện kèm theo..." />
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
            Tạo quảng cáo
          </button>
        </div>
      </div>
    </div>
  );
}
