
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTicketsByDateRange } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';
import { IndianRupee, Users, Ticket, TrendingUp } from 'lucide-react';

const TodayStats = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: todayTickets = [] } = useTicketsByDateRange(today, today);

  // Calculate today's statistics
  const todayStats = {
    totalRevenue: todayTickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price.toString()), 0),
    totalPassengers: todayTickets.reduce((sum, ticket) => sum + ticket.passenger_count, 0),
    totalTickets: todayTickets.length,
    averageTicketPrice: todayTickets.length > 0 ? 
      todayTickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price.toString()), 0) / todayTickets.length : 0
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-left">Today's Performance</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 text-left">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">₹{todayStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 text-left">
              {user?.workingStation} Station
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 text-left">Today's Passengers</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{todayStats.totalPassengers}</div>
            <p className="text-xs text-green-600 dark:text-green-400 text-left">Passengers served</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 text-left">Today's Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{todayStats.totalTickets}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 text-left">Tickets issued</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 text-left">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">₹{todayStats.averageTicketPrice.toFixed(0)}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 text-left">Per ticket</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodayStats;
