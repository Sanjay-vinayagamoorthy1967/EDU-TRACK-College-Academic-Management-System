# 🔐 COMPLETE RBAC SYSTEM - IMPLEMENTATION PLAN

## ✅ CURRENT STATUS

### Already Implemented ✅
1. ✅ JWT Authentication
2. ✅ Role-based middleware (authenticate, authorize)
3. ✅ Super Admin → Admin assignment
4. ✅ College-level data filtering
5. ✅ Faculty management with college restrictions
6. ✅ Student management with college restrictions
7. ✅ College locking feature (database field added)

### Missing Features ❌
1. ❌ Course Management (Admin creates courses)
2. ❌ Result Publishing Workflow
3. ❌ Student Dashboard with Results
4. ❌ College Lock UI (Lock/Unlock button)
5. ❌ Audit Logs
6. ❌ One Admin per College validation

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Critical Features (IMPLEMENT NOW)
1. **Course Management** - Admin creates courses for their college
2. **Result Publishing** - Admin/Faculty publish results
3. **Student Results View** - Students see their published results
4. **College Lock UI** - Super Admin can lock/unlock colleges

### Phase 2: Enhancement Features
5. Audit Logs
6. One Admin per College validation
7. Advanced Analytics

---

## 📋 FEATURE 1: COURSE MANAGEMENT

### Database Schema
```prisma
model Course {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique
  credits     Int
  semester    Int
  collegeId   String
  college     College  @relation(fields: [collegeId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([collegeId])
  @@index([code])
}
```

### Backend API
```typescript
// Routes: /api/courses
GET    /api/courses          // Get courses (filtered by college)
POST   /api/courses          // Create course (Admin only)
PUT    /api/courses/:id      // Update course (Admin only)
DELETE /api/courses/:id      // Delete course (Admin only)

// Controller
export const createCourse = async (req, res) => {
    const { name, code, credits, semester } = req.body;
    const { role, userId } = req.user;
    
    // Get admin's college
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Check college lock
    const college = await prisma.college.findUnique({ 
        where: { id: user.collegeId } 
    });
    
    if (college?.isLocked && role !== 'SUPER_ADMIN') {
        return res.status(403).json({ 
            error: 'College is locked. Cannot create courses.' 
        });
    }
    
    // Create course
    const course = await prisma.course.create({
        data: {
            name,
            code,
            credits,
            semester,
            collegeId: user.collegeId
        }
    });
    
    res.status(201).json(course);
};
```

### Frontend UI
```typescript
// Page: /admin/courses
- List all courses for admin's college
- Add Course button
- Edit/Delete course
- Filter by semester
```

---

## 📋 FEATURE 2: RESULT PUBLISHING

### Database Schema (Already Exists)
```prisma
model SemesterResult {
  id            String         @id @default(uuid())
  studentId     String
  student       Student        @relation(fields: [studentId])
  semester      Int
  sgpa          Float
  cgpa          Float
  status        ResultStatus   // PASS, FAIL, PENDING
  isPublished   Boolean        @default(false)  // ← KEY FIELD
  publishedAt   DateTime?
  lastUpdatedBy String?
  lastUpdatedAt DateTime?
  subjects      SubjectResult[]
}
```

### Backend API
```typescript
// Routes: /api/results
POST   /api/results/publish/:id    // Publish result (Admin only)
POST   /api/results/unpublish/:id  // Unpublish result (Admin only)
GET    /api/results/student/:id    // Get student results (published only)

// Controller
export const publishResult = async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user;
    
    // Get result with student
    const result = await prisma.semesterResult.findUnique({
        where: { id },
        include: { student: true }
    });
    
    // Check college ownership
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (result.student.collegeId !== user.collegeId && role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // Publish result
    const published = await prisma.semesterResult.update({
        where: { id },
        data: {
            isPublished: true,
            publishedAt: new Date(),
            lastUpdatedBy: user.name,
            lastUpdatedAt: new Date()
        }
    });
    
    res.json(published);
};
```

