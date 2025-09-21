
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Eye } from 'lucide-react';
import { getClassDisplayName } from '../../utils/trainUtils';

interface Station {
  id: string;
  name: string;
  code: string;
}

interface RecentTicketsProps {
  recentTickets: any[];
  stations: Station[];
  travelDate: string;
  ticketType?: 'railway' | 'platform';
}

const RecentTickets: React.FC<RecentTicketsProps> = ({
  recentTickets,
  stations,
  travelDate,
  ticketType = 'railway'
}) => {
  console.log('RecentTickets component - received tickets:', recentTickets);
  console.log('RecentTickets component - travel date:', travelDate);
  console.log('RecentTickets component - ticket type:', ticketType);

  // Filter tickets based on type with improved logic
  const filteredTickets = recentTickets.filter(ticket => {
    console.log('Filtering ticket:', ticket.travel_id, 'class_type:', ticket.class_type, 'ticket_class:', ticket.ticket_class);
    
    if (ticketType === 'railway') {
      // Railway tickets: have from_station_id and to_station_id, and class_type is NOT 'platform'
      // Also check if travel_id doesn't start with 'PLT-' (platform ticket prefix)
      const isRailwayTicket = ticket.from_station_id && 
                              ticket.to_station_id && 
                              ticket.class_type !== 'platform' && 
                              ticket.ticket_class !== 'platform' &&
                              !ticket.travel_id.startsWith('PLT-');
      
      console.log('Railway ticket check for', ticket.travel_id, ':', isRailwayTicket);
      return isRailwayTicket;
    } else {
      // Platform tickets: have class_type as 'platform' OR travel_id starts with 'PLT-'
      const isPlatformTicket = ticket.class_type === 'platform' || 
                               ticket.ticket_class === 'platform' ||
                               ticket.travel_id.startsWith('PLT-');
      
      console.log('Platform ticket check for', ticket.travel_id, ':', isPlatformTicket);
      return isPlatformTicket;
    }
  });

  console.log('Filtered tickets for', ticketType, ':', filteredTickets.length);

  const getTitle = () => {
    if (ticketType === 'railway') {
      return "Today's Railway Tickets";
    } else {
      return "Today's Platform Tickets";
    }
  };

  const getDescription = () => {
    if (ticketType === 'railway') {
      return `Railway tickets created on ${new Date(travelDate).toLocaleDateString()} - Showing ${filteredTickets.length} tickets`;
    } else {
      return `Platform tickets created on ${new Date(travelDate).toLocaleDateString()} - Showing ${filteredTickets.length} tickets`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-green-600" />
          <CardTitle>{getTitle()}</CardTitle>
        </div>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredTickets.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No {ticketType} tickets created for this date
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Travel ID</TableHead>
                <TableHead>Passenger</TableHead>
                {ticketType === 'railway' ? (
                  <>
                    <TableHead>Route</TableHead>
                    <TableHead>Train & Seat</TableHead>
                  </>
                ) : (
                  <TableHead>Details</TableHead>
                )}
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const fromStation = stations.find(s => s.id === ticket.from_station_id);
                const toStation = stations.find(s => s.id === ticket.to_station_id);
                
                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.travel_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.passenger_name}</p>
                        <p className="text-sm text-gray-500">{ticket.passenger_count} passenger{ticket.passenger_count > 1 ? 's' : ''}</p>
                      </div>
                    </TableCell>
                    {ticketType === 'railway' ? (
                      <>
                        <TableCell>
                          <div className="text-sm">
                            <p>{fromStation?.name || 'Unknown'} → {toStation?.name || 'Unknown'}</p>
                            <p className="text-gray-500">{ticket.kilometres} KM</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{getClassDisplayName(ticket.ticket_class)}</p>
                            <p className="text-gray-500">{ticket.seat_number || 'No seat'}</p>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">Platform Entry</p>
                          <p className="text-gray-500">Valid for platform access</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>₹{ticket.total_price}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTickets;
