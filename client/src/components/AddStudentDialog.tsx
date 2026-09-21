import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Student, College } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { collegesAPI } from '@/services/api';
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useAuth } from '@/contexts/AuthContext';

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (student: Student) => void;
  defaultCollegeId?: string;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  open,
  onClose,
  onAdd,
  defaultCollegeId,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const adminCollegeId = isAdmin ? user?.collegeId : null;
  const [isLoading, setIsLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);

  const emptyForm = {
    name: '', email: '', password: '', phone: '', dob: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    address: '',
    collegeId: adminCollegeId || defaultCollegeId || '',
    course: '', semester: 1, rollNumber: '', admissionNumber: '',
    fatherName: '', motherName: '', guardianContact: '', guardianOccupation: '',
    tenthMarks: '', tenthBoard: '', twelfthMarks: '', twelfthBoard: '',
    aadharNumber: '',
  };

  React.useEffect(() => {
    collegesAPI.getAll().then(res => {
      if (res.data && res.data.length > 0) setColleges(res.data);
    }).catch(() => {});
  }, []);

  // Reset form every time dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({ ...emptyForm, collegeId: adminCollegeId || defaultCollegeId || '' });
    }
  }, [open]);

  const [formData, setFormData] = useState({ ...emptyForm });

  const [documents, setDocuments] = useState({
    tenthMarksheet: null as File | null,
    twelfthMarksheet: null as File | null,
    tc: null as File | null,
    communityCertificate: null as File | null,
    aadharCard: null as File | null,
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.collegeId || !formData.course || !formData.rollNumber) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields marked with *',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const college = colleges.find((c) => c.id === formData.collegeId);

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dob: formData.dob ? new Date(formData.dob).toISOString() : new Date('2000-01-01').toISOString(),
        gender: formData.gender?.toUpperCase() || 'MALE',
        address: formData.address || 'N/A',
        collegeId: formData.collegeId,
        course: formData.course,
        semester: Number(formData.semester),
        rollNumber: formData.rollNumber,
        admissionNumber: formData.admissionNumber || `ADM-${formData.rollNumber}-${Date.now()}`,
        fatherName: formData.fatherName || 'N/A',
        motherName: formData.motherName || 'N/A',
        guardianContact: formData.guardianContact || '0000000000',
        guardianOccupation: formData.guardianOccupation || 'N/A',
        tenthMarks: parseFloat(formData.tenthMarks) || 0,
        tenthBoard: formData.tenthBoard || 'N/A',
        twelfthMarks: parseFloat(formData.twelfthMarks) || 0,
        twelfthBoard: formData.twelfthBoard || 'N/A',
      };

      const { studentsAPI } = await import('@/services/api');
      await studentsAPI.create(payload);

      onAdd({} as any); // triggers parent reload

      toast({ title: 'Student Created', description: `${formData.name} added successfully. Login: ${formData.email}` });
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || 'Failed to create student';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const collegeCourses: { [key: string]: string[] } = {
    'Engineering': [
      'B.Tech Computer Science',
      'B.Tech Electronics',
      'B.Tech Mechanical',
      'B.Tech Civil',
      'M.Tech CSE',
      'M.Tech ECE',
    ],
    'Pharmacy': [
      'B.Pharm',
      'M.Pharm',
      'Pharm.D',
    ],
    'Arts': [
      'BA English',
      'BA History',
      'BA Economics',
      'BSc Mathematics',
      'BSc Physics',
    ],
    'Commerce': [
      'B.Com',
      'M.Com',
      'BBA',
      'MBA',
    ],
    'Science': [
      'B.Sc Physics',
      'B.Sc Chemistry',
      'B.Sc Mathematics',
    ]
  };

  const getAvailableCourses = () => {
    const college = colleges.find(c => c.id === formData.collegeId);
    if (!college) return [];
    return collegeCourses[college.type] || [];
  };

  const boards = ['CBSE', 'ICSE', 'ISC', 'State Board', 'IB', 'Other'];

  const handleFileChange = (field: string, file: File | null) => {
    if (!file) {
      setDocuments(prev => ({ ...prev, [field]: null }));
      return;
    }

    // Validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF, JPG, and PNG are allowed',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setDocuments(prev => ({ ...prev, [field]: file }));

    // Simulate "upload" progress
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(prev => ({ ...prev, [field]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pr-4">
            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="student@college.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  This will be their login password.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>
            </TabsContent>

            {/* Academic Information */}
            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="college">College *</Label>
                  {isAdmin ? (
                    <Input
                      value={user?.collegeName || ''}
                      disabled
                      className="bg-muted"
                    />
                  ) : (
                    <Select
                      value={formData.collegeId}
                      onValueChange={(value) => handleChange('collegeId', value)}
                      disabled={!!defaultCollegeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.course}
                    onValueChange={(value) => handleChange('course', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCourses().map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semester.toString()}
                    onValueChange={(value) => handleChange('semester', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    value={formData.rollNumber}
                    onChange={(e) => handleChange('rollNumber', e.target.value.toUpperCase())}
                    placeholder="e.g., COE2024CS001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={(e) => handleChange('admissionNumber', e.target.value.toUpperCase())}
                  placeholder="e.g., ADM2024001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharNumber" className="flex items-center gap-1">
                  Aadhar Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={(e) => handleChange('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="12-digit number"
                />
              </div>
            </TabsContent>

            {/* Family Information */}
            <TabsContent value="family" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                    placeholder="Father's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={formData.motherName}
                    onChange={(e) => handleChange('motherName', e.target.value)}
                    placeholder="Mother's full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianContact">Guardian Contact</Label>
                  <Input
                    id="guardianContact"
                    value={formData.guardianContact}
                    onChange={(e) => handleChange('guardianContact', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianOccupation">Guardian Occupation</Label>
                  <Input
                    id="guardianOccupation"
                    value={formData.guardianOccupation}
                    onChange={(e) => handleChange('guardianOccupation', e.target.value)}
                    placeholder="e.g., Business, Engineer"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Previous Education */}
            <TabsContent value="education" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">10th Standard</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenthMarks">Marks (%)</Label>
                    <Input
                      id="tenthMarks"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.tenthMarks}
                      onChange={(e) => handleChange('tenthMarks', e.target.value)}
                      placeholder="e.g., 92.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenthBoard">Board</Label>
                    <Select
                      value={formData.tenthBoard}
                      onValueChange={(value) => handleChange('tenthBoard', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">12th Standard</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twelfthMarks">Marks (%)</Label>
                    <Input
                      id="twelfthMarks"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.twelfthMarks}
                      onChange={(e) => handleChange('twelfthMarks', e.target.value)}
                      placeholder="e.g., 89.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twelfthBoard">Board</Label>
                    <Select
                      value={formData.twelfthBoard}
                      onValueChange={(value) => handleChange('twelfthBoard', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {boards.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Documents Upload */}
            <TabsContent value="documents" className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 mb-4">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Please upload mandatory documents. Only PDF, JPG, and PNG formats are allowed (Max 5MB per file).
                </p>
              </div>

              {[
                { id: 'tenthMarksheet', label: '10th Marksheet' },
                { id: 'twelfthMarksheet', label: '12th Marksheet' },
                { id: 'tc', label: 'Transfer Certificate (TC)' },
                { id: 'communityCertificate', label: 'Community Certificate' },
                { id: 'aadharCard', label: 'Aadhar Card' },
              ].map((doc) => (
                <div key={doc.id} className="space-y-2 p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={doc.id} className="flex items-center gap-1">
                      {doc.label} <span className="text-destructive">*</span>
                    </Label>
                    {(documents as any)[doc.id] && uploadProgress[doc.id] === 100 && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  {!(documents as any)[doc.id] ? (
                    <div className="flex items-center gap-4">
                      <Input
                        id={doc.id}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(doc.id, e.target.files ? e.target.files[0] : null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => document.getElementById(doc.id)?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {doc.label}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                        <span className="truncate max-w-[300px]">{(documents as any)[doc.id].name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleFileChange(doc.id, null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {uploadProgress[doc.id] < 100 && (
                        <Progress value={uploadProgress[doc.id]} className="h-1" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
          </ScrollArea>

        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Student'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
