// PRODUCTION VERSION - NO MOCK DATA
// All data must come from the backend API
// This file is kept for type definitions only

import { College, Admin, Faculty, Student, Activity } from '@/types';

// Empty arrays - no mock data in production
export const mockColleges: College[] = [];
export const mockAdmins: Admin[] = [];
export const mockFaculty: Faculty[] = [];
export const mockStudents: Student[] = [];
export const mockActivities: Activity[] = [];

// Helper functions return empty arrays in production
export const getStudentsByCollege = (collegeId: string): Student[] => {
  console.warn('Mock data functions should not be used in production. Use API calls instead.');
  return [];
};

export const getFacultyByCollege = (collegeId: string): Faculty[] => {
  console.warn('Mock data functions should not be used in production. Use API calls instead.');
  return [];
};

export const getStudentById = (id: string): Student | undefined => {
  console.warn('Mock data functions should not be used in production. Use API calls instead.');
  return undefined;
};