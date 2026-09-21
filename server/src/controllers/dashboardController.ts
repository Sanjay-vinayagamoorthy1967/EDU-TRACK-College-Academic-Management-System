import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const { role, userId } = req.user!;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        let stats: any = {};

        if (role === 'SUPER_ADMIN') {
            const [colleges, admins, faculty, students, activities] = await Promise.all([
                prisma.college.count(),
                prisma.admin.count(),
                prisma.faculty.count(),
                prisma.student.count(),
                prisma.activity.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true } },
                        college: { select: { name: true } },
                    },
                }),
            ]);

            stats = {
                totalColleges: colleges,
                totalAdmins: admins,
                totalFaculty: faculty,
                totalStudents: students,
                recentActivities: activities,
            };
        } else if (role === 'ADMIN' || role === 'FACULTY') {
            const [faculty, students, activities] = await Promise.all([
                prisma.faculty.count({ where: user?.collegeId ? { collegeId: user.collegeId } : undefined }),
                prisma.student.count({ where: user?.collegeId ? { collegeId: user.collegeId } : undefined }),
                prisma.activity.findMany({
                    where: user?.collegeId ? { collegeId: user.collegeId } : undefined,
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true } },
                    },
                }),
            ]);

            stats = {
                totalFaculty: faculty,
                totalStudents: students,
                recentActivities: activities,
            };
        } else if (role === 'STUDENT') {
            const student = await prisma.student.findUnique({
                where: { userId },
                include: {
                    results: {
                        include: { subjects: true },
                        orderBy: { semester: 'desc' },
                        take: 1,
                    },
                },
            });

            stats = {
                currentSemester: student?.semester,
                attendance: student?.attendance,
                latestResult: student?.results[0],
            };
        }

        res.json(stats);
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getActivities = async (req: AuthRequest, res: Response) => {
    try {
        const { role, userId } = req.user!;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        let activities;

        if (role === 'SUPER_ADMIN') {
            activities = await prisma.activity.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    college: { select: { name: true } },
                },
            });
        } else {
            activities = await prisma.activity.findMany({
                where: { collegeId: user?.collegeId },
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                },
            });
        }

        res.json(activities);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};
