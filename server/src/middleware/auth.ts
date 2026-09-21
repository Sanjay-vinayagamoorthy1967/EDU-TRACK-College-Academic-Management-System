import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';
import prisma from '../config/database';

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Parse token from raw cookie header (no cookie-parser needed)
        const rawCookie = req.headers.cookie || '';

        const cookieToken = rawCookie
            .split(';')
            .map(c => c.trim())
            .find(c => c.startsWith('token='))
            ?.split('=')[1];

        const token =
            cookieToken ||
            req.headers.authorization?.substring(7);

        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
            });
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token',
        });
    }
};

export const authorize = (...roles: string[]) => {
    return (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Not authenticated',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
            });
        }

        next();
    };
};

// Enhanced RBAC middleware for college-level access control
export const authorizeCollegeAccess = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Not authenticated',
        });
    }

    const { role, collegeId } = req.user;

    const requestedCollegeId =
        req.params.collegeId || req.body.collegeId;

    // Super Admin has access to all colleges
    if (role === 'SUPER_ADMIN') {
        return next();
    }

    // Other roles can only access their own college
    if (collegeId !== requestedCollegeId) {
        return res.status(403).json({
            error: 'Access denied to this college',
        });
    }

    next();
};

// Middleware to check if college is locked
export const checkCollegeLock = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { role, userId } = req.user!;

        // Super Admin bypasses lock check
        if (role === 'SUPER_ADMIN') {
            return next();
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                college: true,
            },
        });

        if (user?.college?.isLocked) {
            return res.status(403).json({
                error: 'College is locked. Contact Super Admin.',
                isLocked: true,
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to check college lock status',
        });
    }
};

// Middleware for strict role hierarchy enforcement
export const enforceHierarchy = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Not authenticated',
        });
    }

    const { role } = req.user;

    const targetRole =
        req.body.role || req.params.role;

    // Define role hierarchy
    const roleHierarchy: Record<
        'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT',
        string[]
    > = {
        SUPER_ADMIN: ['ADMIN', 'FACULTY', 'STUDENT'],
        ADMIN: ['FACULTY', 'STUDENT'],
        FACULTY: [],
        STUDENT: [],
    };

    if (
        targetRole &&
        !roleHierarchy[
            role as keyof typeof roleHierarchy
        ]?.includes(targetRole)
    ) {
        return res.status(403).json({
            error:
                'Cannot create users with higher or equal privileges',
        });
    }

    next();
};