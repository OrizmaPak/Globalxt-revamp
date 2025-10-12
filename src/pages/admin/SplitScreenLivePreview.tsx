import { useState, useRef } from 'react';
import { 
  EyeIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { useAdminEdit } from '../../context/AdminEditProvider';
import LivePreviewIndustries from './LivePreviewIndustries';
import LivePreviewProducts from './LivePreviewProducts';
import PreviewWrapper from '../../components/admin/PreviewWrapper';

type PreviewPage = 'industries' | 'products' | 'home' | 'about' | 'contact';

const SplitScreenLivePreview = () => {
  const {
    isEditMode,
    hasUnsavedChanges,
    status,
    enterEditMode,
    exitEditMode,
    saveChanges,
    discardChanges,
  } = useAdminEdit();
  
  const [activePage, setActivePage] = useState<PreviewPage>('industries');
  const [showEditControls, setShowEditControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50); // 50% split by default
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const pages = [
    { id: 'industries' as PreviewPage, label: 'Industries', icon: '🏢' },
    { id: 'products' as PreviewPage, label: 'Products', icon: '📦' },
    { id: 'home' as PreviewPage, label: 'Home', icon: '🏠' },
    { id: 'about' as PreviewPage, label: 'About', icon: '📋' },
    { id: 'contact' as PreviewPage, label: 'Contact', icon: '📞' },
  ];

  // Sync scroll between panels
  const handleLeftScroll = () => {
    if (leftPanelRef.current && rightPanelRef.current) {
      const leftScrollTop = leftPanelRef.current.scrollTop;
      const leftScrollHeight = leftPanelRef.current.scrollHeight - leftPanelRef.current.clientHeight;
      const leftScrollRatio = leftScrollTop / leftScrollHeight;
      
      const rightScrollHeight = rightPanelRef.current.scrollHeight - rightPanelRef.current.clientHeight;
      rightPanelRef.current.scrollTop = rightScrollHeight * leftScrollRatio;
    }
  };

  const handleRightScroll = () => {
    if (leftPanelRef.current && rightPanelRef.current) {
      const rightScrollTop = rightPanelRef.current.scrollTop;
      const rightScrollHeight = rightPanelRef.current.scrollHeight - rightPanelRef.current.clientHeight;
      const rightScrollRatio = rightScrollTop / rightScrollHeight;
      
      const leftScrollHeight = leftPanelRef.current.scrollHeight - leftPanelRef.current.clientHeight;
      leftPanelRef.current.scrollTop = leftScrollHeight * rightScrollRatio;
    }
  };

  const renderPreviewPage = () => {
    return <PreviewWrapper pageName={activePage} />;
  };

  const renderEditablePage = () => {
    if (!isEditMode) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <div className="text-center">
            <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Edit Mode Required
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Click "Enter Edit Mode" to start editing your pages with inline editing controls.
            </p>
            <button
              onClick={enterEditMode}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Enter Edit Mode
            </button>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case 'industries':
        return <LivePreviewIndustries />;
      case 'products':
        return <LivePreviewProducts />;
      case 'home':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🏠</span>
              <p className="text-gray-600">Home page editing coming soon</p>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-gray-600">About page editing coming soon</p>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📞</span>
              <p className="text-gray-600">Contact page editing coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-full mx-auto h-screen flex flex-col">
      {/* Sticky Header */}
      {showEditControls && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Split Screen Editor</h1>
              </div>
              
              {isEditMode && (
                <div className="flex items-center gap-2 text-sm">
                  {hasUnsavedChanges ? (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600 font-medium">Unsaved changes</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">All changes saved</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullScreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={() => setShowEditControls(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Hide controls"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              
              {isEditMode ? (
                <>
                  {hasUnsavedChanges && (
                    <button
                      onClick={discardChanges}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Discard Changes
                    </button>
                  )}
                  
                  <button
                    onClick={saveChanges}
                    disabled={!hasUnsavedChanges}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    Save Changes
                  </button>
                  
                  <button
                    onClick={exitEditMode}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Exit Edit Mode
                  </button>
                </>
              ) : (
                <button
                  onClick={enterEditMode}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Enter Edit Mode
                </button>
              )}
            </div>
          </div>

          {/* Status Bar */}
          {status && status !== 'Ready' && (
            <div className={`px-6 py-3 text-sm font-medium border-t ${
              status.includes('Error') 
                ? 'bg-red-50 text-red-700 border-red-200'
                : status.includes('successfully')
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {status}
            </div>
          )}

          {/* Page Navigation */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <nav className="flex space-x-1" aria-label="Pages">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activePage === page.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <span className="mr-2">{page.icon}</span>
                  {page.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Show controls toggle when hidden */}
      {!showEditControls && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowEditControls(true)}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Show edit controls"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Split Screen Content */}
      <div className={`flex flex-1 ${isFullScreen ? 'fixed inset-0 z-40' : ''}`}>
        {/* Left Panel - Frontend Preview */}
        <div 
          className="flex-1 bg-white border-r border-gray-200 overflow-auto"
          style={{ width: `${splitRatio}%` }}
          ref={leftPanelRef}
          onScroll={handleLeftScroll}
        >
          <div className="sticky top-0 z-10 bg-blue-50 px-4 py-2 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Frontend Preview</span>
              <span className="text-xs text-blue-600">How visitors see your page</span>
            </div>
          </div>
          <div className="min-h-screen">
            {renderPreviewPage()}
          </div>
        </div>

        {/* Resizer */}
        <div 
          className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startRatio = splitRatio;
            
            const handleMouseMove = (e: MouseEvent) => {
              const containerWidth = window.innerWidth;
              const newRatio = Math.max(20, Math.min(80, startRatio + ((e.clientX - startX) / containerWidth) * 100));
              setSplitRatio(newRatio);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />

        {/* Right Panel - Editable Interface */}
        <div 
          className="flex-1 bg-gray-50 overflow-auto"
          style={{ width: `${100 - splitRatio}%` }}
          ref={rightPanelRef}
          onScroll={handleRightScroll}
        >
          <div className="sticky top-0 z-10 bg-green-50 px-4 py-2 border-b border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Edit Panel</span>
              <span className="text-xs text-green-600">
                {isEditMode ? "Click to edit content" : "Enter edit mode to start"}
              </span>
            </div>
          </div>
          <div className="min-h-screen">
            {renderEditablePage()}
          </div>
        </div>
      </div>

      {/* Instructions overlay for edit mode */}
      {isEditMode && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
          <h4 className="font-semibold mb-2">✨ Split Screen Mode</h4>
          <p className="text-sm">
            Left: Live preview • Right: Edit panel
            <br />
            Changes appear instantly on both sides!
          </p>
        </div>
      )}
    </div>
  );
};

export default SplitScreenLivePreview;