import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { College } from '@/types';
import { Plus, Search, Building2, Users, GraduationCap, Mail, Phone, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collegesAPI } from '@/services/api';

const ManageColleges: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCollege, setNewCollege] = useState({
    name: '',
    code: '',
    type: '',
    address: '',
    phone: '',
    email: '',
  });
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    type: '',
    address: '',
    phone: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const response = await collegesAPI.getAll();
      setColleges(response.data);
    } catch (error) {
      console.error('Error loading colleges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load colleges',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(
    (college) =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCollege = async () => {
    if (!newCollege.name || !newCollege.code || !newCollege.type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await collegesAPI.create(newCollege);
      setColleges([...colleges, response.data]);
      setNewCollege({ name: '', code: '', type: '', address: '', phone: '', email: '' });
      setIsAddDialogOpen(false);

      toast({
        title: 'College Added',
        description: `${response.data.name} has been successfully added to the system.`,
      });
    } catch (error) {
      console.error('Error adding college:', error);
      toast({
        title: 'Error',
        description: 'Failed to add college',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditDialog = (college: College) => {
    setEditingCollege(college);
    setEditFormData({
      name: college.name,
      code: college.code,
      type: college.type,
      address: college.address,
      phone: college.phone,
      email: college.email,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCollege = async () => {
    if (!editingCollege) return;

    if (!editFormData.name || !editFormData.code || !editFormData.type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await collegesAPI.update(editingCollege.id, editFormData);
      const updatedColleges = colleges.map((c) =>
        c.id === editingCollege.id ? response.data : c
      );

      setColleges(updatedColleges);
      setIsEditDialogOpen(false);
      setEditingCollege(null);

      toast({
        title: 'College Updated',
        description: `${editFormData.name} has been successfully updated.`,
      });
    } catch (error) {
      console.error('Error updating college:', error);
      toast({
        title: 'Error',
        description: 'Failed to update college',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCollege = async (id: string) => {
    try {
      await collegesAPI.delete(id);
      setColleges(colleges.filter((c) => c.id !== id));
      toast({
        title: 'College Deleted',
        description: 'The college has been removed from the system.',
      });
    } catch (error) {
      console.error('Error deleting college:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete college',
        variant: 'destructive',
      });
    }
  };

  const collegeTypes = ['Engineering', 'Pharmacy', 'Arts', 'Commerce', 'Science', 'Law', 'Medicine'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading colleges...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Manage Colleges</h1>
            <p className="text-muted-foreground mt-1">Add and manage colleges in the university system</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add College
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New College</DialogTitle>
                <DialogDescription>
                  Enter the details for the new college. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">College Name *</Label>
                    <Input
                      id="name"
                      value={newCollege.name}
                      onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                      placeholder="e.g., College of Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">College Code *</Label>
                    <Input
                      id="code"
                      value={newCollege.code}
                      onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., COS"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">College Type *</Label>
                  <Select
                    value={newCollege.type}
                    onValueChange={(value) => setNewCollege({ ...newCollege, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select college type" />
                    </SelectTrigger>
                    <SelectContent>
                      {collegeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCollege.address}
                    onChange={(e) => setNewCollege({ ...newCollege, address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newCollege.phone}
                      onChange={(e) => setNewCollege({ ...newCollege, phone: e.target.value })}
                      placeholder="+91 11-12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCollege.email}
                      onChange={(e) => setNewCollege({ ...newCollege, email: e.target.value })}
                      placeholder="college@edutrack.edu"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCollege}>Save College</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges by name, code, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Colleges Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">All Colleges</CardTitle>
            <CardDescription>
              {filteredColleges.length} college{filteredColleges.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Faculty</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{college.name}</p>
                            <p className="text-sm text-muted-foreground">{college.code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{college.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{college.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{college.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-accent" />
                          <span className="font-medium">{college.facultyCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <GraduationCap className="h-4 w-4 text-secondary" />
                          <span className="font-medium">{college.studentsCount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEditDialog(college)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCollege(college.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit College Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit College</DialogTitle>
              <DialogDescription>
                Update the details for the college. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">College Name *</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">College Code *</Label>
                  <Input
                    id="edit-code"
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">College Type *</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select college type" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCollege}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageColleges;
