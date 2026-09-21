import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting PRODUCTION database setup...');

    // Clear ALL existing data (complete reset)
    console.log('🧹 Clearing all existing data...');
    await prisma.activity.deleteMany();
    await prisma.uploadHistory.deleteMany();
    await prisma.subjectResult.deleteMany();
    await prisma.semesterResult.deleteMany();
    await prisma.student.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
    await prisma.college.deleteMany();

    // Create ONLY Super Admin (no demo users)
    const superAdminPassword = await bcrypt.hash('SuperAdmin@2024!', 12);
    
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@edutrack.system',
            password: superAdminPassword,
            name: 'System Administrator',
            role: UserRole.SUPER_ADMIN,
            phone: '+91-9999999999',
        },
    });

    console.log('✅ Created Super Admin');
    console.log('🔐 PRODUCTION CREDENTIALS:');
    console.log('Email: superadmin@edutrack.system');
    console.log('Password: SuperAdmin@2024!');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('1. Change the Super Admin password immediately after first login');
    console.log('2. No demo users exist - all users must be created through proper channels');
    console.log('3. Super Admin creates College Admins');
    console.log('4. College Admins create Faculty and Students');
    console.log('5. No public registration is allowed');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Login as Super Admin');
    console.log('2. Create colleges');
    console.log('3. Assign admins to colleges');
    console.log('4. Admins can then create faculty and students');
}

main()
    .catch((e) => {
        console.error('❌ Error setting up production database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });