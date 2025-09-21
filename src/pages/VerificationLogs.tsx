
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { CalendarIcon, Download, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useVerificationLogs } from '../hooks/useSupabaseData';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const VerificationLogs = () => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: logs = [], isLoading } = useVerificationLogs(
    startDate || undefined, 
    endDate || undefined
  );

  // Filter logs by search term
  const filteredLogs = logs.filter(log => 
    log.travel_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.verified_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ticket?.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'fraud':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      valid: 'default',
      invalid: 'destructive',
      fraud: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Travel ID', 'Passenger Name', 'From', 'To', 'Status', 'Verified By', 'Verified At', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.travel_id,
        log.ticket?.passenger_name || 'N/A',
        log.ticket?.from_station?.name || 'N/A',
        log.ticket?.to_station?.name || 'N/A',
        log.status,
        log.verified_by,
        log.verified_at ? format(new Date(log.verified_at), 'yyyy-MM-dd HH:mm') : 'N/A',
        log.details || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-logs-${user?.workingStation || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Verification Logs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verification Logs</h1>
            <p className="text-gray-600">
              Track all ticket verification activities
              {user?.workingStation && user.role === 'admin' && (
                <span className="ml-2 text-blue-600 font-medium">
                  - {user.workingStation} Station
                </span>
              )}
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
            <CardDescription>
              Filter verification logs by date range and search by travel ID, verifier, or passenger name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Travel ID, verifier, passenger..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSearchTerm('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Records</CardTitle>
            <CardDescription>
              {filteredLogs.length} records found
              {user?.workingStation && user.role === 'admin' && (
                <span className="ml-2">for {user.workingStation} station</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading verification logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No verification logs found for the selected criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Travel ID</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Verified At</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.travel_id}
                        </TableCell>
                        <TableCell>
                          {log.ticket?.passenger_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{log.ticket?.from_station?.name || 'N/A'}</div>
                            <div className="text-gray-500">to</div>
                            <div>{log.ticket?.to_station?.name || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell>{log.verified_by}</TableCell>
                        <TableCell>
                          {log.verified_at ? (
                            <div className="text-sm">
                              <div>{format(new Date(log.verified_at), 'MMM dd, yyyy')}</div>
                              <div className="text-gray-500">{format(new Date(log.verified_at), 'HH:mm')}</div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {log.details || 'No details'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VerificationLogs;
