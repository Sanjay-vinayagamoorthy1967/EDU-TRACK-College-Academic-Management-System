import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, GraduationCap, Trophy, Loader2 } from 'lucide-react';
import { downloadStudentReport } from '@/utils/reportGenerator';
import DownloadFormatModal from '@/components/DownloadFormatModal';
import { useToast } from '@/hooks/use-toast';
import { useStudentData } from '@/hooks/useStudentData';
import { DownloadFormat } from '@/types';

const StudentResults: React.FC = () => {
  const { toast } = useToast();
  const { studentData, loading } = useStudentData();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all' | null>(null);

  const publishedResults = studentData?.results?.filter((r: any) => r.isPublished) || [];
  const latestCGPA = publishedResults.length > 0 ? publishedResults[publishedResults.length - 1]?.cgpa?.toFixed(2) : 'N/A';
  const totalCredits = publishedResults.reduce((acc: number, r: any) =>
    acc + (r.subjects?.reduce((s: number, sub: any) => s + (sub.credits || 0), 0) || 0), 0);

  const handleDownloadClick = (semester: number | 'all') => {
    setSelectedSemester(semester);
    setDownloadModalOpen(true);
  };

  const handleFormatSelect = async (format: DownloadFormat) => {
    if (!selectedSemester || !studentData) return;
    setIsDownloading(true);
    try {
      await downloadStudentReport(studentData, format, selectedSemester);
      toast({ title: 'Download Started', description: `${format.toUpperCase()} report is being generated.` });
    } catch {
      toast({ title: 'Download Failed', description: 'Error generating report.', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
      setDownloadModalOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading results...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">My Results</h1>
            <p className="text-muted-foreground mt-1">View your academic performance across semesters</p>
          </div>
          <Button onClick={() => handleDownloadClick('all')} disabled={isDownloading || publishedResults.length === 0}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download All Semesters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Overall Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Current CGPA</span>
                <span className="text-2xl font-bold text-primary">{latestCGPA}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Completed Credits</span>
                <span className="text-2xl font-bold">{totalCredits}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Total Semesters</span>
                <span className="text-2xl font-bold">{publishedResults.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-secondary" />
                Academic History
              </CardTitle>
              <CardDescription>Detailed subject-wise marks distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {publishedResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No published results yet.</p>
              ) : (
                <Tabs defaultValue={`sem${publishedResults[0]?.semester}`} className="space-y-4">
                  <TabsList>
                    {publishedResults.map((r: any) => (
                      <TabsTrigger key={r.semester} value={`sem${r.semester}`}>Semester {r.semester}</TabsTrigger>
                    ))}
                  </TabsList>
                  {publishedResults.map((result: any) => (
                    <TabsContent key={result.semester} value={`sem${result.semester}`} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <Badge variant="secondary">SGPA: {result.sgpa}</Badge>
                          <Badge variant="outline">CGPA: {result.cgpa}</Badge>
                          <Badge variant={result.status === 'PASS' ? 'default' : 'destructive'}>{result.status}</Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadClick(result.semester)} disabled={isDownloading}>
                          {isDownloading && selectedSemester === result.semester
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Download className="mr-2 h-4 w-4" />}
                          Download Marksheet
                        </Button>
                      </div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Code</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead className="text-center">Int</TableHead>
                              <TableHead className="text-center">Ext</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                              <TableHead className="text-center">Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.subjects.map((subject: any) => (
                              <TableRow key={subject.code}>
                                <TableCell className="font-mono text-xs">{subject.code}</TableCell>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell className="text-center">{subject.internalMarks}</TableCell>
                                <TableCell className="text-center">{subject.externalMarks}</TableCell>
                                <TableCell className="text-center font-bold">{subject.totalMarks}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline">{subject.grade}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <DownloadFormatModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onSelect={handleFormatSelect}
        title={selectedSemester === 'all' ? 'Download Consolidated Report' : `Download Semester ${selectedSemester} Result`}
        description="Select your preferred format for the academic report."
      />
    </DashboardLayout>
  );
};

export default StudentResults;
