# RBAC Flow Diagram

## 🔐 Complete Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: User Login
┌──────────┐
│  User    │  Email: admin@college.edu
│          │  Password: admin123
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  POST /api/auth/login                                                    │
│  { email, password }                                                     │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Server: authController.login()                                          │
│  1. Find user by email                                                   │
│  2. Compare password with bcrypt                                         │
│  3. Generate JWT token with { userId, email, role }                      │
│  4. Generate refresh token                                               │
│  5. Log activity                                                         │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Response:                                                               │
│  {                                                                       │
│    user: { id, email, name, role: "ADMIN", collegeId },                 │
│    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",                    │
│    refreshToken: "..."                                                   │
│  }                                                                       │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Client: AuthContext                                                     │
│  1. Store user in state                                                  │
│  2. Store token in localStorage                                          │
│  3. Store refresh token in localStorage                                  │
│  4. Set isAuthenticated = true                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      API REQUEST WITH AUTHORIZATION                      │
└─────────────────────────────────────────────────────────────────────────┘

Step 2: Making API Request
┌──────────┐
│  User    │  Clicks "View Students"
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  GET /api/students                                                       │
│  Headers: {                                                              │
│    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."      │
│  }                                                                       │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Middleware: authenticate()                                              │
│  1. Extract token from Authorization header                              │
│  2. Verify token with JWT_SECRET                                         │
│  3. Decode token → { userId, email, role }                               │
│  4. Attach to req.user                                                   │
│  5. Call next()                                                          │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ├─── ❌ No token → 401 Unauthorized
     ├─── ❌ Invalid token → 401 Unauthorized
     └─── ✅ Valid token → Continue
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Middleware: authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY')               │
│  1. Check if req.user.role is in allowed roles                           │
│  2. If yes → Call next()                                                 │
│  3. If no → Return 403 Forbidden                                         │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ├─── ❌ Role not allowed → 403 Forbidden
     └─── ✅ Role allowed → Continue
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Controller: getStudents()                                               │
│  1. Get user role and userId from req.user                               │
│  2. Apply data filtering based on role:                                  │
│                                                                          │
│     IF role === 'SUPER_ADMIN':                                           │
│       → Return ALL students from ALL colleges                            │
│                                                                          │
│     IF role === 'ADMIN' or 'FACULTY':                                    │
│       → Get user's collegeId                                             │
│       → Return students WHERE collegeId = user.collegeId                 │
│                                                                          │
│     IF role === 'STUDENT':                                               │
│       → This endpoint would return 403 (not in authorize list)           │
│                                                                          │
│  3. Return filtered data                                                 │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Response: 200 OK                                                        │
│  [                                                                       │
│    { id: "1", name: "John Doe", college: "Demo College", ... },         │
│    { id: "2", name: "Jane Smith", college: "Demo College", ... }        │
│  ]                                                                       │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         ROLE-BASED DATA ACCESS                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  SUPER_ADMIN    │
│  (System-wide)  │
└────────┬────────┘
         │
         ├─── ✅ View ALL colleges
         ├─── ✅ View ALL admins
         ├─── ✅ View ALL faculty (all colleges)
         ├─── ✅ View ALL students (all colleges)
         ├─── ✅ Create/Edit/Delete anything
         └─── ✅ System-wide analytics

┌─────────────────┐
│     ADMIN       │
│  (College-wide) │
└────────┬────────┘
         │
         ├─── ✅ View students in THEIR college
         ├─── ✅ View faculty in THEIR college
         ├─── ✅ Create/Edit students in THEIR college
         ├─── ✅ Create/Edit/Delete faculty in THEIR college
         ├─── ✅ Delete students in THEIR college
         ├─── ❌ Cannot access other colleges
         └─── ❌ Cannot manage admins

┌─────────────────┐
│    FACULTY      │
│  (College-wide) │
└────────┬────────┘
         │
         ├─── ✅ View students in THEIR college
         ├─── ✅ Create/Edit students in THEIR college
         ├─── ✅ Enter marks/grades
         ├─── ❌ Cannot delete students
         ├─── ❌ Cannot view/manage faculty
         └─── ❌ Cannot access other colleges

