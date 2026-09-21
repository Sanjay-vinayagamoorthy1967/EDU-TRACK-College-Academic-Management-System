import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Student, SemesterResult, SubjectResult } from '@/types';
import { studentsAPI } from '@/services/api';
import DownloadFormatModal from '@/components/DownloadFormatModal';
import { downloadStudentReport, downloadBulkReports } from '@/utils/reportGenerator';
import { Search, Download, FileText, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getStorageData, setStorageData } from '@/utils/storage';
import { useEffect } from 'react';
import BulkUploadDialog from '@/components/admin/BulkUploadDialog';
import ResultEditModal from '@/components/admin/ResultEditModal';
import {
    Plus,
    Upload,
    Trash2,
    Check,
    X as CloseIcon,
    History,
    Eye,
    EyeOff,
    MoreVertical,
    CheckSquare,
    Square
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

const AdminReports: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        studentsAPI.getAll().then(res => {
            const raw = res.data || [];
            setStudents(raw.map((s: any) => ({
                ...s,
                name: s.user?.name || s.name || '',
                email: s.user?.email || s.email || '',
                phone: s.user?.phone || s.phone || '',
                collegeName: s.college?.name || s.collegeName || '',
                results: (s.results || []).map((r: any) => ({ ...r, subjects: r.subjects || [] })),
            })));
        }).catch(() => {});
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [selectedSemester, setSelectedSemester] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Modals state
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [bulkDownloadOpen, setBulkDownloadOpen] = useState(false);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedResult, setSelectedResult] = useState<SemesterResult | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]); // rollNumber-semester



    const filteredResults = students.flatMap(student =>
        student.results.map(result => ({ student, result }))
    ).filter(({ student, result }) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
        const matchesSemester = selectedSemester === 'all' || result.semester.toString() === selectedSemester;
        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'published' ? result.isPublished :
                selectedStatus === 'draft' ? !result.isPublished :
                    result.status === selectedStatus);
        const matchesUserCollege = !user?.collegeId || student.collegeId === user?.collegeId;

        return matchesSearch && matchesCourse && matchesSemester && matchesStatus && matchesUserCollege;
    });

    const stats = {
        total: filteredResults.length,
        published: filteredResults.filter(r => r.result.isPublished).length,
        draft: filteredResults.filter(r => !r.result.isPublished).length,
        passRate: filteredResults.length > 0
            ? (filteredResults.filter(r => r.result.status === 'pass').length / filteredResults.length * 100).toFixed(1)
            : '0',
        avgGpa: filteredResults.length > 0
            ? (filteredResults.reduce((s, r) => s + r.result.sgpa, 0) / filteredResults.length).toFixed(2)
            : '0.00'
    };

    const handleDownload = (student: Student) => {
        setSelectedStudent(student);
        setDownloadModalOpen(true);
    };

    const handleDownloadConfirm = (format: 'pdf' | 'excel') => {
        if (selectedStudent) {
            downloadStudentReport(selectedStudent, format);
            toast({
                title: 'Download Started',
                description: `Report for ${selectedStudent.name} is being downloaded as ${format.toUpperCase()}.`,
            });
        }
        setSelectedStudent(null);
    };

    const handleBulkDownload = (format: 'pdf' | 'excel') => {
        const distinctStudents = Array.from(new Set(filteredResults.map(fr => fr.student)));
        downloadBulkReports(distinctStudents, format);
        toast({
            title: 'Bulk Download Started',
            description: `Reports for ${distinctStudents.length} students are being downloaded.`,
        });
    };

    const handleTogglePublish = (studentRoll: string, semester: number, publish: boolean) => {
        const updatedStudents = students.map(s => {
            if (s.rollNumber === studentRoll) {
                const results = s.results.map(r => {
                    if (r.semester === semester) {
                        return {
                            ...r,
                            isPublished: publish,
                            publishedAt: publish ? format(new Date(), 'yyyy-MM-dd') : r.publishedAt
                        };
                    }
                    return r;
                });
                return { ...s, results };
            }
            return s;
        });
        setStudents(updatedStudents);
        toast({
            title: publish ? 'Result Published' : 'Result Unpublished',
            description: `Result for Sem ${semester} is now ${publish ? 'visible' : 'hidden'} for the student.`,
        });
    };

    const handleSaveResult = (semester: number, subjects: SubjectResult[]) => {
        if (!selectedStudent) return;

        const totalMarks = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
        const avgPercentage = subjects.length > 0 ? totalMarks / subjects.length : 0;
        const status = subjects.every(s => s.grade !== 'F') ? 'pass' : 'fail';
        const sgpa = avgPercentage / 10; // Simple mock conversion

        const updatedStudents = students.map(s => {
            if (s.id === selectedStudent.id) {
                // Progression Validation
                if (semester > 1) {
                    const prevSemExists = s.results.some(r => r.semester === semester - 1);
                    if (!prevSemExists) {
                        toast({
                            title: 'Progression Error',
                            description: `Cannot add Semester ${semester} result as Semester ${semester - 1} result is missing.`,
                            variant: 'destructive',
                        });
                        return s;
                    }
                }

                const results = [...s.results];
                const index = results.findIndex(r => r.semester === semester);

                const newResult: SemesterResult = {
                    semester,
                    subjects,
                    sgpa,
                    cgpa: sgpa, // Should calculate based on history
                    status: status as any,
                    isPublished: selectedResult?.isPublished || false,
                    lastUpdatedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
                    lastUpdatedBy: user?.name || 'Admin',
                    editHistory: [
                        ...(selectedResult?.editHistory || []),
                        {
                            updatedBy: user?.name || 'Admin',
                            updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
                            changes: selectedResult ? 'Manually edited result' : 'Added new result'
                        }
                    ]
                };

                if (index > -1) {
                    results[index] = newResult;
                } else {
                    results.push(newResult);
                }
                return { ...s, results };
            }
            return s;
        });

        setStudents(updatedStudents);
        toast({
            title: 'Result Saved',
            description: `Academic result for Semester ${semester} has been updated.`,
        });
    };

    const handleBulkPublish = (publish: boolean) => {
        const updatedStudents = students.map(s => {
            const results = s.results.map(r => {
                const rowKey = `${s.rollNumber}-${r.semester}`;
                if (selectedRows.includes(rowKey)) {
                    return {
                        ...r,
                        isPublished: publish,
                        publishedAt: publish ? format(new Date(), 'yyyy-MM-dd') : r.publishedAt
                    };
                }
                return r;
            });
            return { ...s, results };
        });
        setStudents(updatedStudents);
        setSelectedRows([]);
        toast({
            title: `Bulk ${publish ? 'Publish' : 'Unpublish'} Complete`,
            description: `Updated status for ${selectedRows.length} records.`,
        });
    };

    const handleDeleteResult = () => {
        if (!selectedStudent || !selectedResult) return;
        const updatedStudents = students.map(s => {
            if (s.id === selectedStudent.id) {
                return {
                    ...s,
                    results: s.results.filter(r => r.semester !== selectedResult.semester)
                };
            }
            return s;
        });
        setStudents(updatedStudents);
        setDeleteAlertOpen(false);
        toast({
            title: 'Result Deleted',
            description: `Semester ${selectedResult.semester} result for ${selectedStudent.name} has been removed.`,
        });
    };

    const handleBulkDelete = () => {
        const updatedStudents = students.map(s => {
            const results = s.results.filter(r => {
                const rowKey = `${s.rollNumber}-${r.semester}`;
                return !selectedRows.includes(rowKey);
            });
            return { ...s, results };
        });
        setStudents(updatedStudents);
        setSelectedRows([]);
        setDeleteAlertOpen(false);
        toast({
            title: 'Bulk Delete Complete',
            description: `Successfully removed ${selectedRows.length} result records.`,
        });
    };

    const handleBulkUploadSuccess = (data: any[]) => {
        // data contains roll numbers and semester results
        // This is a complex mapping, we'll implement a robust version
        const updatedStudents = [...students];
        data.forEach(row => {
            const rollNo = row['Roll Number'];
            const sem = parseInt(row['Semester']);
            const studentIdx = updatedStudents.findIndex(s => s.rollNumber === rollNo);

            if (studentIdx > -1) {
                const s = updatedStudents[studentIdx];
                const results = [...s.results];
                const resIdx = results.findIndex(r => r.semester === sem);

                // Construct subjects from row keys
                const subjects: SubjectResult[] = [];
                for (let i = 1; i <= 8; i++) {
                    const name = row[`Subject ${i} Name`];
                    const marks = row[`Subject ${i} Marks`];
                    if (name && marks !== undefined) {
                        const total = parseInt(marks);
                        subjects.push({
                            code: `SUB${i}`,
                            name,
                            credits: 3,
                            internalMarks: total / 2, // Mock split
                            externalMarks: total / 2,
                            totalMarks: total,
                            grade: row['Grade'] || 'A',
                            gradePoints: 9
                        });
                    }
                }

                const newResult: SemesterResult = {
                    semester: sem,
                    subjects,
                    sgpa: parseFloat(row['GPA']) || (parseInt(row['Total Marks']) / 10 / (subjects.length || 1)),
                    cgpa: 8.5,
                    status: (row['Status']?.toLowerCase() === 'pass' ? 'pass' : 'fail') as any,
                    isPublished: false, // Default to draft
                    lastUpdatedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
                    lastUpdatedBy: user?.name || 'Admin'
                };

                if (resIdx > -1) {
                    results[resIdx] = newResult;
                } else {
                    results.push(newResult);
                }
                updatedStudents[studentIdx] = { ...s, results };
            }
        });

        setStudents(updatedStudents);
        setBulkUploadOpen(false);
    };

    const courses = Array.from(new Set(students.map(s => s.course)));
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-4 flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Results</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="pt-4 flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Published</p>
                            <p className="text-2xl font-bold text-green-700">{stats.published}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="pt-4 flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Drafts</p>
                            <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="pt-4 flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Pass %</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.passRate}%</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardContent className="pt-4 flex flex-col items-center text-center">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Avg SGPA</p>
                            <p className="text-2xl font-bold text-purple-700">{stats.avgGpa}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">Student Results Management</h1>
                        <p className="text-muted-foreground mt-1">Manage, edit, and publish student academic performance from here.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setBulkDownloadOpen(true)} className="gradient-primary text-white shadow-lg">
                            <Download className="mr-2 h-4 w-4" />
                            Generate Reports
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search student..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course} value={course}>{course}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Semesters</SelectItem>
                                    {semesters.map((sem) => (
                                        <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft (Unpublished)</SelectItem>
                                    <SelectItem value="pass">Pass Only</SelectItem>
                                    <SelectItem value="fail">Fail Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-heading">Manage Results</CardTitle>
                            <CardDescription>
                                {filteredResults.length} records found
                            </CardDescription>
                        </div>
                        {selectedRows.length > 0 && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                <Button size="sm" variant="outline" onClick={() => handleBulkPublish(true)}>
                                    <Eye className="mr-2 h-4 w-4" /> Publish
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleBulkPublish(false)}>
                                    <EyeOff className="mr-2 h-4 w-4" /> Draft
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => setDeleteAlertOpen(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={selectedRows.length === filteredResults.length && filteredResults.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSelectedRows(filteredResults.map(fr => `${fr.student.rollNumber}-${fr.result.semester}`));
                                                    else setSelectedRows([]);
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Roll No</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead className="text-center">Sem</TableHead>
                                        <TableHead className="text-center">GPA</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-center">Visibility</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResults.map(({ student, result }) => {
                                        const rowKey = `${student.rollNumber}-${result.semester}`;
                                        return (
                                            <TableRow key={rowKey}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedRows.includes(rowKey)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedRows([...selectedRows, rowKey]);
                                                            else setSelectedRows(selectedRows.filter(r => r !== rowKey));
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{student.rollNumber}</TableCell>
                                                <TableCell className="font-medium text-sm">{student.name}</TableCell>
                                                <TableCell className="text-center">{result.semester}</TableCell>
                                                <TableCell className="text-center font-mono">{result.sgpa.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={result.status === 'pass' ? 'secondary' : 'destructive'}
                                                        className="capitalize text-[10px]"
                                                    >
                                                        {result.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={result.isPublished ? 'outline' : 'default'} className="text-[10px] gap-1">
                                                        {result.isPublished ? <Check className="h-3 w-3 text-green-500" /> : <CloseIcon className="h-3 w-3 text-red-500" />}
                                                        {result.isPublished ? 'Published' : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedStudent(student);
                                                                setSelectedResult(result);
                                                                setEditModalOpen(true);
                                                            }}>
                                                                <FileText className="mr-2 h-4 w-4" /> Edit Result
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleTogglePublish(student.rollNumber, result.semester, !result.isPublished)}>
                                                                {result.isPublished ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                                                {result.isPublished ? 'Set as Draft' : 'Publish Result'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDownload(student)}>
                                                                <Download className="mr-2 h-4 w-4" /> Export Report
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => {
                                                                    setSelectedStudent(student);
                                                                    setSelectedResult(result);
                                                                    setDeleteAlertOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modals & Dialogs */}
            <ResultEditModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                student={selectedStudent}
                resultToEdit={selectedResult}
                onSave={handleSaveResult}
            />

            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the Semester {selectedResult?.semester} result for {selectedStudent?.name}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={selectedRows.length > 0 ? handleBulkDelete : handleDeleteResult} className="bg-destructive text-destructive-foreground">
                            Delete {selectedRows.length > 0 ? `${selectedRows.length} Results` : 'Result'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DownloadFormatModal
                open={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                onSelect={handleDownloadConfirm}
                title={`Download Report for ${selectedStudent?.name}`}
            />

            <DownloadFormatModal
                open={bulkDownloadOpen}
                onClose={() => setBulkDownloadOpen(false)}
                onSelect={handleBulkDownload}
                title="Bulk Export Reports"
                description={`Export reports for ${filteredResults.length} selected records.`}
            />
        </DashboardLayout>
    );
};

export default AdminReports;
