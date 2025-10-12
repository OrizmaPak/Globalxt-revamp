import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContent: string) => void;
  element: {
    content: string;
    type: string;
    tagName: string;
    component?: string;
  } | null;
}

const EditModal = ({ isOpen, onClose, onSave, element }: EditModalProps) => {
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && element) {
      setEditValue(element.content);
      // Focus and select text after modal opens
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, element]);

  const handleSave = () => {
    if (editValue.trim() !== '') {
      onSave(editValue);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const getElementTypeIcon = (type: string) => {
    switch (type) {
      case 'heading': return '📝';
      case 'paragraph': return '📄';
      case 'button': return '🔘';
      case 'link': return '🔗';
      default: return '✏️';
    }
  };

  const getElementTypeColor = (type: string) => {
    switch (type) {
      case 'heading': return 'text-blue-600 bg-blue-50';
      case 'paragraph': return 'text-green-600 bg-green-50';
      case 'button': return 'text-red-600 bg-red-50';
      case 'link': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen || !element) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
<div className="relative bg-gradient-to-br from-purple-200 via-blue-200 to-purple-200 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden border-t-4 border-blue-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getElementTypeColor(element.type)}`}>
              <span className="text-lg">{getElementTypeIcon(element.type)}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Edit {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
              </h2>
              <p className="text-sm text-gray-600">
                {element.tagName.toLowerCase()} • {element.content.length} characters
                {element.component && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    Component: {element.component}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {element.component && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <strong>Component Edit:</strong> This change will update all similar {element.component} components across your website.
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Content
            </label>
<textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your content here..."
              style={{
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.5',
                cursor: 'text',
              }}
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{editValue.length} characters</span>
              <span>Ctrl/Cmd + Enter to save • Esc to cancel</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Changes will be saved to your content management system
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={editValue.trim() === ''}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;