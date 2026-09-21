import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                user: { select: { name: true, email: true, phone: true, avatar: true } },
                college: { select: { name: true, code: true } },
                results: {
                    include: { subjects: true },
                    orderBy: { semester: 'asc' },
                },
            },
        });
        if (!student) return res.status(404).json({ error: 'Student profile not found' });
        res.json(student);
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { role, userId } = req.user!;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        let students;

        if (role === 'SUPER_ADMIN') {
            students = await prisma.student.findMany({
                include: {
                    user: { select: { name: true, email: true, phone: true, avatar: true } },
                    college: { select: { name: true, code: true } },
                    results: { include: { subjects: true } },
                },
            });
        } else {
            students = await prisma.student.findMany({
                where: user?.collegeId ? { collegeId: user.collegeId } : undefined,
                include: {
                    user: { select: { name: true, email: true, phone: true, avatar: true } },
                    college: { select: { name: true, code: true } },
                    results: { include: { subjects: true } },
                },
            });
        }

        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

export const getStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user!;

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true, phone: true, avatar: true } },
                college: { select: { name: true, code: true } },
                results: {
                    include: { subjects: true },
                    orderBy: { semester: 'asc' },
                },
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Students can only view their own data
        if (role === 'STUDENT' && student.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Admin and Faculty can only view students from their college
        if ((role === 'ADMIN' || role === 'FACULTY')) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        res.json(student);
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, phone, collegeId, ...studentData } = req.body;
        const { role, userId } = req.user!;

        // Check if college is locked
        const college = await prisma.college.findUnique({ where: { id: collegeId } });
        if (college?.isLocked && role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'College is locked. Cannot add students.' });
        }

        // Admin and Faculty can only create students in their college
        if (role === 'ADMIN' || role === 'FACULTY') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only create students in your college' });
            }
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        // Check if rollNumber already exists
        const existingRoll = await prisma.student.findUnique({ where: { rollNumber: studentData.rollNumber } });
        if (existingRoll) {
            return res.status(400).json({ error: 'A student with this roll number already exists' });
        }

        // Check if admissionNumber already exists
        if (studentData.admissionNumber) {
            const existingAdm = await prisma.student.findUnique({ where: { admissionNumber: studentData.admissionNumber } });
            if (existingAdm) {
                return res.status(400).json({ error: 'A student with this admission number already exists' });
            }
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password || 'student123', 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: 'STUDENT',
                collegeId,
            },
        });

        const student = await prisma.student.create({
            data: {
                userId: user.id,
                collegeId,
                course: studentData.course,
                semester: studentData.semester,
                rollNumber: studentData.rollNumber,
                admissionNumber: studentData.admissionNumber,
                dob: new Date(studentData.dob),
                gender: (studentData.gender?.toUpperCase() || 'MALE') as 'MALE' | 'FEMALE' | 'OTHER',
                address: studentData.address || '',
                fatherName: studentData.fatherName || 'N/A',
                motherName: studentData.motherName || 'N/A',
                guardianContact: studentData.guardianContact || '0000000000',
                guardianOccupation: studentData.guardianOccupation || 'N/A',
                tenthMarks: parseFloat(studentData.tenthMarks) || 0,
                tenthBoard: studentData.tenthBoard || 'N/A',
                twelfthMarks: parseFloat(studentData.twelfthMarks) || 0,
                twelfthBoard: studentData.twelfthBoard || 'N/A',
            },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                college: { select: { name: true } },
            },
        });

        await prisma.college.update({
            where: { id: collegeId },
            data: { studentsCount: { increment: 1 } },
        });

        await prisma.activity.create({
            data: {
                type: 'STUDENT_ADDED',
                message: `New student ${name} enrolled`,
                userId: req.user!.userId,
                collegeId,
            },
        });

        res.status(201).json(student);
    } catch (error: any) {
        console.error('Create student error:', error?.message || error);
        console.error('Error code:', error?.code);
        console.error('Error meta:', error?.meta);
        const message = error?.code === 'P2002'
            ? `Duplicate entry: ${error?.meta?.target} already exists`
            : error?.code === 'P2003'
            ? 'Invalid college ID'
            : error?.message || 'Failed to create student';
        res.status(500).json({ error: message });
    }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { email, name, phone, ...studentData } = req.body;
        const { role, userId } = req.user!;

        const student = await prisma.student.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Admin and Faculty can only update students in their college
        if (role === 'ADMIN' || role === 'FACULTY') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only update students in your college' });
            }
        }

        await prisma.user.update({
            where: { id: student.userId },
            data: { email, name, phone },
        });

        const updatedStudent = await prisma.student.update({
            where: { id },
            data: {
                course: studentData.course,
                semester: studentData.semester,
                rollNumber: studentData.rollNumber,
                admissionNumber: studentData.admissionNumber,
                dob: studentData.dob ? new Date(studentData.dob) : undefined,
                gender: studentData.gender ? (studentData.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER') : undefined,
                address: studentData.address,
                fatherName: studentData.fatherName,
                motherName: studentData.motherName,
                guardianContact: studentData.guardianContact,
                guardianOccupation: studentData.guardianOccupation,
                tenthMarks: studentData.tenthMarks !== undefined ? parseFloat(studentData.tenthMarks) : undefined,
                tenthBoard: studentData.tenthBoard,
                twelfthMarks: studentData.twelfthMarks !== undefined ? parseFloat(studentData.twelfthMarks) : undefined,
                twelfthBoard: studentData.twelfthBoard,
            },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                college: { select: { name: true } },
            },
        });

        res.json(updatedStudent);
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user!;

        const student = await prisma.student.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Admin can only delete students in their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only delete students in your college' });
            }
        }

        await prisma.student.delete({ where: { id } });
        await prisma.user.delete({ where: { id: student.userId } });

        await prisma.college.update({
            where: { id: student.collegeId },
            data: { studentsCount: { decrement: 1 } },
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
};
