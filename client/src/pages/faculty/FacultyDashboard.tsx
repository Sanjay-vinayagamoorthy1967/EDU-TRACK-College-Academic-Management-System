import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, FileBarChart, Plus, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, avgAttendance: 0, passRate: 0 });

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats({
        total: res.data.totalStudents || 0,
        avgAttendance: 0,
        passRate: 0,
      });
    }).catch(() => {});
  }, []);

  const attendanceDist = [
    { name: 'Above 90%', value: 0, color: '#10b981' },
    { name: '75-90%', value: 0, color: '#3b82f6' },
    { name: 'Below 75%', value: 0, color: '#f43f5e' },
  ];

  const performanceData = [
    { name: 'Sem 1', internal: 0, external: 0 },
    { name: 'Sem 2', internal: 0, external: 0 },
    { name: 'Sem 3', internal: 0, external: 0 },
    { name: 'Sem 4', internal: 0, external: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Welcome, {user?.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-1">{user?.collegeName} • Faculty Portal</p>
          </div>
          <Button className="gradient-primary text-white" asChild>
            <Link to="/faculty/students"><Plus className="mr-2 h-4 w-4" /> Add Student</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats.total} icon={Users} variant="primary" />
          <StatCard title="Avg. Attendance" value={`${stats.avgAttendance.toFixed(1)}%`} icon={TrendingUp} variant="secondary" />
          <StatCard title="Pass Rate" value={`${stats.passRate.toFixed(1)}%`} icon={FileBarChart} variant="accent" />
          <StatCard title="New Enrollments" value="—" icon={Plus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
              <CardDescription>Breakdown of student attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceDist} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {attendanceDist.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal vs External Performance</CardTitle>
              <CardDescription>Comparison of assessment types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" /><YAxis />
                    <RechartsTooltip /><Legend />
                    <Bar dataKey="internal" name="Internal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="external" name="External" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/faculty/students"><Users className="h-5 w-5 text-primary" /><span>Manage Students</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/faculty/reports"><FileBarChart className="h-5 w-5 text-secondary" /><span>Academic Reports</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/faculty/data-entry"><TrendingUp className="h-5 w-5 text-accent" /><span>Attendance Entry</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/faculty/data-entry"><GraduationCap className="h-5 w-5 text-orange-500" /><span>Marks Entry</span></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
