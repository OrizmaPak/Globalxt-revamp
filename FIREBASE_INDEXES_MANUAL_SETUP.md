# 🔥 Firebase Indexes - Manual Setup Guide

## ❌ **Current Error**
```
FirebaseError: [code=failed-precondition]: The query requires an index. 
You can create it here: https://console.firebase.google.com/v1/r/project/global-xt/firestore/indexe...
```

## ✅ **Solution: Create These 2 Indexes**

**Note**: Both indexes are on the same collection (`chatRooms`) but with **different field combinations**. This is normal and required - Firebase allows multiple composite indexes per collection.

### **Step 1: Go to Firebase Console**
1. Open: https://console.firebase.google.com/project/global-xt/firestore/indexes
2. Sign in with your Google account
3. You should see your `global-xt` project

### **Step 2: Create Index 1 - Admin Dashboard Query** 
1. Click **"Create Index"** button
2. **Collection ID**: `chatRooms`
3. **Query scope**: `Collection`
4. **Fields to index**:
   - Field: `companyEmail`, Order: `Ascending`
   - Field: `lastActivity`, Order: `Descending`
5. Click **"Create"**

### **Step 3: Create Index 2 - Find Existing Room Query**
1. Click **"Create Index"** button again  
2. **Collection ID**: `chatRooms` ← **Same collection, different fields**
3. **Query scope**: `Collection`
4. **Fields to index**:
   - Field: `customerEmail`, Order: `Ascending`
   - Field: `companyEmail`, Order: `Ascending`
5. Click **"Create"**

**Note**: The messages query only uses `orderBy('timestamp')` on a subcollection, which doesn't require a composite index.

## ⏳ **Wait for Indexes to Build**

After creating both indexes:
1. **Status will show "Building"** - this is normal
2. **Wait 5-10 minutes** for both indexes to complete
3. **Status will change to "Enabled"** when ready

## 🚀 **Test After Index Creation**

1. **Wait for both indexes to show "Enabled"**
2. **Restart your dev server**: 
   ```bash
   npm run dev
   ```
3. **Test admin chat**: Go to `/admin/chat`
4. **Check console** - should see no more Firestore errors
5. **Verify conversations load** properly

## 📋 **Visual Guide**

**Index Creation Form Should Look Like:**

### Index 1 - Admin Dashboard Query:
```
Collection ID: chatRooms
Query scope: Collection
Fields:
  companyEmail (Ascending)
  lastActivity (Descending)
```

### Index 2 - Find Existing Room Query:
```
Collection ID: chatRooms
Query scope: Collection  
Fields:
  customerEmail (Ascending)
  companyEmail (Ascending)
```

## ❓ **If You Have Issues**

### **Can't Access Firebase Console?**
- Make sure you're signed in with the account that owns the `global-xt` project
- The project should be visible at: https://console.firebase.google.com/

### **Don't See "Create Index" Button?**
- Go to: Firestore Database → Indexes tab
- Should see "Composite" tab with "Create Index" button

### **Index Creation Fails?**
- Check that field names are spelled exactly as shown above
- Make sure "Collection" (not "Collection group") is selected for both indexes

## 🎯 **Expected Results After Setup**

✅ **No more Firestore errors** in console  
✅ **Chat rooms will load** in admin dashboard  
✅ **Messages will display** properly  
✅ **Real-time updates** will work  
✅ **Presence status** will update  

---

**Important**: Don't skip the waiting period! Indexes take time to build. If you test before they're ready, you'll still see errors.

**Status Check**: You can monitor index building progress in the Firebase Console under the Indexes tab.