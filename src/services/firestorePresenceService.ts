// Firestore-Only Presence Service (Simpler Alternative)
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const firestorePresenceService = {
  // Set user online (update every 30 seconds while active)
  async setUserOnline(userEmail: string, roomId?: string): Promise<void> {
    try {
      const presenceRef = doc(db, 'presence', btoa(userEmail));
      
      await setDoc(presenceRef, {
        email: userEmail,
        online: true,
        lastSeen: serverTimestamp(),
        activeInRoom: roomId || null,
        userAgent: navigator.userAgent
      }, { merge: true });
      
      // Keep updating every 30 seconds while user is active
      const keepAliveInterval = setInterval(async () => {
        try {
          await setDoc(presenceRef, {
            lastSeen: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error('Keep alive failed:', error);
          clearInterval(keepAliveInterval);
        }
      }, 30000);
      
      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        clearInterval(keepAliveInterval);
        // Note: This won't work reliably for sudden disconnections
        this.setUserOffline(userEmail);
      });
      
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  },

  // Set user offline
  async setUserOffline(userEmail: string): Promise<void> {
    try {
      const presenceRef = doc(db, 'presence', btoa(userEmail));
      await setDoc(presenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
        activeInRoom: null
      }, { merge: true });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  },

  // Check if user is online (consider online if last seen < 2 minutes ago)
  async isUserOnline(userEmail: string): Promise<boolean> {
    try {
      const presenceRef = doc(db, 'presence', btoa(userEmail));
      
      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(presenceRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const lastSeen = data.lastSeen?.toDate() || new Date(0);
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            
            // Consider online if marked online AND last seen within 2 minutes
            const isOnline = data.online && lastSeen > twoMinutesAgo;
            resolve(isOnline);
          } else {
            resolve(false);
          }
          unsubscribe();
        });
      });
    } catch (error) {
      console.error('Error checking user online status:', error);
      return false;
    }
  }
};