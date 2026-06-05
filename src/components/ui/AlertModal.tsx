import React from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: React.ReactNode;
  type?: AlertType;
  okLabel?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  okLabel = 'OK',
}: AlertModalProps) {
  if (!isOpen) return null;

  // Detect theme color based on the URL path
  const getTheme = () => {
    if (typeof window === 'undefined') return 'emerald';
    const path = window.location.pathname;
    if (path.startsWith('/partner')) return 'orange';
    if (path.startsWith('/manager')) return 'emerald';
    if (path.startsWith('/admin')) return 'blue'; // admin uses blue
    return 'blue'; // default theme
  };

  const theme = getTheme();

  // Theme-specific styles
  const themeStyles = {
    orange: {
      buttonBg: 'bg-[#e28743] hover:bg-[#d47935] focus:ring-[#e28743]/20',
      successIconBg: 'bg-[#faeadd]',
      successIconColor: 'text-[#e28743]',
      infoIconBg: 'bg-[#faeadd]',
      infoIconColor: 'text-[#e28743]',
      titleColor: 'text-slate-800',
    },
    emerald: {
      buttonBg: 'bg-[#009a63] hover:bg-[#008a58] focus:ring-[#009a63]/20',
      successIconBg: 'bg-[#e6f5ef]',
      successIconColor: 'text-[#009a63]',
      infoIconBg: 'bg-[#e6f5ef]',
      infoIconColor: 'text-[#009a63]',
      titleColor: 'text-slate-800',
    },
    blue: {
      buttonBg: 'bg-[#1392ec] hover:bg-[#0b7ecc] focus:ring-[#1392ec]/20',
      successIconBg: 'bg-blue-50',
      successIconColor: 'text-[#1392ec]',
      infoIconBg: 'bg-blue-50',
      infoIconColor: 'text-[#1392ec]',
      titleColor: 'text-slate-800',
    },
  }[theme];

  // Semantic styles for alert types
  const typeStyles = {
    success: {
      icon: CheckCircle2,
      iconBg: themeStyles.successIconBg,
      iconColor: themeStyles.successIconColor,
      defaultTitle: 'Thành công',
    },
    error: {
      icon: XCircle,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      defaultTitle: 'Lỗi xảy ra',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      defaultTitle: 'Cảnh báo',
    },
    info: {
      icon: Info,
      iconBg: themeStyles.infoIconBg,
      iconColor: themeStyles.infoIconColor,
      defaultTitle: 'Thông báo',
    },
  }[type];

  const IconComponent = typeStyles.icon;
  const displayTitle = title || typeStyles.defaultTitle;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 pt-8 text-center flex flex-col items-center">
          {/* Animated Icon Container */}
          <div className={`p-4 rounded-2xl ${typeStyles.iconBg} ${typeStyles.iconColor} mb-4 flex items-center justify-center`}>
            <IconComponent size={28} className="animate-bounce-subtle" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-800 mb-2 px-2 leading-snug">
            {displayTitle}
          </h3>

          {/* Message Area */}
          <div className="text-slate-600 text-sm leading-relaxed mb-6 px-2 whitespace-pre-line">
            {message}
          </div>

          {/* OK Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 text-sm font-bold text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg shadow-black/[0.05] ${themeStyles.buttonBg}`}
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
