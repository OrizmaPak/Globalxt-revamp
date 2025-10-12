import { useEffect } from 'react';
import { useSmartEdit } from '../../context/SmartEditProvider';

const SmartEditTest = () => {
  const { isSmartEditMode, status, hasUnsavedChanges, toggleSmartEdit } = useSmartEdit();

  useEffect(() => {
    console.log('🧪 SmartEditTest: Component mounted');
    console.log('🧪 SmartEditTest: Current status:', {
      isSmartEditMode,
      status,
      hasUnsavedChanges
    });
  }, [isSmartEditMode, status, hasUnsavedChanges]);

  return (
    <div className="fixed top-20 left-4 z-[9999] bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 max-w-xs">
      <div className="text-sm font-bold text-yellow-800 mb-2">Smart Edit Debug</div>
      <div className="text-xs space-y-1">
        <div>
          <strong>Mode:</strong> {isSmartEditMode ? '✅ Active' : '❌ Inactive'}
        </div>
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Changes:</strong> {hasUnsavedChanges ? '⚠️ Unsaved' : '✅ Saved'}
        </div>
      </div>
      <button
        onClick={toggleSmartEdit}
        className="mt-2 px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Toggle Smart Edit
      </button>
      
      {/* Test content for editing */}
      <div className="mt-4 p-2 border border-gray-300 rounded">
        <h3 className="text-sm font-bold" data-content-path="pageCopy.test.heading">
          Test Heading
        </h3>
        <p className="text-xs mt-1" data-content-path="pageCopy.test.description">
          This is a test paragraph that should be editable when smart edit is enabled.
        </p>
        <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1" data-content-path="pageCopy.test.buttonText">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SmartEditTest;
