import { useState, useRef, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  maxLength?: number;
}

const InlineTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  multiline = false,
  className = '',
  label,
  required = false,
  maxLength
}: InlineTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    setTempValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value;

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <div className={`group relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="flex items-start gap-2">
          <InputComponent
            ref={inputRef as any}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`flex-1 rounded-lg border border-brand-primary bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary ${
              multiline ? 'min-h-[80px] resize-vertical' : ''
            }`}
            rows={multiline ? 3 : undefined}
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={handleSave}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              title="Save (Enter)"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors"
              title="Cancel (Esc)"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {maxLength && (
          <div className="mt-1 text-xs text-gray-500 text-right">
            {tempValue.length}/{maxLength}
          </div>
        )}
        {multiline && (
          <div className="mt-1 text-xs text-gray-500">
            Press Ctrl+Enter to save, Escape to cancel
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed border-transparent bg-gray-50 px-3 py-2 transition-all hover:border-brand-primary hover:bg-brand-primary/5 ${
          isEmpty ? 'text-gray-400 italic' : 'text-gray-900'
        } ${multiline ? 'min-h-[80px]' : ''}`}
        onClick={handleEdit}
      >
        <div className="flex items-center justify-between">
          <span className={`${multiline ? 'whitespace-pre-wrap' : 'truncate'} flex-1`}>
            {displayValue}
          </span>
          <PencilIcon className="ml-2 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
};

export default InlineTextEditor;