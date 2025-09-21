
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useTicketsByDateRange } from '../../hooks/useSupabaseData';
import { useAuth } from '../../contexts/AuthContext';
import { IndianRupee, TrendingUp, Users, Ticket } from 'lucide-react';

const RevenueAnalytics = () => {
  const { user } = useAuth();
  
  // Get data for the last 30 days to have more data
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const { data: tickets = [] } = useTicketsByDateRange(startDate, endDate);

  console.log('Revenue Analytics - Raw tickets data:', tickets);
  console.log('Revenue Analytics - User working station:', user?.workingStation);

  // Use all tickets - the filtering is already done in the hook
  const filteredTickets = tickets;

  console.log('Revenue Analytics - Using tickets:', filteredTickets);

  // Calculate revenue by class type
  const revenueByClass = filteredTickets.reduce((acc: any, ticket: any) => {
    let className = 'general';
    
    // Check if it's a platform ticket
    if (ticket.class_type === 'platform' || ticket.ticket_class === 'platform') {
      className = 'platform';
    } else {
      className = ticket.ticket_class || ticket.class_type || 'general';
    }
    
    if (!acc[className]) {
      acc[className] = { name: className, revenue: 0, count: 0 };
    }
    acc[className].revenue += parseFloat(ticket.total_price.toString());
    acc[className].count += ticket.passenger_count;
    return acc;
  }, {});

  const classData = Object.values(revenueByClass).map((item: any) => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    revenue: item.revenue,
    count: item.count
  }));

  console.log('Revenue Analytics - Class data:', classData);

  // Calculate daily revenue for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyRevenue = last7Days.map(date => {
    const dayTickets = filteredTickets.filter(ticket => ticket.travel_date === date);
    return {
      date,
      revenue: dayTickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price.toString()), 0),
      passengers: dayTickets.reduce((sum, ticket) => sum + ticket.passenger_count, 0),
      tickets: dayTickets.length
    };
  });

  console.log('Revenue Analytics - Daily revenue:', dailyRevenue);

  // Calculate totals
  const totalRevenue = filteredTickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_price.toString()), 0);
  const totalPassengers = filteredTickets.reduce((sum, ticket) => sum + ticket.passenger_count, 0);
  const totalTickets = filteredTickets.length;

  console.log('Revenue Analytics - Totals:', { totalRevenue, totalPassengers, totalTickets });

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#2563eb",
    },
    passengers: {
      label: "Passengers",
      color: "#60a5fa",
    },
    tickets: {
      label: "Tickets",
      color: "#34d399",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-left">Revenue Analytics</h2>
          <p className="text-gray-600 text-left">
            Last 30 days performance
            {user?.workingStation && (
              <span className="ml-2 text-blue-600 font-medium">
                - {user.workingStation} Station
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>Updated in real-time</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground text-left">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPassengers}</div>
            <p className="text-xs text-muted-foreground text-left">Passengers served</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-left">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground text-left">Tickets issued</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Daily Revenue Trend</CardTitle>
            <CardDescription className="text-left">Revenue over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={dailyRevenue}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-revenue)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue by Class */}
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Revenue by Class</CardTitle>
            <CardDescription className="text-left">Distribution of revenue by ticket class</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Daily Passengers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Daily Passengers</CardTitle>
            <CardDescription className="text-left">Number of passengers per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={dailyRevenue}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="passengers" fill="var(--color-passengers)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Class Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Class Performance</CardTitle>
            <CardDescription className="text-left">Tickets sold by class</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={classData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-tickets)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
