import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Student, College } from '@/types';
import DownloadFormatModal from '@/components/DownloadFormatModal';
import AddStudentDialog from '@/components/AddStudentDialog';
import { downloadStudentReport, downloadBulkReports } from '@/utils/reportGenerator';
import StudentPreview from '@/components/StudentPreview';
import { Search, Download, Plus, Building2, FileText, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, collegesAPI } from '@/services/api';

const ManageStudentsSuperAdmin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [bulkDownloadOpen, setBulkDownloadOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const userCollegeId = user?.role === 'SUPER_ADMIN' ? null : user?.collegeId;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, collegesRes] = await Promise.all([
        studentsAPI.getAll(),
        collegesAPI.getAll(),
      ]);
      // normalize API response to match Student type
      const raw = studentsRes.data || [];
      const normalized = raw.map((s: any) => ({
        ...s,
        name: s.user?.name || s.name || '',
        email: s.user?.email || s.email || '',
        phone: s.user?.phone || s.phone || '',
        profilePhoto: s.user?.avatar || s.profilePhoto || '',
        collegeName: s.college?.name || s.collegeName || '',
        results: s.results || [],
      }));
      setStudents(normalized);
      setColleges(collegesRes.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = selectedCollege === 'all' || student.collegeId === selectedCollege;
    const matchesUserCollege = !userCollegeId || student.collegeId === userCollegeId;
    return matchesSearch && matchesCollege && matchesUserCollege;
  });

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleDownload = (student: Student) => { setSelectedStudent(student); setDownloadModalOpen(true); };
  const handlePreview = (student: Student) => { setSelectedStudent(student); setPreviewOpen(true); };

  const handleDownloadConfirm = (format: 'pdf' | 'excel') => {
    if (selectedStudent) {
      downloadStudentReport(selectedStudent, format);
      toast({ title: 'Download Started', description: `Report for ${selectedStudent.name} downloading as ${format.toUpperCase()}.` });
    }
    setSelectedStudent(null);
  };

  const handleBulkDownload = (format: 'pdf' | 'excel') => {
    downloadBulkReports(filteredStudents, format);
    toast({ title: 'Bulk Download Started', description: `Reports for ${filteredStudents.length} students downloading.` });
  };

  const handleAddStudent = async () => {
    await loadData();
  };

  const getLatestCGPA = (student: Student) => {
    const latestResult = student.results?.[student.results.length - 1];
    return latestResult?.cgpa?.toFixed(2) || 'N/A';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading students...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">All Students</h1>
            <p className="text-muted-foreground mt-1">View and manage students across all colleges</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddStudentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
            <Button onClick={() => setBulkDownloadOpen(true)} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download All
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Filter by college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Students List</CardTitle>
            <CardDescription>{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead className="text-center">Semester</TableHead>
                    <TableHead className="text-center">CGPA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.profilePhoto} alt={student.name} />
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{student.rollNumber}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-sm">{student.collegeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{student.semester}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">{getLatestCGPA(student)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(student)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleDownload(student)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DownloadFormatModal open={downloadModalOpen} onClose={() => setDownloadModalOpen(false)} onSelect={handleDownloadConfirm} title={`Download Report for ${selectedStudent?.name}`} />
      <DownloadFormatModal open={bulkDownloadOpen} onClose={() => setBulkDownloadOpen(false)} onSelect={handleBulkDownload} title="Download All Reports" description={`Download reports for ${filteredStudents.length} students`} />
      <AddStudentDialog open={addStudentOpen} onClose={() => setAddStudentOpen(false)} onAdd={handleAddStudent} defaultCollegeId={userCollegeId || undefined} />
      <StudentPreview student={selectedStudent} open={previewOpen} onOpenChange={setPreviewOpen} />
    </DashboardLayout>
  );
};

export default ManageStudentsSuperAdmin;
