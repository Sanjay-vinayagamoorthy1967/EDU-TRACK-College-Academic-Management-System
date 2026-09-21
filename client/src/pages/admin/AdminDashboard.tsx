import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Upload, FileBarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalFaculty: 0, totalStudents: 0 });

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats({
        totalFaculty: res.data.totalFaculty || 0,
        totalStudents: res.data.totalStudents || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Welcome, {user?.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">{user?.collegeName} Dashboard</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Faculty" value={stats.totalFaculty} icon={Users} variant="primary" />
          <StatCard title="Total Students" value={stats.totalStudents} icon={GraduationCap} variant="secondary" />
          <StatCard title="Results Published" value="—" icon={FileBarChart} />
          <StatCard title="Pending Uploads" value="—" icon={Upload} />
        </div>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/admin/faculty"><Users className="h-5 w-5" /><span>Manage Faculty</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/admin/students"><GraduationCap className="h-5 w-5" /><span>Manage Students</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/admin/bulk-upload"><Upload className="h-5 w-5" /><span>Bulk Upload</span></Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/admin/reports"><FileBarChart className="h-5 w-5" /><span>Reports</span></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
