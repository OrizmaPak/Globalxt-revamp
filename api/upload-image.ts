import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with server-side credentials from Vercel env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const allowCORS = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dataUrl, folder = 'global-xt-uploads', publicId, resourceType } = (req.body || {}) as {
    dataUrl?: string;
    folder?: string;
    publicId?: string;
    resourceType?: string;
  };

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ error: 'Cloudinary not configured on server' });
  }

  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return res.status(400).json({ error: 'Invalid payload: expected dataUrl (base64 data URL)' });
  }

  try {
    // Determine resource type from data URL if not provided
    let finalResourceType = resourceType;
    if (!finalResourceType) {
      if (dataUrl.startsWith('data:image/')) {
        finalResourceType = 'image';
      } else if (dataUrl.startsWith('data:video/')) {
        finalResourceType = 'video';
      } else if (dataUrl.startsWith('data:audio/')) {
        finalResourceType = 'auto'; // Cloudinary will auto-detect audio files
      } else {
        finalResourceType = 'auto'; // Let Cloudinary auto-detect
      }
    }

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      public_id: publicId,
      overwrite: true,
      unique_filename: !publicId,
      resource_type: finalResourceType,
    });

    return res.status(200).json({ 
      secure_url: result.secure_url, 
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format
    });
  } catch (err: any) {
    console.error('Cloudinary upload failed:', err);
    return res.status(500).json({ error: 'Cloudinary upload failed', details: err?.message ?? String(err) });
  }
}
