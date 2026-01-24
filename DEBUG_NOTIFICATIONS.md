# 🔍 Firebase Notifications Debug Guide

## Problem: Not receiving notifications on laptop and mobile

---

## Step 1: Check Backend Logs (FIRST!)

**After someone likes your project, check backend console logs:**

```
👤 [Like] User sender@email.com liked project abc123
   📋 Project: "My Project" by YOUR_EMAIL@gmail.com
   🔔 Creating notification for project owner: YOUR_EMAIL@gmail.com
   📤 Sending Firebase notification...

   📬 [sendRealTimeNotification] Attempting to send notification to: YOUR_EMAIL@gmail.com
   ✓ [sendRealTimeNotification] Found 2 FCM token(s) for YOUR_EMAIL@gmail.com
      Tokens: fi5jQS5YNDrQXShMuBfp...., gT8kL2Mq9PqVwXyZ1Abc...
   📤 [sendRealTimeNotification] Sending to 2 device(s)...
      ✓ Device 1/2: Notification sent
      ✓ Device 2/2: Notification sent
   ✓ [sendRealTimeNotification] Notification delivery completed
```

### ❌ If you see this:

```
❌ [sendRealTimeNotification] No FCM tokens found for user: YOUR_EMAIL@gmail.com
   User exists but fcmTokens array is empty or missing
   → User needs to login and grant notification permission
```

**This means: Your FCM tokens were NOT saved when you logged in**

### ✅ If you see tokens being sent:

**Problem is likely on CLIENT SIDE (browser/app not receiving)**

---

## Step 2: Check if Tokens Were Saved on Login

### On Laptop:

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for this after login:

   ```
   ✓ [getTokenAndSave] FCM Token obtained: fi5jQS5YNDrQXShMuBfp7r:APA91bHsFJsq...
   📤 [getTokenAndSave] Sending to /api/fcm/save-token...
   ✓ [getTokenAndSave] FCM token sent to server
   ```

4. Go to **Network** tab → Look for `/api/fcm/save-token` POST request
   - Response should be: `{"message": "FCM token saved", "totalTokens": 1}`

5. Open **Application** → **localStorage** → Look for:
   - `fcmToken`: Should have a long string (FCM token)

6. Check **Application** → **Service Workers** → Should show:
   - `/firebase-messaging-sw.js` with status: **"activated and running"**

### On Mobile:

1. Open Safari (iOS) or Chrome (Android)
2. Open DevTools (use remote debugging)
3. Follow same steps as laptop

**If Service Worker shows "activated and running" but no `fcmToken` in localStorage:**

- Notification permission might not be granted
- Check browser console for: `❌ [initializeFCM] Notifications are blocked for this site`

---

## Step 3: Verify Notification Permission

### Desktop/Laptop:

1. Click the 🔒 lock icon in address bar (left of URL)
2. Look for "Notifications" permission
3. Should be set to "Allow"

### Mobile:

1. Go to Browser Settings → Notifications
2. Make sure app has permission

**If "Blocked":**

1. Clear site data for your domain
2. Refresh page
3. Accept notification permission prompt

---

## Step 4: Check Firebase Configuration on Each Device

Open Console and run:

```javascript
console.log(
  "VAPID Key:",
  import.meta.env.VITE_FIREBASE_VAPID_KEY ? "✅" : "❌",
);
console.log("Firebase Config:", {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅" : "❌",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "✅" : "❌",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ? "✅"
    : "❌",
});
```

**Should show all ✅**

If any ❌:

1. Check `.env.local` file in `frontEnd/` folder
2. Make sure all `VITE_FIREBASE_*` variables are set
3. Refresh page (Ctrl+Shift+R to hard refresh)

---

## Step 5: Test Network Call

1. Login on device
2. Open DevTools → **Network** tab
3. Ask someone else to like your project
4. You should see request appear:
   - **POST** `/api/fcm/save-token` (on login) ✅
   - **POST** `/api/like/:projectId` (when someone likes)
5. Check backend console for detailed logs

---

## Step 6: Test Service Worker

