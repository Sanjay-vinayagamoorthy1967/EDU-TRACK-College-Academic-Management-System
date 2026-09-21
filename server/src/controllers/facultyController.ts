import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const getFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { role, userId } = req.user!;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        let faculty;

        if (role === 'SUPER_ADMIN') {
            faculty = await prisma.faculty.findMany({
                include: {
                    user: { select: { name: true, email: true, phone: true, avatar: true } },
                    college: { select: { name: true, code: true } },
                },
            });
        } else {
            faculty = await prisma.faculty.findMany({
                where: user?.collegeId ? { collegeId: user.collegeId } : undefined,
                include: {
                    user: { select: { name: true, email: true, phone: true, avatar: true } },
                    college: { select: { name: true, code: true } },
                },
            });
        }

        res.json(faculty);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
};

export const getFacultyById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const faculty = await prisma.faculty.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, phone: true, avatar: true } },
                college: { select: { name: true, code: true } },
            },
        });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        res.json(faculty);
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
};

export const createFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, phone, collegeId, department, designation, qualification, experience } = req.body;
        const { role, userId } = req.user!;

        // Check if college is locked
        const college = await prisma.college.findUnique({ where: { id: collegeId } });
        if (college?.isLocked && role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'College is locked. Cannot add faculty.' });
        }

        // Admin can only create faculty in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only create faculty in your college' });
            }
        }

        const hashedPassword = await bcrypt.hash(password || 'faculty123', 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'FACULTY',
                collegeId,
            },
        });

        const faculty = await prisma.faculty.create({
            data: {
                userId: user.id,
                collegeId,
                department,
                designation,
                qualification,
                experience,
            },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                college: { select: { name: true } },
            },
        });

        await prisma.college.update({
            where: { id: collegeId },
            data: { facultyCount: { increment: 1 } },
        });

        await prisma.activity.create({
            data: {
                type: 'FACULTY_ADDED',
                message: `${name} joined as ${designation}`,
                userId: req.user!.userId,
                collegeId,
            },
        });

        res.status(201).json(faculty);
    } catch (error) {
        console.error('Create faculty error:', error);
        res.status(500).json({ error: 'Failed to create faculty' });
    }
};

export const updateFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { email, name, phone, department, designation, qualification, experience } = req.body;
        const { role, userId } = req.user!;

        const faculty = await prisma.faculty.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Admin can only update faculty in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (faculty.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only update faculty in your college' });
            }
        }

        await prisma.user.update({
            where: { id: faculty.userId },
            data: { email, name, phone },
        });

        const updatedFaculty = await prisma.faculty.update({
            where: { id },
            data: { department, designation, qualification, experience },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                college: { select: { name: true } },
            },
        });

        res.json(updatedFaculty);
    } catch (error) {
        console.error('Update faculty error:', error);
        res.status(500).json({ error: 'Failed to update faculty' });
    }
};

export const deleteFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user!;

        const faculty = await prisma.faculty.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Admin can only delete faculty in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (faculty.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only delete faculty in your college' });
            }
        }

        await prisma.faculty.delete({ where: { id } });
        await prisma.user.delete({ where: { id: faculty.userId } });

        await prisma.college.update({
            where: { id: faculty.collegeId },
            data: { facultyCount: { decrement: 1 } },
        });

        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Delete faculty error:', error);
        res.status(500).json({ error: 'Failed to delete faculty' });
    }
};
