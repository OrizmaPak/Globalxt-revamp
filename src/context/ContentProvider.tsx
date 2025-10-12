import { createContext, useContext, useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, type Firestore } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import type { SiteContent } from '../lib/contentTypes';
import { buildContentPayload } from '../lib/buildContentPayload';

interface ContentContextValue {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseApp) {
      setError('Firebase is not configured. Remote content cannot be loaded.');
      setLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;
    try {
      const db: Firestore = getFirestore(firebaseApp);
      const ref = doc(db, 'content/site');

      const maybeSeed = async () => {
        try {
          if (import.meta.env.VITE_AUTO_SEED === 'true') {
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              const mods = import.meta.glob('../data/cloudinaryMap.json', { eager: true, import: 'default' }) as Record<string, any>;
              const obj = mods['../data/cloudinaryMap.json'] as Record<string, string> | undefined;
              const payload = buildContentPayload(obj);

              const sanitizeForFirebase = (obj: any): any => {
                if (obj === null || obj === undefined) return null;
                if (Array.isArray(obj)) return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
                if (typeof obj === 'object') {
                  const cleaned: any = {};
                  for (const [key, value] of Object.entries(obj)) {
                    if (value !== undefined && value !== null) {
                      const sanitized = sanitizeForFirebase(value);
                      if (sanitized !== undefined && sanitized !== null) cleaned[key] = sanitized;
                    }
                  }
                  return cleaned;
                }
                return obj;
              };

              const cleanPayload = sanitizeForFirebase(payload);
              await setDoc(ref, cleanPayload, { merge: false });
              console.log('Auto-seeded Firestore content/site');
            }
          }
        } catch (e) {
          console.error('Auto-seeding failed:', e);
        }
      };

      maybeSeed();

      unsub = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as SiteContent;
            setContent(data);
            setError(null);
          } else {
            setContent(null);
            setError('Firestore document content/site is missing.');
          }
          setLoading(false);
        },
        (err) => {
          setError(err?.message ?? 'Firestore listener error');
          setContent(null);
          setLoading(false);
        }
      );
    } catch (err: any) {
      setError(err?.message ?? 'Firebase/Firestore setup failed');
      setContent(null);
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, error }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
};

