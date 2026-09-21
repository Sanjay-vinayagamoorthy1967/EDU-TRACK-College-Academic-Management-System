import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            if (!url.includes('/auth/me') && !url.includes('/auth/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const studentsAPI = {
    getAll: () => api.get('/students'),
    getById: (id: string) => api.get(`/students/${id}`),
    create: (data: any) => api.post('/students', data),
    update: (id: string, data: any) => api.put(`/students/${id}`, data),
    delete: (id: string) => api.delete(`/students/${id}`),
};

export const collegesAPI = {
    getAll: () => api.get('/colleges'),
    getById: (id: string) => api.get(`/colleges/${id}`),
    create: (data: any) => api.post('/colleges', data),
    update: (id: string, data: any) => api.put(`/colleges/${id}`, data),
    delete: (id: string) => api.delete(`/colleges/${id}`),
};

export const facultyAPI = {
    getAll: () => api.get('/faculty'),
    getById: (id: string) => api.get(`/faculty/${id}`),
    create: (data: any) => api.post('/faculty', data),
    update: (id: string, data: any) => api.put(`/faculty/${id}`, data),
    delete: (id: string) => api.delete(`/faculty/${id}`),
};

export const adminsAPI = {
    getAll: () => api.get('/admins'),
    getById: (id: string) => api.get(`/admins/${id}`),
    create: (data: any) => api.post('/admins', data),
    update: (id: string, data: any) => api.put(`/admins/${id}`, data),
    delete: (id: string) => api.delete(`/admins/${id}`),
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivities: () => api.get('/dashboard/activities'),
};

export default api;