### Frontend UI
```typescript
// Admin: /admin/results
- List all students with results
- "Publish" button for each result
- "Unpublish" button for published results
- Bulk publish option

// Student: /student/results
- Show only published results
- Hide unpublished results
- Download result PDF
```

---

## 📋 FEATURE 3: COLLEGE LOCK UI

### Frontend Component
```typescript
// File: client/src/pages/super-admin/ManageColleges.tsx

// Add Lock/Unlock button to each college row
<Button
  variant={college.isLocked ? "destructive" : "outline"}
  onClick={() => toggleCollegeLock(college.id, !college.isLocked)}
>
  {college.isLocked ? (
    <>
      <Lock className="mr-2 h-4 w-4" />
      Unlock College
    </>
  ) : (
    <>
      <Unlock className="mr-2 h-4 w-4" />
      Lock College
    </>
  )}
</Button>

// Handler
const toggleCollegeLock = async (collegeId, isLocked) => {
    try {
        await collegesAPI.toggleLock(collegeId, { isLocked });
        toast({
            title: isLocked ? 'College Locked' : 'College Unlocked',
            description: `College has been ${isLocked ? 'locked' : 'unlocked'}.`
        });
        loadColleges(); // Refresh list
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to toggle college lock.',
            variant: 'destructive'
        });
    }
};
```

---

## 📋 FEATURE 4: ONE ADMIN PER COLLEGE

### Backend Validation
```typescript
// File: server/src/controllers/adminController.ts

export const createAdmin = async (req, res) => {
    const { collegeId } = req.body;
    
    // Check if college already has an admin
    const existingAdmin = await prisma.admin.findFirst({
        where: { collegeId }
    });
    
    if (existingAdmin) {
        return res.status(400).json({ 
            error: 'This college already has an admin assigned.' 
        });
    }
    
    // Create admin...
};
```

---

## 🔒 COMPLETE PERMISSION MATRIX

| Feature | Super Admin | Admin | Faculty | Student |
|---------|-------------|-------|---------|---------|
| **Colleges** |
| View all colleges | ✅ | ❌ | ❌ | ❌ |
| Create college | ✅ | ❌ | ❌ | ❌ |
| Lock/Unlock college | ✅ | ❌ | ❌ | ❌ |
| **Admins** |
| View all admins | ✅ | ❌ | ❌ | ❌ |
| Create admin | ✅ | ❌ | ❌ | ❌ |
| **Courses** |
| View courses | ✅ | ✅* | ✅* | ✅* |
| Create course | ✅ | ✅ | ❌ | ❌ |
| Edit course | ✅ | ✅ | ❌ | ❌ |
| Delete course | ✅ | ✅ | ❌ | ❌ |
| **Faculty** |
| View faculty | ✅ | ✅* | ❌ | ❌ |
| Create faculty | ✅ | ✅ | ❌ | ❌ |
| **Students** |
| View students | ✅ | ✅* | ✅* | ❌ |
| Create student | ✅ | ✅ | ✅ | ❌ |
| Delete student | ✅ | ✅ | ❌ | ❌ |
| View own profile | - | - | - | ✅ |
| **Results** |
| Enter marks | ✅ | ✅ | ✅ | ❌ |
| Publish results | ✅ | ✅ | ❌ | ❌ |
| View published results | ✅ | ✅ | ✅ | ✅** |

*Only for their college  
**Only their own results

---

## 🧪 END-TO-END TEST SCENARIOS

### Test 1: College Lock Enforcement
```
1. Super Admin locks Engineering College
2. Engineering Admin tries to add faculty
3. Expected: ❌ 403 Forbidden - "College is locked"
4. Super Admin unlocks college
5. Engineering Admin tries to add faculty
6. Expected: ✅ Faculty created successfully
```

