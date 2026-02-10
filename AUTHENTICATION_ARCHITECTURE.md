# Codexa Authentication Architecture Explained

## **Type: Token-Based Authentication (JWT) with HTTP-Only Cookies**

Your Codexa application uses **Token-Based Authentication**, specifically **JWT (JSON Web Tokens)**, NOT session-based authentication. However, it has some session-like characteristics because:
- Tokens are stored in HTTP-only cookies (server-controlled)
- Server verifies tokens on every request
- Tokens can be invalidated via Redis blacklist

---

## **Complete Authentication Flow**

### **1. SIGN UP FLOW**

```
User → Frontend (SignUpForm.jsx)
  ↓
POST /api/auth/signUp
  ↓
Backend (authRouter.js):
  ├─ Validates user data (email, password, etc.)
  ├─ Checks if email already exists
  ├─ Hashes password with bcrypt (10 rounds)
  ├─ Generates email verification token (crypto.randomBytes)
  ├─ Sends verification email via SendGrid/Nodemailer
  └─ Creates user in MongoDB with:
      - isVerified: false
      - emailVerifyToken: <random token>
      - emailVerifyTokenExpiry: 24 hours
  ↓
Response: "Check spam/inbox! Verification link sent"
```

**Key Points:**
- User cannot login until email is verified
- Password is hashed with bcrypt before storage
- Email token expires in 24 hours

---

### **2. EMAIL VERIFICATION FLOW**

```
User clicks email link → GET /api/auth/verify-email/:token
  ↓
Backend:
  ├─ Finds user by emailVerifyToken
  ├─ Checks if token hasn't expired
  ├─ Sets isVerified = true
  └─ Clears emailVerifyToken fields
  ↓
Response: "Email verified successfully!"
```

---

### **3. SIGN IN FLOW**

```
User → Frontend (SignInForm.jsx)
  ↓
POST /api/auth/signIn (withCredentials: true)
  ├─ Email & Password sent in request body
  ↓
Backend (authRouter.js):
  ├─ Finds user by email in MongoDB
  ├─ Checks if user exists → 401 if not
  ├─ Checks if isVerified === true → 400 if not verified
  ├─ Compares password: bcrypt.compare(password, hashedPassword)
  ├─ If valid:
  │   ├─ Creates JWT token:
  │   │   jwt.sign({ _id, email }, SECRET_KEY, { expiresIn: "7d" })
  │   ├─ Sets HTTP-only cookie:
  │   │   {
  │   │     name: "token",
  │   │     value: <JWT token>,
  │   │     httpOnly: true,        // JavaScript cannot access
  │   │     secure: true (production), // HTTPS only
  │   │     sameSite: "strict",    // CSRF protection
  │   │     maxAge: 7 days
  │   │   }
  │   └─ Returns user info (email, name)
  └─ If invalid → 401
  ↓
Frontend receives response:
  ├─ Sets user state: setUser(response.data.user)
  └─ Navigates to /Home
```

**Key Points:**
- Token is stored in HTTP-only cookie (NOT localStorage)
- Cookie is automatically sent with every request
- Token expires in 7 days
- Frontend never directly handles the token

---

### **4. PROTECTED ROUTE ACCESS (Every Request)**

```
Frontend makes API call → GET /api/getProjects
  ├─ withCredentials: true (sends cookie automatically)
  ↓
Backend receives request:
  ├─ Cookie parser extracts token from cookies
  ├─ Route protected by userAuth middleware
  ↓
userAuth Middleware (userAuth.js) - Server-Side Verification:
  
  Step 1: Extract Token
  ├─ const { token } = req.cookies
  └─ If no token → 401 "Token doesn't exist!"
  
  Step 2: Verify JWT Token
  ├─ jwt.verify(token, SECRET_KEY)
  ├─ Decodes payload: { _id, email }
  └─ If invalid/expired → 401 "Authentication failed"
  
  Step 3: Verify User Exists
  ├─ User.findById(payload._id)
  └─ If user not found → 401 "User not found!"
  
  Step 4: Check Redis Blacklist
  ├─ redisClient.exists(`token:${token}`)
  └─ If blocked → 401 "Token blocked! Please login again."
  
  Step 5: Attach User to Request
  ├─ req.user = <full user document from MongoDB>
  └─ next() → Continue to route handler
  ↓
Route Handler receives authenticated request:
  ├─ req.user.email available
  ├─ req.user._id available
  └─ Can safely access protected resources
```

**Key Points:**
- **Every protected request is verified server-side**
- Token is verified, user existence checked, and blacklist checked
- Full user document attached to request object
- This is NOT session-based, but token-based with server verification

---

### **5. LOGOUT FLOW**

```
User clicks logout → POST /api/auth/logOut
  ├─ Protected by userAuth middleware (must be authenticated)
  ↓
Backend (authRouter.js):
  ├─ Extracts token from cookies
  ├─ Decodes token to get expiry time
  ├─ Adds token to Redis blacklist:
  │   ├─ redisClient.set(`token:${token}`, "Blocked")
  │   └─ redisClient.expireAt(`token:${token}`, payload.exp)
  ├─ Clears cookie in browser:
  │   └─ res.clearCookie("token", {...})
  └─ Returns success message
  ↓
Frontend:
  └─ setUser(null) → Redirects to login
```

