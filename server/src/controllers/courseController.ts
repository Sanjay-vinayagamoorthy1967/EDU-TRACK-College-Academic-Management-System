import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getCourses = async (req: AuthRequest, res: Response) => {
    try {
        const { role, userId } = req.user!;
        let courses;

        if (role === 'SUPER_ADMIN') {
            courses = await prisma.course.findMany({
                include: { college: { select: { name: true, code: true } } },
            });
        } else {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            courses = await prisma.course.findMany({
               where: { collegeId: user?.collegeId ?? undefined },
                include: { college: { select: { name: true, code: true } } },
            });
        }

        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { name, code, duration, collegeId } = req.body;
        const { role, userId } = req.user!;

        // Admin can only create courses in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only create courses in your college' });
            }
        }

        const course = await prisma.course.create({
            data: { name, code, duration, collegeId },
            include: { college: { select: { name: true } } },
        });

        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, code, duration } = req.body;
        const { role, userId } = req.user!;

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Admin can only update courses in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (course.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only update courses in your college' });
            }
        }

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: { name, code, duration },
            include: { college: { select: { name: true } } },
        });

        res.json(updatedCourse);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user!;

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Admin can only delete courses in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (course.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only delete courses in your college' });
            }
        }

        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};
