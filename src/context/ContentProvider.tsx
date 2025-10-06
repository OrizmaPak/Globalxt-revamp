import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getFirestore, doc, onSnapshot, setDoc, getDoc, type Firestore } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import type { SiteContent } from '../lib/contentTypes';
import * as local from '../data/siteContent';
import { buildContentPayload } from '../lib/buildContentPayload';
import defaultHeroImage from '../assets/image3.jpg';

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

  // Build local fallback once
  const localContent: SiteContent = useMemo(() => {
    return {
      // local exports are named; TS may not know exact shapes at compile time
      companyInfo: (local as any).companyInfo,
      heroSlides: (local as any).heroSlides,
      productCategories: (local as any).productCategories,
      industrySegments: (local as any).industrySegments,
      resourceArticles: (local as any).resourceArticles,
      serviceOfferings: (local as any).serviceOfferings,
      contactChannels: (local as any).contactChannels,
      whyChooseUs: (local as any).whyChooseUs,
      navItems: (local as any).navItems,
      quickLinks: (local as any).quickLinks,
      pageImages: {
        defaultHero: defaultHeroImage,
      },
      pageCopy: (local as any).pageCopy,
    } as SiteContent;
  }, []);

  useEffect(() => {
    console.log('📱 ContentProvider: Firebase app status:', firebaseApp ? '✅ Available' : '❌ Not available');
    
    if (!firebaseApp) {
      console.log('⚠️ Firebase not configured, using local content only');
      setContent(localContent);
      setError((prev) => prev ?? 'Firebase not configured; using local content.');
      setLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;
    try {
      console.log('🔥 Attempting to connect to Firestore...');
      const db: Firestore = getFirestore(firebaseApp);
      const ref = doc(db, 'content/site');
      console.log('📄 Firestore document reference created: content/site');

      // Optional one-time auto-seed controlled by env flag
      const maybeSeed = async () => {
        try {
          if (import.meta.env.VITE_AUTO_SEED === 'true') {
            console.log('🌱 Auto-seeding enabled, checking if document exists...');
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              console.log('🌱 Document does not exist, auto-seeding with local content...');
              const mods = import.meta.glob('../data/cloudinaryMap.json', { eager: true, import: 'default' }) as Record<string, any>;
              const obj = mods['../data/cloudinaryMap.json'] as Record<string, string> | undefined;
              const payload = buildContentPayload(obj);
              
              // Sanitize payload before seeding
              const sanitizeForFirebase = (obj: any): any => {
                if (obj === null || obj === undefined) return null;
                if (Array.isArray(obj)) return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
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
              
              const cleanPayload = sanitizeForFirebase(payload);
              await setDoc(ref, cleanPayload, { merge: false });
              console.log('✅ Auto-seeding completed successfully');
            } else {
              console.log('🌱 Document already exists, skipping auto-seeding');
            }
          }
        } catch (e) {
          console.error('❌ Auto-seeding failed:', e);
          // ignore seeding errors; app will continue with fallback/local
        }
      };

      maybeSeed();

      console.log('👂 Setting up Firestore listener...');
      unsub = onSnapshot(
        ref,
        (snap) => {
          console.log('📷 Firestore snapshot received');
          if (snap.exists()) {
            console.log('✅ Document exists in Firestore - using Firebase content');
            const data = snap.data() as SiteContent;
            setContent(data);
            setError(null);
          } else {
            console.log('❌ Document does not exist in Firestore - using local content');
            setContent(localContent);
          }
          setLoading(false);
        },
        (err) => {
          console.error('❌ Firestore listener error:', err);
          setError(err?.message ?? String(err));
          setContent(localContent);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('❌ Firebase/Firestore setup failed:', err);
      setError(err?.message ?? String(err));
      setContent(localContent);
      setLoading(false);
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [localContent]);

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


