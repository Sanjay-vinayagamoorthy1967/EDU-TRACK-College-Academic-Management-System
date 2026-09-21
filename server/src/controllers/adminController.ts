import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const getAdmins = async (req: AuthRequest, res: Response) => {
    try {
        const admins = await prisma.admin.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true } },
                college: { select: { id: true, name: true, code: true } },
            },
        });

        // Format response
        const formattedAdmins = admins.map(admin => ({
            id: admin.id,
            name: admin.user.name,
            email: admin.user.email,
            phone: admin.user.phone,
            avatar: admin.user.avatar,
            collegeId: admin.collegeId,
            collegeName: admin.college.name,
            createdAt: admin.user.createdAt,
        }));

        res.json(formattedAdmins);
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
};

export const getAdminById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const admin = await prisma.admin.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, phone: true, avatar: true } },
                college: { select: { name: true, code: true } },
            },
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        res.json(admin);
    } catch (error) {
        console.error('Get admin error:', error);
        res.status(500).json({ error: 'Failed to fetch admin' });
    }
};

export const createAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, phone, collegeId } = req.body;

        // Validation
        if (!email || !password || !name || !collegeId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'ADMIN',
                collegeId,
            },
        });

        const admin = await prisma.admin.create({
            data: {
                userId: user.id,
                collegeId,
            },
        });

        // Get full admin data with relations
        const fullAdmin = await prisma.admin.findUnique({
            where: { id: admin.id },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true } },
                college: { select: { id: true, name: true, code: true } },
            },
        });

        await prisma.activity.create({
            data: {
                type: 'ADMIN_ADDED',
                message: `${name} added as admin`,
                userId: req.user!.userId,
                collegeId,
            },
        });

        // Format response to match frontend expectations
        const response = {
            id: fullAdmin!.id,
            name: fullAdmin!.user.name,
            email: fullAdmin!.user.email,
            phone: fullAdmin!.user.phone,
            avatar: fullAdmin!.user.avatar,
            collegeId: fullAdmin!.collegeId,
            collegeName: fullAdmin!.college.name,
            createdAt: fullAdmin!.user.createdAt,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};

export const updateAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { email, name, phone, collegeId } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        await prisma.user.update({
            where: { id: admin.userId },
            data: { email, name, phone, collegeId },
        });

        const updatedAdmin = await prisma.admin.update({
            where: { id },
            data: { collegeId },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                college: { select: { name: true } },
            },
        });

        res.json(updatedAdmin);
    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({ error: 'Failed to update admin' });
    }
};

export const deleteAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const admin = await prisma.admin.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        await prisma.admin.delete({ where: { id } });
        await prisma.user.delete({ where: { id: admin.userId } });

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ error: 'Failed to delete admin' });
    }
};
