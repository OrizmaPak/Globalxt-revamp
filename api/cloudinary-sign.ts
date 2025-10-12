import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  allowCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ error: 'Cloudinary not configured on server' });
  }

  const { folder = 'global-xt-uploads', publicId, resourceType } = (req.body || {}) as { folder?: string; publicId?: string; resourceType?: string };
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, any> = {
    timestamp,
    folder,
    ...(publicId ? { public_id: publicId } : {}),
    ...(resourceType ? { resource_type: resourceType } : {}),
    overwrite: true,
  };

  try {
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);
    return res.status(200).json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      publicId,
      resourceType,
      signature,
    });
  } catch (err: any) {
    console.error('Cloudinary sign failed:', err);
    return res.status(500).json({ error: 'Cloudinary sign failed', details: err?.message ?? String(err) });
  }
}