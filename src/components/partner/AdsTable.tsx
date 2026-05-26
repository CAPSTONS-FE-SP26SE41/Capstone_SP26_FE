import { useState } from 'react';
import { ImageIcon, MapPin, Calendar, Tag, Eye, X, ExternalLink, Clock, FileText, Play, Pause, Loader2, Edit3 } from 'lucide-react';
import { Ad } from '../../types/ad';
import { activateMyAdvertisement, inactivateMyAdvertisement } from '../../services/advertisementService';
import { useAlert } from '../ui/AlertContext';

interface AdsTableProps {
  ads: Ad[];
  poiNameMap?: Record<string, string>;
  onRefresh?: () => void;
  onEdit?: (ad: Ad) => void;
}

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  PendingApproval: 'bg-amber-50 text-amber-600 border border-amber-100',
  Rejected: 'bg-red-50 text-red-500 border border-red-100',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  Expired: 'bg-slate-100 text-slate-500 border border-slate-200',
  Paused: 'bg-slate-100 text-slate-500 border border-slate-200',
  Approved: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

const statusLabels: Record<string, string> = {
  Active: 'Hoạt động',
  Pending: 'Chờ duyệt',
  PendingApproval: 'Chờ xét duyệt',
  Rejected: 'Bị từ chối',
  Inactive: 'Ngừng hoạt động',
  Expired: 'Hết hạn',
  Paused: 'Tạm dừng',
  Approved: 'Đã duyệt',
};

const isValidImageUrl = (url?: string) => {
  if (!url || typeof url !== 'string') return false;
  const value = url.trim();
  if (!value || value.toLowerCase() === 'string') return false;
  return /^(https?:\/\/|data:|blob:|\/)/i.test(value);
};

