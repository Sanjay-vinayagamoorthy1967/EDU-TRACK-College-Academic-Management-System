export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  collegeId?: string;
  collegeName?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  studentsCount: number;
  facultyCount: number;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  collegeId: string;
  collegeName: string;
  course: string;
  semester: number;
  rollNumber: string;
  admissionNumber: string;
  fatherName: string;
  motherName: string;
  guardianContact: string;
  guardianOccupation: string;
  tenthMarks: number;
  tenthBoard: string;
  twelfthMarks: number;
  twelfthBoard: string;
  attendance: number;
  profilePhoto?: string;
  aadharCard?: string;
  panCard?: string;
  tenthMarksheet?: string;
  twelfthMarksheet?: string;
  transferCertificate?: string;
  communityCertificate?: string;
  certificates?: string[];
  results: SemesterResult[];
  createdAt: string;
}

export interface SemesterResult {
  semester: number;
  subjects: SubjectResult[];
  sgpa: number;
  cgpa: number;
  status: 'PASS' | 'FAIL' | 'PENDING';
  publishedAt?: string;
  isPublished: boolean;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  editHistory?: ResultHistoryEntry[];
}

export interface ResultHistoryEntry {
  updatedBy: string;
  updatedAt: string;
  changes: string;
}

export interface SubjectResult {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  collegeId: string;
  collegeName: string;
  qualification: string;
  experience: number;
  avatar?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  collegeId: string;
  collegeName: string;
  avatar?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalColleges?: number;
  totalAdmins?: number;
  totalFaculty: number;
  totalStudents: number;
  recentActivities?: Activity[];
  performanceData?: PerformanceData[];
}

export interface Activity {
  id: string;
  type: 'student_added' | 'result_published' | 'faculty_added' | 'admin_added' | 'college_added';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface PerformanceData {
  name: string;
  value: number;
}

export type DownloadFormat = 'pdf' | 'excel';
