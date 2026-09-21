import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, FileText, Users, Building2, Briefcase, Loader2 } from 'lucide-react';
import { useStudentData } from '@/hooks/useStudentData';

const StudentProfile: React.FC = () => {
  const { studentData: student, loading } = useStudentData();

  const maskAadhar = (aadhar?: string) => {
    if (!aadhar) return 'N/A';
    return `XXXX-XXXX-${aadhar.slice(-4)}`;
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
      <div className="p-2 rounded-full bg-background">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Profile not found. Please contact your administrator.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="overflow-hidden border-none shadow-xl">
          <div className="h-32 gradient-primary w-full" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 md:items-end px-4">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                <AvatarImage src={student.avatar || student.profilePhoto} />
                <AvatarFallback className="text-2xl">{student.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-muted-foreground">{student.course} • Batch of 2024</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{student.collegeName}</Badge>
                  <Badge variant="outline">Roll: {student.rollNumber}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{student.email || 'N/A'}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{student.phone || 'N/A'}</span></div>
                <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{student.address || 'N/A'}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Personal Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Calendar} label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : 'N/A'} />
                <InfoItem icon={User} label="Gender" value={student.gender || 'N/A'} />
                <InfoItem icon={FileText} label="Aadhar" value={maskAadhar(student.aadharCard)} />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Records</CardTitle>
                <CardDescription>Previous qualifying examinations</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-primary font-bold uppercase mb-1">Class X ({student.tenthBoard || 'N/A'})</p>
                  <p className="text-3xl font-bold">{student.tenthMarks ? `${student.tenthMarks}%` : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                  <p className="text-xs text-secondary font-bold uppercase mb-1">Class XII ({student.twelfthBoard || 'N/A'})</p>
                  <p className="text-3xl font-bold">{student.twelfthMarks ? `${student.twelfthMarks}%` : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Enrollment Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={Building2} label="College" value={student.collegeName} />
                <InfoItem icon={Briefcase} label="Course" value={student.course} />
                <InfoItem icon={GraduationCap} label="Admission No" value={student.admissionNumber} />
                <InfoItem icon={FileText} label="Semester" value={student.semester} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Family Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={Users} label="Father's Name" value={student.fatherName} />
                <InfoItem icon={Users} label="Mother's Name" value={student.motherName} />
                <InfoItem icon={Phone} label="Guardian Contact" value={student.guardianContact} />
                <InfoItem icon={Briefcase} label="Guardian Occupation" value={student.guardianOccupation} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
