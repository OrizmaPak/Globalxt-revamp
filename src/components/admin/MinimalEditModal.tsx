import { useEffect, useRef, useState } from 'react';

interface MinimalEditModalProps {
  isOpen: boolean;
  initialValue: string;
  elementLabel?: string;
  onClose: () => void;
  onSave: (newContent: string) => void;
}

const MinimalEditModal = ({ isOpen, initialValue, elementLabel, onClose, onSave }: MinimalEditModalProps) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log('MinimalEditModal useEffect:', { isOpen, initialValue, elementLabel });
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialValue]);

  console.log('MinimalEditModal render:', { isOpen, value, elementLabel });
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = value.trim();
    console.log('🚀 MinimalEditModal: handleConfirm called with value:', trimmed);
    
    if (trimmed.length === 0) {
      console.log('⚠️ MinimalEditModal: Empty value, aborting save');
      return;
    }
    
    console.log('💾 MinimalEditModal: Calling onSave with:', trimmed);
    onSave(trimmed);
    
    console.log('🔴 MinimalEditModal: Closing modal');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center" data-smart-edit-ignore>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-white/95 to-emerald-50/90 backdrop-blur-xl" style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div className="px-6 py-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm">
          <div className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">Smart Edit</div>
          <div className="text-sm text-emerald-600 font-medium">{elementLabel || 'Edit text'}</div>
        </div>

        <div className="p-6">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Transform your content with AI precision..."
            className="w-full h-36 rounded-xl border-2 border-emerald-200 px-4 py-3 text-[15px] leading-6 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 resize-none bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-sm transition-all duration-300"
            style={{ boxShadow: 'inset 0 1px 3px rgba(16, 185, 129, 0.1)' }}
          />
          <div className="mt-3 text-xs text-emerald-600/80 text-right font-medium">{value.length} characters</div>
        </div>

        <div className="px-6 py-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-t border-emerald-500/20 backdrop-blur-sm flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm text-emerald-700 bg-white/80 border border-emerald-200 rounded-lg hover:bg-emerald-50/80 transition-all duration-200 font-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              onClick={handleConfirm}
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalEditModal;
