
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar, Trash2, Download } from 'lucide-react';

interface DatewiseDataManagementProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedDateTickets: any[];
  selectedDateLogs: any[];
  isDeleting: boolean;
  handleDeleteByDate: () => void;
  exportToCSV: () => void;
}

const DatewiseDataManagement = ({
  selectedDate,
  setSelectedDate,
  selectedDateTickets,
  selectedDateLogs,
  isDeleting,
  handleDeleteByDate,
  exportToCSV
}: DatewiseDataManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-left">
          <Calendar className="h-5 w-5" />
          Date-wise Data Management
        </CardTitle>
        <CardDescription className="text-left">
          Delete tickets and verification logs for a specific date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="date-select" className="text-left">Select Date</Label>
          <Input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p className="text-left">Selected date data:</p>
          <p className="text-left">• Tickets: {selectedDateTickets.length}</p>
          <p className="text-left">• Verification Logs: {selectedDateLogs.length}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDeleteByDate}
            disabled={isDeleting || selectedDateTickets.length === 0}
            variant="destructive"
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Date Data'}
          </Button>
          
          <Button
            onClick={exportToCSV}
            disabled={selectedDateTickets.length === 0 && selectedDateLogs.length === 0}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatewiseDataManagement;