Open Console and run:

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then((registrations) => {
  if (registrations.length > 0) {
    console.log("✓ Service Worker registered:", registrations[0].scope);
    console.log("Active:", registrations[0].active ? "Yes" : "No");
  } else {
    console.log("❌ No service workers found");
  }
});
```

---

## Common Issues & Fixes

### ❌ "No FCM tokens found" in backend

**Cause:** Token not saved when you logged in

**Fix:**

1. Logout completely (clear localStorage)
2. Refresh page
3. Login again
4. Check console for: `✓ [getTokenAndSave] FCM token sent to server`
5. Check Network tab for `/api/fcm/save-token` success (200)

### ❌ Service Worker not registered

**Cause:** File missing or browser doesn't support

**Fix:**

1. Check file exists: `frontEnd/public/firebase-messaging-sw.js`
2. Hard refresh page (Ctrl+Shift+R)
3. Check console for errors

### ❌ Notification permission blocked

**Cause:** You dismissed permission prompt

**Fix:**

1. Go to browser settings → Notifications → Find your domain
2. Change to "Allow"
3. OR: Clear site data and refresh to re-prompt

### ❌ VAPID key missing

**Cause:** `.env.local` not configured

**Fix:**

1. Open `frontEnd/.env.local`
2. Add: `VITE_FIREBASE_VAPID_KEY=your_vapid_key_here`
3. Get VAPID key from: Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates
4. Restart dev server (Ctrl+C then npm run dev)
5. Hard refresh browser

---

## Quick Test Flow (5 minutes)

1. **Login on Laptop**
   - Console should show: `✓ [getTokenAndSave] FCM token sent to server`
   - Network tab should show: `/api/fcm/save-token` with 200 status

2. **Login on Mobile** (same account)
   - Repeat step 1 on mobile
   - Now backend should have 2 FCM tokens for your email

3. **Have someone like your project**
   - Backend console should show:
     ```
     ✓ Found 2 FCM token(s) for YOUR_EMAIL
     ✓ Device 1/2: Notification sent
     ✓ Device 2/2: Notification sent
     ```

4. **Check both devices**
   - Both should receive notification
   - Click notification → Opens project

---

## MongoDB Query to Verify Tokens

Run in MongoDB shell:

```javascript
db.users.findOne({ email: "YOUR_EMAIL@gmail.com" });
```

Should show:

```javascript
{
  email: "YOUR_EMAIL@gmail.com",
  fcmTokens: [
    "fi5jQS5YNDrQXShMuBfp7r:APA91bHsFJsqN0xo253O7d4Wa58...",  // Laptop
    "gT8kL2Mq9PqVwXyZ1AbcDe:APA91bFgH1qS6nT2wXyZa1bC3d..."   // Mobile
  ],
  // ... other fields
}
```

**If `fcmTokens` is empty or missing:**

- Tokens are not being saved
- Check `/api/fcm/save-token` endpoint logs

---

## Final Checklist

- [ ] Backend logs show tokens found when sending notification
- [ ] Console shows: `✓ [getTokenAndSave] FCM token sent to server`
- [ ] Network tab shows `/api/fcm/save-token` with 200 status
- [ ] Service Worker shows "activated and running" in DevTools
- [ ] Notification permission set to "Allow" in browser
- [ ] `.env.local` has all `VITE_FIREBASE_*` variables
- [ ] MongoDB shows fcmTokens array with at least 1 token
- [ ] Backend shows `✓ Found X FCM token(s)` when sending

---

## Still Not Working?

1. **Collect logs and share:**

   ```
   - Backend console output when someone likes your project
   - Browser console output after login
   - Screenshot of Network tab showing /api/fcm/save-token
   - MongoDB query result for your user
   ```

2. **Clear everything and start fresh:**

   ```
   - Delete .env.local and recreate with correct values
   - Delete site data in browser settings
   - Logout and login again
   - Restart backend server
   ```

3. **Check Firebase Admin SDK:**
   - Verify service account JSON is correct in `backEnd/config/firebase.js`
   - Test connection: Run `npm test` or log Firebase initialization
