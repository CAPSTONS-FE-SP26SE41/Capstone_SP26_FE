import { useState } from 'react';
import { ImageIcon, MapPin, Calendar, Tag, Eye, X, ExternalLink, Clock, FileText } from 'lucide-react';
import { Ad } from '../../types/ad';

interface AdsTableProps {
  ads: Ad[];
}

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border border-amber-100',
  Rejected: 'bg-red-50 text-red-500 border border-red-100',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200',
  Approved: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

const statusLabels: Record<string, string> = {
  Active: 'Hoạt động',
  Pending: 'Chờ duyệt',
  Rejected: 'Bị từ chối',
  Inactive: 'Ngừng hoạt động',
  Approved: 'Đã duyệt',
};

export default function AdsTable({ ads }: AdsTableProps) {
  const [detailAd, setDetailAd] = useState<Ad | null>(null);

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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[13px] uppercase tracking-wider">
                <th className="p-4 font-bold w-[35%] tracking-tight">Advertisement</th>
                <th className="p-4 font-bold tracking-tight">Duration</th>
                <th className="p-4 font-bold tracking-tight">Promotion</th>
                <th className="p-4 font-bold tracking-tight text-center">Status</th>
                <th className="p-4 font-bold tracking-tight text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ads.map(ad => (
                <tr key={ad.adId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt={ad.title} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 mb-0.5 line-clamp-1 leading-tight">{ad.title}</p>
                        <p className="text-[13px] text-slate-500 line-clamp-1 font-normal leading-relaxed">{ad.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[13px] text-slate-600">
                      <Calendar size={16} className="text-slate-400 shrink-0" />
                      <div className="leading-tight">
                        <p className="font-semibold text-slate-700">{formatDate(ad.startDate)}</p>
                        <p className="text-slate-400 font-medium">đến {formatDate(ad.endDate)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    {ad.promotion?.title ? (
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                          <Tag size={14} className="text-[#e28743]" />
                          {ad.promotion.title}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 font-normal" title={ad.promotion.description}>
                          {ad.promotion.description}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic font-normal">Không có</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[ad.status || ''] || 'bg-slate-100 text-slate-500'}`}>
                      {statusLabels[ad.status || ''] || ad.status || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDetailAd(ad)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailAd && (
        <AdDetailModal ad={detailAd} onClose={() => setDetailAd(null)} formatDate={formatDate} />
      )}
    </>
  );
}

// ── Ad Detail Modal ─────────────────────────────────────────────────
interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  formatDate: (d: string) => string;
}

function AdDetailModal({ ad, onClose, formatDate }: AdDetailModalProps) {
  const infoRows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [
    {
      icon: <FileText size={16} />,
      label: 'Nội dung',
      value: ad.content || '—',
    },
    {
      icon: <MapPin size={16} />,
      label: 'POI ID',
      value: <span className="font-mono text-xs">{ad.poiId}</span>,
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">Chi tiết quảng cáo</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image + Title header */}
          <div className="flex items-start gap-4">
            {ad.imageUrl ? (
              <img src={ad.imageUrl} alt={ad.title} className="h-24 w-24 rounded-2xl object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-[#faeadd] flex items-center justify-center flex-shrink-0">
                <ImageIcon size={32} className="text-[#e28743]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-1">{ad.title}</h3>
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{row.label}</p>
                  <div className="text-sm text-slate-700 font-medium">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Promotion */}
          {ad.promotion?.title && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag size={14} className="text-amber-600" />
                <p className="text-sm text-amber-700 font-bold">{ad.promotion.title}</p>
              </div>
              {ad.promotion.description && (
                <p className="text-sm text-amber-800">{ad.promotion.description}</p>
              )}
              {ad.promotion.terms && (
                <p className="text-xs text-amber-600 mt-1 italic">Điều kiện: {ad.promotion.terms}</p>
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
  );
}
