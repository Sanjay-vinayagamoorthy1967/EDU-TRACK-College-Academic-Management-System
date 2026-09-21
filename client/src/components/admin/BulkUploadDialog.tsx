import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Upload,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface BulkUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onUploadSuccess: (results: any[]) => void;
    existingStudents: { rollNumber: string, name: string }[];
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
    open,
    onClose,
    onUploadSuccess,
    existingStudents
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [errors, setErrors] = useState<{ row: number; msg: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndProcessFile(selectedFile);
        }
    };

    const validateAndProcessFile = (selectedFile: File) => {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
            toast({
                title: 'Invalid file format',
                description: 'Please upload an Excel or CSV file.',
                variant: 'destructive',
            });
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            processJsonData(json);
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const processJsonData = (data: any[]) => {
        const newErrors: { row: number; msg: string }[] = [];
        const processed = data.map((row, index) => {
            const rollNo = row['Roll Number']?.toString().trim();
            const semester = parseInt(row['Semester']);
            const studentExists = existingStudents.some(s => s.rollNumber === rollNo);

            if (!rollNo) newErrors.push({ row: index + 1, msg: 'Roll Number is missing' });
            else if (!studentExists) newErrors.push({ row: index + 1, msg: `Roll Number ${rollNo} not found in system` });

            if (isNaN(semester) || semester < 1 || semester > 8) {
                newErrors.push({ row: index + 1, msg: 'Invalid Semester (should be 1-8)' });
            }

            // Simple marks validation
            Object.keys(row).forEach(key => {
                if (key.includes('Marks')) {
                    const marks = parseInt(row[key]);
                    if (isNaN(marks) || marks < 0 || marks > 100) {
                        newErrors.push({ row: index + 1, msg: `${key} must be between 0-100` });
                    }
                }
            });

            return { ...row, id: index, isValid: !newErrors.some(e => e.row === index + 1) };
        });

        setPreviewData(processed);
        setErrors(newErrors);
    };

    const handleConfirmSave = async () => {
        if (errors.length > 0) {
            toast({
                title: 'Cannot Save',
                description: 'Please fix errors in the file before uploading.',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
            setProgress(i);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        onUploadSuccess(previewData);
        setUploading(false);
        setProgress(0);
        setFile(null);
        setPreviewData([]);
        onClose();

        toast({
            title: 'Success',
            description: `${previewData.length} results uploaded successfully.`,
        });
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Roll Number': 'COE2024CS001',
                'Student Name': 'Rahul Mehta',
                'Semester': 3,
                'Subject 1 Name': 'Mathematics',
                'Subject 1 Marks': 85,
                'Subject 2 Name': 'Physics',
                'Subject 2 Marks': 78,
                'Total Marks': 163,
                'Percentage': 81.5,
                'Grade': 'A+',
                'Status': 'Pass'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'Semester_Results_Template.xlsx');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Semester Results</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file with student results.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {!file ? (
                        <div
                            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 rounded-full bg-primary/10">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Click to upload or drag and drop</p>
                                <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls) or CSV</p>
                            </div>
                            <Button variant="outline" type="button">Select File</Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); setErrors([]); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {previewData.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">Data Preview</h4>
                                        <div className="flex gap-2 text-xs">
                                            <Badge variant="outline" className="text-green-600">
                                                {previewData.filter(d => d.isValid).length} Valid
                                            </Badge>
                                            {errors.length > 0 && (
                                                <Badge variant="outline" className="text-destructive">
                                                    {errors.length} Errors
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">Roll No</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="text-center">Sem</TableHead>
                                                    <TableHead className="text-center">Total</TableHead>
                                                    <TableHead className="text-center">Grade</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {previewData.slice(0, 5).map((row, i) => (
                                                    <TableRow key={i} className={!row.isValid ? 'bg-destructive/10' : ''}>
                                                        <TableCell className="font-mono text-xs">{row['Roll Number']}</TableCell>
                                                        <TableCell className="text-sm">{row['Student Name']}</TableCell>
                                                        <TableCell className="text-center">{row['Semester']}</TableCell>
                                                        <TableCell className="text-center">{row['Total Marks']}</TableCell>
                                                        <TableCell className="text-center">{row['Grade']}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={row['Status'] === 'Pass' ? 'secondary' : 'destructive'} className="text-[10px]">
                                                                {row['Status']}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {previewData.length > 5 && (
                                            <div className="p-2 text-center text-xs text-muted-foreground border-t bg-muted/20">
                                                Showing first 5 of {previewData.length} records
                                            </div>
                                        )}
                                    </div>

                                    {errors.length > 0 && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Validation Errors</AlertTitle>
                                            <AlertDescription className="text-xs max-h-24 overflow-y-auto">
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {errors.slice(0, 3).map((err, i) => (
                                                        <li key={i}>Row {err.row}: {err.msg}</li>
                                                    ))}
                                                    {errors.length > 3 && <li>And {errors.length - 3} more errors...</li>}
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Download className="h-5 w-5 text-secondary" />
                            <div>
                                <p className="text-sm font-medium">Need the format?</p>
                                <p className="text-xs text-muted-foreground">Download our sample template to get started.</p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={downloadTemplate}>
                            Download Template
                        </Button>
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t">
                    {uploading ? (
                        <div className="w-full space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span>Uploading results...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button
                                onClick={handleConfirmSave}
                                disabled={!file || errors.length > 0}
                                className="gradient-primary text-white"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm and Save
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BulkUploadDialog;

const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }) => {
    const variants = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant || 'default']} ${className}`}>
            {children}
        </span>
    );
};
