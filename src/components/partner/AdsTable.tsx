import React from 'react';
import { ImageIcon, MapPin, Calendar, Tag, MoreVertical } from 'lucide-react';
import { Ad } from '../../types/ad';

interface AdsTableProps {
  ads: Ad[];
}

export default function AdsTable({ ads }: AdsTableProps) {
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[13px] uppercase tracking-wider">
              <th className="p-4 font-bold w-[35%] tracking-tight">Advertisement</th>
              <th className="p-4 font-bold tracking-tight">POI ID</th>
              <th className="p-4 font-bold tracking-tight">Duration</th>
              <th className="p-4 font-bold tracking-tight">Promotion</th>
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
                      <p className="text-[13px] text-slate-500 line-clamp-1 mb-1 font-normal leading-relaxed">{ad.content}</p>
                      {ad.videoUrl && (
                        <a href={ad.videoUrl} target="_blank" rel="noreferrer" className="text-[12px] text-[#e28743] hover:underline inline-flex items-center gap-1 font-semibold">
                          Watch Video
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-[120px] font-mono text-xs" title={ad.poiId}>{ad.poiId}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <Calendar size={16} className="text-slate-400 shrink-0" />
                    <div className="leading-tight">
                      <p className="font-semibold text-slate-700">{formatDate(ad.startDate)}</p>
                      <p className="text-slate-400 font-medium">to {formatDate(ad.endDate)}</p>
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
                    <span className="text-slate-400 italic font-normal">No promotion</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-[#e28743] hover:bg-[#faeadd] rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