export default function AdsTable({ ads, poiNameMap = {}, onRefresh, onEdit }: AdsTableProps) {
  const { showError } = useAlert();
  const [detailAd, setDetailAd] = useState<Ad | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    try {
      setActionLoadingId(adId);
      if (currentStatus === 'Active') {
        await inactivateMyAdvertisement(adId);
      } else if (currentStatus === 'Paused') {
        await activateMyAdvertisement(adId);
      }
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Error toggling ad status", error);
      showError(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[980px] table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[13px] uppercase tracking-wider">
                <th className="px-3 py-3 font-bold w-[28%] tracking-tight align-middle">Quảng cáo</th>
                <th className="px-3 py-3 font-bold w-[22%] tracking-tight align-middle">Thời gian</th>
                <th className="px-3 py-3 font-bold w-[20%] tracking-tight align-middle">Ưu đãi</th>
                <th className="px-3 py-3 font-bold w-[15%] tracking-tight text-center align-middle">Trạng thái</th>
                <th className="px-3 py-3 font-bold w-[15%] tracking-tight text-center align-middle">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ads.map(ad => (
                <tr key={ad.adId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-3 min-w-0">
                      {isValidImageUrl(ad.imageUrl) ? (
                        <img src={ad.imageUrl} alt={ad.title} className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0 shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 mb-0.5 truncate leading-tight">{ad.title}</p>
                        <p className="text-[13px] text-slate-500 truncate font-normal leading-relaxed">{ad.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2 text-[13px] text-slate-600 min-w-0">
                      <Calendar size={16} className="text-slate-400 shrink-0" />
                      <div className="min-w-0 leading-tight">
                        <p className="font-semibold text-slate-700 truncate">{formatDate(ad.startDate)}</p>
                        <p className="text-slate-400 font-medium truncate">đến {formatDate(ad.endDate)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm align-middle max-w-0">
                    {ad.promotion?.title ? (
                      <div className="min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5 min-w-0">
                          <Tag size={14} className="text-[#e28743] shrink-0" />
                          <span className="truncate" title={ad.promotion.title}>{ad.promotion.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate font-normal" title={ad.promotion.description}>
                          {ad.promotion.description}
                        </p>
                        {typeof ad.promotion.saveCount === 'number' && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-sky-600 bg-sky-50 w-fit px-1.5 py-0.5 rounded-md border border-sky-100">
                            <Tag size={10} className="fill-sky-600" />
                            {ad.promotion.saveCount} / {(ad.promotion.limitSaveCount ?? 0) > 0 ? ad.promotion.limitSaveCount : '∞'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic font-normal">Không có</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusStyles[ad.status || ''] || 'bg-slate-100 text-slate-500'}`}>
                      {statusLabels[ad.status || ''] || ad.status || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit?.(ad)}
                        className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-[#e28743] hover:bg-[#faeadd]/30 hover:border-[#e28743]/30 rounded-lg transition-all"
                      >
                        <Edit3 size={18} />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[70]">
                          Chỉnh sửa
                          <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                        </span>
                      </button>

                      <button
                        onClick={() => setDetailAd(ad)}
                        className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[70]">
                          Xem chi tiết
                          <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                        </span>
                      </button>

                      {ad.status === 'Active' && (
                        <button
                          onClick={() => handleToggleStatus(ad.adId || '', ad.status || '')}
                          disabled={actionLoadingId === ad.adId}
                          className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 rounded-lg transition-all disabled:opacity-50"
                        >
                          {actionLoadingId === ad.adId ? <Loader2 size={18} className="animate-spin" /> : <Pause size={18} />}
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[70]">
                            Tạm dừng
                            <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                          </span>
                        </button>
                      )}

                      {ad.status === 'Paused' && (
                        <button
                          onClick={() => handleToggleStatus(ad.adId || '', ad.status || '')}
                          disabled={actionLoadingId === ad.adId}
                          className="group relative inline-flex h-9 w-9 items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition-all disabled:opacity-50"
                        >

                          {actionLoadingId === ad.adId ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[70]">
                            Bật hoạt động
                            <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailAd && (
        <AdDetailModal
          ad={detailAd}
          onClose={() => setDetailAd(null)}
          formatDate={formatDate}
          poiNameMap={poiNameMap}
        />
      )}
    </>
  );
}

// ── Ad Detail Modal ─────────────────────────────────────────────────
interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  formatDate: (d: string) => string;
  poiNameMap: Record<string, string>;
}

function AdDetailModal({ ad, onClose, formatDate, poiNameMap }: AdDetailModalProps) {
  const infoRows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    {
      icon: <FileText size={16} />,
      label: 'Nội dung',
      value: ad.content || '—',
    },
    {
      icon: <MapPin size={16} />,
      label: 'Địa điểm',
      value: (
        <span>
          {poiNameMap[ad.poiId] || (ad as any).poiName || (ad as any).POIName || (ad as any).PoiName || 'Không xác định'}
        </span>
      ),
    },
    {
      icon: <Clock size={16} />,
      label: 'Thời gian',
      value: (
        <span>
          {formatDate(ad.startDate)} → {formatDate(ad.endDate)}
        </span>
      ),
    },
    {
      icon: <Tag size={16} />,
      label: 'Lượt lưu ưu đãi',
      value: (
        <span className="font-bold text-sky-600">
          {ad.promotion?.saveCount ?? 0} / {ad.promotion?.limitSaveCount && ad.promotion.limitSaveCount > 0 ? ad.promotion.limitSaveCount : '∞'}
        </span>
      ),
    },
  ];

  if (ad.imageUrl) {
    infoRows.push({
      icon: <ImageIcon size={16} />,
      label: 'Hình ảnh',
      value: (
        <a href={ad.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-xs">
          Xem hình ảnh
        </a>
      ),
    });
  }

  if (ad.videoUrl) {
    infoRows.push({
      icon: <ExternalLink size={16} />,
      label: 'Video',
      value: (
        <a href={ad.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-xs">
          Xem video
        </a>
      ),
    });
  }

  return (
    <div className="fixed inset-0 z-50 p-0 md:p-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full md:h-[90vh] md:max-w-6xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Chi tiết quảng cáo</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 p-6 flex flex-col md:grid md:grid-cols-2 md:gap-x-8 overflow-y-auto md:overflow-hidden relative">
          
          {/* Cột trái: Hình ảnh quảng cáo */}
          <div className="space-y-4 md:overflow-y-auto md:p-1 md:pr-4 flex flex-col">
            <span className="text-sm font-semibold text-slate-700 block">Hình ảnh quảng cáo</span>
            <div className="flex-1 min-h-[300px] md:min-h-0 w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 relative group">
              {isValidImageUrl(ad.imageUrl) ? (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm">Không có hình ảnh</p>
                  </div>
                </div>
              )}
              {ad.videoUrl && (
                <a
                  href={ad.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2">
                    <ExternalLink size={16} /> Xem Video
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="space-y-6 mt-6 md:mt-0 md:overflow-y-auto md:p-1 md:pl-4 flex flex-col">
            
            {/* Header info */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tiêu đề</span>
              <h3 className="text-2xl font-extrabold text-slate-900 break-words">{ad.title}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[ad.status || ''] || 'bg-slate-100 text-slate-500'}`}>
                  {statusLabels[ad.status || ''] || ad.status || '—'}
                </span>
              </div>
            </div>

            {/* Chi tiết từng hàng thông tin */}
            <div className="space-y-4">
              {infoRows.map((row, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">{row.label}</span>
                  <div className="text-sm text-slate-800 font-medium break-words leading-relaxed">{row.value}</div>
                </div>
              ))}
            </div>

            {/* Khuyến mãi */}
            {ad.promotion?.title && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 space-y-3 relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-full -mr-12 -mt-12 blur-2xl" />
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <Tag size={16} />
                  <span>Thông tin Khuyến mãi</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-600 uppercase">Tiêu đề khuyến mãi</label>
                  <p className="font-bold text-slate-800 text-base">{ad.promotion.title}</p>
                </div>
                {ad.promotion.description && (
                  <div>
                    <label className="text-xs font-bold text-amber-600 uppercase">Mô tả</label>
                    <p className="text-sm text-slate-700 leading-relaxed">{ad.promotion.description}</p>
                  </div>
                )}
                {ad.promotion.terms && (
                  <div>
                    <label className="text-xs font-bold text-amber-600 uppercase">Điều khoản & Điều kiện</label>
                    <p className="text-xs text-amber-600 italic bg-white/50 p-3 rounded-lg border border-amber-100 mt-1">
                      {ad.promotion.terms}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
