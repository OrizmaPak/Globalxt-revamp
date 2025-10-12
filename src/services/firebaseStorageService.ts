// Firebase Storage Service for Audio Uploads
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  uploadBytesResumable,
  type UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from '../lib/firebase';

interface FirebaseUploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

/**
 * Upload an audio file to Firebase Storage
 */
export const uploadAudioToFirebase = async (
  file: File,
  roomId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<FirebaseUploadResult> => {
  console.log('🔥 Starting Firebase Storage upload for audio:', file.name);
  
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  // Validate file type
  if (!file.type.startsWith('audio/')) {
    throw new Error('File must be an audio file');
  }

  // Generate a unique filename
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedFileName}`;
  
  // Create storage reference - organize by room and type
  const storageRef = ref(storage, `chat-files/${roomId}/audio/${filename}`);
  
  try {
    if (onProgress) {
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => {
            console.error('🔥 Firebase upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('🔥 Firebase upload completed:', downloadURL);
              
              resolve({
                url: downloadURL,
                path: uploadTask.snapshot.ref.fullPath,
                size: file.size,
                contentType: file.type
              });
            } catch (urlError) {
              console.error('🔥 Failed to get download URL:', urlError);
              reject(new Error('Failed to get download URL'));
            }
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      console.log('🔥 Uploading to path:', storageRef.fullPath);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type
      });
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔥 Firebase upload completed:', downloadURL);
      
      return {
        url: downloadURL,
        path: uploadResult.ref.fullPath,
        size: file.size,
        contentType: file.type
      };
    }
  } catch (error) {
    console.error('🔥 Firebase Storage upload failed:', error);
    throw new Error(`Firebase upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload any file type to Firebase Storage (for non-audio files as fallback)
 */
export const uploadFileToFirebase = async (
  file: File,
  roomId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<FirebaseUploadResult> => {
  console.log('🔥 Starting Firebase Storage upload for file:', file.name);
  
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  // Generate a unique filename
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedFileName}`;
  
  // Determine folder based on file type
  let folder = 'other';
  if (file.type.startsWith('image/')) {
    folder = 'images';
  } else if (file.type.startsWith('audio/')) {
    folder = 'audio';
  } else if (file.type.startsWith('video/')) {
    folder = 'videos';
  } else if (file.type.includes('pdf') || file.type.includes('document')) {
    folder = 'documents';
  }
  
  // Create storage reference
  const storageRef = ref(storage, `chat-files/${roomId}/${folder}/${filename}`);
  
  try {
    if (onProgress) {
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            onProgress(progress);
          },
          (error) => {
            console.error('🔥 Firebase upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('🔥 Firebase upload completed:', downloadURL);
              
              resolve({
                url: downloadURL,
                path: uploadTask.snapshot.ref.fullPath,
                size: file.size,
                contentType: file.type
              });
            } catch (urlError) {
              console.error('🔥 Failed to get download URL:', urlError);
              reject(new Error('Failed to get download URL'));
            }
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      console.log('🔥 Uploading to path:', storageRef.fullPath);
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type
      });
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('🔥 Firebase upload completed:', downloadURL);
      
      return {
        url: downloadURL,
        path: uploadResult.ref.fullPath,
        size: file.size,
        contentType: file.type
      };
    }
  } catch (error) {
    console.error('🔥 Firebase Storage upload failed:', error);
    throw new Error(`Firebase upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export type { FirebaseUploadResult, UploadProgress };