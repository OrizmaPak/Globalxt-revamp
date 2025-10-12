import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary environment variables. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
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

