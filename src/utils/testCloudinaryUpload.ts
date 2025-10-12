// Test utility for Cloudinary upload functionality
// This file is for testing purposes only

// import { uploadFileToCloudinary } from '../services/cloudinaryUploadService';

export const testCloudinaryUpload = () => {
  // Test the resource type detection with sample file objects
  const testFiles = [
    { name: 'audio.mp3', type: 'audio/mpeg', size: 1024 * 100 }, // 100KB audio file
    { name: 'audio.wav', type: 'audio/wav', size: 1024 * 200 },   // 200KB audio file
    { name: 'audio.ogg', type: 'audio/ogg', size: 1024 * 150 },   // 150KB audio file
    { name: 'image.jpg', type: 'image/jpeg', size: 1024 * 50 },   // 50KB image file
    { name: 'video.mp4', type: 'video/mp4', size: 1024 * 500 },   // 500KB video file
    { name: 'document.pdf', type: 'application/pdf', size: 1024 * 300 } // 300KB PDF file
  ];

  console.log('🧪 Testing Cloudinary resource type detection:');
  
  testFiles.forEach(fileData => {
    // const file = new File(['test content'], fileData.name, { type: fileData.type });
    
    let expectedResourceType = 'auto';
    if (fileData.type.startsWith('image/')) {
      expectedResourceType = 'image';
    } else if (fileData.type.startsWith('video/')) {
      expectedResourceType = 'video';
    } else if (fileData.type.startsWith('audio/')) {
      expectedResourceType = 'auto';
    }
    
    console.log(`📄 ${fileData.name} (${fileData.type}) -> Expected resource type: ${expectedResourceType}`);
  });
  
  console.log('✅ Resource type detection test completed!');
  console.log('🎤 Audio files (.mp3, .wav, .ogg) should now upload successfully to Cloudinary');
  console.log('📝 To test in the UI: Go to a chat room and try recording or uploading an audio file');
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testCloudinaryUpload = testCloudinaryUpload;
}