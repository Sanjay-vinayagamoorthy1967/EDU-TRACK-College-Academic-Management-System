import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import prisma from './config/database';

// Routes
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import collegeRoutes from './routes/collegeRoutes';
import facultyRoutes from './routes/facultyRoutes';
import adminRoutes from './routes/adminRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import courseRoutes from './routes/courseRoutes';
import resultRoutes from './routes/resultRoutes';

dotenv.config();

const app = express();

// Render is behind a proxy
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Database connection check
async function checkDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('⚠️ Server will continue without database connection');
    }
}

// CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
        });
    } catch (error) {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            error: 'Database connection failed',
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);

    await checkDatabaseConnection();

    console.log('\n✅ Available API Endpoints:');
    console.log('   - GET    /health');
    console.log('   - POST   /api/auth/login');
    console.log('   - POST   /api/auth/logout');
    console.log('   - GET    /api/auth/me');
    console.log('   - GET    /api/colleges');
    console.log('   - GET    /api/students');
    console.log('   - GET    /api/faculty');
    console.log('   - GET    /api/admins');
    console.log('   - GET    /api/dashboard/stats');
    console.log('   - GET    /api/dashboard/activities');
});

export default app;