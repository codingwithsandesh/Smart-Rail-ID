
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useStaff, useCreateStaff, useDeleteStaff } from '../../hooks/useStaffData';
import { Plus, Users, UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';

const DashboardStaffManagement = () => {
  const { user } = useAuth();
  const { data: staff = [], isLoading } = useStaff();
  const createStaffMutation = useCreateStaff();
  const deleteStaffMutation = useDeleteStaff();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
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

  const handleDelete = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete staff member: ${staffName}?`)) return;
    
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

  // Count staff by role
  const ticketCreators = filteredStaff.filter(member => member.role === 'ticket_creator' && member.is_active);
  const ttes = filteredStaff.filter(member => member.role === 'tte' && member.is_active);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-left">Loading staff information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-left">
              <Users className="h-5 w-5" />
              Staff Management
            </CardTitle>
            <CardDescription className="text-left">
              Manage staff members for your station
              {user?.workingStation && (
                <span className="block text-blue-600 font-medium mt-1">
                  {user.workingStation} Station - {filteredStaff.length} total staff members
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
                <DialogTitle className="text-left">Create New Staff Member</DialogTitle>
                <DialogDescription className="text-left">
                  Add a new ticket creator or TTE to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="staff_id" className="text-left">Staff ID *</Label>
                  <Input
                    id="staff_id"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    placeholder="Enter unique staff ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-left">Password *</Label>
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
                  <Label htmlFor="name" className="text-left">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-left">Role *</Label>
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
                  <Label htmlFor="working_station" className="text-left">Working Station</Label>
                  <Input
                    id="working_station"
                    value={formData.working_station}
                    onChange={(e) => setFormData({ ...formData, working_station: e.target.value })}
                    placeholder={user?.workingStation || "Enter working station name"}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-left">
                    {user?.workingStation ? `Defaults to ${user.workingStation}` : 'Enter the station name'}
                  </p>
                </div>
                <Button type="submit" disabled={createStaffMutation.isPending} className="w-full">
                  {createStaffMutation.isPending ? 'Creating...' : 'Create Staff'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Staff Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 text-left">Ticket Creators</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{ticketCreators.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 text-left">TTEs</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{ttes.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 text-left">Total Active</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{ticketCreators.length + ttes.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Recent Staff Members */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-left">Recent Staff Members</h3>
          {filteredStaff.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-left">No staff members found for this station</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaff.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-left">{member.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
                        {member.staff_id} • {member.working_station || 'No station assigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={member.role === 'ticket_creator' ? 'default' : 'secondary'}>
                      {member.role === 'ticket_creator' ? 'Ticket Creator' : 'TTE'}
                    </Badge>
                    <Badge variant={member.is_active ? 'default' : 'destructive'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(member.id, member.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredStaff.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  Showing 5 of {filteredStaff.length} staff members
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStaffManagement;
