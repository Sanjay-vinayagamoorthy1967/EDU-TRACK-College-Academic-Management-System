# ✅ TESTING CHECKLIST

## 🔧 SETUP
- [ ] Server running on http://localhost:5000
- [ ] Client running on http://localhost:8080
- [ ] Database connected and seeded

## 1️⃣ SUPER ADMIN LOGIN
- [ ] Go to http://localhost:8080/login
- [ ] Login with:
  - Email: `superadmin@edutrack.system`
  - Password: `SuperAdmin@2024!`
- [ ] Should redirect to Super Admin dashboard
- [ ] Can see "Manage Colleges" and "Manage Admins" in sidebar

## 2️⃣ CREATE COLLEGE
- [ ] Click "Manage Colleges"
- [ ] Click "Add College" button
- [ ] Fill form:
  - Name: Test College
  - Code: TC
  - Type: Engineering
  - Address: Test Address
  - Phone: 9876543210
  - Email: test@college.edu
- [ ] Click "Add College"
- [ ] College appears in list

## 3️⃣ CREATE ADMIN
- [ ] Click "Manage Admins"
- [ ] Click "Add Admin" button
- [ ] Fill form:
  - Name: Test Admin
  - Email: admin@test.edu
  - **Password: Admin@123** ← CHECK THIS FIELD EXISTS
  - Phone: 9876543210
  - College: Select "Test College"
- [ ] Click "Add Admin"
- [ ] Success message shows with email
- [ ] Admin appears in list

## 4️⃣ ADMIN LOGIN
- [ ] Logout from Super Admin
- [ ] Login with:
  - Email: `admin@test.edu`
  - Password: `Admin@123`
- [ ] Should redirect to Admin dashboard
- [ ] Can see "Manage Faculty" and "Manage Students"

## 5️⃣ CREATE FACULTY
- [ ] Click "Manage Faculty"
- [ ] Click "Add Faculty" button
- [ ] Fill form:
  - Name: Test Faculty
  - Email: faculty@test.edu
  - **Password: Faculty@123** ← CHECK THIS FIELD EXISTS
  - Phone: 9876543211
  - Department: Computer Science
  - Designation: Professor
- [ ] Click "Add Faculty"
- [ ] Success message shows with email
- [ ] Faculty appears in list

## 6️⃣ CREATE STUDENT
- [ ] Click "Manage Students"
- [ ] Click "Add Student" button
- [ ] Go to "Personal" tab, fill:
  - Name: Test Student
  - Email: student@test.edu
  - **Password: Student@123** ← CHECK THIS FIELD EXISTS
  - Phone: 9876543212
- [ ] Go to "Academic" tab, fill:
  - Roll Number: TC2024001
  - Course: Select any
  - Semester: 1
  - Aadhar: 123456789012
- [ ] Skip other tabs for now
- [ ] Click "Add Student"
- [ ] Success message shows with email
- [ ] Student appears in list

## 7️⃣ FACULTY LOGIN
- [ ] Logout from Admin
- [ ] Login with:
  - Email: `faculty@test.edu`
  - Password: `Faculty@123`
- [ ] Should redirect to Faculty dashboard
- [ ] Can see faculty-specific menu

## 8️⃣ STUDENT LOGIN
- [ ] Logout from Faculty
- [ ] Login with:
  - Email: `student@test.edu`
  - Password: `Student@123`
- [ ] Should redirect to Student dashboard
- [ ] Can see student profile and results

---

## ❌ IF ANY TEST FAILS:

### Password field not showing?
- Clear browser cache
- Restart client: `npm run dev` in client folder

### Login fails with 401?
- Check server is running
- Check database has users
- Run: `npx tsx prisma/production-seed.ts` in server folder

### Server not starting?
- Check port 5000 is free
- Run: `npm install` in server folder
- Check DATABASE_URL in server/.env

### Client not starting?
- Check port 8080 is free
- Run: `npm install` in client folder

---

## ✅ SUCCESS CRITERIA
All 8 tests should pass:
1. ✅ Super Admin can login
2. ✅ Super Admin can create college
3. ✅ Super Admin can create admin with password
4. ✅ Admin can login with created credentials
5. ✅ Admin can create faculty with password
6. ✅ Admin can create student with password
7. ✅ Faculty can login with created credentials
8. ✅ Student can login with created credentials

---

## 📝 REPORT RESULTS
After testing, note which steps failed and the error messages.