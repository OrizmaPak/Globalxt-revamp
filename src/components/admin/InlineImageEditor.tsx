import { useState, useRef } from 'react';
import { PhotoIcon, CloudArrowUpIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import ImagePreview from '../ImagePreview';

// Cloudinary unsigned upload (client-side)
const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary env: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  if (!json.secure_url) throw new Error('Cloudinary response missing secure_url');
  return json.secure_url as string;
};

interface InlineImageEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  width?: number;
  height?: number;
  allowUrl?: boolean;
}

const InlineImageEditor = ({
  value,
  onChange,
  placeholder = 'No image selected',
  className = '',
  label,
  required = false,
  width = 200,
  height = 120,
  allowUrl = true
}: InlineImageEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsUploading(true);
      setUploadProgress('Uploading to Cloudinary...');
      
      const url = await uploadToCloudinary(file);
      onChange(url);
      setUploadProgress('Upload complete!');
      
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
    } catch (error: any) {
      setUploadProgress(`Upload failed: ${error.message}`);
      setTimeout(() => {
        setUploadProgress('');
      }, 5000);
    } finally {
      setIsUploading(false);
      // Clean up local preview URL
      try { 
        URL.revokeObjectURL(objectUrl); 
      } catch {}
      setPreviewUrl('');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    } else if (e.key === 'Escape') {
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const currentImageUrl = previewUrl || value;
  const hasImage = !!currentImageUrl;

  return (
    <div className={`group relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Image Display/Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-lg transition-all ${
            hasImage 
              ? 'border-gray-200 bg-white' 
              : 'border-gray-300 hover:border-brand-primary hover:bg-brand-primary/5 cursor-pointer'
          }`}
          onClick={!hasImage ? triggerFileInput : undefined}
          style={{ minHeight: height + 40 }}
        >
          {hasImage ? (
            <div className="relative">
              <ImagePreview
                src={currentImageUrl}
                alt="Selected image"
                width={width}
                height={height}
                className="mx-auto"
              />
              {previewUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-sm bg-black bg-opacity-75 px-3 py-2 rounded">
                    Uploading...
                  </div>
                </div>
              )}
              {/* Image Actions */}
              <div className="absolute top-2 right-2 flex gap-1">
                {value && (
                  <button
                    onClick={() => window.open(value, '_blank')}
                    className="p-1.5 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-75 transition-colors"
                    title="View full size"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleRemove}
                  className="p-1.5 bg-red-500 bg-opacity-75 text-white rounded-md hover:bg-opacity-100 transition-colors"
                  title="Remove image"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <PhotoIcon className="h-12 w-12 mb-3" />
              <p className="text-sm font-medium">{placeholder}</p>
              <p className="text-xs mt-1">Click to upload an image</p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className={`text-sm px-3 py-2 rounded-lg ${
            uploadProgress.includes('failed') 
              ? 'bg-red-50 text-red-700 border border-red-200'
              : uploadProgress.includes('complete')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {uploadProgress}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-lime transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            {hasImage ? 'Replace' : 'Upload'} Image
          </button>
          
          {allowUrl && (
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <PhotoIcon className="h-4 w-4" />
              Use URL
            </button>
          )}
        </div>

        {/* URL Input */}
        {showUrlInput && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="Paste image URL here..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-lime transition-colors text-sm"
            >
              Add
            </button>
            <button
              onClick={() => setShowUrlInput(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Current URL Display (for editing) */}
        {value && (
          <div className="text-xs text-gray-500">
            <div className="font-medium mb-1">Current URL:</div>
            <div className="bg-gray-50 p-2 rounded border break-all font-mono">
              {value}
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default InlineImageEditor;