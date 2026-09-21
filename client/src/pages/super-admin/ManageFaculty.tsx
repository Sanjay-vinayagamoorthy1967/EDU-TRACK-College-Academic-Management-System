import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Faculty, College } from '@/types';
import { Search, Building2, Plus, Mail, Phone, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collegesAPI, facultyAPI } from '@/services/api';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

const ManageFacultySuperAdmin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<string | null>(null);
  const [newFaculty, setNewFaculty] = useState({
    name: '', email: '', password: '', phone: '',
    department: '', designation: '', collegeId: '', qualification: '', experience: 0,
  });
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', phone: '', department: '',
    designation: '', collegeId: '', qualification: '', experience: 0,
  });

  const isAdmin = user?.role === 'ADMIN';
  const facultyCollegeId = isAdmin ? user?.collegeId : null;

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (isAdmin && user?.collegeId) {
      setNewFaculty(prev => ({ ...prev, collegeId: user.collegeId || '' }));
    }
  }, [isAdmin, user?.collegeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [facultyRes, collegesRes] = await Promise.all([
        facultyAPI.getAll(),
        collegesAPI.getAll(),
      ]);
      const raw = facultyRes.data || [];
      setFaculty(raw.map((f: any) => ({
        ...f,
        name: f.user?.name || f.name || '',
        email: f.user?.email || f.email || '',
        phone: f.user?.phone || f.phone || '',
        avatar: f.user?.avatar || f.avatar || '',
        collegeName: f.college?.name || f.collegeName || '',
      })));
      setColleges(collegesRes.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = (selectedCollege === 'all' || f.collegeId === selectedCollege) &&
      (!facultyCollegeId || f.collegeId === facultyCollegeId);
    return matchesSearch && matchesCollege;
  });

  const handleAddFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.password || !newFaculty.collegeId || !newFaculty.department) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    try {
      await facultyAPI.create(newFaculty);
      await loadData();
      setNewFaculty({ name: '', email: '', password: '', phone: '', department: '', designation: '', collegeId: '', qualification: '', experience: 0 });
      setIsAddDialogOpen(false);
      toast({ title: 'Faculty Created', description: `${newFaculty.name} can now login with email: ${newFaculty.email}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to add faculty', variant: 'destructive' });
    }
  };

  const handleOpenEditDialog = (f: Faculty) => {
    setEditingFaculty(f);
    setEditFormData({ name: f.name, email: f.email, phone: f.phone, department: f.department, designation: f.designation, collegeId: f.collegeId, qualification: f.qualification, experience: f.experience });
    setIsEditDialogOpen(true);
  };

  const handleUpdateFaculty = async () => {
    if (!editingFaculty) return;
    if (!editFormData.name || !editFormData.email || !editFormData.collegeId) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    try {
      await facultyAPI.update(editingFaculty.id, editFormData);
      await loadData();
      setIsEditDialogOpen(false);
      setEditingFaculty(null);
      toast({ title: 'Faculty Updated', description: `${editFormData.name} has been successfully updated.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to update faculty', variant: 'destructive' });
    }
  };

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;
    try {
      await facultyAPI.delete(facultyToDelete);
      await loadData();
      setFacultyToDelete(null);
      toast({ title: 'Faculty Removed', description: 'The faculty member has been removed from the system.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.error || 'Failed to delete faculty', variant: 'destructive' });
    }
  };

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading faculty...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">All Faculty</h1>
            <p className="text-muted-foreground mt-1">View faculty members across all colleges</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Faculty</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogDescription>Enter the details for the new faculty member.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={newFaculty.name} onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })} placeholder="e.g., Dr. Alice Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={newFaculty.email} onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })} placeholder="faculty@college.edu" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" value={newFaculty.password} onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })} placeholder="Minimum 8 characters" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={newFaculty.phone} onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" />
                  </div>
                  <div className="space-y-2">
                    <Label>College *</Label>
                    {isAdmin ? (
                      <Input value={user?.collegeName || ''} disabled className="bg-muted" />
                    ) : (
                      <Select value={newFaculty.collegeId} onValueChange={(v) => setNewFaculty({ ...newFaculty, collegeId: v })}>
                        <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                        <SelectContent>
                          {colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Input value={newFaculty.department} onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })} placeholder="e.g., CSE" />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input value={newFaculty.designation} onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })} placeholder="e.g., Professor" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Qualification</Label>
                    <Input value={newFaculty.qualification} onChange={(e) => setNewFaculty({ ...newFaculty, qualification: e.target.value })} placeholder="e.g., Ph.D." />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (Years)</Label>
                    <Input type="number" value={newFaculty.experience} onChange={(e) => setNewFaculty({ ...newFaculty, experience: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddFaculty}>Add Faculty</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, or department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={selectedCollege} onValueChange={setSelectedCollege} disabled={isAdmin}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder={isAdmin ? user?.collegeName : 'Filter by college'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Faculty List</CardTitle>
            <CardDescription>{filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''} found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead className="text-center">Exp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No faculty found</TableCell></TableRow>
                  ) : filteredFaculty.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={f.avatar} alt={f.name} />
                            <AvatarFallback>{getInitials(f.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.designation}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /><span>{f.email}</span></div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /><span>{f.phone || 'N/A'}</span></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{f.department}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-sm">{f.collegeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center"><Badge variant="secondary">{f.experience}y</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(f)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setFacultyToDelete(f.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Faculty</DialogTitle>
              <DialogDescription>Update the details for the faculty member.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                </div>
                <div className="space-y-2">
                  <Label>College *</Label>
                  {isAdmin ? (
                    <Input value={user?.collegeName || ''} disabled className="bg-muted" />
                  ) : (
                    <Select value={editFormData.collegeId} onValueChange={(v) => setEditFormData({ ...editFormData, collegeId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select college" /></SelectTrigger>
                      <SelectContent>
                        {colleges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Input value={editFormData.department} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={editFormData.designation} onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input value={editFormData.qualification} onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <Input type="number" value={editFormData.experience} onChange={(e) => setEditFormData({ ...editFormData, experience: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateFaculty}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!facultyToDelete} onOpenChange={(open) => !open && setFacultyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the faculty member from the system.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFaculty} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageFacultySuperAdmin;
