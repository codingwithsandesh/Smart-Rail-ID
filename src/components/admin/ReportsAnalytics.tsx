import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Calendar, FileText, TrendingUp } from 'lucide-react';
import { toast } from '../ui/use-toast';

// Define the DailyReport type since it's not in the generated types yet
interface DailyReport {
  id: string;
  report_date: string;
  report_type: string;  
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  working_station: string | null;
}

const ReportsAnalytics = () => {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState('daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('tickets');
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch daily reports with proper error handling
  const { data: dailyReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['daily-reports', user?.workingStation],
    queryFn: async (): Promise<DailyReport[]> => {
      try {
        // Try using the RPC function first
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_daily_reports' as any,
          {
            station_filter: user?.workingStation || null
          }
        );

        if (rpcError) {
          console.log('RPC not available, trying direct query');
          // If RPC doesn't work, try direct query
          const { data: directData, error: directError } = await (supabase as any)
            .from('daily_reports')
            .select('*')
            .eq('working_station', user?.workingStation)
            .order('created_at', { ascending: false })
            .limit(50);

          if (directError) {
            console.log('Daily reports table not ready yet:', directError);
            return [];
          }
          return (directData || []) as DailyReport[];
        }

        return (rpcData || []) as DailyReport[];
      } catch (error) {
        console.error('Error fetching daily reports:', error);
        return [];
      }
    },
  });

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    const today = new Date();
    
    switch (value) {
      case 'daily':
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'monthly':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(monthStart.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'yearly':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setStartDate(yearStart.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
    }
  };

  const downloadReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      console.log('Attempting to download report:', { reportType, startDate, endDate, workingStation: user?.workingStation });
      
      // Generate the report using only current working station data
      let csvData = '';
      const headers = [];
      const rows = [];

      if (reportType === 'tickets') {
        // Generate tickets report filtered by working station
        let query = supabase
          .from('tickets')
          .select(`
            *,
            from_station:stations!tickets_from_station_id_fkey(name, code, working_station),
            to_station:stations!tickets_to_station_id_fkey(name, code, working_station),
            train:trains(name, number, working_station)
          `)
          .gte('travel_date', startDate)
          .lte('travel_date', endDate);

        const { data: tickets, error } = await query;
        if (error) throw error;

        // Filter tickets by working station
        const filteredTickets = tickets?.filter(ticket => {
          const createdByMatch = ticket.created_by && ticket.created_by.includes(user?.workingStation || '');
          const fromStationMatch = ticket.from_station?.working_station === user?.workingStation;
          const toStationMatch = ticket.to_station?.working_station === user?.workingStation;
          const trainMatch = ticket.train?.working_station === user?.workingStation;
          
          return createdByMatch || fromStationMatch || toStationMatch || trainMatch;
        }) || [];

        headers.push('Travel ID', 'Passenger Name', 'From Station', 'To Station', 'Travel Date', 'Price', 'Created By', 'Train');
        
        filteredTickets.forEach(ticket => {
          rows.push([
            ticket.travel_id,
            ticket.passenger_name,
            ticket.from_station?.name || 'N/A',
            ticket.to_station?.name || 'N/A',
            ticket.travel_date,
            ticket.total_price,
            ticket.created_by,
            ticket.train?.name || 'N/A'
          ]);
        });
      } else if (reportType === 'verification_logs') {
        // Generate verification logs report filtered by working station
        const { data: logs, error } = await supabase
          .from('verification_logs')
          .select(`
            *,
            ticket:tickets(
              travel_id,
              passenger_name,
              created_by,
              from_station:stations!tickets_from_station_id_fkey(name, working_station),
              to_station:stations!tickets_to_station_id_fkey(name, working_station)
            )
          `)
          .gte('verified_at', startDate)
          .lte('verified_at', endDate + 'T23:59:59');

        if (error) throw error;

        // Filter logs by working station
        const filteredLogs = logs?.filter(log => {
          if (!log.ticket) return false;
          
          const verifiedByMatch = log.verified_by?.includes(user?.workingStation || '');
          const ticketFromStationMatch = log.ticket.from_station?.working_station === user?.workingStation;
          const ticketToStationMatch = log.ticket.to_station?.working_station === user?.workingStation;
          const ticketCreatedByMatch = log.ticket.created_by?.includes(user?.workingStation || '');
          
          return verifiedByMatch || ticketFromStationMatch || ticketToStationMatch || ticketCreatedByMatch;
        }) || [];

        headers.push('Travel ID', 'Status', 'Verified By', 'Verified At', 'Passenger Name', 'Route');
        
        filteredLogs.forEach(log => {
          rows.push([
            log.travel_id,
            log.status,
            log.verified_by,
            log.verified_at ? new Date(log.verified_at).toLocaleString() : 'N/A',
            log.ticket?.passenger_name || 'N/A',
            `${log.ticket?.from_station?.name || 'N/A'} to ${log.ticket?.to_station?.name || 'N/A'}`
          ]);
        });
      }

      // Create CSV content
      csvData = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      // Create and download file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_${startDate}_to_${endDate}_${user?.workingStation || 'all'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${reportType} report downloaded successfully for ${user?.workingStation} station (${rows.length} records)`,
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error", 
        description: error?.message || "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">Generate and download reports for tickets, revenue, and verification logs</p>
          {user?.workingStation && (
            <p className="text-blue-600 font-medium mt-1">Station: {user.workingStation}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Generate Custom Report
                {user?.workingStation && (
                  <span className="text-sm font-normal text-blue-600">
                    - {user.workingStation} Station Only
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Generate and download reports in CSV format for the selected period (filtered by your station)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-type">Filter Type</Label>
                  <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tickets">Railway Tickets</SelectItem>
                      <SelectItem value="verification_logs">Verification Logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={downloadReport} 
                className="w-full md:w-auto"
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Generating Report...' : `Download ${user?.workingStation || 'Station'} Report (CSV)`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Auto-Generated Daily Reports
                {user?.workingStation && (
                  <span className="text-sm font-normal text-gray-500">
                    - {user.workingStation} Station
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Reports are automatically generated daily at 8:00 AM for your station
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div>Loading reports...</div>
              ) : dailyReports.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No reports generated yet for {user?.workingStation} station. Reports will be available after 8:00 AM daily.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Report Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Generated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize">
                          {report.report_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{report.file_name}</TableCell>
                        <TableCell>{formatFileSize(report.file_size)}</TableCell>
                        <TableCell>{report.working_station || 'All Stations'}</TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
