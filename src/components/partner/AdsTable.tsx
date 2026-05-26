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
                            {ad.promotion.saveCount} / {ad.promotion.limitSaveCount > 0 ? ad.promotion.limitSaveCount : '∞'}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden mx-4">
        <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">Chi tiết quảng cáo</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-lg transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image + Title header */}
          <div className="flex items-start gap-4">
            {isValidImageUrl(ad.imageUrl) ? (
              <img src={ad.imageUrl} alt={ad.title} className="h-24 w-24 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-[#faeadd] flex items-center justify-center flex-shrink-0">
                <ImageIcon size={32} className="text-[#e28743]" />
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className="text-xl font-bold text-slate-800 mb-1 break-words">{ad.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[ad.status || ''] || 'bg-slate-100 text-slate-500'}`}>
                  {statusLabels[ad.status || ''] || ad.status || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-3">
            {infoRows.map((row, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="text-slate-400 mt-0.5 flex-shrink-0">{row.icon}</div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{row.label}</p>
                  <div className="text-sm text-slate-700 font-medium break-words">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Promotion */}
          {ad.promotion?.title && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-start gap-1.5 mb-1">
                <Tag size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 font-bold break-words">{ad.promotion.title}</p>
              </div>
              {ad.promotion.description && (
                <p className="text-sm text-amber-800 break-words">{ad.promotion.description}</p>
              )}
              {ad.promotion.terms && (
                <p className="text-xs text-amber-600 mt-1 italic break-words">Điều kiện: {ad.promotion.terms}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
