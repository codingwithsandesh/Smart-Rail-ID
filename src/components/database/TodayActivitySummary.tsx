
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileText } from 'lucide-react';

interface TodayActivitySummaryProps {
  todayTickets: any[];
  todayLogs: any[];
}

const TodayActivitySummary = ({ todayTickets, todayLogs }: TodayActivitySummaryProps) => {
  const todayRevenue = todayTickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price.toString()), 0);
  const todayPassengers = todayTickets.reduce((sum, ticket) => sum + ticket.passenger_count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-left">
          <FileText className="h-5 w-5" />
          Today's Activity Summary
        </CardTitle>
        <CardDescription className="text-left">
          Overview of today's ticket sales and verifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{todayTickets.length}</div>
            <div className="text-sm text-gray-500 text-left">Tickets Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{todayLogs.length}</div>
            <div className="text-sm text-gray-500 text-left">Verifications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ₹{todayRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 text-left">Today's Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {todayPassengers}
            </div>
            <div className="text-sm text-gray-500 text-left">Passengers</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayActivitySummary;
