# RBAC Quick Reference Guide

## 🎯 4 User Roles

### 1. SUPER_ADMIN 🔴
- **Access Level**: EVERYTHING
- **Scope**: System-wide
- **Can Do**:
  - ✅ Manage ALL colleges (create, edit, delete)
  - ✅ Manage ALL admins across all colleges
  - ✅ View ALL students and faculty
  - ✅ Access system-wide analytics
  - ✅ View all activities
- **Cannot Do**: Nothing - has full access
- **Test Email**: `superadmin@edutrack.com`

### 2. ADMIN 🟡
- **Access Level**: College-specific management
- **Scope**: Own college only
- **Can Do**:
  - ✅ Manage students in THEIR college only
  - ✅ Manage faculty in THEIR college only
  - ✅ Upload student results
  - ✅ Generate reports for their college
  - ✅ View college-specific analytics
- **Cannot Do**:
  - ❌ Access other colleges' data
  - ❌ Create/delete colleges
  - ❌ Manage other admins
  - ❌ View system-wide data
- **Test Email**: `admin@democollege.edu`

### 3. FACULTY 🟢
- **Access Level**: Read + Student management
- **Scope**: Own college only
- **Can Do**:
  - ✅ View students in their college
  - ✅ Create students
  - ✅ Edit students
  - ✅ Enter marks/grades
  - ✅ View student results
  - ✅ Generate student reports
  - ✅ View analytics
- **Cannot Do**:
  - ❌ Delete students
  - ❌ Manage other faculty
  - ❌ Access admin functions
  - ❌ Manage colleges
- **Test Email**: `faculty@democollege.edu`

### 4. STUDENT 🔵
- **Access Level**: Own data only
- **Scope**: Personal profile
- **Can Do**:
  - ✅ View their own profile
  - ✅ View their own results
  - ✅ Download their reports
  - ✅ Check attendance
- **Cannot Do**:
  - ❌ View other students' data
  - ❌ Modify any data
  - ❌ Access management functions
  - ❌ View analytics
- **Test Email**: `student@democollege.edu`

---

## 🔐 API Endpoints & Permissions

### Authentication (No Auth Required)
```
POST /api/auth/login          - Anyone
POST /api/auth/refresh        - Anyone with refresh token
```

### Authenticated Endpoints
```
POST /api/auth/logout         - All authenticated users
GET  /api/auth/me             - All authenticated users
```

### Colleges
```
GET    /api/colleges          - All authenticated users
POST   /api/colleges          - SUPER_ADMIN only
GET    /api/colleges/:id      - All authenticated users
PUT    /api/colleges/:id      - SUPER_ADMIN only
DELETE /api/colleges/:id      - SUPER_ADMIN only
```

### Admins
```
GET    /api/admins            - SUPER_ADMIN only
POST   /api/admins            - SUPER_ADMIN only
GET    /api/admins/:id        - SUPER_ADMIN only
PUT    /api/admins/:id        - SUPER_ADMIN only
DELETE /api/admins/:id        - SUPER_ADMIN only
```

### Faculty
```
GET    /api/faculty           - SUPER_ADMIN, ADMIN (own college)
POST   /api/faculty           - SUPER_ADMIN, ADMIN (own college)
GET    /api/faculty/:id       - All authenticated users
PUT    /api/faculty/:id       - SUPER_ADMIN, ADMIN (own college)
DELETE /api/faculty/:id       - SUPER_ADMIN, ADMIN (own college)
```

### Students
```
GET    /api/students          - SUPER_ADMIN, ADMIN, FACULTY (filtered by college)
POST   /api/students          - SUPER_ADMIN, ADMIN, FACULTY (own college)
GET    /api/students/:id      - All authenticated (with access control)
PUT    /api/students/:id      - SUPER_ADMIN, ADMIN, FACULTY (own college)
DELETE /api/students/:id      - SUPER_ADMIN, ADMIN (own college)
```

### Dashboard
```
GET    /api/dashboard/stats       - All authenticated (filtered by role)
GET    /api/dashboard/activities  - All authenticated (filtered by role)
```

