# 🔧 Quick Fix for Dropbox Upload Issues

## 🎯 **Most Likely Issues & Solutions**

### **Issue 1: Token Permissions (Most Common)**
**Symptom**: Upload fails with 401/403 errors

**Fix**:
1. Go to: https://www.dropbox.com/developers/apps
2. Find your app (App Key: 6gs3m5pqjtq2dea)
3. Click **Permissions** tab
4. Enable: `files.content.write`, `files.content.read`, `sharing.write`
5. Go to **Settings** tab → Generate new access token
6. Update `.env.local` with new token
7. Restart dev server: `npm run dev`

### **Issue 2: Token Format**
**Symptom**: Environment variable issues

**Fix**: Make sure `.env.local` has token on single line:
```env
VITE_DROPBOX_ACCESS_TOKEN=sl.u.AGCyV3BXwAlxr9wogybk6WKMeRn-tqSEKTkTr_YptqCUgxtJY_eUk0qek2xCEm2-BRaTFlh0bu7DoNaacs9t9pIzkKtSyfJNMtG2A63-RzBMcu9sHxE
```

### **Issue 3: Network/CORS**
**Symptom**: Network errors or blocked requests

**Fix**: Check internet connection and disable VPN/firewall temporarily

## 🧪 **Quick Test Steps**

1. **Open browser**: Go to `http://localhost:5173/`
2. **Open console**: Press F12 → Console tab
3. **Run tests**:
   ```javascript
   // Test 1: Basic connection
   testDropboxConnection()
   
   // Test 2: Simple upload
   testSimpleUpload()
   
   // Test 3: Full diagnostic
   debugDropboxUpload()
   ```

## ✅ **Expected Output**

**Successful connection:**
```
✅ Token found, length: 182
✅ Connection successful!
👤 Account: Your Name
📧 Email: your@email.com
```

**Successful upload:**
```
📤 Uploading test file to: /test-1234567890.txt
✅ Upload successful!
📁 File path: /test-1234567890.txt
📊 File size: 25 bytes
```

## ❌ **Error Solutions**

**401 Unauthorized** → Regenerate access token
**403 Forbidden** → Enable file permissions in Dropbox app
**400 Bad Request** → Check token format (starts with `sl.`)
**Network Error** → Check internet/firewall

## 🎤 **Test Audio Upload**

After connection test passes:
1. Go to chat room
2. Click microphone button
3. Record short message
4. Watch console for upload progress
5. File should appear in chat

## 📞 **If Still Failing**

Run the full diagnostic and share the console output:
```javascript
debugDropboxUpload()
```

The most common issue is **insufficient permissions** in your Dropbox app settings!