import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be defined in production environment variables.');
}
const JWT_SECRET_CONST = JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h'; // Reduced for better security
const JWT_REFRESH_EXPIRES_IN = '7d'; // Reduced from 30d

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    collegeId?: string; // Added for RBAC
}

export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export { JWT_SECRET };