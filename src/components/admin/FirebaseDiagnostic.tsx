import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useContent } from '../../context/ContentProvider';

const FirebaseDiagnostic = () => {
  const { content, loading, error } = useContent();
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking...');
  const [documentExists, setDocumentExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirebaseStatus = async () => {
      try {
        if (!db) {
          setFirebaseStatus('❌ Firebase not initialized');
          return;
        }

        setFirebaseStatus('🔄 Checking Firebase document...');
        
        const docRef = doc(db, 'content/site');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDocumentExists(true);
          setFirebaseStatus('✅ Firebase document exists');
          console.log('📊 Firebase document data:', docSnap.data());
        } else {
          setDocumentExists(false);
          setFirebaseStatus('❌ Firebase document does not exist');
        }
      } catch (err: any) {
        setFirebaseStatus(`❌ Firebase error: ${err.message}`);
        console.error('Firebase diagnostic error:', err);
      }
    };

    checkFirebaseStatus();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-blue-100 border-2 border-blue-400 rounded-lg p-4 max-w-sm">
      <div className="text-sm font-bold text-blue-800 mb-2">🔥 Firebase Diagnostic</div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Content Provider Status:</strong>
          <div className="mt-1 p-2 bg-white rounded border text-xs">
            • Loading: {loading ? '🔄 Yes' : '✅ No'}<br/>
            • Error: {error ? `❌ ${error}` : '✅ None'}<br/>
            • Content: {content ? '✅ Loaded' : '❌ Not loaded'}
          </div>
        </div>

        <div>
          <strong>Firebase Status:</strong>
          <div className="mt-1 p-2 bg-white rounded border text-xs">
            {firebaseStatus}
          </div>
        </div>

        <div>
          <strong>Document Status:</strong>
          <div className="mt-1 p-2 bg-white rounded border text-xs">
            {documentExists === null ? '🔄 Checking...' :
             documentExists ? '✅ Document exists in Firestore' :
             '❌ Document missing in Firestore'}
          </div>
        </div>

        {content && (
          <div>
            <strong>Content Structure:</strong>
            <div className="mt-1 p-2 bg-white rounded border text-xs">
              • Company Info: {content.companyInfo ? '✅' : '❌'}<br/>
              • Hero Slides: {content.heroSlides ? '✅' : '❌'}<br/>
              • Page Copy: {content.pageCopy ? '✅' : '❌'}<br/>
              • Nav Items: {content.navItems ? '✅' : '❌'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseDiagnostic;
