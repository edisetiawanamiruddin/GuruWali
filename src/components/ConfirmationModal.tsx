import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, LogOut, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  type: 'delete' | 'create' | 'logout';
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  itemName,
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isLogout = type === 'logout';
  const isCreate = type === 'create';

  const defaultConfirmLabel = isDelete 
    ? 'Ya, Hapus Data' 
    : isLogout 
    ? 'Ya, Keluar Akun' 
    : 'Ya, Simpan Data';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Poppins'] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isDelete ? 'bg-red-500' : isLogout ? 'bg-amber-500' : 'bg-[#1E4FD8]'
          }`} 
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          {/* Icon Badge */}
          <div 
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isDelete 
                ? 'bg-red-100 text-red-600 border border-red-200' 
                : isLogout 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-blue-100 text-[#1E4FD8] border border-blue-200'
            }`}
          >
            {isDelete && <Trash2 className="w-6 h-6" />}
            {isLogout && <LogOut className="w-6 h-6" />}
            {isCreate && <CheckCircle2 className="w-6 h-6" />}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              {message}
            </p>
            {itemName && (
              <div className="mt-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 break-words">
                {itemName}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 ${
              isDelete 
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800' 
                : isLogout 
                ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' 
                : 'bg-[#1E4FD8] hover:bg-[#1A42B8] active:bg-[#163897]'
            }`}
          >
            {isDelete && <Trash2 className="w-3.5 h-3.5" />}
            {isLogout && <LogOut className="w-3.5 h-3.5" />}
            {isCreate && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel || defaultConfirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
