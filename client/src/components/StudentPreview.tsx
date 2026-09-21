import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Student } from '@/types';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Building2,
    FileText,
    Download,
    Eye,
    Users,
    Briefcase,
    Heart,
    Globe,
    CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';

interface StudentPreviewProps {
    student: Student | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const StudentPreview: React.FC<StudentPreviewProps> = ({ student, open, onOpenChange }) => {
    if (!student) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const InfoItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color?: string }) => (
        <div className="flex items-start gap-3 py-2">
            <div className={`p-2 rounded-lg ${color || 'bg-muted'}`}>
                <Icon className="h-4 w-4 text-foreground" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-sm font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[540px] p-0">
                <ScrollArea className="h-full">
                    <div className="p-6 space-y-8">
                        <SheetHeader className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                                    <AvatarImage src={student.profilePhoto} alt={student.name} />
                                    <AvatarFallback className="text-2xl">{getInitials(student.name)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <SheetTitle className="text-2xl font-heading font-bold">{student.name}</SheetTitle>
                                    <SheetDescription>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono">{student.rollNumber}</Badge>
                                            <Badge variant="secondary">{student.course}</Badge>
                                        </div>
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <Separator />

                        {/* Personal Information */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <InfoItem icon={Calendar} label="Date of Birth" value={new Date(student.dob).toLocaleDateString()} />
                                <InfoItem icon={Users} label="Gender" value={student.gender.charAt(0).toUpperCase() + student.gender.slice(1)} />
                                <InfoItem icon={Mail} label="Email Address" value={student.email} />
                                <InfoItem icon={Phone} label="Phone Number" value={student.phone} />
                                <InfoItem icon={Heart} label="Blood Group" value="B+" /> {/* Mocking for now */}
                                <InfoItem icon={Globe} label="Nationality" value="Indian" /> {/* Mocking for now */}
                            </div>
                            <InfoItem icon={MapPin} label="Permanent Address" value={student.address} />
                        </section>

                        <Separator />

                        {/* Academic records */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-secondary" />
                                Academic Records
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border bg-card">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">10th Standard</p>
                                    <p className="text-2xl font-bold text-primary">{student.tenthMarks}%</p>
                                    <p className="text-sm text-muted-foreground">{student.tenthBoard}</p>
                                </div>
                                <div className="p-4 rounded-xl border bg-card">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">12th Standard</p>
                                    <p className="text-2xl font-bold text-secondary">{student.twelfthMarks}%</p>
                                    <p className="text-sm text-muted-foreground">{student.twelfthBoard}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <InfoItem icon={Building2} label="College" value={student.collegeName} />
                                <InfoItem icon={Briefcase} label="Course" value={student.course} />
                                <InfoItem icon={Calendar} label="Current Semester" value={student.semester} />
                                <InfoItem icon={FileText} label="Admission No" value={student.admissionNumber} />
                            </div>
                        </section>

                        <Separator />

                        {/* Family Details */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                                <Users className="h-5 w-5 text-accent" />
                                Family Details
                            </h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <InfoItem icon={User} label="Father's Name" value={student.fatherName} />
                                <InfoItem icon={Briefcase} label="Occupation" value="Business" /> {/* Mocking */}
                                <InfoItem icon={User} label="Mother's Name" value={student.motherName} />
                                <InfoItem icon={Briefcase} label="Occupation" value="Homemaker" /> {/* Mocking */}
                                <InfoItem icon={Phone} label="Guardian Contact" value={student.guardianContact} />
                            </div>
                        </section>

                        <Separator />

                        {/* Uploaded Documents */}
                        <section className="space-y-4 pb-6">
                            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Uploaded Documents
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: '10th Marksheet', field: 'tenthMarksheet', icon: FileText },
                                    { name: '12th Marksheet', field: 'twelfthMarksheet', icon: FileText },
                                    { name: 'Transfer Certificate', field: 'transferCertificate', icon: FileText },
                                    { name: 'Community Certificate', field: 'communityCertificate', icon: FileText },
                                    { name: 'Aadhar Card', field: 'aadharCard', icon: FileText },
                                ].map((doc) => {
                                    const fileUrl = (student as any)[doc.field];
                                    return (
                                        <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <doc.icon className="h-4 w-4 text-muted-foreground" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{doc.name}</span>
                                                    {fileUrl ? (
                                                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Available
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Not uploaded</span>
                                                    )}
                                                </div>
                                            </div>
                                            {fileUrl && (
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Download">
                                                        <a href={fileUrl} download={`${student.name}_${doc.name}`}>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default StudentPreview;
