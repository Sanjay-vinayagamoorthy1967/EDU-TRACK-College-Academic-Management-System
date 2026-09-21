import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DownloadFormatModal from '@/components/DownloadFormatModal';
import { downloadStudentReport } from '@/utils/reportGenerator';
import { GraduationCap, Download, TrendingUp, Award, BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudentData } from '@/hooks/useStudentData';

const StudentDashboard: React.FC = () => {
  const { toast } = useToast();
  const { studentData, loading } = useStudentData();
  const [downloadOpen, setDownloadOpen] = useState(false);

  const latestResult = studentData?.results?.length > 0
    ? studentData.results[studentData.results.length - 1]
    : null;

  const handleDownload = (format: 'pdf' | 'excel') => {
    if (studentData) {
      downloadStudentReport(studentData, format);
      toast({ title: 'Download Started', description: `Your report is being downloaded as ${format.toUpperCase()}.` });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Welcome, {(studentData?.name || 'Student').split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {studentData?.course || 'N/A'} • Semester {studentData?.semester ?? 'N/A'}
            </p>
          </div>
          <Button onClick={() => setDownloadOpen(true)} disabled={!studentData}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Current CGPA" value={latestResult?.cgpa?.toFixed(2) ?? 'N/A'} icon={Award} variant="primary" />
          <StatCard title="Current SGPA" value={latestResult?.sgpa?.toFixed(2) ?? 'N/A'} icon={TrendingUp} variant="secondary" />
          <StatCard title="Semester" value={studentData?.semester ?? 'N/A'} icon={BookOpen} />
          <StatCard title="Subjects" value={latestResult?.subjects?.length ?? 0} icon={GraduationCap} />
        </div>

        {latestResult ? (
          <Card>
            <CardHeader>
              <CardTitle>Semester {latestResult.semester} Results</CardTitle>
              <CardDescription>
                {latestResult.publishedAt
                  ? `Published on ${new Date(latestResult.publishedAt).toLocaleDateString('en-IN')}`
                  : 'Result available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Subject</th>
                      <th className="text-center py-3 px-2">Credits</th>
                      <th className="text-center py-3 px-2">Internal</th>
                      <th className="text-center py-3 px-2">External</th>
                      <th className="text-center py-3 px-2">Total</th>
                      <th className="text-center py-3 px-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestResult.subjects.map((subject: any) => (
                      <tr key={subject.code} className="border-b">
                        <td className="py-3 px-2">
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">{subject.code}</p>
                        </td>
                        <td className="text-center py-3 px-2">{subject.credits}</td>
                        <td className="text-center py-3 px-2">{subject.internalMarks}</td>
                        <td className="text-center py-3 px-2">{subject.externalMarks}</td>
                        <td className="text-center py-3 px-2 font-medium">{subject.totalMarks}</td>
                        <td className="text-center py-3 px-2">
                          <Badge variant="secondary">{subject.grade}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No results published yet.
            </CardContent>
          </Card>
        )}
      </div>
      <DownloadFormatModal open={downloadOpen} onClose={() => setDownloadOpen(false)} onSelect={handleDownload} />
    </DashboardLayout>
  );
};

export default StudentDashboard;
