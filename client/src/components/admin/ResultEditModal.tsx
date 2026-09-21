import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, CheckCircle2, Calculator, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SemesterResult, SubjectResult, Student } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ResultEditModalProps {
    open: boolean;
    onClose: () => void;
    student: Student | null;
    resultToEdit: SemesterResult | null;
    onSave: (semester: number, subjects: SubjectResult[]) => void;
}

const ResultEditModal: React.FC<ResultEditModalProps> = ({
    open,
    onClose,
    student,
    resultToEdit,
    onSave
}) => {
    const [semester, setSemester] = useState<number>(1);
    const [subjects, setSubjects] = useState<SubjectResult[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (resultToEdit) {
            setSemester(resultToEdit.semester);
            setSubjects([...resultToEdit.subjects]);
        } else {
            setSemester(1);
            setSubjects([{
                code: '',
                name: '',
                credits: 3,
                internalMarks: 0,
                externalMarks: 0,
                totalMarks: 0,
                grade: 'F',
                gradePoints: 0
            }]);
        }
    }, [resultToEdit, open]);

    const calculateGrade = (percentage: number): { grade: string, points: number } => {
        if (percentage >= 90) return { grade: 'O', points: 10 };
        if (percentage >= 80) return { grade: 'A+', points: 9 };
        if (percentage >= 70) return { grade: 'A', points: 8 };
        if (percentage >= 60) return { grade: 'B+', points: 7 };
        if (percentage >= 50) return { grade: 'B', points: 6 };
        return { grade: 'F', points: 0 };
    };

    const handleSubjectChange = (index: number, field: keyof SubjectResult, value: any) => {
        const newSubjects = [...subjects];
        const subject = { ...newSubjects[index], [field]: value };

        if (field === 'internalMarks' || field === 'externalMarks') {
            const int = field === 'internalMarks' ? parseInt(value) : subject.internalMarks;
            const ext = field === 'externalMarks' ? parseInt(value) : subject.externalMarks;

            if (int < 0 || int > 100 || ext < 0 || ext > 100) return;

            subject.totalMarks = (int || 0) + (ext || 0);
            const percentage = (subject.totalMarks / 200) * 100; // Assuming 100 each for simplicity or adjust as needed
            // Actually usually it's total out of 100. Let's assume int + ext = total (max 100) or int/40 + ext/60 etc.
            // Requirement says "max 100 validation" per subject. Let's assume internal + external = total (max 100)
            const { grade, points } = calculateGrade(subject.totalMarks);
            subject.grade = grade;
            subject.gradePoints = points;
        }

        newSubjects[index] = subject;
        setSubjects(newSubjects);
    };

    const addSubject = () => {
        setSubjects([...subjects, {
            code: '',
            name: '',
            credits: 3,
            internalMarks: 0,
            externalMarks: 0,
            totalMarks: 0,
            grade: 'F',
            gradePoints: 0
        }]);
    };

    const removeSubject = (index: number) => {
        if (subjects.length > 1) {
            const newSubjects = subjects.filter((_, i) => i !== index);
            setSubjects(newSubjects);
        }
    };

    const handleSave = () => {
        if (subjects.some(s => !s.code || !s.name)) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all subject details.',
                variant: 'destructive',
            });
            return;
        }
        onSave(semester, subjects);
        onClose();
    };

    const totalMarks = subjects.reduce((sum, s) => sum + s.totalMarks, 0);
    const avgPercentage = subjects.length > 0 ? totalMarks / subjects.length : 0;
    const { grade: overallGrade } = calculateGrade(avgPercentage);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{resultToEdit ? 'Edit Semester result' : 'Add Semester result'}</DialogTitle>
                    <DialogDescription>
                        {student ? `${student.name} (${student.rollNumber})` : 'Student Details'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select
                                value={semester.toString()}
                                onValueChange={(v) => setSemester(parseInt(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Total Marks</Label>
                            <Input value={totalMarks} readOnly className="bg-muted font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label>Overall Grade</Label>
                            <div className="flex h-10 items-center">
                                <Badge variant={overallGrade === 'F' ? 'destructive' : 'secondary'} className="text-lg px-4">
                                    {overallGrade}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-primary" />
                                Subject Breakdown
                            </h4>
                            <Button variant="outline" size="sm" onClick={addSubject}>
                                <Plus className="h-4 w-4 mr-2" /> Add Subject
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {subjects.map((sub, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg border bg-background group relative animate-in fade-in slide-in-from-top-2">
                                    <div className="md:col-span-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Code</Label>
                                        <Input
                                            placeholder="CS101"
                                            value={sub.code}
                                            onChange={(e) => handleSubjectChange(index, 'code', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Subject Name</Label>
                                        <Input
                                            placeholder="Mathematics"
                                            value={sub.name}
                                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Internal</Label>
                                        <Input
                                            type="number"
                                            value={sub.internalMarks}
                                            onChange={(e) => handleSubjectChange(index, 'internalMarks', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">External</Label>
                                        <Input
                                            type="number"
                                            value={sub.externalMarks}
                                            onChange={(e) => handleSubjectChange(index, 'externalMarks', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Total</Label>
                                        <div className="h-10 flex items-center font-bold px-2">{sub.totalMarks}</div>
                                    </div>
                                    <div className="md:col-span-1">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Grade</Label>
                                        <div className="h-10 flex items-center">
                                            <Badge variant={sub.grade === 'F' ? 'destructive' : 'outline'}>{sub.grade}</Badge>
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex items-end justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeSubject(index)}
                                            disabled={subjects.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} className="gradient-primary text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResultEditModal;
