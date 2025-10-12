# 🔐 Dropbox App Permissions Check

## 🚨 **Common Issue: Insufficient Permissions**

Your Dropbox app might not have the correct permissions to upload files. Here's how to check and fix:

## 📋 **Required Permissions**

Your Dropbox app needs these permissions:
- ✅ **files.content.write** - Upload and modify files
- ✅ **files.content.read** - Download files (for verification)
- ✅ **sharing.write** - Create shareable links

## 🔧 **How to Check/Fix Permissions**

### **Step 1: Go to Dropbox App Console**
1. Visit: https://www.dropbox.com/developers/apps
2. Click on your app: **Global XT Chat Files** (App Key: 6gs3m5pqjtq2dea)

### **Step 2: Check Permissions Tab**
1. Click **"Permissions"** tab
2. Make sure these are checked:
   - ✅ **files.content.write**
   - ✅ **files.content.read** 
   - ✅ **sharing.write**

### **Step 3: Generate New Access Token**
1. Go to **"Settings"** tab
2. Scroll to **"OAuth 2"** section
3. Click **"Generate"** button under **"Generated access token"**
4. Copy the new token
5. Update your `.env.local` file with the new token

## 🧪 **Test the Fix**

Open browser console and run:
```javascript
// Test 1: Check connection
testDropboxConnection()

// Test 2: Try simple upload
testSimpleUpload()
```

## 📱 **App Type Settings**

Make sure your app is configured as:
- **App type**: Scoped app
- **Access type**: Full Dropbox (not App folder)
- **Permission type**: Individual scopes

## 🔄 **Token Regeneration Steps**

If your current token doesn't work:

1. **Revoke current token**:
   - In Dropbox console → Settings → OAuth 2
   - Click "Revoke" next to your current token

2. **Generate new token**:
   - Still in OAuth 2 section
   - Click "Generate" button
   - Copy the new token (starts with `sl.`)

3. **Update environment**:
   ```env
   VITE_DROPBOX_ACCESS_TOKEN=sl.your_new_token_here
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

## 🔍 **Debug Commands Available**

In browser console, you can run:
- `testDropboxConnection()` - Test basic API access
- `testSimpleUpload()` - Test file upload
- `debugDropboxUpload()` - Full diagnostic test

## ⚠️ **Common Error Messages**

### **401 Unauthorized**
- Token is invalid or expired
- **Fix**: Regenerate access token

### **403 Forbidden** 
- App doesn't have required permissions
- **Fix**: Enable files.content.write permission

### **400 Bad Request**
- Invalid API call format
- **Fix**: Check token format (should start with `sl.`)

### **CORS Error**
- Browser blocking cross-origin request
- **Note**: This shouldn't happen with Dropbox API (CORS enabled)

## 🎯 **Expected Working Flow**

1. **Token Check**: ✅ Valid format (starts with `sl.`)
2. **API Connection**: ✅ Can get account info
3. **File Upload**: ✅ Can upload to `/global-xt-uploads/`
4. **Link Creation**: ✅ Can create shareable links
5. **Chat Integration**: ✅ Files appear in chat with play/download

If any step fails, the issue is at that level.