import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  durationMs = 4000
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-bounce-short">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
        type === 'success'
          ? 'bg-emerald-900/90 text-white border-emerald-700'
          : type === 'error'
          ? 'bg-rose-900/90 text-white border-rose-700'
          : 'bg-slate-900/90 text-white border-slate-700'
      }`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
        {type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

        <div className="flex-1 text-xs leading-relaxed font-medium">
          {message}
        </div>

        <button
          onClick={onClose}
          className="text-slate-300 hover:text-white p-0.5 rounded focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
