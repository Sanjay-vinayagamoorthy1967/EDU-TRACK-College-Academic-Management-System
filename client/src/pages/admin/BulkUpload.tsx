import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
    Upload,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
    History,
    ArrowRight,
    ArrowLeft,
    Check,
    FileSpreadsheet,
    AlertTriangle,
    Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { getStorageData, setStorageData } from '@/utils/storage';
import { mockStudents } from '@/data/mockData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type UploadStep = 'download' | 'upload' | 'validate' | 'submit';

interface UploadHistoryEntry {
    id: string;
    date: string;
    fileName: string;
    records: number;
    uploadedBy: string;
    status: 'success' | 'warning' | 'error';
}

const BulkUpload: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState<UploadStep>('download');
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [validationResults, setValidationResults] = useState<{
        errors: { row: number; msg: string; type: 'error' | 'warning' }[];
        stats: { total: number; valid: number; errors: number; warnings: number };
    }>({
        errors: [],
        stats: { total: 0, valid: 0, errors: 0, warnings: 0 }
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadHistory, setUploadHistory] = useState<UploadHistoryEntry[]>(() =>
        getStorageData('edutrack_upload_history', [])
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const students = getStorageData('edutrack_students', mockStudents);

    useEffect(() => {
        setStorageData('edutrack_upload_history', uploadHistory);
    }, [uploadHistory]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setCurrentStep('validate');
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            validateData(json);
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const validateData = (data: any[]) => {
        const errors: { row: number; msg: string; type: 'error' | 'warning' }[] = [];
        let validCount = 0;
        let errorCount = 0;
        let warningCount = 0;

        const processed = data.map((row, index) => {
            const rowErrors: string[] = [];
            const rowWarnings: string[] = [];

            const rollNo = row['Roll Number']?.toString().trim();
            const semester = parseInt(row['Semester']);
            const student = students.find(s => s.rollNumber === rollNo);

            if (!rollNo) rowErrors.push('Roll Number is missing');
            else if (!student) rowErrors.push(`Roll Number ${rollNo} not found`);

            if (isNaN(semester) || semester < 1 || semester > 8) {
                rowErrors.push('Invalid Semester');
            } else if (student && student.course !== row['Course']) {
                rowWarnings.push('Course mismatch with student record');
            }

            // Mark validation
            let hasMarkError = false;
            Object.keys(row).forEach(key => {
                if (key.toLowerCase().includes('marks')) {
                    const marks = parseInt(row[key]);
                    if (isNaN(marks) || marks < 0 || marks > 100) {
                        rowErrors.push(`${key} must be 0-100`);
                        hasMarkError = true;
                    }
                }
            });

            const isValid = rowErrors.length === 0;
            if (isValid) validCount++;
            else errorCount++;
            if (rowWarnings.length > 0) warningCount++;

            rowErrors.forEach(msg => errors.push({ row: index + 1, msg, type: 'error' }));
            rowWarnings.forEach(msg => errors.push({ row: index + 1, msg, type: 'warning' }));

            return {
                ...row,
                _id: index,
                _isValid: isValid,
                _errors: rowErrors,
                _warnings: rowWarnings
            };
        });

        setPreviewData(processed);
        setValidationResults({
            errors,
            stats: { total: data.length, valid: validCount, errors: errorCount, warnings: warningCount }
        });
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Roll Number': 'COE2024CS001',
                'Student Name': 'Rahul Mehta',
                'Course': 'B.Tech CSE',
                'Semester': 3,
                'Subject 1 Name': 'Data Structures',
                'Subject 1 Marks': 85,
                'Subject 2 Name': 'Algorithms',
                'Subject 2 Marks': 78,
                'Attendance %': 92,
                'Status': 'Pass'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Results Template');
        XLSX.writeFile(wb, 'EduTrack_Results_Template.xlsx');
    };

    const handleUpload = async () => {
        setUploading(true);
        for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(r => setTimeout(r, 150));
        }

        const validRecords = previewData.filter(d => d._isValid);

        // Update storage
        const updatedStudents = [...students];
        validRecords.forEach(row => {
            const studentIdx = updatedStudents.findIndex(s => s.rollNumber === row['Roll Number']);
            if (studentIdx > -1) {
                const s = updatedStudents[studentIdx];
                const sem = parseInt(row['Semester']);
                const results = [...s.results];

                // Construct subjects
                const subjects = [];
                for (let i = 1; i <= 8; i++) {
                    const name = row[`Subject ${i} Name`];
                    const marks = row[`Subject ${i} Marks`];
                    if (name && marks !== undefined) {
                        subjects.push({
                            code: `SUB${i}`,
                            name,
                            credits: 3,
                            internalMarks: parseInt(marks) * 0.4,
                            externalMarks: parseInt(marks) * 0.6,
                            totalMarks: parseInt(marks),
                            grade: 'A',
                            gradePoints: 9
                        });
                    }
                }

                const newResult = {
                    semester: sem,
                    subjects,
                    sgpa: 8.5,
                    cgpa: 8.5,
                    status: (row['Status']?.toLowerCase() === 'pass' ? 'pass' : 'fail') as 'pass' | 'fail' | 'pending',
                    isPublished: false,
                    lastUpdatedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
                    lastUpdatedBy: user?.name || 'Admin'
                };

                const resIdx = results.findIndex(r => r.semester === sem);
                if (resIdx > -1) results[resIdx] = newResult;
                else results.push(newResult);

                updatedStudents[studentIdx] = { ...s, results };
            }
        });

        setStorageData('edutrack_students', updatedStudents);

        // Add to history
        const newEntry: UploadHistoryEntry = {
            id: Math.random().toString(36).substr(2, 9),
            date: format(new Date(), 'yyyy-MM-dd HH:mm'),
            fileName: file?.name || 'Unknown',
            records: validRecords.length,
            uploadedBy: user?.name || 'Admin',
            status: validationResults.stats.errors > 0 ? 'warning' : 'success'
        };
        setUploadHistory([newEntry, ...uploadHistory]);

        setUploading(false);
        toast({
            title: 'Upload Complete',
            description: `Successfully uploaded ${validRecords.length} records.`,
        });
        setCurrentStep('download');
        setFile(null);
        setPreviewData([]);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground">Bulk Upload Student Results</h1>
                        <p className="text-muted-foreground mt-1">Upload semester results for multiple students using Excel/CSV</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex justify-between items-center max-w-4xl mx-auto mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
                    {[
                        { id: 'download', label: 'Download Template', icon: Download },
                        { id: 'upload', label: 'Upload File', icon: Upload },
                        { id: 'validate', label: 'Validate & Preview', icon: CheckCircle2 },
                        { id: 'submit', label: 'Review & Submit', icon: Check },
                    ].map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = ['download', 'upload', 'validate', 'submit'].indexOf(currentStep) > idx;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 bg-background",
                                    isActive ? "border-primary text-primary scale-110 shadow-lg" :
                                        isCompleted ? "border-green-500 bg-green-500 text-white" : "border-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </div>
                                <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {currentStep === 'download' && (
                            <Card className="animate-in fade-in slide-in-from-bottom-4 transition-all hover:shadow-md">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <FileSpreadsheet className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Step 1: Download Template</CardTitle>
                                            <CardDescription>Start by downloading our standardized Excel template</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
                                        <h4 className="text-sm font-medium">Required Columns:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['Roll Number', 'Semester', 'Course', 'Subject Marks', 'Status', 'Attendance %'].map(col => (
                                                <Badge key={col} variant="outline" className="bg-background">{col}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={downloadTemplate} className="w-full gradient-primary text-white h-12 text-lg">
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Excel Template
                                    </Button>
                                    <div className="flex justify-end">
                                        <Button variant="ghost" onClick={() => setCurrentStep('upload')}>
                                            Skip to Upload <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 'upload' && (
                            <Card className="animate-in fade-in slide-in-from-bottom-4 transition-all">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Step 2: Upload File</CardTitle>
                                            <CardDescription>Upload your completed Excel or CSV file</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div
                                        className="border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-muted/50 cursor-pointer transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="p-4 rounded-full bg-primary/10">
                                            <Upload className="h-10 w-10 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-medium">Drag and drop file here</p>
                                            <p className="text-sm text-muted-foreground">Supported formats: .xlsx, .xls, .csv (Max 10MB)</p>
                                        </div>
                                        <Button variant="outline" type="button">Browse Files</Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <Button variant="ghost" onClick={() => setCurrentStep('download')}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 'validate' && (
                            <Card className="animate-in fade-in slide-in-from-bottom-4 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <CheckCircle2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Step 3: Validate & Preview</CardTitle>
                                            <CardDescription>Review the data and any validation issues found</CardDescription>
                                        </div>
                                    </div>
                                    {file && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
                                            <FileText className="h-4 w-4" />
                                            {file.name}
                                            <X className="h-4 w-4 cursor-pointer hover:text-destructive" onClick={() => { setFile(null); setCurrentStep('upload'); }} />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Stats Summary */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 rounded-xl border bg-muted/20 text-center">
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</p>
                                            <p className="text-2xl font-bold">{validationResults.stats.total}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-center">
                                            <p className="text-xs text-green-600 uppercase font-bold tracking-wider">Valid</p>
                                            <p className="text-2xl font-bold text-green-700">{validationResults.stats.valid}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-center">
                                            <p className="text-xs text-red-600 uppercase font-bold tracking-wider">Errors</p>
                                            <p className="text-2xl font-bold text-red-700">{validationResults.stats.errors}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-center">
                                            <p className="text-xs text-yellow-600 uppercase font-bold tracking-wider">Warnings</p>
                                            <p className="text-2xl font-bold text-yellow-700">{validationResults.stats.warnings}</p>
                                        </div>
                                    </div>

                                    {/* Preview Table */}
                                    <div className="rounded-xl border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow>
                                                        <TableHead>Roll No</TableHead>
                                                        <TableHead>Sem</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Issues</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {previewData.slice(0, 5).map((row, i) => (
                                                        <TableRow key={i} className={cn(
                                                            !row._isValid ? "bg-red-50" : row._warnings.length > 0 ? "bg-yellow-50" : ""
                                                        )}>
                                                            <TableCell className="font-mono text-xs">{row['Roll Number']}</TableCell>
                                                            <TableCell className="text-center">{row['Semester']}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={row._isValid ? "secondary" : "destructive"}>
                                                                    {row._isValid ? "Valid" : "Invalid"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    {row._errors.map((e: string, idx: number) => (
                                                                        <p key={idx} className="text-[10px] text-red-600 flex items-center gap-1">
                                                                            <AlertCircle className="h-3 w-3" /> {e}
                                                                        </p>
                                                                    ))}
                                                                    {row._warnings.map((w: string, idx: number) => (
                                                                        <p key={idx} className="text-[10px] text-yellow-700 flex items-center gap-1">
                                                                            <AlertTriangle className="h-3 w-3" /> {w}
                                                                        </p>
                                                                    ))}
                                                                    {row._isValid && row._warnings.length === 0 && (
                                                                        <p className="text-[10px] text-green-600 flex items-center gap-1">
                                                                            <Check className="h-3 w-3" /> Ready
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {previewData.length > 5 && (
                                            <div className="p-3 bg-muted/30 text-center text-xs text-muted-foreground border-t">
                                                Previewing 5 of {previewData.length} records.
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="ghost" onClick={() => setCurrentStep('upload')}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Reset File
                                        </Button>
                                        <Button onClick={() => setCurrentStep('submit')} disabled={validationResults.stats.valid === 0}>
                                            Proceed to Submit <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentStep === 'submit' && (
                            <Card className="animate-in fade-in slide-in-from-bottom-4 transition-all">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Check className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Step 4: Review & Submit</CardTitle>
                                            <CardDescription>Final check before saving results to students records</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center gap-4 text-center">
                                        <CheckCircle2 className="h-12 w-12 text-primary animate-bounce-short" />
                                        <div>
                                            <h3 className="text-xl font-bold">Ready to Import {validationResults.stats.valid} Records</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {validationResults.stats.errors > 0 ?
                                                    `${validationResults.stats.errors} records with errors will be skipped.` :
                                                    "All records are valid and ready to be imported."}
                                            </p>
                                        </div>
                                        <div className="w-full max-w-md bg-background rounded-xl p-4 border space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>File:</span>
                                                <span className="font-mono font-medium">{file?.name}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Import Size:</span>
                                                <span className="font-medium">{validationResults.stats.valid} records</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Estimated Time:</span>
                                                <span className="font-medium">&lt; 1 minute</span>
                                            </div>
                                        </div>
                                    </div>

                                    {uploading ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Importing records...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-3" />
                                            <p className="text-center text-xs text-muted-foreground">Updating student results and generating audit logs...</p>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border">
                                            <Button variant="ghost" onClick={() => setCurrentStep('validate')}>
                                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Preview
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => { setFile(null); setCurrentStep('download'); }}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleUpload} className="gradient-primary text-white px-8">
                                                    Start Import
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* History Side Card */}
                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <History className="h-5 w-5 text-secondary" />
                                    Recent Uploads
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 px-0">
                                {uploadHistory.length > 0 ? (
                                    <div className="divide-y max-h-[600px] overflow-y-auto">
                                        {uploadHistory.map((item) => (
                                            <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors cursor-default">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-sm font-medium truncate max-w-[150px]">{item.fileName}</p>
                                                    <Badge variant={item.status === 'success' ? 'secondary' : 'outline'} className="text-[10px]">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                                    <span>{item.date}</span>
                                                    <span className="font-semibold text-primary">{item.records} records</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-2">By: {item.uploadedBy}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center space-y-2">
                                        <div className="p-3 rounded-full bg-muted w-fit mx-auto">
                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No upload history found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Search History */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search logs..." className="pl-9 h-9 text-sm" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BulkUpload;
