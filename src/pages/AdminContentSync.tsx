import { useMemo, useState } from 'react';
import { useAdminNotifications } from '../context/AdminNotificationProvider';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import type { SiteContent } from '../lib/contentTypes';
// local content imported within builder
import { buildContentPayload } from '../lib/buildContentPayload';

// Recursively remove undefined values from objects to prevent Firebase errors
const sanitizeForFirebase = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        const sanitized = sanitizeForFirebase(value);
        if (sanitized !== undefined && sanitized !== null) {
          cleaned[key] = sanitized;
        }
      }
    }
    return cleaned;
  }
  
  return obj;
};

const normalizeMap = (mapObj: Record<string, string> | undefined) => {
  const out = new Map<string, string>();
  if (!mapObj) return out;
  Object.entries(mapObj).forEach(([k, v]) => {
    out.set(k.toLowerCase(), v);
  });
  return out;
};

const AdminContentSync = () => {
  const { notify } = useAdminNotifications();
  const [status, setStatus] = useState<string>('Idle');
  const [detail, setDetail] = useState<string>('');

  const map = useMemo(() => {
    // Use Vite glob to optionally include mapping if it exists
    const mods = import.meta.glob('../data/cloudinaryMap.json', { eager: true, import: 'default' }) as Record<string, any>;
    const obj = mods['../data/cloudinaryMap.json'] as Record<string, string> | undefined;
    return normalizeMap(obj);
  }, []);

  const buildPayload = (): SiteContent => {
    // Reuse shared payload builder
    const plain: Record<string, string> = {};
    map.forEach((v, k) => (plain[k] = v));
    return buildContentPayload(plain);
  };

  const runSync = async () => {
    try {
      setStatus('Preparing');
      setDetail('Building content payload with Cloudinary URLs where available');
      const payload = buildPayload();
      
      console.log('?? Raw payload keys:', Object.keys(payload));
      console.log('?? Raw payload sample:', {
        companyInfo: payload.companyInfo,
        heroSlidesCount: payload.heroSlides?.length,
        productCategoriesCount: payload.productCategories?.length
      });

      if (!firebaseApp) {
        throw new Error('Firebase is not configured. Provide environment variables before syncing.');
      }

      setStatus('Sanitizing');
      setDetail('Removing undefined values to prevent Firebase errors...');
      const cleanPayload = sanitizeForFirebase(payload);
      
      console.log('? Sanitized payload keys:', Object.keys(cleanPayload));
      console.log('? Checking for undefined values...');
      
      // Quick check for any remaining undefined values
      const jsonStr = JSON.stringify(cleanPayload);
      if (jsonStr.includes('undefined')) {
        throw new Error('Still contains undefined values after sanitization');
      }

      setStatus('Writing');
      setDetail('Uploading sanitized content to Firestore...');
      const db = getFirestore(firebaseApp);
      await setDoc(doc(db, 'content/site'), cleanPayload, { merge: false });

      setStatus('Success');
      setDetail(`Content uploaded to Firestore at content/site\n\nData summary:\n- Company info: ${cleanPayload.companyInfo ? '?' : '?'}\n- Hero slides: ${cleanPayload.heroSlides?.length || 0}\n- Product categories: ${cleanPayload.productCategories?.length || 0}\n- Page copy: ${cleanPayload.pageCopy ? '?' : '?'}`);
      notify({ type: 'success', title: 'Content sync complete', message: 'Content was uploaded to Firestore.' });
    } catch (err: any) {
      setStatus('Error');
      console.error('? Sync error:', err);
      const message = err?.message ?? String(err);
      setDetail(`Error: ${message}\n\nCheck browser console for detailed logs.`);
      notify({ type: 'error', title: 'Content sync failed', message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Admin: Content Sync</h1>
      <p className="text-sm text-gray-600 mt-2">
        Upload current local content into Firestore. If cloudinaryMap.json exists, image fields will be replaced with Cloudinary URLs.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={runSync}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Sync Now
        </button>
      </div>
      <div className="mt-6">
        <div className="font-medium">Status: {status}</div>
        {detail && (
          <pre className="mt-2 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">{detail}</pre>
        )}
      </div>
    </div>
  );
};

export default AdminContentSync;
