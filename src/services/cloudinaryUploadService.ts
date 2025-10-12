import { API_CONFIG } from '../config/api';

interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
  resourceType?: string;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

const pickSecureUrl = (payload: any): string | undefined => {
  return payload?.secure_url || payload?.url || payload?.data?.url || payload?.data?.display_url || payload?.data?.image?.url;
};

// Helper function to determine Cloudinary resource type based on file type
const getCloudinaryResourceType = (file: File): string => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('audio/')) {
    return 'auto'; // Cloudinary handles audio files as 'raw' but 'auto' works better
  } else {
    return 'auto'; // Let Cloudinary auto-detect other file types
  }
};

export const uploadFileToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  console.log('📤 Starting file upload:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    isAudio: file.type.startsWith('audio/'),
    resourceType: getCloudinaryResourceType(file)
  });
  
  const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY as string | undefined;
  if (imgbbKey) {
    try {
      const form = new FormData();
      form.append('image', file);
      const resp = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`, {
        method: 'POST',
        body: form
      });
      if (!resp.ok) throw new Error(`imgbb upload failed: ${resp.status}`);
      const json = await resp.json();
      const url = pickSecureUrl(json);
      if (url) {
        return { url: url as string, resourceType: 'image' };
      }
      throw new Error('imgbb response missing url');
    } catch (err) {
      console.warn('imgbb upload failed, falling back to Cloudinary', err);
    }
  }

  const envBase = (import.meta.env.VITE_UPLOAD_API_BASE as string | undefined) || '';
  const inferredBase = API_CONFIG?.BASE_URL || '';
  const signCandidates = [
    envBase ? `${envBase.replace(/\/$/, '')}/api/cloudinary-sign` : '',
    inferredBase ? `${inferredBase.replace(/\/$/, '')}/api/cloudinary-sign` : '',
    '/api/cloudinary-sign',
    'http://localhost:3001/api/cloudinary-sign'
  ].filter(Boolean);

  const cloudNameEnv = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

  const resourceType = getCloudinaryResourceType(file);
  
  for (const signUrl of signCandidates) {
    try {
      const signResp = await fetch(signUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType })
      });
      if (!signResp.ok) continue;
      const { cloudName: cn, apiKey, timestamp, folder, publicId, signature, resourceType: signedResourceType } = await signResp.json();
      const cloudName = cloudNameEnv || cn;
      if (!cloudName || !apiKey || !timestamp || !signature) throw new Error('Invalid Cloudinary signature payload');
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      if (folder) form.append('folder', folder);
      if (publicId) form.append('public_id', publicId);
      if (signedResourceType) form.append('resource_type', signedResourceType);
      form.append('overwrite', 'true');
      
      // Use the appropriate Cloudinary endpoint based on resource type
      const endpoint = signedResourceType === 'video' ? 'video/upload' : 
                      signedResourceType === 'auto' || file.type.startsWith('audio/') ? 'auto/upload' :
                      'upload';
      const uploadResp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`, { method: 'POST', body: form });
      if (!uploadResp.ok) {
        console.warn(`❌ Cloudinary upload failed with status ${uploadResp.status} for ${file.name}`);
        continue;
      }
      const json = await uploadResp.json();
      const url = pickSecureUrl(json);
      if (url) {
        console.log('✅ Cloudinary signed upload successful:', {
          fileName: file.name,
          url: url,
          resourceType: json.resource_type,
          publicId: json.public_id
        });
        return { url: url as string, publicId: json.public_id as string | undefined, resourceType: json.resource_type as string | undefined };
      }
    } catch (err) {
      console.warn('❌ Cloudinary signed upload failed for', file.name, '- Error:', err);
    }
  }

  const cloudName = cloudNameEnv;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
  if (cloudName && uploadPreset) {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', uploadPreset);
      if (resourceType && resourceType !== 'image') {
        form.append('resource_type', resourceType);
      }
      
      // Use the appropriate Cloudinary endpoint based on resource type
      const endpoint = resourceType === 'video' ? 'video/upload' : 
                      resourceType === 'auto' || file.type.startsWith('audio/') ? 'auto/upload' :
                      'upload';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`, { method: 'POST', body: form });
      if (res.ok) {
        const json = await res.json();
        const url = pickSecureUrl(json);
        if (url) {
          return { url: url as string, publicId: json.public_id as string | undefined, resourceType: json.resource_type as string | undefined };
        }
      }
    } catch (err) {
      console.warn('Cloudinary unsigned upload failed', err);
    }
  }

  const dataUrl = await readFileAsDataUrl(file);
  const uploadCandidates = [
    envBase ? `${envBase.replace(/\/$/, '')}/api/upload-image` : '',
    inferredBase ? `${inferredBase.replace(/\/$/, '')}/api/upload-image` : '',
    '/api/upload-image',
    'http://localhost:3001/api/upload-image'
  ].filter(Boolean);

  let lastErr: any = null;
  for (const url of uploadCandidates) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, resourceType })
      });
      if (!resp.ok) {
        lastErr = new Error(`Upload API failed: ${resp.status} ${resp.statusText}`);
        continue;
      }
      const json = await resp.json();
      const secureUrl = pickSecureUrl(json);
      if (secureUrl) {
        return { url: secureUrl as string, publicId: json.public_id as string | undefined, resourceType: json.resource_type as string | undefined };
      }
    } catch (err) {
      lastErr = err;
      continue;
    }
  }

  throw lastErr || new Error('Upload failed via all methods');
};

export type { CloudinaryUploadResult };
