import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken, generateRefreshToken } from '../config/jwt';
import { AuthRequest } from '../middleware/auth';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24h
};

// Rate limiting for failed login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check rate limiting
        const attemptKey = `${email}:${clientIP}`;
        const attempts = failedAttempts.get(attemptKey);
        
        if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
            const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
            if (timeSinceLastAttempt < LOCKOUT_DURATION) {
                return res.status(429).json({ 
                    error: 'Too many failed attempts. Please try again later.',
                    lockoutTime: Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000)
                });
            } else {
                // Reset attempts after lockout period
                failedAttempts.delete(attemptKey);
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                college: true,
                adminProfile: true,
                facultyProfile: true,
                studentProfile: true,
            },
        });

        if (!user) {
            // Record failed attempt
            const currentAttempts = failedAttempts.get(attemptKey) || { count: 0, lastAttempt: new Date() };
            failedAttempts.set(attemptKey, {
                count: currentAttempts.count + 1,
                lastAttempt: new Date()
            });
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Record failed attempt
            const currentAttempts = failedAttempts.get(attemptKey) || { count: 0, lastAttempt: new Date() };
            failedAttempts.set(attemptKey, {
                count: currentAttempts.count + 1,
                lastAttempt: new Date()
            });
            
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Clear failed attempts on successful login
        failedAttempts.delete(attemptKey);

        // Role-based access validation
        if (user.role !== 'SUPER_ADMIN' && !user.collegeId) {
            return res.status(403).json({ error: 'Account not properly configured. Contact administrator.' });
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
        });

        // Log successful login activity
        await prisma.activity.create({
            data: {
                type: 'USER_LOGIN',
                message: `${user.name} (${user.role}) logged in from ${clientIP}`,
                userId: user.id,
                collegeId: user.collegeId,
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        res.cookie('token', token, COOKIE_OPTIONS);
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({
            token,
            user: {
                ...userWithoutPassword,
                collegeName: user.college?.name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication service temporarily unavailable' });
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user) {
            const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
            await prisma.activity.create({
                data: {
                    type: 'USER_LOGOUT',
                    message: `User logged out from ${clientIP}`,
                    userId: req.user.userId,
                },
            });
        }

        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                college: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            ...userWithoutPassword,
            collegeName: user.college?.name,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = require('../config/jwt').verifyToken(token);

        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, collegeId: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        const newToken = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
        });

        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

// New endpoint for changing password (production requirement)
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        // Log password change
        await prisma.activity.create({
            data: {
                type: 'USER_LOGIN', // We can add PASSWORD_CHANGED to enum later
                message: `${user.name} changed their password`,
                userId: user.id,
                collegeId: user.collegeId,
            },
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};
