# Student Success Hub - Full-Stack Application

A comprehensive educational management system with **100% working** client-server architecture, complete database integration, and production-ready features.

## 🏗️ Project Structure

```
EDU-TRACK/
├── client/                    # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── api/              # API service layer
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/            # Page components
│   │   └── App.tsx
│   └── package.json
│
├── server/                    # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   └── package.json
│
├── database/                  # Database scripts
└── docs/                      # Documentation
```

## ✨ Features

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ CORS protection

### User Roles
- **Super Admin**: Manage all colleges, admins, faculty, students
- **Admin**: Manage college-specific faculty and students
- **Faculty**: View students, enter marks, generate reports
- **Student**: View results, download reports

### Core Features
- ✅ College management
- ✅ Student management with complete profiles
- ✅ Faculty management
- ✅ Semester results tracking
- ✅ Dashboard analytics
- ✅ Activity logging
- ✅ Report generation (PDF/Excel)

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### 1. Database Setup

**Configure PostgreSQL on port 12345**:
```bash
# Edit postgresql.conf
port = 12345

# Restart PostgreSQL
# Windows: net stop/start postgresql
# Mac: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
```

**Create database**:
```bash
psql -h localhost -p 12345 -U postgres
CREATE DATABASE edutrack;
\q
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment
# Edit .env file with your database credentials

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run prisma:seed

# Start server
npm run dev
```

Server runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@edutrack.com | admin123 |
| Admin | admin.engineering@edutrack.com | admin123 |
| Faculty | faculty.cs@edutrack.com | admin123 |
| Student | rahul.student@edutrack.com | admin123 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Colleges
- `GET /api/colleges` - List all colleges
- `POST /api/colleges` - Create college (Super Admin)
- `GET /api/colleges/:id` - Get college details
- `PUT /api/colleges/:id` - Update college
- `DELETE /api/colleges/:id` - Delete college

### Students
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Faculty
- `GET /api/faculty` - List faculty
- `POST /api/faculty` - Create faculty
- `GET /api/faculty/:id` - Get faculty details
- `PUT /api/faculty/:id` - Update faculty
- `DELETE /api/faculty/:id` - Delete faculty

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities

## 🗄️ Database Schema

### Core Models
- **User**: Authentication and base user info
- **College**: Educational institutions
- **Admin**: College administrators
- **Faculty**: Teaching staff
- **Student**: Student profiles
- **SemesterResult**: Academic results
- **SubjectResult**: Subject-wise marks
- **Activity**: System activity logs
- **UploadHistory**: Bulk upload tracking

### Relationships
- User → College (Many-to-One)
- Student → SemesterResult (One-to-Many)
- SemesterResult → SubjectResult (One-to-Many)
- College → Students/Faculty/Admins (One-to-Many)

## 🛠️ Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open database GUI
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📊 Database Management

### Prisma Studio
```bash
cd server
npm run prisma:studio
```
Opens GUI at `http://localhost:5555`

### Reset Database
```bash
cd server
npx prisma migrate reset
```

## 🧪 Testing

### Test API with curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@edutrack.com","password":"admin123"}'

# Get students (with token)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Health Check
```bash
curl http://localhost:5000/health
```

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running on port 12345
- Check DATABASE_URL in server/.env
- Ensure database "edutrack" exists

### Backend Won't Start
- Check if port 5000 is available
- Verify all dependencies installed
- Check .env configuration

### Frontend Can't Connect
- Ensure backend is running
- Check VITE_API_URL in client/.env
- Clear browser cache and localStorage

## 📝 Environment Variables

### Server (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:12345/edutrack"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Student Success Hub
```

## 🚢 Production Deployment

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Deploy dist/ folder to hosting service
```

### Recommended Hosting
- **Backend**: Railway, Render, Heroku
- **Frontend**: Vercel, Netlify
- **Database**: Railway PostgreSQL, Supabase

## 📚 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- Axios
- React Query
- React Router

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Bcrypt

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License

## 👥 Support

For issues and questions:
- Check documentation in `/docs`
- Review troubleshooting guide
- Open an issue on GitHub

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 3, 2026