**Key Points:**
- Token is blacklisted in Redis (cannot be reused)
- Cookie is cleared from browser
- Even if someone steals the token, it's now invalid

---

### **6. APP INITIALIZATION (Check if User is Logged In)**

```
App.jsx loads → useEffect runs
  ↓
GET /api/auth/verify (withCredentials: true)
  ├─ Protected by userAuth middleware
  ├─ If token valid → Returns { authenticated: true, user: {...} }
  └─ If token invalid → 401 → Frontend sets user = null
  ↓
Frontend:
  ├─ If authenticated → setUser(user data)
  └─ If not → setUser(null) → Shows login page
```

---

## **Why This is Token-Based, Not Session-Based**

### **Session-Based Authentication:**
- Server stores session data in memory/database
- Session ID stored in cookie
- Server looks up session data on each request
- Session can be invalidated server-side

### **Your Token-Based Authentication:**
- ✅ Token contains user data (JWT payload)
- ✅ Token stored in HTTP-only cookie
- ✅ Token verified on server (stateless verification)
- ✅ Token can be invalidated via Redis blacklist
- ✅ No server-side session storage

**Hybrid Approach:** You're using tokens but with server-side verification and blacklisting, giving you the benefits of both approaches.

---

## **Security Features**

### **1. HTTP-Only Cookies**
```javascript
httpOnly: true  // Prevents XSS attacks - JavaScript cannot access cookie
```

### **2. Secure Cookies (Production)**
```javascript
secure: process.env.NODE_ENV === "production"  // HTTPS only in production
```

### **3. SameSite Protection**
```javascript
sameSite: "strict"  // Prevents CSRF attacks
```

### **4. Password Hashing**
```javascript
bcrypt.hash(password, 10)  // 10 rounds of hashing
```

### **5. Token Blacklisting**
```javascript
// On logout, token added to Redis blacklist
redisClient.set(`token:${token}`, "Blocked")
// On each request, blacklist checked
redisClient.exists(`token:${token}`)
```

### **6. Server-Side Verification**
- Every request verified (not just initial login)
- User existence checked from database
- Token expiry validated
- Blacklist checked

### **7. Rate Limiting**
```javascript
// Redis-based sliding window rate limiter
// 25 requests per hour per user/IP
```

---

## **Token Structure**

Your JWT token contains:
```json
{
  "_id": "user_mongodb_id",
  "email": "user@example.com",
  "iat": 1234567890,  // Issued at
  "exp": 1234567890   // Expires at (7 days)
}
```

**Signed with:** `process.env.SECRET_KEY`

---

## **Request Flow Diagram**

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/signIn
       │    { email, password }
       │    withCredentials: true
       │
       ▼
┌─────────────────────────────────┐
│         Express Server           │
│  ┌───────────────────────────┐  │
│  │  Cookie Parser Middleware │  │
│  │  Extracts token from      │  │
│  │  req.cookies.token        │  │
│  └───────────┬───────────────┘  │
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │   userAuth Middleware     │  │
│  │  1. Get token from cookie │  │
│  │  2. jwt.verify(token)     │  │
│  │  3. User.findById(_id)    │  │
│  │  4. Check Redis blacklist │  │
│  │  5. Attach req.user       │  │
│  └───────────┬───────────────┘  │
│              │                   │
│              ▼                   │
│  ┌───────────────────────────┐  │
│  │   Route Handler           │  │
│  │   Access req.user.email   │  │
│  │   Process request         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
       │
       │ 2. Response with data
       │
       ▼
┌─────────────┐
│   Browser   │
│  Updates UI │
└─────────────┘
```

---

## **Key Differences: Token vs Session**

| Feature | Your Implementation | Pure Session-Based |
|---------|-------------------|-------------------|
| Storage | JWT in HTTP-only cookie | Session ID in cookie |
| Server State | Stateless (token contains data) | Stateful (session stored) |
| Verification | JWT signature verification | Session lookup |
| Scalability | ✅ Stateless, scales horizontally | ❌ Needs shared session store |
| Logout | Redis blacklist | Delete session |
| Security | ✅ Token can't be modified | ✅ Server controls session |

---

## **Summary**

**Your authentication is:**
- ✅ **Token-based** (JWT)
- ✅ **Server-verified** on every request
- ✅ **Secure** (HTTP-only cookies, blacklisting, rate limiting)
- ✅ **Stateless** (no server-side session storage)
- ✅ **Scalable** (can add more servers without session sharing)

**Flow Summary:**
1. Sign Up → Email Verification → Sign In
2. Sign In → JWT token created → Stored in HTTP-only cookie
3. Every Request → Cookie sent automatically → Server verifies token → User attached to request
4. Logout → Token blacklisted → Cookie cleared

This is a **production-ready, secure authentication system** that combines the benefits of token-based authentication with server-side security checks!

