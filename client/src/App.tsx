import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Super Admin
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import ManageColleges from "./pages/super-admin/ManageColleges";
import ManageAdmins from "./pages/super-admin/ManageAdmins";
import ManageFacultySuperAdmin from "./pages/super-admin/ManageFaculty";
import ManageStudentsSuperAdmin from "./pages/super-admin/ManageStudents";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import BulkUpload from "./pages/admin/BulkUpload";

// Faculty
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyReports from "./pages/faculty/FacultyReports";
import MarksEntry from "./pages/faculty/MarksEntry";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentResults from "./pages/student/StudentResults";
import StudentProfile from "./pages/student/StudentProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Super Admin Routes - SUPER_ADMIN only */}
          <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/colleges" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ManageColleges /></ProtectedRoute>} />
          <Route path="/super-admin/admins" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ManageAdmins /></ProtectedRoute>} />
          <Route path="/super-admin/faculty" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ManageFacultySuperAdmin /></ProtectedRoute>} />
          <Route path="/super-admin/students" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><ManageStudentsSuperAdmin /></ProtectedRoute>} />

          {/* Admin Routes - ADMIN only */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageFacultySuperAdmin /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageStudentsSuperAdmin /></ProtectedRoute>} />
          <Route path="/admin/bulk-upload" element={<ProtectedRoute allowedRoles={['ADMIN']}><BulkUpload /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReports /></ProtectedRoute>} />

          {/* Faculty Routes - FACULTY only */}
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={['FACULTY']}><ManageStudentsSuperAdmin /></ProtectedRoute>} />
          <Route path="/faculty/data-entry" element={<ProtectedRoute allowedRoles={['FACULTY']}><MarksEntry /></ProtectedRoute>} />
          <Route path="/faculty/reports" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyReports /></ProtectedRoute>} />

          {/* Student Routes - STUDENT only */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResults /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
