
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '../hooks/useStaffData';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useAuth } from '../contexts/AuthContext';

const StaffManagement = () => {
  const { user } = useAuth();
  const { data: staff = [], isLoading } = useStaff();
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [formData, setFormData] = useState({
    staff_id: '',
    password: '',
    name: '',
    role: 'ticket_creator' as 'ticket_creator' | 'tte',
    is_active: true,
    working_station: user?.workingStation || ''
  });

  const resetForm = () => {
    setFormData({
      staff_id: '',
      password: '',
      name: '',
      role: 'ticket_creator',
      is_active: true,
      working_station: user?.workingStation || ''
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaffMutation.mutateAsync({
        ...formData,
        working_station: formData.working_station || user?.workingStation || null
      });
      toast({
        title: "Success",
        description: `Staff member created successfully for ${formData.working_station || user?.workingStation} station`,
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member. Staff ID might already exist.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (staffMember: any) => {
    setEditingStaff(staffMember);
    setFormData({
      staff_id: staffMember.staff_id,
      password: staffMember.password,
      name: staffMember.name,
      role: staffMember.role,
      is_active: staffMember.is_active,
      working_station: staffMember.working_station || user?.workingStation || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    
    try {
      await updateStaffMutation.mutateAsync({
        id: editingStaff.id,
        ...formData,
        working_station: formData.working_station || user?.workingStation || null
      });
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });
      setIsEditDialogOpen(false);
      resetForm();
      setEditingStaff(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    
    try {
      await deleteStaffMutation.mutateAsync(staffId);
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    }
  };

  // Filter staff by working station for admins
  const filteredStaff = user?.workingStation 
    ? staff.filter(member => 
        member.working_station === user.workingStation || 
        member.working_station === null
      )
    : staff;

  if (isLoading) {
    return <div>Loading staff...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Staff Management
            </CardTitle>
            <CardDescription>
              Manage ticket creators and TTEs
              {user?.workingStation && (
                <span className="block text-blue-600 font-medium mt-1">
                  Managing staff for: {user.workingStation} Station
                </span>
              )}
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Staff Member</DialogTitle>
                <DialogDescription>
                  Add a new ticket creator or TTE to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="staff_id">Staff ID *</Label>
                  <Input
                    id="staff_id"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    placeholder="Enter unique staff ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password for login"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'ticket_creator' | 'tte' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ticket_creator">Ticket Creator</SelectItem>
                      <SelectItem value="tte">TTE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="working_station">Working Station</Label>
                  <Input
                    id="working_station"
                    value={formData.working_station}
                    onChange={(e) => setFormData({ ...formData, working_station: e.target.value })}
                    placeholder={user?.workingStation || "Enter working station name"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.workingStation ? `Defaults to ${user.workingStation}` : 'Enter the station name'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit" disabled={createStaffMutation.isPending}>
                  {createStaffMutation.isPending ? 'Creating...' : 'Create Staff'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Working Station</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.staff_id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>
                  <Badge variant={member.role === 'ticket_creator' ? 'default' : 'secondary'}>
                    {member.role === 'ticket_creator' ? 'Ticket Creator' : 'TTE'}
                  </Badge>
                </TableCell>
                <TableCell>{member.working_station || 'Not assigned'}</TableCell>
                <TableCell>
                  <Badge variant={member.is_active ? 'default' : 'destructive'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No staff members found for this station
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update staff member information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit_staff_id">Staff ID</Label>
                <Input
                  id="edit_staff_id"
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_password">Password</Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_name">Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'ticket_creator' | 'tte' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ticket_creator">Ticket Creator</SelectItem>
                    <SelectItem value="tte">TTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_working_station">Working Station</Label>
                <Input
                  id="edit_working_station"
                  value={formData.working_station}
                  onChange={(e) => setFormData({ ...formData, working_station: e.target.value })}
                  placeholder="Enter working station name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
              <Button type="submit" disabled={updateStaffMutation.isPending}>
                {updateStaffMutation.isPending ? 'Updating...' : 'Update Staff'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StaffManagement;