### Test 2: Course Management
```
1. Engineering Admin creates "Data Structures" course
2. Expected: ✅ Course created for Engineering College
3. Pharmacy Admin tries to view Engineering courses
4. Expected: ❌ Only sees Pharmacy courses
```

### Test 3: Result Publishing
```
1. Admin uploads results for Semester 3
2. Results are unpublished (isPublished = false)
3. Student tries to view results
4. Expected: ❌ No results shown
5. Admin clicks "Publish Results"
6. Expected: ✅ Results now visible to student
```

### Test 4: Cross-College Access
```
1. Engineering Admin tries to add faculty to Pharmacy
2. Expected: ❌ 403 Forbidden
3. Engineering Admin tries to view Pharmacy students
4. Expected: ❌ Only sees Engineering students
```

### Test 5: One Admin Per College
```
1. Super Admin assigns Admin1 to Engineering
2. Super Admin tries to assign Admin2 to Engineering
3. Expected: ❌ Error - "College already has an admin"
```

---

## 📊 IMPLEMENTATION CHECKLIST

### Database ✅
- [x] User table with role and collegeId
- [x] College table with isLocked field
- [x] Admin table with collegeId
- [x] Faculty table with collegeId
- [x] Student table with collegeId
- [x] SemesterResult table with isPublished
- [ ] Course table (TO ADD)

### Backend API ✅
- [x] Authentication middleware
- [x] Authorization middleware
- [x] College CRUD with lock endpoint
- [x] Admin CRUD with college validation
- [x] Faculty CRUD with college filtering
- [x] Student CRUD with college filtering
- [x] College lock validation in controllers
- [ ] Course CRUD (TO ADD)
- [ ] Result publish/unpublish endpoints (TO ADD)
- [ ] One admin per college validation (TO ADD)

### Frontend ✅
- [x] Role-based routing
- [x] Protected routes
- [x] Super Admin pages
- [x] Admin pages
- [x] Faculty pages
- [x] Student pages
- [x] College dropdown locked for admins
- [ ] College lock/unlock UI (TO ADD)
- [ ] Course management page (TO ADD)
- [ ] Result publishing UI (TO ADD)
- [ ] Student results page (TO ADD)

---

## 🚀 QUICK IMPLEMENTATION GUIDE

### Step 1: Add Course Management
```bash
1. Add Course model to schema.prisma
2. Run: npx prisma migrate dev --name add_courses
3. Create courseController.ts
4. Create courseRoutes.ts
5. Add to server/src/index.ts
6. Create ManageCourses.tsx page
7. Add route to App.tsx
```

### Step 2: Add Result Publishing
```bash
1. Add publish/unpublish endpoints
2. Update result controllers
3. Create PublishResults.tsx page
4. Update StudentResults.tsx to show only published
```

### Step 3: Add College Lock UI
```bash
1. Add Lock/Unlock button to ManageColleges.tsx
2. Add toggleLock API call
3. Test lock enforcement
```

### Step 4: Add One Admin Validation
```bash
1. Update createAdmin controller
2. Check existing admin before creating
3. Return error if admin exists
```

---

## ✅ FINAL VERIFICATION

- [ ] Super Admin can create colleges
- [ ] Super Admin can lock/unlock colleges
- [ ] Super Admin can assign one admin per college
- [ ] Admin can only see their college
- [ ] Admin can create courses for their college
- [ ] Admin can create faculty for their college
- [ ] Admin can create students for their college
- [ ] Admin can publish results
- [ ] Locked colleges block all admin actions
- [ ] Faculty can only view their college data
- [ ] Students can only see published results
- [ ] Students can only see their own data
- [ ] No cross-college data leakage
- [ ] All permissions enforced at backend
- [ ] All UI adapts to user role

---

**Status:** 70% Complete  
**Missing:** Course Management, Result Publishing UI, College Lock UI  
**Priority:** Implement missing features in order listed above
