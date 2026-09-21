import { PrismaClient, UserRole, Gender, ResultStatus, UploadStatus, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.activity.deleteMany();
    await prisma.uploadHistory.deleteMany();
    await prisma.subjectResult.deleteMany();
    await prisma.semesterResult.deleteMany();
    await prisma.student.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();
    await prisma.college.deleteMany();

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Colleges
    const colleges = await Promise.all([
        prisma.college.create({
            data: {
                name: 'College of Engineering',
                code: 'COE',
                type: 'Engineering',
                address: '123 Tech Park, Sector 15, New Delhi - 110001',
                phone: '+91 11-23456789',
                email: 'engineering@edutrack.edu',
                studentsCount: 0,
                facultyCount: 0,
            },
        }),
        prisma.college.create({
            data: {
                name: 'College of Pharmacy',
                code: 'COP',
                type: 'Pharmacy',
                address: '456 Health Campus, Sector 22, New Delhi - 110002',
                phone: '+91 11-23456790',
                email: 'pharmacy@edutrack.edu',
                studentsCount: 0,
                facultyCount: 0,
            },
        }),
        prisma.college.create({
            data: {
                name: 'College of Arts & Humanities',
                code: 'CAH',
                type: 'Arts',
                address: '789 Culture Avenue, Sector 30, New Delhi - 110003',
                phone: '+91 11-23456791',
                email: 'arts@edutrack.edu',
                studentsCount: 0,
                facultyCount: 0,
            },
        }),
        prisma.college.create({
            data: {
                name: 'College of Commerce',
                code: 'COC',
                type: 'Commerce',
                address: '321 Business Hub, Sector 18, New Delhi - 110004',
                phone: '+91 11-23456792',
                email: 'commerce@edutrack.edu',
                studentsCount: 0,
                facultyCount: 0,
            },
        }),
    ]);

    console.log('✅ Created 4 colleges');

    // Create Super Admin
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@edutrack.com',
            password: hashedPassword,
            name: 'Dr. Rajesh Kumar',
            role: UserRole.SUPER_ADMIN,
            phone: '+91 9876543210',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
        },
    });

    console.log('✅ Created super admin');

    // Create Admins
    const admin1User = await prisma.user.create({
        data: {
            email: 'admin.engineering@edutrack.com',
            password: hashedPassword,
            name: 'Prof. Anil Sharma',
            role: UserRole.ADMIN,
            phone: '+91 9876543211',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
            collegeId: colleges[0].id,
        },
    });

    await prisma.admin.create({
        data: {
            userId: admin1User.id,
            collegeId: colleges[0].id,
        },
    });

    const admin2User = await prisma.user.create({
        data: {
            email: 'admin.pharmacy@edutrack.com',
            password: hashedPassword,
            name: 'Dr. Priya Patel',
            role: UserRole.ADMIN,
            phone: '+91 9876543212',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin2',
            collegeId: colleges[1].id,
        },
    });

    await prisma.admin.create({
        data: {
            userId: admin2User.id,
            collegeId: colleges[1].id,
        },
    });

    console.log('✅ Created 2 admins');

    // Create Faculty
    const faculty1User = await prisma.user.create({
        data: {
            email: 'faculty.cs@edutrack.com',
            password: hashedPassword,
            name: 'Dr. Sanjay Verma',
            role: UserRole.FACULTY,
            phone: '+91 9876543213',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faculty1',
            collegeId: colleges[0].id,
        },
    });

    await prisma.faculty.create({
        data: {
            userId: faculty1User.id,
            collegeId: colleges[0].id,
            department: 'Computer Science',
            designation: 'Professor',
            qualification: 'Ph.D. in Computer Science',
            experience: 15,
        },
    });

    await prisma.college.update({
        where: { id: colleges[0].id },
        data: { facultyCount: { increment: 1 } },
    });

    console.log('✅ Created faculty');

    // Create Students
    const student1User = await prisma.user.create({
        data: {
            email: 'rahul.student@edutrack.com',
            password: hashedPassword,
            name: 'Rahul Mehta',
            role: UserRole.STUDENT,
            phone: '+91 9876543214',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
            collegeId: colleges[0].id,
        },
    });

    const student1 = await prisma.student.create({
        data: {
            userId: student1User.id,
            collegeId: colleges[0].id,
            course: 'B.Tech Computer Science',
            semester: 3,
            rollNumber: 'COE2024CS001',
            admissionNumber: 'ADM2024001',
            dob: new Date('2002-05-15'),
            gender: Gender.MALE,
            address: '45 Green Park, New Delhi - 110016',
            fatherName: 'Suresh Mehta',
            motherName: 'Kavita Mehta',
            guardianContact: '+91 9876543220',
            guardianOccupation: 'Business',
            tenthMarks: 92.5,
            tenthBoard: 'CBSE',
            twelfthMarks: 89.2,
            twelfthBoard: 'CBSE',
            attendance: 85,
            profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
        },
    });

    // Create semester results for student
    const sem1Result = await prisma.semesterResult.create({
        data: {
            studentId: student1.id,
            semester: 1,
            sgpa: 8.75,
            cgpa: 8.75,
            status: ResultStatus.PASS,
            isPublished: true,
            publishedAt: new Date('2024-06-15'),
        },
    });

    await prisma.subjectResult.createMany({
        data: [
            {
                resultId: sem1Result.id,
                code: 'CS101',
                name: 'Programming Fundamentals',
                credits: 4,
                internalMarks: 38,
                externalMarks: 72,
                totalMarks: 110,
                grade: 'A',
                gradePoints: 9,
            },
            {
                resultId: sem1Result.id,
                code: 'MA101',
                name: 'Engineering Mathematics I',
                credits: 4,
                internalMarks: 35,
                externalMarks: 68,
                totalMarks: 103,
                grade: 'A',
                gradePoints: 9,
            },
            {
                resultId: sem1Result.id,
                code: 'PH101',
                name: 'Engineering Physics',
                credits: 3,
                internalMarks: 32,
                externalMarks: 65,
                totalMarks: 97,
                grade: 'B+',
                gradePoints: 8,
            },
        ],
    });

    await prisma.college.update({
        where: { id: colleges[0].id },
        data: { studentsCount: { increment: 1 } },
    });

    console.log('✅ Created student with results');

    // Create Activities
    await prisma.activity.createMany({
        data: [
            {
                type: ActivityType.COLLEGE_ADDED,
                message: 'College of Engineering added to the system',
                userId: superAdmin.id,
            },
            {
                type: ActivityType.ADMIN_ADDED,
                message: 'Prof. Anil Sharma appointed as Admin for Engineering College',
                userId: superAdmin.id,
                collegeId: colleges[0].id,
            },
            {
                type: ActivityType.FACULTY_ADDED,
                message: 'Dr. Sanjay Verma joined as Professor',
                userId: admin1User.id,
                collegeId: colleges[0].id,
            },
            {
                type: ActivityType.STUDENT_ADDED,
                message: 'New student Rahul Mehta enrolled in B.Tech Computer Science',
                userId: admin1User.id,
                collegeId: colleges[0].id,
            },
        ],
    });

    console.log('✅ Created activities');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('Super Admin: superadmin@edutrack.com / admin123');
    console.log('Admin: admin.engineering@edutrack.com / admin123');
    console.log('Faculty: faculty.cs@edutrack.com / admin123');
    console.log('Student: rahul.student@edutrack.com / admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
