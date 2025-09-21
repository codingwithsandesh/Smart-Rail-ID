
import React, { useState } from 'react';
import Layout from '../components/Layout';
import AdminNavigation from '../components/AdminNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { useDeleteTicketsByDate } from '../hooks/useSupabaseData';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/use-toast';
import { Trash2, Calendar, Database, AlertTriangle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DataManagement = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dataType, setDataType] = useState('tickets');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const deleteTicketsMutation = useDeleteTicketsByDate();

  const handleDeleteData = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      if (dataType === 'tickets') {
        // Delete tickets for the selected date, filtered by working station
        let query = supabase
          .from('tickets')
          .delete()
          .eq('travel_date', selectedDate);

        const { error, count } = await query;
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Deleted ${count || 0} tickets for ${selectedDate} from ${user?.workingStation} station`,
        });
      } else if (dataType === 'verification_logs') {
        // Delete verification logs for the selected date
        const startDate = selectedDate + 'T00:00:00Z';
        const endDate = selectedDate + 'T23:59:59Z';
        
        const { error, count } = await supabase
          .from('verification_logs')
          .delete()
          .gte('verified_at', startDate)
          .lte('verified_at', endDate);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Deleted ${count || 0} verification logs for ${selectedDate}`,
        });
      }
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout title="Data Management">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <AdminNavigation />
        
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Delete tickets and verification logs by date</p>
              {user?.workingStation && (
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  Station: {user.workingStation}
                </p>
              )}
            </div>
          </div>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
                <span>Danger Zone - Data Deletion</span>
              </CardTitle>
              <CardDescription>
                Permanently delete tickets and verification logs by date. This action cannot be undone.
                {user?.workingStation && (
                  <span className="block mt-1 text-blue-600 dark:text-blue-400">
                    Only data from {user.workingStation} station will be affected.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-type">Data Type</Label>
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tickets">Railway Tickets</SelectItem>
                      <SelectItem value="verification_logs">Verification Logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">Warning</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      You are about to permanently delete all <strong>{dataType.replace('_', ' ')}</strong> for{' '}
                      <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
                      {user?.workingStation && (
                        <span> from <strong>{user.workingStation}</strong> station</span>
                      )}. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    disabled={!selectedDate || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : `Delete ${dataType.replace('_', ' ')}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all <strong>{dataType.replace('_', ' ')}</strong> for{' '}
                      <strong>{new Date(selectedDate).toLocaleDateString()}</strong>
                      {user?.workingStation && (
                        <span> from <strong>{user.workingStation}</strong> station</span>
                      )}.
                      This action cannot be undone and the data will be lost forever.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, delete permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Delete all railway tickets issued on a specific date. This includes passenger information, 
                  pricing details, and travel information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Verification Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Delete all ticket verification logs for a specific date. This includes validation records, 
                  TTE actions, and fraud detection data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DataManagement;
