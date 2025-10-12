// Chat System Types and Interfaces

export interface ChatRoom {
  id: string;
  customerEmail: string;
  customerName: string;
  companyEmail: string;
  participants: string[];
  createdAt: Date;
  lastActivity: Date;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    senderType: 'customer' | 'admin';
  };
  unreadCount?: number;
}

export interface Message {
  id: string;
  roomId: string;
  content: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderType: 'customer' | 'admin';
  messageType: 'message' | 'enquiry' | 'system' | 'file';
  timestamp: Date;
  read: boolean;
  emailNotificationSent?: boolean;
  // For enquiry messages
  enquiryData?: {
    products: any[];
    generalMessage?: string;
    contactDetails: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  // For file messages
  fileData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    thumbnailUrl?: string;
    storagePath?: string;
  };
}

export interface UserPresence {
  userId: string;
  email: string;
  online: boolean;
  lastSeen: Date;
  activeInRoom?: string;
  userAgent?: string;
}

export interface ChatUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  isAdmin: boolean;
  lastActive: Date;
  preferences?: {
    emailNotifications: boolean;
    soundNotifications: boolean;
  };
}

export interface EnquiryMessage extends Message {
  messageType: 'enquiry';
  enquiryData: {
    products: Array<{
      name: string;
      categorySlug: string;
      productSlug: string;
      notes?: string;
    }>;
    generalMessage?: string;
    contactDetails: {
      name: string;
      email: string;
      phone?: string;
    };
    timestamp: Date;
  };
}

export interface SystemMessage extends Message {
  messageType: 'system';
  systemData: {
    type: 'room_created' | 'user_joined' | 'enquiry_added';
    details: string;
  };
}

// Firebase document data types (without id)
export interface ChatRoomData {
  customerEmail: string;
  customerName: string;
  companyEmail: string;
  participants: string[];
  createdAt: Date;
  lastActivity: Date;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    senderType: 'customer' | 'admin';
  };
}

export interface MessageData {
  roomId: string;
  content: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderType: 'customer' | 'admin';
  messageType: 'message' | 'enquiry' | 'system' | 'file';
  timestamp: Date;
  read: boolean;
  emailNotificationSent?: boolean;
  enquiryData?: {
    products: any[];
    generalMessage?: string;
    contactDetails: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  fileData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    thumbnailUrl?: string;
    storagePath?: string;
  };
}

export interface UserPresenceData {
  email: string;
  online: boolean;
  lastSeen: Date;
  activeInRoom?: string;
  userAgent?: string;
}

// API Response types
export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Event types for real-time updates
export type ChatEvent = 
  | { type: 'message_received'; data: Message }
  | { type: 'message_read'; data: { messageId: string; roomId: string } }
  | { type: 'user_online'; data: { userId: string } }
  | { type: 'user_offline'; data: { userId: string } }
  | { type: 'typing_start'; data: { userId: string; roomId: string } }
  | { type: 'typing_stop'; data: { userId: string; roomId: string } }
  | { type: 'room_updated'; data: ChatRoom };

// Hook return types
export interface UseChatRoom {
  room: ChatRoom | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
}

export interface UseAdminChat {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  setActiveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  markRoomAsRead: (roomId: string) => Promise<void>;
}

// Configuration types
export interface ChatConfig {
  companyEmail: string;
  companyName: string;
  maxMessageLength: number;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  presenceUpdateInterval: number;
  typingIndicatorTimeout: number;
}


