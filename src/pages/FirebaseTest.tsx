import { useState } from 'react';
import firebaseApp from '../lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const FirebaseTest = () => {
  const [status, setStatus] = useState<string>('Idle');
  const [detail, setDetail] = useState<string>('');

  const runTest = async () => {
    try {
      setStatus('Initializing');
      // Access initialized app
      const app = firebaseApp;
      if (!app) {
        throw new Error('Firebase is not configured. Provide VITE_FIREBASE_* env vars to run the test.');
      }
      setDetail(`App name: ${app.name}`);

      setStatus('Connecting to Firestore');
      const db = getFirestore(app);

      // Try a read of a harmless doc; existence is not required
      const ref = doc(db, '__health__/ping');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setStatus('Success');
        setDetail('Connected to Firestore and read existing doc.');
      } else {
        setStatus('Success');
        setDetail('Connected to Firestore. Doc does not exist (expected).');
      }
    } catch (err: any) {
      setStatus('Error');
      setDetail(err?.message ?? String(err));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Firebase Connection Test</h1>
      <p className="text-sm text-gray-600 mb-4">
        Runs a simple Firestore read to verify client connectivity.
      </p>
      <button
        onClick={runTest}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Run Test
      </button>

      <div className="mt-4">
        <div className="font-medium">Status: {status}</div>
        {detail && <pre className="mt-2 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">{detail}</pre>}
      </div>
    </div>
  );
};

export default FirebaseTest;
