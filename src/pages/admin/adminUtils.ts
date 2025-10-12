// Shared admin helpers
import firebaseApp from '../../lib/firebase';
import { uploadFileToCloudinary } from '../../services/cloudinaryUploadService';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export const sanitizeForFirebase = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase).filter((x) => x !== null && x !== undefined);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined && v !== null) {
        const s = sanitizeForFirebase(v);
        if (s !== undefined && s !== null) out[k] = s;
      }
    }
    return out;
  }
  return obj;
};

export const splitByComma = (val: string) => val.split(',').map((s) => s.trim()).filter(Boolean);
export const splitByLines = (val: string) => val.split('\n').map((s) => s.trim()).filter(Boolean);

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const result = await uploadFileToCloudinary(file);
  return result.url;
};

export const saveContentSite = async (payload: any) => {
  if (!firebaseApp) throw new Error('Firebase not configured');
  const db = getFirestore(firebaseApp);
  await setDoc(doc(db, 'content/site'), payload, { merge: false });
};



