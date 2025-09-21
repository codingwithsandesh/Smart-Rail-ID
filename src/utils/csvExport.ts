
import * as XLSX from 'xlsx';
import { useToast } from '../components/ui/use-toast';

export const exportDataToCSV = (
  selectedDateTickets: any[],
  selectedDateLogs: any[],
  selectedDate: string,
  toast: ReturnType<typeof useToast>['toast']
) => {
  if (selectedDateTickets.length === 0 && selectedDateLogs.length === 0) {
    toast({
      title: "No Data",
      description: "No data available for the selected date",
      variant: "destructive",
    });
    return;
  }

  const ticketsData = selectedDateTickets.map(ticket => ({
    'Travel ID': ticket.travel_id,
    'Passenger Name': ticket.passenger_name,
    'From': ticket.from_station?.name || 'Unknown',
    'To': ticket.to_station?.name || 'Unknown',
    'Travel Date': ticket.travel_date,
    'Class': ticket.ticket_class,
    'Price': ticket.total_price,
    'Created By': ticket.created_by,
    'Verified': ticket.is_verified ? 'Yes' : 'No'
  }));

  const logsData = selectedDateLogs.map(log => {
    const verifiedAt = log.verified_at ? new Date(log.verified_at) : null;
    return {
      'Travel ID': log.travel_id,
      'Status': log.status,
      'Verified By': log.verified_by,
      'Verified At': verifiedAt ? verifiedAt.toLocaleString() : 'Unknown',
      'Fraud Attempt': log.fraud_attempt ? 'Yes' : 'No',
      'Details': log.details || 'None'
    };
  });

  const wb = XLSX.utils.book_new();
  
  if (ticketsData.length > 0) {
    const ticketsWs = XLSX.utils.json_to_sheet(ticketsData);
    XLSX.utils.book_append_sheet(wb, ticketsWs, 'Tickets');
  }
  
  if (logsData.length > 0) {
    const logsWs = XLSX.utils.json_to_sheet(logsData);
    XLSX.utils.book_append_sheet(wb, logsWs, 'Verification Logs');
  }
  
  XLSX.writeFile(wb, `database_data_${selectedDate}.xlsx`);
  
  toast({
    title: "Success",
    description: "Data exported successfully",
  });
};