---

## 🚦 HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - No token or invalid token
- **403 Forbidden** - Valid token but insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## 🔑 JWT Token Structure

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ADMIN",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Expiry**:
- Access Token: 7 days
- Refresh Token: 30 days

---

## 📋 Frontend Routes

### Public Routes
```
/                 - Landing page
/login            - Login page
```

### Super Admin Routes (SUPER_ADMIN only)
```
/super-admin                - Dashboard
/super-admin/colleges       - Manage colleges
/super-admin/admins         - Manage admins
/super-admin/faculty        - View all faculty
/super-admin/students       - View all students
```

### Admin Routes (ADMIN only)
```
/admin                      - Dashboard
/admin/faculty              - Manage faculty
/admin/students             - Manage students
/admin/bulk-upload          - Bulk upload
/admin/reports              - Reports
```

### Faculty Routes (FACULTY only)
```
/faculty                    - Dashboard
/faculty/students           - View students
/faculty/data-entry         - Enter marks
/faculty/reports            - Reports
```

### Student Routes (STUDENT only)
```
/student                    - Dashboard
/student/results            - View results
/student/profile            - View profile
```

---

## 🧪 Testing Commands

### Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@edutrack.com","password":"admin123"}'

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Authorization
```bash
# Super Admin - Should succeed
curl -X GET http://localhost:5000/api/colleges \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Admin - Should fail (403)
curl -X POST http://localhost:5000/api/colleges \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New College",...}'

# Student - Should fail (403)
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

---

## 🔍 Common Issues & Solutions

### Issue: 401 Unauthorized
**Cause**: No token or invalid token
**Solution**: 
1. Check if token is included in Authorization header
2. Verify token format: `Bearer <token>`
3. Check if token has expired
4. Re-login to get new token

### Issue: 403 Forbidden
**Cause**: Valid token but insufficient permissions
**Solution**:
1. Check user role in token
2. Verify route requires that role
3. Check if trying to access other college's data
4. Ensure student is accessing only their own data

### Issue: Cannot access other college's data
**Cause**: College-level filtering
**Solution**: This is expected behavior for ADMIN and FACULTY roles

### Issue: Student cannot view student list
**Cause**: Students can only view their own data
**Solution**: This is expected behavior for security

---

## 📊 Data Filtering Rules

### SUPER_ADMIN
- No filtering
- Sees ALL data across ALL colleges

### ADMIN
- Filtered by `collegeId`
- Sees only data from their assigned college
- Cannot create/modify data in other colleges

### FACULTY
- Filtered by `collegeId`
- Sees only data from their assigned college
- Cannot delete students
- Cannot manage other faculty

### STUDENT
- Filtered by `userId`
- Sees only their own profile and results
- Cannot see other students' data
- Cannot modify any data

---

## ✅ Security Checklist

- [x] All routes protected with authentication
- [x] All routes have role-based authorization
- [x] Passwords hashed with bcrypt
- [x] JWT tokens properly validated
- [x] College-level data isolation
- [x] Student self-access control
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Error handling implemented
- [x] Activity logging enabled
- [x] SQL injection prevented (Prisma ORM)
- [x] XSS protection (React escaping)
- [x] CSRF protection (token-based auth)

---

## 🎓 Best Practices

1. **Always include Authorization header** in API requests
2. **Store tokens securely** in localStorage (not cookies for this app)
3. **Handle 401/403 errors** gracefully in frontend
4. **Refresh tokens** before they expire
5. **Logout on token expiry** or invalid token
6. **Never expose sensitive data** in error messages
7. **Log all security events** for audit trail
8. **Use HTTPS** in production
9. **Rotate JWT secrets** periodically
10. **Implement rate limiting** to prevent brute force

---

## 📞 Support

For issues or questions about RBAC implementation:
1. Check this guide first
2. Review `RBAC_IMPLEMENTATION.md` for detailed documentation
3. Test with provided test users
4. Check browser console and server logs for errors

**Status**: ✅ Production-Ready
**Last Updated**: 2024
**Version**: 1.0.0
