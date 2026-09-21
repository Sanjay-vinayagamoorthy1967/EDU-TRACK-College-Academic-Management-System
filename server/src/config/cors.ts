import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const configuredOrigin = process.env.FRONTEND_URL?.replace(/\/$/, '');
const fixedOrigins = new Set([
    configuredOrigin,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
].filter((origin): origin is string => Boolean(origin)));

const isAllowedOrigin = (origin: string) => {
    if (fixedOrigins.has(origin)) {
        return true;
    }

    if (process.env.NODE_ENV !== 'production') {
        try {
            const url = new URL(origin);
            return (
                (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
                Boolean(url.port)
            );
        } catch {
            return false;
        }
    }

    return false;
};

export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests without an Origin header
        if (!origin) {
            return callback(null, true);
        }

        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        console.log('❌ CORS blocked origin:', origin);
        return callback(new Error(`CORS blocked: ${origin}`));
    },

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    allowedHeaders: [
        'Content-Type',
        'Authorization',
    ],
};