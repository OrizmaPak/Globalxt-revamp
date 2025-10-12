# 🛠️ Dropbox Upload Debugging Guide

## 🚨 **Issue Fixed: Broken Access Token**

**Problem:** The access token in `.env.local` was split across multiple lines, causing authentication to fail.

**Solution:** Fixed the token to be on a single line:
```env
VITE_DROPBOX_ACCESS_TOKEN=sl.u.AGCyV3BXwAlxr9wogybk6WKMeRn-tqSEKTkTr_YptqCUgxtJY_eUk0qek2xCEm2-BRaTFlh0bu7DoNaacs9t9pIzkKtSyfJNMtG2A63-RzBMcu9sHxE
```

## 🧪 **How to Test the Upload**

### **Step 1: Open Browser Console**
1. Go to `http://localhost:5175/`
2. Open Developer Tools (F12)
3. Go to Console tab

### **Step 2: Run Debug Function**
```javascript
// Test basic connection and upload
debugDropboxUpload()
```

This will:
- ✅ Check if your access token is configured
- ✅ Test Dropbox API connection
- ✅ Upload a small test file
- ✅ Create a shareable link
- ✅ Show detailed error messages if anything fails

### **Step 3: Test Real Audio Upload**
1. Go to a chat room in your app
2. Click the microphone button
3. Record a short audio message
4. Check the browser console for detailed logs

## 🔍 **What the Debug Logs Show**

### **Environment Check:**
```
🔑 Token validation:
- Token exists: true
- Token length: 182
- Token format: Valid format
```

### **Upload Process:**
```
📁 Uploading to path: /global-xt-uploads/audio/1234567890_recording.webm
📁 File size check: 45KB (limit: 150MB)
🔄 Making upload request to Dropbox...
📊 Upload response status: 200
📁 File uploaded successfully
🔗 Public link created
✅ Dropbox upload completed successfully
```

## 🚫 **Common Error Messages & Solutions**

### **❌ "Access token not configured"**
- **Solution:** Check your `.env.local` file has the correct token

### **❌ "Invalid Dropbox access token format"** 
- **Solution:** Token must start with `sl.` - check for typos

### **❌ "Dropbox authentication failed (401)"**
- **Solution:** Token is invalid or expired - regenerate from Dropbox console

### **❌ "Dropbox access forbidden (403)"**
- **Solution:** Check your Dropbox app permissions - needs file read/write access

### **❌ "Network error connecting to Dropbox"**
- **Solution:** Check internet connection and firewall/antivirus settings

### **❌ "File too large. Maximum size is 150MB"**
- **Solution:** Reduce file size or use Dropbox's upload session API for larger files

## 🔧 **Improvements Made**

1. **Fixed broken access token** - Was split across lines in .env.local
2. **Added comprehensive error handling** - Shows specific error messages
3. **Added file size validation** - Prevents uploads over 150MB limit  
4. **Added detailed logging** - Shows exactly what's happening during upload
5. **Added token format validation** - Checks for proper `sl.` prefix
6. **Added network debugging** - Shows request/response details

## 🎯 **Expected Behavior**

When working correctly:
1. **Record audio** → Shows recording UI
2. **Stop recording** → File preview appears  
3. **Upload starts** → Console shows upload progress
4. **Upload completes** → File appears in chat with play button
5. **File stored** → Check your Dropbox `/global-xt-uploads/audio/` folder

## 📦 **File Organization**

Files are automatically organized in your Dropbox:
```
/global-xt-uploads/
├── audio/          # Audio recordings
├── image/          # Images  
├── video/          # Videos
└── document/       # Documents
```

## 🔄 **If Still Failing**

1. Run `debugDropboxUpload()` in browser console
2. Copy the full error message from console
3. Check your Dropbox app settings at https://www.dropbox.com/developers/apps
4. Verify the app has "files.content.write" permission
5. Make sure you're using the correct access token (not App Key/Secret)

The upload should now work perfectly! 🎉