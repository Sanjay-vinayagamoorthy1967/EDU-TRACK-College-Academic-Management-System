import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { studentsAPI } from '@/services/api';
import { Save, Search, UserCheck, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

const MarksEntry: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [selectedSemester, setSelectedSemester] = useState<string>('1');
    const [entryType, setEntryType] = useState<'marks' | 'attendance'>('marks');

    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        studentsAPI.getAll().then(res => {
            const raw = res.data || [];
            const normalized = raw.map((s: any) => ({
                ...s,
                name: s.user?.name || s.name || '',
                email: s.user?.email || s.email || '',
                collegeName: s.college?.name || s.collegeName || '',
                results: s.results || [],
            })).filter((s: any) => s.collegeId === user?.collegeId);
            setStudents(normalized);
        }).catch(() => {});
    }, [user?.collegeId]);

    const [tempValues, setTempValues] = useState<Record<string, string>>({});

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCourse = selectedCourse === 'all' || s.course === selectedCourse;
            const matchesSemester = s.semester.toString() === selectedSemester;
            return matchesSearch && matchesCourse && matchesSemester;
        });
    }, [students, searchTerm, selectedCourse, selectedSemester]);

    const handleValueChange = (rollNumber: string, value: string) => {
        if (value === '') {
            setTempValues(prev => ({ ...prev, [rollNumber]: value }));
            return;
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
            toast({
                title: "Invalid Input",
                description: "Value must be between 0 and 100",
                variant: "destructive"
            });
            return;
        }
        setTempValues(prev => ({ ...prev, [rollNumber]: value }));
    };

    const handleSave = () => {
        const updatedStudents = students.map(s => {
            const newVal = tempValues[s.rollNumber];
            if (newVal !== undefined) {
                if (entryType === 'marks') {
                    // Update latest result or add new one
                    const results = [...s.results];
                    const semesterResult = results.find(r => r.semester === parseInt(selectedSemester));
                    if (semesterResult) {
                        // In a real app we'd update specific subjects, 
                        // here we just mock the SGPA based on the entered avg marks
                        semesterResult.sgpa = parseFloat(newVal) / 10;
                    }
                    return { ...s, results };
                } else {
                    return { ...s, attendance: parseInt(newVal) };
                }
            }
            return s;
        });

        setStudents(updatedStudents);
        setTempValues({});
        toast({
            title: "Success",
            description: `${entryType === 'marks' ? 'Marks' : 'Attendance'} updated successfully.`,
        });
    };

    const courses = Array.from(new Set(students.map((s: any) => s.course)));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">Data Entry</h1>
                        <p className="text-muted-foreground mt-1">Enter marks and attendance for your students</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={entryType === 'marks' ? 'default' : 'outline'}
                            onClick={() => { setEntryType('marks'); setTempValues({}); }}
                        >
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Marks Entry
                        </Button>
                        <Button
                            variant={entryType === 'attendance' ? 'default' : 'outline'}
                            onClick={() => { setEntryType('attendance'); setTempValues({}); }}
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Attendance
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-md">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or roll number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{entryType === 'marks' ? 'Marks Entry' : 'Attendance Update'}</CardTitle>
                            <CardDescription>
                                Semester {selectedSemester} • {selectedCourse === 'all' ? 'All Courses' : selectedCourse}
                            </CardDescription>
                        </div>
                        <Button onClick={handleSave} className="gradient-primary text-white">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Roll Number</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="w-[150px] text-right pr-6">
                                        {entryType === 'marks' ? 'Obtained Marks (Max 100)' : 'Attendance %'}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="pl-6 font-medium text-xs">
                                                {student.rollNumber}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {student.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal text-[10px]">
                                                    {student.course}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder={entryType === 'marks' ? "Marks" : "%"}
                                                    className="w-20 ml-auto text-right"
                                                    value={tempValues[student.rollNumber] ?? (entryType === 'marks' ? '' : student.attendance.toString())}
                                                    onChange={(e) => handleValueChange(student.rollNumber, e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No students found matching the criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default MarksEntry;
