import React, { useState, useEffect, useRef } from 'react';
import { 
  PencilSquareIcon, 
  CheckIcon, 
  XMarkIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useSmartEdit } from '../../context/SmartEditProvider';
import './SmartEditStyles.css';

interface EditableElementOverlay {
  id: string;
  rect: DOMRect;
  content: string;
  type: string;
  element: HTMLElement;
  component?: string;
}

const SmartEditOverlay = () => {
  const {
    isSmartEditMode,
    editableElements,
    hasUnsavedChanges,
    status,
    toggleSmartEdit,
    saveChanges,
    discardChanges,
    updateElement,
    scanForEditableElements
  } = useSmartEdit();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [elementOverlays, setElementOverlays] = useState<EditableElementOverlay[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Update overlays when elements change
  useEffect(() => {
    if (!isSmartEditMode) {
      setElementOverlays([]);
      return;
    }

    const overlays = editableElements.map(element => {
      const rect = element.element.getBoundingClientRect();
      return {
        id: element.id,
        rect: {
          ...rect,
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        } as DOMRect,
        content: element.content,
        type: element.type,
        element: element.element,
        component: element.component
      };
    }).filter(overlay => 
      // Only show visible elements
      overlay.rect.width > 0 && overlay.rect.height > 0
    );

    console.log('Smart Edit Debug:', {
      isSmartEditMode,
      editableElementsCount: editableElements.length,
      overlaysCount: overlays.length,
      firstOverlay: overlays[0]
    });

    setElementOverlays(overlays);
  }, [editableElements, isSmartEditMode]);

  // Re-scan when scrolling or resizing
  useEffect(() => {
    if (!isSmartEditMode) return;

    const handleUpdate = () => {
      scanForEditableElements();
    };

    const debouncedUpdate = debounce(handleUpdate, 100);
    
    window.addEventListener('scroll', debouncedUpdate);
    window.addEventListener('resize', debouncedUpdate);
    
    return () => {
      window.removeEventListener('scroll', debouncedUpdate);
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [isSmartEditMode, scanForEditableElements]);

  const handleStartEdit = (overlay: EditableElementOverlay) => {
    setEditingId(overlay.id);
    setEditValue(overlay.content);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 50);
  };

  const handleSaveEdit = () => {
    if (editingId && editValue !== '') {
      updateElement(editingId, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getOverlayColor = (type: string, component?: string) => {
    if (component) return 'rgba(255, 165, 0, 0.3)'; // Orange for components
    
    switch (type) {
      case 'heading': return 'rgba(59, 130, 246, 0.3)'; // Blue
      case 'paragraph': return 'rgba(34, 197, 94, 0.3)'; // Green
      case 'button': return 'rgba(239, 68, 68, 0.3)'; // Red
      case 'link': return 'rgba(168, 85, 247, 0.3)'; // Purple
      default: return 'rgba(156, 163, 175, 0.3)'; // Gray
    }
  };

  const getBorderColor = (type: string, component?: string) => {
    if (component) return '#f59e0b'; // Orange border
    
    switch (type) {
      case 'heading': return '#3b82f6'; // Blue
      case 'paragraph': return '#22c55e'; // Green  
      case 'button': return '#ef4444'; // Red
      case 'link': return '#a855f7'; // Purple
      default: return '#9ca3af'; // Gray
    }
  };

  if (!isSmartEditMode) return null;

  return (
    <>
      {/* Floating Control Panel */}
      <div className="fixed top-4 right-4 z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Smart Edit</span>
          </div>
          <button
            onClick={toggleSmartEdit}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Exit Smart Edit Mode (Esc)"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Editable Elements:</span>
            <span className="font-medium">{editableElements.length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Overlays Rendered:</span>
            <span className="font-medium">{elementOverlays.length}</span>
          </div>
          
          {hoveredId && (
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Hovering:</span>
              <span className="font-medium text-blue-600">Element</span>
            </div>
          )}
          
          {hasUnsavedChanges && (
            <div className="flex items-center justify-between">
              <span className="text-amber-600">Unsaved Changes:</span>
              <span className="font-medium text-amber-600">Yes</span>
            </div>
          )}
          
          <div className={`text-xs font-medium ${
            status.includes('✅') || status.includes('successfully') ? 'text-green-600' :
            status.includes('❌') || status.includes('Error') || status.includes('failed') ? 'text-red-600' :
            status.includes('🔄') || status.includes('Saving') ? 'text-blue-600' :
            'text-gray-500'
          }`}>
            Status: {status}
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={saveChanges}
              className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={discardChanges}
              className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Discard
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">Element Types:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }}></div>
              <span>Headings</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.5)' }}></div>
              <span>Text</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }}></div>
              <span>Buttons</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(255, 165, 0, 0.5)' }}></div>
              <span>Components</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="font-medium mb-1">Shortcuts:</div>
          <div>Ctrl/Cmd + S: Save • Esc: Exit</div>
        </div>
      </div>

      {/* Element Overlays */}
      {elementOverlays.map((overlay) => {
        const isEditing = editingId === overlay.id;
        const isHovered = hoveredId === overlay.id;
        
        return (
          <div
            key={overlay.id}
            className="fixed z-[9998]"
            style={{
              left: overlay.rect.left,
              top: overlay.rect.top,
              width: overlay.rect.width,
              height: overlay.rect.height,
              pointerEvents: isEditing ? 'auto' : 'none',
            }}
            onMouseEnter={() => setHoveredId(overlay.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Overlay Background - Always visible with subtle styling */}
            <div
              className={`absolute inset-0 border-2 transition-all duration-200 cursor-pointer ${
                isEditing ? 'border-solid border-blue-500' : 'border-dashed'
              } ${isHovered ? 'opacity-80 shadow-lg' : 'opacity-30'}`}
              style={{
                backgroundColor: isHovered ? getOverlayColor(overlay.type, overlay.component) : 'rgba(59, 130, 246, 0.1)',
                borderColor: getBorderColor(overlay.type, overlay.component),
                boxShadow: isHovered ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            />

            {/* Edit Button */}
            {(isHovered || isEditing) && !isEditing && (
              <button
                className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors pointer-events-auto"
                onClick={() => handleStartEdit(overlay)}
                title={`Edit ${overlay.type}${overlay.component ? ` (${overlay.component} component)` : ''}`}
              >
                <PencilSquareIcon className="h-3 w-3" />
              </button>
            )}

            {/* Component Badge */}
            {overlay.component && (isHovered || isEditing) && (
              <div className="absolute -top-6 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded pointer-events-none">
                {overlay.component}
              </div>
            )}

            {/* Inline Edit Input */}
            {isEditing && (
              <div className="absolute inset-0 bg-white border-2 border-blue-500 rounded pointer-events-auto">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full h-full px-2 py-1 text-sm border-none outline-none resize-none bg-transparent"
                  style={{
                    fontSize: window.getComputedStyle(overlay.element).fontSize,
                    fontFamily: window.getComputedStyle(overlay.element).fontFamily,
                    fontWeight: window.getComputedStyle(overlay.element).fontWeight,
                  }}
                />
                <div className="absolute -bottom-8 left-0 flex gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 text-white p-1 rounded shadow hover:bg-green-700"
                    title="Save (Enter)"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-red-600 text-white p-1 rounded shadow hover:bg-red-700"
                    title="Cancel (Esc)"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Element Info Tooltip */}
            {isHovered && !isEditing && (
              <div className="absolute -bottom-6 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {overlay.type} • "{overlay.content.length > 30 ? overlay.content.substring(0, 30) + '...' : overlay.content}"
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

// Utility function for debouncing
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export default SmartEditOverlay;