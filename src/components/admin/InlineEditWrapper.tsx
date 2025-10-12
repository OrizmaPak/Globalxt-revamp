import React, { useState, useRef, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAdminEdit } from '../../context/AdminEditProvider';

interface InlineEditWrapperProps {
  children: React.ReactNode;
  editType?: 'text' | 'textarea' | 'rich' | 'image';
  value: string | string[];
  onSave: (value: any) => void;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  label?: string;
}

const InlineEditWrapper = ({
  children,
  editType = 'text',
  value,
  onSave,
  placeholder = '',
  className = '',
  editClassName = '',
  multiline = false,
  rows = 3,
  disabled = false,
  label
}: InlineEditWrapperProps) => {
  const { isEditMode } = useAdminEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showHover, setShowHover] = useState(false);
  const editRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Don't show editing controls if not in edit mode or disabled
  if (!isEditMode || disabled) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      if (editType === 'textarea' || multiline) {
        editRef.current.setSelectionRange(editRef.current.value.length, editRef.current.value.length);
      }
    }
  }, [isEditing, editType, multiline]);

  const handleStartEdit = () => {
    if (Array.isArray(value)) {
      setEditValue(value.join('\n'));
    } else {
      setEditValue(value || '');
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    let processedValue: any = editValue;
    
    if (editType === 'textarea' && editValue.includes('\n')) {
      // For textarea, split by newlines if it contains line breaks
      processedValue = editValue.split('\n').filter(line => line.trim());
    }
    
    onSave(processedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && editType !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && e.metaKey) {
      // Cmd/Ctrl + Enter to save in multiline
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    const inputClassName = `
      inline-block w-full min-w-0 bg-white border-2 border-blue-500 rounded px-3 py-2 text-inherit font-inherit
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
      ${editClassName}
    `.trim();

    return (
      <div className="relative group">
        {label && (
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="flex items-start gap-2">
          {multiline || editType === 'textarea' ? (
            <textarea
              ref={editRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={rows}
              className={`${inputClassName} resize-none`}
            />
          ) : (
            <input
              ref={editRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={inputClassName}
            />
          )}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={handleSave}
              className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              title="Save (Enter or Cmd+Enter)"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              title="Cancel (Escape)"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
      onClick={handleStartEdit}
    >
      {children}
      
      {/* Hover overlay */}
      {showHover && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded pointer-events-none" />
      )}
      
      {/* Edit button */}
      {showHover && (
        <div className="absolute -top-2 -right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartEdit();
            }}
            className="p-1 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title={label ? `Edit ${label}` : 'Edit'}
          >
            <PencilIcon className="h-3 w-3" />
          </button>
        </div>
      )}
      
      {/* Label for editing hint */}
      {label && showHover && (
        <div className="absolute -top-6 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          Click to edit: {label}
        </div>
      )}
    </div>
  );
};

export default InlineEditWrapper;