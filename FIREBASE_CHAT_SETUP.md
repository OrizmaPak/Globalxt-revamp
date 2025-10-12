# 🔥 Firebase Chat System Setup Guide

## Overview
Your chat system has been implemented with Firebase for real-time messaging, authentication, and presence detection. Follow this guide to configure Firebase for your Global XT chat system.

## 🚀 **What's Been Built**

### ✅ **Components Created:**
- **Admin Chat Dashboard** - WhatsApp-style interface with contact list and notifications
- **Customer Chat Interface** - Simple chat for customers to communicate with company
- **Authentication System** - Google Sign-In + email verification
- **Real-time Messaging** - Live chat with presence detection
- **Email Integration** - Smart notifications when users are offline

### ✅ **Files Added:**
```
src/
├── components/chat/
│   ├── AdminChatDashboard.tsx     # Admin WhatsApp-style interface
│   └── CustomerChatInterface.tsx  # Customer chat interface
├── pages/
│   ├── ChatPage.tsx              # Customer chat page routes
│   └── admin/AdminChatPage.tsx   # Admin chat dashboard page
├── hooks/
│   └── useAuth.tsx               # Firebase authentication hook
├── services/
│   └── chatService.ts            # Firebase chat operations
├── types/
│   └── chat.ts                   # TypeScript interfaces
└── config/
    └── firebase.ts               # Firebase configuration
```

## 🛠️ **Firebase Setup Steps**

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `global-xt-chat`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. In Firebase Console → **Authentication**
2. Click "Get Started"
3. **Sign-in method** tab:
   - Enable **Google** (configure OAuth consent)
   - Enable **Email/Password**
   - Enable **Email link (passwordless sign-in)**

### 3. Create Firestore Database
1. In Firebase Console → **Firestore Database**
2. Click "Create database"
3. **Production mode** (we'll set up rules later)
4. Choose location (closest to your users)

### 4. ~~Create Realtime Database~~ (Not needed)
**Skipped** - We're using Firestore-only with heartbeat presence detection

### 5. Get Configuration Keys
1. In Firebase Console → **Project Settings** (gear icon)
2. **General** tab → **Your apps**
3. Click **Web app** icon `</>`
4. Register app name: `global-xt-chat`
5. Copy the config object

### 6. Update Firebase Configuration
Replace the config in `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  // No databaseURL needed - using Firestore only
};
```

## 🔒 **Security Rules**

### Firestore Rules
In Firebase Console → **Firestore** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chat rooms - users can only access rooms they're participants in
    match /chatRooms/{roomId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email in resource.data.participants ||
         request.auth.token.email == 'divinehelpfarmers@gmail.com');
    }
    
    // Messages - users can only access messages in rooms they're participants in
    match /messages/{roomId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email in get(/databases/$(database)/documents/chatRooms/$(roomId)).data.participants ||
         request.auth.token.email == 'divinehelpfarmers@gmail.com');
    }
  }
}
```

### Firestore Security Rules Update
Add presence collection rules to your existing Firestore rules:

```javascript
// Add this to your existing Firestore rules
match /presence/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.token.email != null;
}
```

## 🔧 **App Integration**

### 1. Wrap Your App with AuthProvider
In your main `App.tsx` or `main.tsx`:

```tsx
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      {/* Your existing app routes */}
    </AuthProvider>
  );
}
```

### 2. Add Chat Routes
Add these routes to your routing system:

```tsx
// In your route configuration
import ChatPage, { ChatSignInPage } from './pages/ChatPage';
import AdminChatPage from './pages/admin/AdminChatPage';

// Routes to add:
<Route path="/chat/:roomId" element={<ChatPage />} />
<Route path="/chat/signin/:roomId" element={<ChatSignInPage />} />
<Route path="/admin/chat" element={<AdminChatPage />} />
```

### 3. Email Template Updates
The enquiry system now automatically:
- ✅ Creates chat rooms when enquiries are sent
- ✅ Adds enquiry details as first message
- ✅ Includes chat links in confirmation emails
- ✅ Sends admin dashboard link to business email

## 🎯 **How It Works**

### **Customer Journey:**
1. Customer submits enquiry → Chat room created
2. Confirmation email sent with chat room link
3. Customer clicks link → Authenticates with enquiry email
4. Customer can chat directly with your team

### **Admin Journey:**
1. Enquiry notification email with admin dashboard link
2. Admin opens dashboard → Sees all customer chats
3. WhatsApp-style interface with real-time notifications
4. Admin responds → Customer gets email if offline

### **Smart Notifications:**
- Online users see messages instantly (no email)
- Offline users get email with chat link
- Admins get notifications for new messages
- Recent chats automatically move to top

### **Heartbeat Presence System:**
- Users send "heartbeat" every 20 seconds while active
- Considered online if last heartbeat within 1 minute
- Automatic cleanup when users close browser
- Real-time online/offline indicators in chat

## 🧪 **Testing Your Setup**

### 1. Test Customer Flow:
```bash
npm run dev
```
1. Add products to enquiry cart
2. Submit enquiry with your email
3. Check email for chat room link
4. Click link and authenticate
5. Send test messages

### 2. Test Admin Flow:
1. Sign in with admin email (`divinehelpfarmers@gmail.com`)
2. Go to `/admin/chat`
3. See customer conversations
4. Reply to messages
5. Check customer gets email notification

## 📊 **Firebase Usage Estimates**

**Free Tier Limits:**
- **Firestore:** 20,000 reads/writes per day
- **Realtime DB:** 100 concurrent connections
- **Authentication:** Unlimited users

**Typical Usage:**
- Small business: Well within free limits
- 50 enquiries/month = ~5,000 operations
- Real-time presence for 10-20 concurrent users

## 🚨 **Important Configuration**

### Admin Email Setup
Update admin email in `src/hooks/useAuth.tsx`:
```typescript
const ADMIN_EMAILS = ['divinehelpfarmers@gmail.com']; // Add more as needed
```

### Company Email in Chat Service
Update in `src/services/chatService.ts`:
```typescript
const CHAT_CONFIG = {
  companyEmail: 'divinehelpfarmers@gmail.com', // Your business email
  companyName: 'Global XT Limited',
  maxMessageLength: 2000
};
```

## 🎉 **You're Ready!**

Once Firebase is configured:
1. ✅ Chat system integrates with existing enquiry flow
2. ✅ Customers get chat links in confirmation emails
3. ✅ Admin gets WhatsApp-style dashboard
4. ✅ Real-time messaging with smart email notifications
5. ✅ Authentication handles Gmail and non-Gmail users

Your professional chat system is ready to enhance customer communication! 🚀

---

**Need help?** Check Firebase Console logs for any authentication or database issues.