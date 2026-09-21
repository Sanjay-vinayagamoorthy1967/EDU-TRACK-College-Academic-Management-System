import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getColleges = async (req: AuthRequest, res: Response) => {
    try {
        const { role, userId } = req.user!;
        let colleges;

        if (role === 'SUPER_ADMIN') {
            // Super Admin sees ALL colleges
            colleges = await prisma.college.findMany({
                include: {
                    _count: {
                        select: { students: true, faculty: true, admins: true },
                    },
                },
            });
        } else {
            // Admin/Faculty/Student see ONLY their assigned college
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user?.collegeId) {
                return res.json([]);
            }
            colleges = await prisma.college.findMany({
                where: { id: user.collegeId },
                include: {
                    _count: {
                        select: { students: true, faculty: true, admins: true },
                    },
                },
            });
        }

        res.json(colleges);
    } catch (error) {
        console.error('Get colleges error:', error);
        res.status(500).json({ error: 'Failed to fetch colleges' });
    }
};

export const getCollege = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const college = await prisma.college.findUnique({
            where: { id },
            include: {
                students: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
                faculty: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
                admins: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
        });

        if (!college) {
            return res.status(404).json({ error: 'College not found' });
        }

        res.json(college);
    } catch (error) {
        console.error('Get college error:', error);
        res.status(500).json({ error: 'Failed to fetch college' });
    }
};

export const createCollege = async (req: AuthRequest, res: Response) => {
    try {
        const college = await prisma.college.create({
            data: req.body,
        });

        await prisma.activity.create({
            data: {
                type: 'COLLEGE_ADDED',
                message: `${college.name} added to the system`,
                userId: req.user!.userId,
            },
        });

        res.status(201).json(college);
    } catch (error) {
        console.error('Create college error:', error);
        res.status(500).json({ error: 'Failed to create college' });
    }
};

export const updateCollege = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const college = await prisma.college.update({
            where: { id },
            data: req.body,
        });

        res.json(college);
    } catch (error) {
        console.error('Update college error:', error);
        res.status(500).json({ error: 'Failed to update college' });
    }
};

export const deleteCollege = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.college.delete({ where: { id } });

        res.json({ message: 'College deleted successfully' });
    } catch (error) {
        console.error('Delete college error:', error);
        res.status(500).json({ error: 'Failed to delete college' });
    }
};

export const toggleCollegeLock = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { isLocked } = req.body;

        const college = await prisma.college.update({
            where: { id },
            data: { isLocked },
        });

        await prisma.activity.create({
            data: {
                type: 'COLLEGE_ADDED',
                message: `${college.name} ${isLocked ? 'locked' : 'unlocked'}`,
                userId: req.user!.userId,
                collegeId: id,
            },
        });

        res.json(college);
    } catch (error) {
        console.error('Toggle college lock error:', error);
        res.status(500).json({ error: 'Failed to toggle college lock' });
    }
};
