
import React, { useState } from 'react';
import { useTicketsByDateRange, useVerificationLogs } from '../hooks/useSupabaseData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';
import { useDatabaseStats } from '../hooks/useDatabaseStats';
import { exportDataToCSV } from '../utils/csvExport';
import DatabaseOverview from '../components/database/DatabaseOverview';
import TableStatistics from '../components/database/TableStatistics';
import DatewiseDataManagement from '../components/database/DatewiseDataManagement';
import DeleteAllDataSection from '../components/database/DeleteAllDataSection';
import TodayActivitySummary from '../components/database/TodayActivitySummary';

const DatabaseStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { databaseStats, isLoading } = useDatabaseStats();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  // Get today's data for statistics
  const today = new Date().toISOString().split('T')[0];
  const { data: todayTickets = [] } = useTicketsByDateRange(today, today);
  const { data: todayLogs = [] } = useVerificationLogs(today, today);
  
  // Get selected date data for deletion
  const { data: selectedDateTickets = [] } = useTicketsByDateRange(selectedDate, selectedDate);
  const { data: selectedDateLogs = [] } = useVerificationLogs(selectedDate, selectedDate);

  const handleDeleteByDate = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedDateTickets.length} tickets and ${selectedDateLogs.length} verification logs for ${selectedDate}?`;
    
    if (!confirm(confirmMessage)) return;
    
    setIsDeleting(true);
    try {
      // Delete tickets for the selected date
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('travel_date', selectedDate);
      
      if (ticketsError) throw ticketsError;

      // Delete verification logs for the selected date
      const { error: logsError } = await supabase
        .from('verification_logs')
        .delete()
        .gte('verified_at', `${selectedDate}T00:00:00`)
        .lt('verified_at', `${selectedDate}T23:59:59`);
      
      if (logsError) throw logsError;

      toast({
        title: "Success",
        description: `Deleted data for ${selectedDate}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete data",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllData = async () => {
    const confirmMessage = "Are you sure you want to delete ALL tickets and verification logs? This action cannot be undone!";
    
    if (!confirm(confirmMessage)) return;
    
    const doubleConfirmMessage = "This will permanently delete ALL data. Type 'DELETE ALL' to confirm:";
    const userInput = prompt(doubleConfirmMessage);
    
    if (userInput !== 'DELETE ALL') {
      toast({
        title: "Cancelled",
        description: "Data deletion cancelled",
      });
      return;
    }
    
    setIsDeletingAll(true);
    try {
      // Delete all verification logs first (due to foreign key constraints)
      const { error: logsError } = await supabase
        .from('verification_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (logsError) throw logsError;

      // Delete all tickets
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (ticketsError) throw ticketsError;

      toast({
        title: "Success",
        description: "All tickets and verification logs have been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all data",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const exportToCSV = () => {
    exportDataToCSV(selectedDateTickets, selectedDateLogs, selectedDate, toast);
  };

  const totalRecords = databaseStats.stations.total + databaseStats.routes.total + 
                      databaseStats.trains.total + databaseStats.tickets.total + 
                      databaseStats.staff.total + databaseStats.verificationLogs.total;

  const filledRecords = databaseStats.stations.filled + databaseStats.routes.filled + 
                       databaseStats.trains.filled + databaseStats.tickets.filled + 
                       databaseStats.staff.filled + databaseStats.verificationLogs.filled;

  const emptyRecords = totalRecords - filledRecords;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-left">Loading database statistics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-left">Database Statistics</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base text-left">
            Monitor and manage database usage
            {user?.workingStation && (
              <span className="block sm:inline ml-0 sm:ml-2 text-blue-600 dark:text-blue-400 font-medium">
                {user.workingStation} Station
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Database Overview */}
      <DatabaseOverview 
        totalRecords={totalRecords}
        filledRecords={filledRecords}
        emptyRecords={emptyRecords}
      />

      {/* Detailed Table Statistics */}
      <TableStatistics databaseStats={databaseStats} />

      {/* Data Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatewiseDataManagement
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedDateTickets={selectedDateTickets}
          selectedDateLogs={selectedDateLogs}
          isDeleting={isDeleting}
          handleDeleteByDate={handleDeleteByDate}
          exportToCSV={exportToCSV}
        />

        <DeleteAllDataSection
          isDeletingAll={isDeletingAll}
          handleDeleteAllData={handleDeleteAllData}
        />
      </div>

      {/* Today's Activity Summary */}
      <TodayActivitySummary 
        todayTickets={todayTickets}
        todayLogs={todayLogs}
      />
    </div>
  );
};

export default DatabaseStats;
