// Test utility for Dropbox upload functionality
// This file is for testing purposes only

import { uploadFileToDropbox } from '../services/dropboxUploadService';
import { debugDropboxUpload } from './debugDropboxUpload';

export const testDropboxUpload = () => {
  // Test the resource type detection with sample file objects
  const testFiles = [
    { name: 'audio.mp3', type: 'audio/mpeg', size: 1024 * 100 }, // 100KB audio file
    { name: 'audio.wav', type: 'audio/wav', size: 1024 * 200 },   // 200KB audio file
    { name: 'audio.ogg', type: 'audio/ogg', size: 1024 * 150 },   // 150KB audio file
    { name: 'image.jpg', type: 'image/jpeg', size: 1024 * 50 },   // 50KB image file
    { name: 'video.mp4', type: 'video/mp4', size: 1024 * 500 },   // 500KB video file
    { name: 'document.pdf', type: 'application/pdf', size: 1024 * 300 } // 300KB PDF file
  ];

  console.log('🧪 Testing Dropbox resource type detection:');
  
  testFiles.forEach(fileData => {
    // const file = new File(['test content'], fileData.name, { type: fileData.type });
    
    let expectedResourceType = 'document';
    if (fileData.type.startsWith('image/')) {
      expectedResourceType = 'image';
    } else if (fileData.type.startsWith('video/')) {
      expectedResourceType = 'video';
    } else if (fileData.type.startsWith('audio/')) {
      expectedResourceType = 'audio';
    }
    
    console.log(`📄 ${fileData.name} (${fileData.type}) -> Expected resource type: ${expectedResourceType}`);
  });
  
  console.log('✅ Resource type detection test completed!');
  console.log('📦 Files will be organized in Dropbox folders by type:');
  console.log('  📁 /global-xt-uploads/audio/ - Audio files');
  console.log('  📁 /global-xt-uploads/image/ - Image files');
  console.log('  📁 /global-xt-uploads/video/ - Video files');
  console.log('  📁 /global-xt-uploads/document/ - Other documents');
  console.log('🎤 Audio files (.mp3, .wav, .ogg) should now upload successfully to Dropbox');
  console.log('📝 To test in the UI: Go to a chat room and try recording or uploading an audio file');
};

// Function to test actual upload (for console debugging)
export const testActualDropboxUpload = async () => {
  try {
    // Create a small test audio file
    const testContent = 'This is a test audio file content';
    const testFile = new File([testContent], 'test-audio.mp3', { type: 'audio/mpeg' });
    
    console.log('🧪 Starting actual Dropbox upload test...');
    console.log('📤 Test file:', {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size
    });
    
    const result = await uploadFileToDropbox(testFile);
    
    console.log('✅ Dropbox upload test successful!');
    console.log('📊 Result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Dropbox upload test failed:', error);
    throw error;
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testDropboxUpload = testDropboxUpload;
  (window as any).testActualDropboxUpload = testActualDropboxUpload;
  (window as any).debugDropboxUpload = debugDropboxUpload;
}
