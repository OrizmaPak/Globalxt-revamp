// Firebase Chat Service Functions
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  ChatRoom, 
  ChatRoomData, 
  Message, 
  MessageData
} from '../types/chat';
import { getCompanyEmail, CHAT_CONFIG as CONFIG } from '../config/chat';
import { simpleEmailService } from './simpleEmailService';
import { uploadFileToDropbox } from './dropboxUploadService';

const CHAT_CONFIG = {
  companyEmail: getCompanyEmail(),
  companyName: CONFIG.COMPANY_NAME,
  maxMessageLength: CONFIG.MAX_MESSAGE_LENGTH
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!db; // Check if database is available
};

// Helper function to convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

// Chat Room Operations
export const chatService = {
  // Create or get existing chat room
  async createOrGetChatRoom(customerEmail: string, customerName: string): Promise<ChatRoom> {
    if (!isFirebaseConfigured()) {
      console.warn('🔥 Firebase not configured! Please update src/config/firebase.ts with your Firebase project details.');
      console.warn('📧 Emails will be sent without chat room links until Firebase is configured.');
      throw new Error('Firebase not configured');
    }
    
    try {
      // Check if room already exists
      const roomsRef = collection(db, 'chatRooms');
      const existingRoomQuery = query(
        roomsRef,
        where('customerEmail', '==', customerEmail),
        where('companyEmail', '==', CHAT_CONFIG.companyEmail),
        limit(1)
      );
      
      const existingRooms = await getDocs(existingRoomQuery);
      
      if (!existingRooms.empty) {
        // Return existing room
        const roomDoc = existingRooms.docs[0];
        const roomData = roomDoc.data() as ChatRoomData;
        return {
          id: roomDoc.id,
          ...roomData,
          createdAt: timestampToDate(roomData.createdAt),
          lastActivity: timestampToDate(roomData.lastActivity),
          lastMessage: roomData.lastMessage ? {
            ...roomData.lastMessage,
            timestamp: timestampToDate(roomData.lastMessage.timestamp)
          } : undefined
        };
      }
      
      // Create new room
      const newRoomData: ChatRoomData = {
        customerEmail,
        customerName,
        companyEmail: CHAT_CONFIG.companyEmail,
        participants: [customerEmail, CHAT_CONFIG.companyEmail],
        createdAt: new Date(),
        lastActivity: new Date()
      };
      
      const docRef = await addDoc(roomsRef, {
        ...newRoomData,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...newRoomData
      };
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
      throw new Error('Failed to create chat room');
    }
  },

  // Add enquiry message to chat room
  async addEnquiryMessage(roomId: string, enquiryData: any, customerInfo: { name: string; email: string }): Promise<void> {
    try {
      const messagesRef = collection(db, 'messages', roomId, 'messages');

      const enquiryContent = `[Enquiry] **New Product Enquiry**\n\n**Products (${enquiryData.products.length}):**\n${enquiryData.products.map((product: any, index: number) => `${index + 1}. **${product.name}**${product.notes ? `\n   Notes: ${product.notes}` : ''}`).join('\n')}${enquiryData.generalMessage ? `\n\n**Message:**\n${enquiryData.generalMessage}` : ''}`;

      const messageData: MessageData = {
        roomId,
        content: enquiryContent,
        senderId: customerInfo.email,
        senderEmail: customerInfo.email,
        senderName: customerInfo.name,
        senderType: 'customer',
        messageType: 'enquiry',
        timestamp: new Date(),
        read: false,
        enquiryData: {
          products: enquiryData.products,
          generalMessage: enquiryData.generalMessage,
          contactDetails: enquiryData.contactDetails
        }
      };

      await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp()
      });

      // Update room last activity
      await this.updateRoomLastActivity(roomId, messageData);
    } catch (error) {
      console.error('Error adding enquiry message:', error);
      throw new Error('Failed to add enquiry message');
    }
  },

  // Send file message
  async sendFileMessage(roomId: string, file: File, senderInfo: { email: string; name: string; isAdmin: boolean }): Promise<void> {
    try {
      console.log('[file] Uploading file to Dropbox:', file.name, 'Type:', file.type, 'Size:', file.size);

      const messagesRef = collection(db, 'messages', roomId, 'messages');

      const fileType = file.type || 'application/octet-stream';
      const isImageFile = fileType.startsWith('image/');
      const isAudioFile = fileType.startsWith('audio/');
      const isVideoFile = fileType.startsWith('video/');
      const fileIcon = isImageFile ? '[image]' : isAudioFile ? '[audio]' : isVideoFile ? '[video]' : '[file]';

      const { url: fileUrl } = await uploadFileToDropbox(file);

      const fileData = {
        fileName: file.name,
        fileSize: file.size,
        fileType,
        fileUrl,
        ...(isImageFile ? { thumbnailUrl: fileUrl } : {})
      };

      const messageData: MessageData = {
        roomId,
        content: `${fileIcon} ${file.name}`,
        senderId: senderInfo.email,
        senderEmail: senderInfo.email,
        senderName: senderInfo.name,
        senderType: senderInfo.isAdmin ? 'admin' : 'customer',
        messageType: 'file',
        timestamp: new Date(),
        read: false,
        fileData
      };

      console.log('[file] Message data created:', messageData);

      const docRef = await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp(),
        // Ensure fileData is properly serialized without undefined values
        fileData
      });

      await this.updateRoomLastActivity(roomId, messageData);

      const chatRoom = await this.getChatRoom(roomId);
      if (chatRoom) {
        const messageWithId: any = {
          ...messageData,
          id: docRef.id
        };

        const recipientEmail = senderInfo.isAdmin ? chatRoom.customerEmail : CHAT_CONFIG.companyEmail;

        try {
          await simpleEmailService.sendMessageNotification(messageWithId, recipientEmail, roomId);
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't throw error here - message was sent successfully, just email failed
        }
      }
    } catch (error) {
      console.error('Error sending file message:', error);
      throw new Error('Failed to send file message');
    }
  },

  // Send regular message
  async sendMessage(roomId: string, content: string, senderInfo: { email: string; name: string; isAdmin: boolean }): Promise<void> {
    try {
      if (content.length > CHAT_CONFIG.maxMessageLength) {
        throw new Error(`Message too long. Maximum ${CHAT_CONFIG.maxMessageLength} characters allowed.`);
      }

      const messagesRef = collection(db, 'messages', roomId, 'messages');
      
      const messageData: MessageData = {
        roomId,
        content: content.trim(),
        senderId: senderInfo.email,
        senderEmail: senderInfo.email,
        senderName: senderInfo.name,
        senderType: senderInfo.isAdmin ? 'admin' : 'customer',
        messageType: 'message',
        timestamp: new Date(),
        read: false
      };

      const docRef = await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp()
      });

      // Update room last activity
      await this.updateRoomLastActivity(roomId, messageData);

      // Get the chat room to determine recipient email
      const chatRoom = await this.getChatRoom(roomId);
      if (chatRoom) {
        // Create message object with ID for email notification
        const messageWithId: any = {
          ...messageData,
          id: docRef.id
        };

        // Determine recipient email based on sender type
        const recipientEmail = senderInfo.isAdmin ? chatRoom.customerEmail : CHAT_CONFIG.companyEmail;
        
        // Send email notification
        try {
          await simpleEmailService.sendMessageNotification(messageWithId, recipientEmail, roomId);
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't throw error here - message was sent successfully, just email failed
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  },

  // Update room last activity
  async updateRoomLastActivity(roomId: string, lastMessage: MessageData): Promise<void> {
    try {
      const roomRef = doc(db, 'chatRooms', roomId);
      await updateDoc(roomRef, {
        lastActivity: serverTimestamp(),
        lastMessage: {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          timestamp: serverTimestamp(),
          senderType: lastMessage.senderType
        }
      });
    } catch (error) {
      console.error('Error updating room last activity:', error);
    }
  },

  // Get chat room by ID
  async getChatRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomDoc = await getDoc(roomRef);
      
      if (!roomDoc.exists()) {
        return null;
      }
      
      const roomData = roomDoc.data() as ChatRoomData;
      return {
        id: roomDoc.id,
        ...roomData,
        createdAt: timestampToDate(roomData.createdAt),
        lastActivity: timestampToDate(roomData.lastActivity),
        lastMessage: roomData.lastMessage ? {
          ...roomData.lastMessage,
          timestamp: timestampToDate(roomData.lastMessage.timestamp)
        } : undefined
      };
    } catch (error) {
      console.error('Error getting chat room:', error);
      return null;
    }
  },

  // Subscribe to chat room messages
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = collection(db, 'messages', roomId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data() as MessageData;
        return {
          id: doc.id,
          ...data,
          timestamp: timestampToDate(data.timestamp),
          enquiryData: data.enquiryData ? {
            ...data.enquiryData,
            contactDetails: {
              ...data.enquiryData.contactDetails
            }
          } : undefined
        };
      });
      
      callback(messages);
    });
  },

  // Subscribe to admin chat rooms (for admin dashboard)
  subscribeToAdminRooms(callback: (rooms: ChatRoom[]) => void): () => void {
    const roomsRef = collection(db, 'chatRooms');
    const roomsQuery = query(
      roomsRef,
      where('companyEmail', '==', CHAT_CONFIG.companyEmail),
      orderBy('lastActivity', 'desc')
    );
    
    return onSnapshot(roomsQuery, 
      (snapshot) => {
        const rooms: ChatRoom[] = snapshot.docs.map(doc => {
          const data = doc.data() as ChatRoomData;
          return {
            id: doc.id,
            ...data,
            createdAt: timestampToDate(data.createdAt),
            lastActivity: timestampToDate(data.lastActivity),
            lastMessage: data.lastMessage ? {
              ...data.lastMessage,
              timestamp: timestampToDate(data.lastMessage.timestamp)
            } : undefined
          };
        });
        
        callback(rooms);
      },
      (error) => {
        console.error('❌ Firestore query error (likely missing index):', error);
        console.log('🔧 Please create Firebase indexes as described in FIREBASE_INDEXES_MANUAL_SETUP.md');
        
        // Fallback: return empty array and show helpful message
        callback([]);
      }
    );
  },

  // Mark messages as read
  async markMessagesAsRead(roomId: string, messageIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      messageIds.forEach(messageId => {
        const messageRef = doc(db, 'messages', roomId, 'messages', messageId);
        batch.update(messageRef, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
};

// Firestore Presence Service with 20-second heartbeat
let presenceIntervals: Map<string, NodeJS.Timeout> = new Map();

export const presenceService = {
  // Set user online with 20-second heartbeat
  async setUserOnline(userEmail: string, roomId?: string): Promise<void> {
    try {
      const presenceRef = doc(db, 'presence', btoa(userEmail));
      
      // Initial online status
      await updateDoc(presenceRef, {
        email: userEmail,
        online: true,
        lastSeen: serverTimestamp(),
        activeInRoom: roomId || null,
        userAgent: navigator.userAgent
      }).catch(async () => {
        // Document doesn't exist, create it
        await setDoc(presenceRef, {
          email: userEmail,
          online: true,
          lastSeen: serverTimestamp(),
          activeInRoom: roomId || null,
          userAgent: navigator.userAgent
        });
      });
      
      // Clear any existing interval for this user
      const existingInterval = presenceIntervals.get(userEmail);
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      
      // Start 20-second heartbeat
      const heartbeatInterval = setInterval(async () => {
        try {
          await updateDoc(presenceRef, {
            lastSeen: serverTimestamp()
          });
          console.log(`Heartbeat sent for ${userEmail}`);
        } catch (error) {
          console.error('Heartbeat failed:', error);
          clearInterval(heartbeatInterval);
          presenceIntervals.delete(userEmail);
        }
      }, 20000); // 20 seconds
      
      presenceIntervals.set(userEmail, heartbeatInterval);
      
      // Clean up on page unload
      const handleUnload = () => {
        clearInterval(heartbeatInterval);
        presenceIntervals.delete(userEmail);
        // Set offline status in Firestore (handled by the offline detection system)
        presenceService.setUserOffline(userEmail).catch(() => {
          // May fail during page unload, that's ok - offline detection will handle it
        });
      };
      
      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('pagehide', handleUnload);
      
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  },

  // Set user offline
  async setUserOffline(userEmail: string): Promise<void> {
    try {
      // Clear heartbeat interval
      const existingInterval = presenceIntervals.get(userEmail);
      if (existingInterval) {
        clearInterval(existingInterval);
        presenceIntervals.delete(userEmail);
      }
      
      const presenceRef = doc(db, 'presence', btoa(userEmail));
      await updateDoc(presenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
        activeInRoom: null
      }).catch(() => {
        // Document might not exist, ignore error
        console.log('Presence document not found, user already offline');
      });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  },

  // Check if user is online (last seen within 1 minute)
  async isUserOnline(userEmail: string): Promise<boolean> {
    try {
      const presenceRef = doc(db, 'presence', btoa(userEmail));
      
      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(presenceRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const lastSeen = data.lastSeen?.toDate() || new Date(0);
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute
            
            // Consider online if marked online AND last seen within 1 minute
            const isOnline = data.online && lastSeen > oneMinuteAgo;
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
  },

  // Subscribe to user presence changes
  subscribeToUserPresence(userEmail: string, callback: (isOnline: boolean) => void): () => void {
    const presenceRef = doc(db, 'presence', btoa(userEmail));
    
    return onSnapshot(presenceRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate() || new Date(0);
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        
        const isOnline = data.online && lastSeen > oneMinuteAgo;
        callback(isOnline);
      } else {
        callback(false);
      }
    });
  }
};

// Email notification service integration
export const emailNotificationService = {
  async sendMessageNotification(message: Message, recipientEmail: string, chatRoomId: string): Promise<void> {
    try {
      // Always send email notification for every message
      console.log(`Sending email notification to ${recipientEmail}`);

      // Send email notification via your existing API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: `New message from ${message.senderName} - Global XT`,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>💬 New Message</h2>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${message.senderName}</p>
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 5px;">
                  ${message.content.replace(/\n/g, '<br>')}
                </div>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/chat/${chatRoomId}" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reply in Chat Room
                </a>
              </div>
              <p style="color: #666; font-size: 12px;">
                Click the button above to continue your conversation with ${message.senderName}.
              </p>
            </div>
          `,
          replyTo: message.senderEmail
        })
      });

      if (response.ok) {
        // Mark email as sent
        const messageRef = doc(db, 'messages', chatRoomId, 'messages', message.id);
        await updateDoc(messageRef, { emailNotificationSent: true });
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }
};
