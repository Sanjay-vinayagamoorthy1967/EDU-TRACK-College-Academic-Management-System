import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const publishResult = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, semester, sgpa, cgpa, status, subjects } = req.body;
        const { role, userId } = req.user!;

        // Get student to verify college
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Admin/Faculty can only publish results for their college students
        if (role === 'ADMIN' || role === 'FACULTY') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Can only publish results for your college students' });
            }
        }

        // Create or update semester result
        const result = await prisma.semesterResult.upsert({
            where: {
                studentId_semester: { studentId, semester }
            },
            update: {
                sgpa,
                cgpa,
                status,
                isPublished: true,
                publishedAt: new Date(),
                lastUpdatedBy: userId,
                lastUpdatedAt: new Date(),
            },
            create: {
                studentId,
                semester,
                sgpa,
                cgpa,
                status,
                isPublished: true,
                publishedAt: new Date(),
                lastUpdatedBy: userId,
                lastUpdatedAt: new Date(),
            },
        });

        // Delete existing subject results and create new ones
        await prisma.subjectResult.deleteMany({ where: { resultId: result.id } });
        
        if (subjects && subjects.length > 0) {
            await prisma.subjectResult.createMany({
                data: subjects.map((subject: any) => ({
                    resultId: result.id,
                    code: subject.code,
                    name: subject.name,
                    credits: subject.credits,
                    internalMarks: subject.internalMarks,
                    externalMarks: subject.externalMarks,
                    totalMarks: subject.totalMarks,
                    grade: subject.grade,
                    gradePoints: subject.gradePoints,
                })),
            });
        }

        await prisma.activity.create({
            data: {
                type: 'RESULT_PUBLISHED',
                message: `Semester ${semester} result published for ${student.rollNumber}`,
                userId,
                collegeId: student.collegeId,
            },
        });

        const fullResult = await prisma.semesterResult.findUnique({
            where: { id: result.id },
            include: { subjects: true, student: { include: { user: true } } },
        });

        res.status(201).json(fullResult);
    } catch (error) {
        console.error('Publish result error:', error);
        res.status(500).json({ error: 'Failed to publish result' });
    }
};

export const getStudentResults = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;
        const { role, userId } = req.user!;

        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Students can only view their own results
        if (role === 'STUDENT' && student.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Admin/Faculty can only view results from their college
        if (role === 'ADMIN' || role === 'FACULTY') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const results = await prisma.semesterResult.findMany({
            where: { 
                studentId,
                isPublished: role === 'STUDENT' ? true : undefined // Students only see published results
            },
            include: { subjects: true },
            orderBy: { semester: 'asc' },
        });

        res.json(results);
    } catch (error) {
        console.error('Get student results error:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
};

export const unpublishResult = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user!;

        const result = await prisma.semesterResult.findUnique({
            where: { id },
            include: { student: true },
        });

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Admin can only unpublish results from their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (result.student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const updatedResult = await prisma.semesterResult.update({
            where: { id },
            data: { 
                isPublished: false,
                lastUpdatedBy: userId,
                lastUpdatedAt: new Date(),
            },
        });

        res.json(updatedResult);
    } catch (error) {
        console.error('Unpublish result error:', error);
        res.status(500).json({ error: 'Failed to unpublish result' });
    }
};

export const deleteResult = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user!;

        const result = await prisma.semesterResult.findUnique({
            where: { id },
            include: { student: true },
        });

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Admin can only delete results from their college
        if (role === 'ADMIN') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (result.student.collegeId !== user?.collegeId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        await prisma.semesterResult.delete({ where: { id } });
        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Delete result error:', error);
        res.status(500).json({ error: 'Failed to delete result' });
    }
};
