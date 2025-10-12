import { useState } from 'react';
import { 
  PencilSquareIcon, 
  Cog6ToothIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthProvider';
import { allowedAdminEmails } from '../../config/admin';
import { useSmartEdit } from '../../context/SmartEditProvider';

const FloatingAdminButton = () => {
  const { user } = useAuth();
  const { isSmartEditMode, toggleSmartEdit } = useSmartEdit();
  const [showMenu, setShowMenu] = useState(false);

  // Only show for admin users
  const email = user?.email?.toLowerCase();
  const isAdmin = !!email && allowedAdminEmails.includes(email);

  if (!isAdmin) return null;

  const handleSmartEditToggle = () => {
    toggleSmartEdit();
    setShowMenu(false);
  };

  const handleAdminPanelClick = () => {
    window.open('/admin', '_blank');
  };

  return (
    <>
      {/* Main Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9997] smart-edit-ui" data-smart-edit-ignore>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            isSmartEditMode 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title={isSmartEditMode ? "Smart Edit Mode Active" : "Admin Tools"}
        >
          {isSmartEditMode ? (
            <PencilSquareIcon className="h-6 w-6" />
          ) : (
            <Cog6ToothIcon className="h-6 w-6" />
          )}
        </button>

        {/* Menu Options */}
        {showMenu && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48">
            <button
              onClick={handleSmartEditToggle}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <PencilSquareIcon className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">
                  {isSmartEditMode ? 'Exit Smart Edit' : 'Smart Edit Mode'}
                </div>
                <div className="text-xs text-gray-500">
                  {isSmartEditMode ? 'Stop editing this page' : 'Edit content on this page'}
                </div>
              </div>
            </button>

            <button
              onClick={handleAdminPanelClick}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-600" />
              <div>
                <div className="font-medium">Admin Panel</div>
                <div className="text-xs text-gray-500">Open full admin interface</div>
              </div>
            </button>

            <div className="border-t border-gray-200 my-1"></div>
            
            <button
              onClick={() => setShowMenu(false)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-500"
            >
              <XMarkIcon className="h-4 w-4" />
              Close
            </button>
          </div>
        )}
      </div>

      {/* Overlay to close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[9996]"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Smart Edit Mode Indicator */}
      {isSmartEditMode && (
        <div className="fixed bottom-6 left-6 z-[9997] bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <PencilSquareIcon className="h-4 w-4" />
            <div>
              <div className="text-sm font-medium">Smart Edit Mode</div>
              <div className="text-xs opacity-90">Hover over text to edit</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAdminButton;