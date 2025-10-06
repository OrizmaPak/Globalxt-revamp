import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import path from 'node:path';

// Read credentials from env or hardcode here per user instruction.
// WARNING: Do not commit secrets in production. Provided for this setup per request.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'duoojkl6a',
  api_key: process.env.CLOUDINARY_API_KEY || '188479395339865',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lgIaazbgJxybUXAHyrm_pV6Xzw8',
  secure: true,
});

const root = path.resolve(process.cwd());
const assetsDirs = [
  path.join(root, 'src', 'assets', 'images'),
  path.join(root, 'src', 'assets'),
];

const outFile = path.join(root, 'src', 'data', 'cloudinaryMap.json');

const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkFiles(p));
    else if (/(\.png|\.jpe?g|\.webp|\.svg)$/i.test(e.name)) files.push(p);
  }
  return files;
};

const uploadAll = async () => {
  const all = assetsDirs.flatMap((d) => walkFiles(d));
  const map = {};
  for (const file of all) {
    const filename = path.basename(file);
    try {
      const folder = 'global-xt-assets';
      const publicId = filename.replace(/\.[^.]+$/, '');
      const res = await cloudinary.uploader.upload(file, {
        folder,
        public_id: publicId,
        overwrite: true,
        unique_filename: false,
        use_filename: true,
        resource_type: 'image',
      });
      map[filename] = res.secure_url;
      console.log('Uploaded:', filename, '->', res.secure_url);
    } catch (err) {
      console.error('Failed:', filename, err?.message || err);
    }
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(map, null, 2));
  console.log('Wrote mapping to', outFile);
};

uploadAll();

