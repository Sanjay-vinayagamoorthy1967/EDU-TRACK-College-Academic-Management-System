# Student Success Hub - Complete Setup Guide

## 🎯 Goal
Get your **100% working** full-stack application running with perfect database integration.

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Database Setup
```bash
# Start PostgreSQL on port 12345
# (See detailed instructions below if needed)

# Create database
psql -h localhost -p 12345 -U postgres
CREATE DATABASE edutrack;
\q
```

### Step 2: Backend Setup
```bash
cd server

# Install & setup
npm install
npx prisma migrate dev --name init
npm run prisma:seed

# Start server
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Step 3: Frontend Setup
```bash
cd client

# Install & start
npm install
npm run dev
```

✅ Frontend running on `http://localhost:5173`

### Step 4: Login
Open `http://localhost:5173/login`

**Credentials**: `superadmin@edutrack.com` / `admin123`

---

## 📋 Detailed Setup

### PostgreSQL Configuration (Port 12345)

**Windows**:
1. Find `postgresql.conf` in `C:\Program Files\PostgreSQL\<version>\data\`
2. Change `port = 5432` to `port = 12345`
3. Restart: `net stop postgresql-x64-<version>` then `net start postgresql-x64-<version>`

**Mac**:
1. Find config: `/usr/local/var/postgres/postgresql.conf`
2. Change port to 12345
3. Restart: `brew services restart postgresql`

**Linux**:
1. Edit `/etc/postgresql/<version>/main/postgresql.conf`
2. Change port to 12345
3. Restart: `sudo systemctl restart postgresql`

**Docker** (Easiest):
```bash
docker run --name edutrack-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=edutrack \
  -p 12345:5432 \
  -d postgres:15
```

### Verify Database Connection
```bash
psql -h localhost -p 12345 -U postgres -c "SELECT version();"
```

---

## 🔍 Verification Checklist

### Backend ✅
- [ ] Server starts without errors
- [ ] See "🚀 Server running on port 5000"
- [ ] Health check works: `curl http://localhost:5000/health`
- [ ] Database connected (no Prisma errors)

### Frontend ✅
- [ ] Vite starts on port 5173
- [ ] Login page loads
- [ ] Can login with demo credentials
- [ ] Redirected to dashboard

### Database ✅
- [ ] PostgreSQL running on port 12345
- [ ] Database "edutrack" exists
- [ ] Tables created (check with Prisma Studio)
- [ ] Seed data loaded

---

## 🧪 Test Everything

### 1. Test API
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@edutrack.com","password":"admin123"}'

# Should return: user, token, refreshToken
```

### 2. Test Database
```bash
cd server
npx prisma studio
```
Opens GUI at `http://localhost:5555` - verify data exists.

### 3. Test Frontend
1. Login as Super Admin
2. Navigate to "Manage Colleges"
3. View college list (should show 4 colleges)
4. Navigate to "Manage Students"
5. View student list (should show 1 student)

---

## 🚨 Troubleshooting

### "Can't reach database server"
- Check PostgreSQL is running: `pg_isready -h localhost -p 12345`
- Verify port in `server/.env`: `DATABASE_URL="postgresql://...@localhost:12345/edutrack"`
- Check firewall allows port 12345

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### "Network Error" in frontend
- Verify backend is running
- Check `client/.env`: `VITE_API_URL=http://localhost:5000/api`
- Clear browser cache and localStorage

### "Invalid credentials"
- Verify database was seeded: `npm run prisma:seed`
- Check users exist in Prisma Studio
- Password is `admin123` for all demo users

---

## 📊 Database Management

### View All Data
```bash
cd server
npx prisma studio
```

### Reset Everything
```bash
cd server
npx prisma migrate reset
# This will delete all data and re-seed
```

### Backup Database
```bash
pg_dump -h localhost -p 12345 -U postgres edutrack > backup.sql
```

---

## 🎓 Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Super Admin | superadmin@edutrack.com | admin123 | Everything |
| Admin | admin.engineering@edutrack.com | admin123 | College management |
| Faculty | faculty.cs@edutrack.com | admin123 | Students, marks |
| Student | rahul.student@edutrack.com | admin123 | View results |

---

## ✅ Success Criteria

Your setup is **100% working** when:

1. ✅ Backend starts without errors
2. ✅ Frontend loads at localhost:5173
3. ✅ Can login with any demo account
4. ✅ Dashboard shows real data from database
5. ✅ Can create/edit/delete records
6. ✅ Data persists after page refresh
7. ✅ No console errors in browser
8. ✅ Prisma Studio shows all tables with data

---

## 🚀 Next Steps

Once everything is working:

1. **Explore Features**:
   - Add new students
   - Create colleges
   - View analytics

2. **Customize**:
   - Change colors in `tailwind.config.ts`
   - Add your logo
   - Modify dashboard

3. **Deploy**:
   - Backend → Railway/Render
   - Frontend → Vercel/Netlify
   - Database → Railway PostgreSQL

---

## 📞 Need Help?

1. Check logs in terminal
2. Check browser console (F12)
3. Verify database with Prisma Studio
4. Review error messages carefully

---

**Setup Time**: 5-10 minutes  
**Difficulty**: Easy  
**Status**: ✅ Production Ready
