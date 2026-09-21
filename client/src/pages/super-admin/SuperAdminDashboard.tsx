import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  UserCog, 
  Users, 
  GraduationCap,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/services/api';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalColleges: 0, totalAdmins: 0, totalFaculty: 0, totalStudents: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [collegeDistribution, setCollegeDistribution] = useState<any[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, collegesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/colleges'),
        ]);

        const dash = dashRes.data;
        setStats({
          totalColleges: dash.totalColleges || 0,
          totalAdmins: dash.totalAdmins || 0,
          totalFaculty: dash.totalFaculty || 0,
          totalStudents: dash.totalStudents || 0,
        });

        const acts = dash.recentActivities || [];
        setActivities(acts);

        const colleges = collegesRes.data || [];
        setCollegeDistribution(colleges.map((c: any) => ({
          name: c.code,
          students: c.studentsCount || 0,
          faculty: c.facultyCount || 0,
        })));

        // Group by type for pie chart
        const typeMap: { [key: string]: number } = {};
        colleges.forEach((c: any) => {
          typeMap[c.type] = (typeMap[c.type] || 0) + (c.studentsCount || 0);
        });
        const colors = ['hsl(210,60%,25%)', 'hsl(175,50%,40%)', 'hsl(38,92%,50%)', 'hsl(142,70%,45%)', 'hsl(270,60%,50%)'];
        setTypeDistribution(Object.entries(typeMap).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] })));
      } catch (e) {
        // server down — keep zeros
      }
    };
    fetchData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'student_added': return <GraduationCap className="h-4 w-4" />;
      case 'result_published': return <TrendingUp className="h-4 w-4" />;
      case 'faculty_added': return <Users className="h-4 w-4" />;
      case 'admin_added': return <UserCog className="h-4 w-4" />;
      case 'college_added': return <Building2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'student_added': return 'bg-primary/10 text-primary';
      case 'result_published': return 'bg-success/10 text-success';
      case 'faculty_added': return 'bg-accent/10 text-accent';
      case 'admin_added': return 'bg-secondary/10 text-secondary';
      case 'college_added': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of the entire university system
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/super-admin/colleges">
                <Plus className="mr-2 h-4 w-4" />
                Add College
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Colleges"
            value={stats.totalColleges}
            icon={Building2}
            variant="primary"
            description="Active institutions"
          />
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={UserCog}
            description="College administrators"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Faculty"
            value={stats.totalFaculty}
            icon={Users}
            description="Teaching staff"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={GraduationCap}
            variant="secondary"
            description="Enrolled students"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading">College Distribution</CardTitle>
              <CardDescription>Students and faculty by college</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collegeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="students" fill="hsl(210, 60%, 25%)" radius={[4, 4, 0, 0]} name="Students" />
                    <Bar dataKey="faculty" fill="hsl(175, 50%, 40%)" radius={[4, 4, 0, 0]} name="Faculty" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading">Students by College Type</CardTitle>
              <CardDescription>Distribution across different streams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {typeDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
                <CardDescription>Latest actions across the system</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : activities.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.user?.name && `by ${activity.user.name} • `}{new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/super-admin/colleges">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Manage Colleges</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/super-admin/admins">
                    <UserCog className="h-5 w-5 text-secondary" />
                    <span className="text-sm">Manage Admins</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/super-admin/faculty">
                    <Users className="h-5 w-5 text-accent" />
                    <span className="text-sm">View Faculty</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                  <Link to="/super-admin/students">
                    <GraduationCap className="h-5 w-5 text-warning" />
                    <span className="text-sm">View Students</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
