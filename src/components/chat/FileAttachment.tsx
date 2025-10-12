// File Attachment Component
import React, { useState } from 'react';

interface FileAttachmentProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  onImageClick?: () => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileName,
  fileSize,
  fileType,
  fileUrl,
  thumbnailUrl,
  onImageClick
}) => {
  const [imageError, setImageError] = useState(false);
  
  const isImage = fileType.startsWith('image/');
  const isAudio = fileType.startsWith('audio/');
  const fileIcon = isImage ? '🖼️' : isAudio ? '🎤' : '📎';
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    try {
      console.log('📥 Downloading file:', fileName, fileUrl);
      
      // Handle data URLs safely
      if (fileUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('📥 Data URL download initiated successfully');
      } else if (fileUrl.includes('dropbox') || fileUrl.includes('dl.dropboxusercontent.com')) {
        // Handle Dropbox URLs - convert to direct download if needed
        let downloadUrl = fileUrl;
        if (fileUrl.includes('dropbox.com') && !fileUrl.includes('dl.dropboxusercontent.com')) {
          downloadUrl = fileUrl.replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        }
        
        // For Dropbox files, try direct download first
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('📥 Dropbox file download initiated:', downloadUrl);
      } else {
        // For other regular URLs, open in new tab as fallback
        window.open(fileUrl, '_blank');
        console.log('📥 File opened in new tab');
      }
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      alert('Error downloading file. The file may no longer be available.');
    }
  };


  if (isImage && !imageError) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-white max-w-sm">
          <div className="mb-2">
            <img
              src={thumbnailUrl || fileUrl}
              alt={fileName}
              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onImageClick}
              onError={() => {
                console.warn('Image load error for:', fileName);
                setImageError(true);
              }}
              crossOrigin="anonymous"
            />
          </div>

        <div className="text-sm">
          <p className="font-medium text-gray-900 truncate" title={fileName}>
            {fileName}
          </p>
          <p className="text-gray-500 text-xs">
            {formatFileSize(fileSize)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={onImageClick}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span>View</span>
          </button>

          <button
            onClick={handleDownload}
            className="text-xs text-green-600 hover:text-green-700 flex items-center space-x-1 ml-auto"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-white max-w-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 5a3 3 0 016 0v4a3 3 0 11-6 0V5z" />
              <path d="M5 9a5 5 0 0010 0h1a1 1 0 110 2h-3.035A3.5 3.5 0 0111 15.446V17h2a1 1 0 110 2H7a1 1 0 110-2h2v-1.554A3.5 3.5 0 016.035 11H3a1 1 0 110-2h1z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate" title={fileName}>
              {fileName}
            </p>
            <p className="text-gray-500 text-xs">
              {formatFileSize(fileSize)}
            </p>
          </div>
        </div>

        <audio controls src={fileUrl} className="w-full rounded" preload="metadata">
          Your browser does not support the audio element.
        </audio>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-1 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate" title={fileName}>
            {fileIcon} {fileName}
          </p>
          <p className="text-gray-500 text-xs">
            {formatFileSize(fileSize)}
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="ml-3 px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-1 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
export default FileAttachment;
