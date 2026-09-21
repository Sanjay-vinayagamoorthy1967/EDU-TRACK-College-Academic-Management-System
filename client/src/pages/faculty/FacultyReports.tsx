import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { mockStudents as initialStudents } from '@/data/mockData';
import { Student } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Users, PieChart as PieChartIcon, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';

const FacultyReports: React.FC = () => {
    const { user } = useAuth();
    const [selectedSemester, setSelectedSemester] = useState<string>('all');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');

    const facultyCollegeId = user?.collegeId;

    const filteredStudents = useMemo(() => {
        return initialStudents.filter(s => {
            const matchesCollege = !facultyCollegeId || s.collegeId === facultyCollegeId;
            const matchesSemester = selectedSemester === 'all' || s.semester.toString() === selectedSemester;
            const matchesCourse = selectedCourse === 'all' || s.course === selectedCourse;
            return matchesCollege && matchesSemester && matchesCourse;
        });
    }, [selectedSemester, selectedCourse, facultyCollegeId]);

    // Section A: Attendance Data
    const attendanceData = useMemo(() => {
        const totalStudents = filteredStudents.length;
        if (totalStudents === 0) return { avg: 0, items: [], distribution: [] };

        const avg = filteredStudents.reduce((acc, s) => acc + (s.attendance || 0), 0) / totalStudents;

        // Distribution for Pie Chart
        const dist = [
            { name: 'Above 90%', value: filteredStudents.filter(s => (s.attendance || 0) >= 90).length, color: '#10b981' },
            { name: '75% - 90%', value: filteredStudents.filter(s => (s.attendance || 0) >= 75 && (s.attendance || 0) < 90).length, color: '#3b82f6' },
            { name: 'Below 75%', value: filteredStudents.filter(s => (s.attendance || 0) < 75).length, color: '#f43f5e' },
        ];

        // Top 5 and Bottom 5 for Bar Chart
        const sorted = [...filteredStudents].sort((a, b) => (b.attendance || 0) - (a.attendance || 0));
        const topBottom = [
            ...sorted.slice(0, 5).map(s => ({ name: s.name.split(' ')[0], attendance: s.attendance || 0, type: 'Top' })),
            ...sorted.slice(-5).map(s => ({ name: s.name.split(' ')[0], attendance: s.attendance || 0, type: 'Bottom' }))
        ];

        return { avg, distribution: dist, items: topBottom };
    }, [filteredStudents]);

    // Section B: Results Data
    const resultsData = useMemo(() => {
        const totalStudents = filteredStudents.length;
        if (totalStudents === 0) return { passRate: 0, passCount: 0, failCount: 0, avgGPA: 0, distribution: [] };

        let passCount = 0;
        let totalGPA = 0;
        let studentsWithResults = 0;

        filteredStudents.forEach(s => {
            const latest = s.results[s.results.length - 1];
            if (latest) {
                if (latest.status === 'pass') passCount++;
                totalGPA += latest.sgpa;
                studentsWithResults++;
            }
        });

        const passRate = studentsWithResults > 0 ? (passCount / studentsWithResults) * 100 : 0;
        const avgGPA = studentsWithResults > 0 ? totalGPA / studentsWithResults : 0;

        return {
            passRate,
            passCount,
            failCount: studentsWithResults - passCount,
            avgGPA,
            distribution: [
                { name: 'Passed', value: passCount, color: '#10b981' },
                { name: 'Failed', value: studentsWithResults - passCount, color: '#f43f5e' },
            ]
        };
    }, [filteredStudents]);

    const courses = Array.from(new Set(initialStudents.map(s => s.course)));
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">Faculty Reports</h1>
                        <p className="text-muted-foreground mt-1">Detailed analysis of student performance and attendance</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Semesters</SelectItem>
                                {semesters.map(s => <SelectItem key={s} value={s}>Semester {s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs defaultValue="attendance" className="space-y-6">
                    <TabsList className="grid grid-cols-2 w-full max-w-[400px]">
                        <TabsTrigger value="attendance" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Section A: Attendance
                        </TabsTrigger>
                        <TabsTrigger value="results" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Section B: Results
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance" className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Attendance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{attendanceData.avg.toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                        Overall class average
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Shortage Cases</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-destructive">
                                        {filteredStudents.filter(s => (s.attendance || 0) < 75).length}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Students below 75%</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Exemplary Cases</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        {filteredStudents.filter(s => (s.attendance || 0) >= 95).length}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Students above 95%</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5 text-primary" />
                                        Attendance Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={attendanceData.distribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {attendanceData.distribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <BarChart3 className="h-5 w-5 text-secondary" />
                                    Top & Bottom Attendance
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={attendanceData.items}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" fontSize={12} />
                                                <YAxis domain={[0, 100]} fontSize={12} />
                                                <RechartsTooltip />
                                                <Bar
                                                    dataKey="attendance"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Details</CardTitle>
                                <CardDescription>Individual student attendance records for selected filters</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left pb-2">Roll No</th>
                                                <th className="text-left pb-2">Name</th>
                                                <th className="text-center pb-2">Total Classes</th>
                                                <th className="text-center pb-2">Attended</th>
                                                <th className="text-center pb-2">Perc %</th>
                                                <th className="text-right pb-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(s => {
                                                const total = 45; // Mocking total classes
                                                const attended = Math.round((s.attendance || 0) * total / 100);
                                                const perc = s.attendance || 0;
                                                const statusColor = perc > 75 ? 'text-green-600' : perc > 65 ? 'text-yellow-600' : 'text-red-600';

                                                return (
                                                    <tr key={s.id} className="border-b last:border-0">
                                                        <td className="py-3 font-mono">{s.rollNumber}</td>
                                                        <td className="py-3 font-medium">{s.name}</td>
                                                        <td className="py-3 text-center">{total}</td>
                                                        <td className="py-3 text-center">{attended}</td>
                                                        <td className={`py-3 text-center font-bold ${statusColor}`}>{perc}%</td>
                                                        <td className="py-3 text-right">
                                                            <Badge variant={perc >= 75 ? 'secondary' : 'destructive'} className="text-[10px]">
                                                                {perc >= 75 ? 'Eligible' : 'Shortage'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-6 animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{resultsData.passRate.toFixed(1)}%</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                            {resultsData.passCount} Passed
                                        </Badge>
                                        <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
                                            {resultsData.failCount} Failed
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Average SGPA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{resultsData.avgGPA.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Class academic performance</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{filteredStudents.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Enrolled in selected filters</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Pass vs Fail Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={resultsData.distribution}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {resultsData.distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Academic Results Details</CardTitle>
                                <CardDescription>Detailed marks and performance for individual students</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left pb-2">Roll No</th>
                                                <th className="text-left pb-2">Name</th>
                                                <th className="text-center pb-2">Semester</th>
                                                <th className="text-center pb-2">Total Marks</th>
                                                <th className="text-center pb-2">Percentage</th>
                                                <th className="text-right pb-2">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(s => {
                                                const latest = s.results[s.results.length - 1];
                                                if (!latest) return null;
                                                const totalMarks = latest.subjects.reduce((sum, sub) => sum + sub.totalMarks, 0);
                                                const percentage = (totalMarks / (latest.subjects.length * 100)) * 100;

                                                return (
                                                    <tr key={s.id} className="border-b last:border-0">
                                                        <td className="py-3 font-mono">{s.rollNumber}</td>
                                                        <td className="py-3 font-medium">{s.name}</td>
                                                        <td className="py-3 text-center">{latest.semester}</td>
                                                        <td className="py-3 text-center">{totalMarks}</td>
                                                        <td className="py-3 text-center font-bold">{percentage.toFixed(1)}%</td>
                                                        <td className="py-3 text-right">
                                                            <Badge variant={latest.status === 'pass' ? 'secondary' : 'destructive'}>
                                                                {latest.status.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default FacultyReports;
