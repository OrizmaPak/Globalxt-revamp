import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'OK',
    service: 'Global XT API',
    timestamp: new Date().toISOString(),
  });
}
