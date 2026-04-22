import React from 'react';
import { X, AlertTriangle, Fan, Ban } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  type = 'danger',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colorClasses = {
    danger: {
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      button: 'bg-[#e28743] hover:bg-[#cf7632]', // Matching the user's orange theme from screenshot
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={loading ? undefined : onClose} 
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Background Icon Decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-[0.03] pointer-events-none">
            <Fan size={160} className="text-slate-900 rotate-12" />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-2xl ${colorClasses.iconBg} ${colorClasses.iconColor} shrink-0`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{title}</h3>
              {subtitle && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Message Area */}
          <div className="bg-slate-50/80 rounded-2xl p-5 mb-8 border border-slate-100/50">
            <div className="text-slate-600 leading-relaxed text-[15px]">
              {message}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg shadow-[#e28743]/20 disabled:opacity-50 ${colorClasses.button}`}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Ban size={18} />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
