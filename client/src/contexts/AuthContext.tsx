import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session by calling /auth/me — cookie is sent automatically
  useEffect(() => {
    authAPI.getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        setIsLoading(false);
        return { success: false, error: 'Email and password are required' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setIsLoading(false);
        return { success: false, error: 'Invalid email format' };
      }

      const response = await authAPI.login(email.toLowerCase(), password);
      const { token, user: userData } = response.data;

      if (token) localStorage.setItem('token', token);
      setUser(userData);
      setIsLoading(false);
      return { success: true, role: userData.role };
    } catch (error: any) {
      setIsLoading(false);
      if (error.response?.status === 429) {
        const lockoutTime = error.response?.data?.lockoutTime;
        return {
          success: false,
          error: lockoutTime
            ? `Too many failed attempts. Try again in ${lockoutTime} minutes.`
            : 'Too many failed attempts. Please try again later.',
        };
      }
      return { success: false, error: error.response?.data?.error || 'Login failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    authAPI.logout().catch(console.error);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentPassword || !newPassword)
        return { success: false, error: 'Both current and new passwords are required' };
      if (newPassword.length < 8)
        return { success: false, error: 'New password must be at least 8 characters long' };
      await authAPI.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to change password' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
