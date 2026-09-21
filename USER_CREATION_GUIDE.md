# 👥 USER CREATION & CREDENTIAL MANAGEMENT GUIDE

## 🔐 HOW CREDENTIALS ARE CREATED

### 1️⃣ SUPER ADMIN (Already Created)
**Created by**: System Setup
**Credentials**:
- Email: `superadmin@edutrack.system`
- Password: `SuperAdmin@2024!`

**Can Create**: College Admins

---

## 2️⃣ HOW TO CREATE COLLEGE ADMIN

### Step 1: Login as Super Admin
1. Go to http://localhost:8080/login
2. Login with Super Admin credentials

### Step 2: Create a College First
1. Go to "Manage Colleges"
2. Click "Add College"
3. Fill in college details:
   - Name: "ABC Engineering College"
   - Code: "ABC"
   - Type: "Engineering"
   - Address, Phone, Email

### Step 3: Create Admin for the College
1. Go to "Manage Admins"
2. Click "Add Admin"
3. Fill in details:
   - **Name**: John Admin
   - **Email**: john.admin@abc.edu (This becomes their login email)
   - **Password**: Admin@123 (You set this)
   - **Phone**: +91-9876543210
   - **College**: Select "ABC Engineering College"

### Step 4: Give Credentials to Admin
Send the admin their credentials:
- Email: `john.admin@abc.edu`
- Password: `Admin@123`
- Login URL: http://localhost:8080/login

---

## 3️⃣ HOW COLLEGE ADMIN CREATES FACULTY

### Step 1: Login as College Admin
1. Use the credentials given by Super Admin
2. Login at http://localhost:8080/login

### Step 2: Create Faculty
1. Go to "Manage Faculty"
2. Click "Add Faculty"
3. Fill in details:
   - **Name**: Dr. Smith
   - **Email**: dr.smith@abc.edu (This becomes their login email)
   - **Password**: Faculty@123 (You set this)
   - **Phone**: +91-9876543211
   - **Department**: Computer Science
   - **Designation**: Professor
   - **Qualification**: PhD in CS
   - **Experience**: 10 years

### Step 3: Give Credentials to Faculty
Send the faculty their credentials:
- Email: `dr.smith@abc.edu`
- Password: `Faculty@123`
- Login URL: http://localhost:8080/login

---

## 4️⃣ HOW COLLEGE ADMIN CREATES STUDENTS

### Step 1: Login as College Admin
1. Use your admin credentials

### Step 2: Create Student
1. Go to "Manage Students"
2. Click "Add Student"
3. Fill in details:
   - **Name**: Rahul Kumar
   - **Email**: rahul.kumar@abc.edu (This becomes their login email)
   - **Password**: Student@123 (You set this)
   - **Phone**: +91-9876543212
   - **Roll Number**: CS2024001
   - **Admission Number**: ADM2024001
   - **Course**: B.Tech Computer Science
   - **Semester**: 1
   - **Date of Birth**: 15/01/2005
   - **Gender**: Male
   - **Address**: Full address
   - **Father Name**: Father's name
   - **Mother Name**: Mother's name
   - **Guardian Contact**: +91-9876543213
   - **Guardian Occupation**: Engineer
   - **10th Marks**: 85%
   - **10th Board**: CBSE
   - **12th Marks**: 88%
   - **12th Board**: CBSE

### Step 3: Give Credentials to Student
Send the student their credentials:
- Email: `rahul.kumar@abc.edu`
- Password: `Student@123`
- Login URL: http://localhost:8080/login

---

## 📋 CREDENTIAL GENERATION RULES

### Email Format
- **Super Admin**: `superadmin@edutrack.system`
- **College Admin**: `firstname.lastname@collegecode.edu`
- **Faculty**: `dr.firstname@collegecode.edu`
- **Student**: `firstname.lastname@collegecode.edu`

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Example Passwords
- `Admin@123`
- `Faculty@2024`
- `Student@123`
- `Welcome@2024`

---

## 🔄 USER CREATION WORKFLOW

```
SUPER ADMIN
    ↓
    Creates College
    ↓
    Creates College Admin (gives email + password)
    ↓
COLLEGE ADMIN
    ↓
    Creates Faculty (gives email + password)
    ↓
    Creates Students (gives email + password)
```

---

## 🎯 QUICK EXAMPLE

### Creating Complete Setup

**1. Super Admin creates College:**
- Name: "Tech Institute"
- Code: "TI"

**2. Super Admin creates Admin:**
- Email: `admin@ti.edu`
- Password: `Admin@2024`

**3. Admin creates Faculty:**
- Email: `prof.john@ti.edu`
- Password: `Faculty@2024`

**4. Admin creates Student:**
- Email: `student.rahul@ti.edu`
- Password: `Student@2024`

---

## 🔒 SECURITY BEST PRACTICES

1. **Force Password Change**: Users should change password on first login
2. **Strong Passwords**: Always use strong passwords
3. **Unique Emails**: Each user must have unique email
4. **Secure Delivery**: Send credentials via secure channel (email/SMS)
5. **Document**: Keep record of created users

---

## ⚠️ IMPORTANT NOTES

- **Super Admin** can create Admins only
- **College Admin** can create Faculty and Students only for their college
- **Faculty** cannot create users
- **Students** cannot create users
- All users can change their own password after login
- Emails must be unique across the system
- Passwords are encrypted in database

---

## 📞 CREDENTIAL DELIVERY TEMPLATE

### For Admin:
```
Subject: Your Admin Account - EduTrack System

Dear [Admin Name],

Your administrator account has been created for [College Name].

Login Credentials:
- URL: http://localhost:8080/login
- Email: [email]
- Password: [password]

Please change your password after first login.

Regards,
System Administrator
```

### For Faculty:
```
Subject: Your Faculty Account - EduTrack System

Dear [Faculty Name],

Your faculty account has been created.

Login Credentials:
- URL: http://localhost:8080/login
- Email: [email]
- Password: [password]

Please change your password after first login.

Regards,
[College Admin Name]
```

### For Student:
```
Subject: Your Student Account - EduTrack System

Dear [Student Name],

Your student account has been created.

Login Credentials:
- URL: http://localhost:8080/login
- Email: [email]
- Password: [password]

Please change your password after first login.

Regards,
[College Admin Name]
```

---

## 🎉 SUMMARY

1. **Super Admin** creates colleges and admins
2. **College Admin** creates faculty and students
3. Each user gets **unique email** and **password**
4. Credentials are **manually set** during user creation
5. Users should **change password** after first login
6. All passwords are **encrypted** in database
7. **No self-registration** - all users must be created by authorized personnel