┌─────────────────┐
│    STUDENT      │
│  (Self-only)    │
└────────┬────────┘
         │
         ├─── ✅ View OWN profile
         ├─── ✅ View OWN results
         ├─── ✅ View OWN attendance
         ├─── ❌ Cannot view other students
         ├─── ❌ Cannot modify any data
         └─── ❌ Cannot access management functions


┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND ROUTE PROTECTION                           │
└─────────────────────────────────────────────────────────────────────────┘

User navigates to /admin/students
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ProtectedRoute Component                                                │
│  allowedRoles: ['ADMIN']                                                 │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Check 1: Is user authenticated?                                         │
│  const { isAuthenticated, user } = useAuth()                             │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ├─── ❌ Not authenticated → Redirect to /login
     └─── ✅ Authenticated → Continue
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Check 2: Does user have required role?                                  │
│  allowedRoles.includes(user.role)                                        │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ├─── ❌ Wrong role → Redirect to user's dashboard
     │         SUPER_ADMIN → /super-admin
     │         ADMIN → /admin
     │         FACULTY → /faculty
     │         STUDENT → /student
     │
     └─── ✅ Correct role → Render component


┌─────────────────────────────────────────────────────────────────────────┐
│                      COLLEGE-LEVEL ISOLATION                             │
└─────────────────────────────────────────────────────────────────────────┘

Example: Admin tries to create student in another college

POST /api/students
{
  "name": "New Student",
  "collegeId": "other-college-id",  ← Different from admin's college
  ...
}
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Controller: createStudent()                                             │
│  1. Get admin's collegeId from database                                  │
│  2. Compare with requested collegeId                                     │
│  3. If different → Return 403 Forbidden                                  │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
Response: 403 Forbidden
{
  "error": "Can only create students in your college"
}


┌─────────────────────────────────────────────────────────────────────────┐
│                      STUDENT SELF-ACCESS CONTROL                         │
└─────────────────────────────────────────────────────────────────────────┘

Example: Student tries to view another student's profile

GET /api/students/other-student-id
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Controller: getStudent()                                                │
│  1. Get student record from database                                     │
│  2. Check if req.user.role === 'STUDENT'                                 │
│  3. If yes, check if student.userId === req.user.userId                  │
│  4. If different → Return 403 Forbidden                                  │
└────┬────────────────────────────────────────────────────────────────────┘
     │
     ▼
Response: 403 Forbidden
{
  "error": "Access denied"
}


┌─────────────────────────────────────────────────────────────────────────┐
│                         ERROR RESPONSE CODES                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  401 Unauthorized    │  No token or invalid token
└──────────────────────┘
         │
         ├─── Missing Authorization header
         ├─── Invalid token format
         ├─── Expired token
         └─── Token signature invalid

┌──────────────────────┐
│  403 Forbidden       │  Valid token but insufficient permissions
└──────────────────────┘
         │
         ├─── Wrong role for endpoint
         ├─── Trying to access other college's data
         ├─── Student trying to view other student's data
         └─── Faculty trying to delete student

┌──────────────────────┐
│  404 Not Found       │  Resource doesn't exist
└──────────────────────┘

┌──────────────────────┐
│  500 Server Error    │  Internal server error
└──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Layer 1: Frontend Route Protection
         ↓
    ProtectedRoute checks authentication & role
         ↓
Layer 2: API Authentication
         ↓
    authenticate() middleware verifies JWT token
         ↓
Layer 3: API Authorization
         ↓
    authorize() middleware checks role permissions
         ↓
Layer 4: Data-Level Filtering
         ↓
    Controller filters data by college/user
         ↓
Layer 5: Database Constraints
         ↓
    Foreign keys, cascade deletes, Prisma ORM

Result: 🔒 MULTI-LAYER SECURITY = PRODUCTION-READY ✅
```

## 🎯 Key Takeaways

1. **Authentication** = Who are you? (JWT token verification)
2. **Authorization** = What can you do? (Role-based permissions)
3. **Data Filtering** = What can you see? (College/user-level isolation)

4. **Multiple Security Layers**:
   - Frontend: Route protection
   - Backend: Token validation
   - Backend: Role checking
   - Backend: Data filtering
   - Database: Constraints

5. **Zero Trust Model**:
   - Never trust client-side checks alone
   - Always validate on server
   - Always filter data by role
   - Always log security events

**Status**: ✅ FULLY IMPLEMENTED & PRODUCTION-READY
