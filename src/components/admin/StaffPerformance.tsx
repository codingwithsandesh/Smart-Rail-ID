
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, Ticket, CheckCircle, TrendingUp, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface StaffStats {
  staffId: string;
  staffName: string;
  role: string;
  workingStation: string;
  ticketsCreated: number;
  ticketsVerified: number;
  totalRevenue: number;
  averageTicketPrice: number;
  lastActivity: string;
  activeToday: boolean;
}

const StaffPerformance = () => {
  const { user } = useAuth();
  const [staffStats, setStaffStats] = useState<StaffStats[]>([]);
  const [timeRange, setTimeRange] = useState('7'); // days
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [availableStations, setAvailableStations] = useState<string[]>([]);

  const fetchStaffPerformance = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Get all staff members
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (staffError) throw staffError;

      // Get tickets created by each staff member
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          from_station:stations!tickets_from_station_id_fkey(name, working_station),
          to_station:stations!tickets_to_station_id_fkey(name, working_station)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (ticketsError) throw ticketsError;

      // Get verification logs
      const { data: verifications, error: verificationsError } = await supabase
        .from('verification_logs')
        .select('*')
        .gte('verified_at', startDate.toISOString())
        .lte('verified_at', endDate.toISOString())
        .eq('status', 'valid');

      if (verificationsError) throw verificationsError;

      // Process staff statistics
      const staffStatsData: StaffStats[] = staff.map(member => {
        const createdTickets = tickets?.filter(ticket => 
          ticket.created_by?.includes(member.name) || 
          ticket.created_by?.includes(member.staff_id)
        ) || [];

        const verifiedTickets = verifications?.filter(verification => 
          verification.verified_by?.includes(member.name) || 
          verification.verified_by?.includes(member.staff_id)
        ) || [];

        const totalRevenue = createdTickets.reduce((sum, ticket) => sum + (ticket.total_price || 0), 0);
        const averageTicketPrice = createdTickets.length > 0 ? totalRevenue / createdTickets.length : 0;

        // Check if active today
        const today = new Date().toDateString();
        const activeToday = createdTickets.some(ticket => 
          new Date(ticket.created_at).toDateString() === today
        ) || verifiedTickets.some(verification => 
          new Date(verification.verified_at).toDateString() === today
        );

        // Find last activity
        const allActivities = [
          ...createdTickets.map(t => ({ date: t.created_at, type: 'created' })),
          ...verifiedTickets.map(v => ({ date: v.verified_at, type: 'verified' }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const lastActivity = allActivities.length > 0 
          ? new Date(allActivities[0].date).toLocaleString()
          : 'No recent activity';

        return {
          staffId: member.staff_id,
          staffName: member.name,
          role: member.role,
          workingStation: member.working_station || 'Not assigned',
          ticketsCreated: createdTickets.length,
          ticketsVerified: verifiedTickets.length,
          totalRevenue,
          averageTicketPrice,
          lastActivity,
          activeToday
        };
      });

      // Filter by station if selected
      const filteredStats = selectedStation === 'all' 
        ? staffStatsData 
        : staffStatsData.filter(stat => stat.workingStation === selectedStation);

      setStaffStats(filteredStats);

      // Extract unique stations
      const stations = [...new Set(staff.map(s => s.working_station).filter(Boolean))];
      setAvailableStations(stations);

    } catch (error) {
      console.error('Error fetching staff performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffPerformance();
  }, [timeRange, selectedStation]);

  // Chart data
  const chartData = staffStats.map(stat => ({
    name: stat.staffName.split(' ')[0], // First name only for chart
    ticketsCreated: stat.ticketsCreated,
    ticketsVerified: stat.ticketsVerified,
    revenue: stat.totalRevenue
  }));

  const roleDistribution = staffStats.reduce((acc, stat) => {
    acc[stat.role] = (acc[stat.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(roleDistribution).map(([role, count]) => ({
    name: role,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const topPerformers = [...staffStats]
    .sort((a, b) => (b.ticketsCreated + b.ticketsVerified) - (a.ticketsCreated + a.ticketsVerified))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Performance Analytics</h2>
          <p className="text-gray-600 dark:text-gray-300">Monitor staff productivity and ticket handling</p>
        </div>
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              {availableStations.map(station => (
                <SelectItem key={station} value={station}>{station}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffStats.filter(s => s.activeToday).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tickets Created</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffStats.reduce((sum, s) => sum + s.ticketsCreated, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tickets Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {staffStats.reduce((sum, s) => sum + s.ticketsVerified, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{staffStats.reduce((sum, s) => sum + s.totalRevenue, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Performance Comparison</CardTitle>
            <CardDescription>Tickets created and verified by each staff member</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ticketsCreated" fill="#8884d8" name="Created" />
                <Bar dataKey="ticketsVerified" fill="#82ca9d" name="Verified" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>Staff members by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription>Staff members with highest activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.staffId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{performer.staffName}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{performer.role}</Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{performer.workingStation}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {performer.ticketsCreated + performer.ticketsVerified} tickets
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{performer.totalRevenue.toFixed(0)} revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Details</CardTitle>
          <CardDescription>Complete staff performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Staff Member</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Station</th>
                  <th className="text-center p-2">Created</th>
                  <th className="text-center p-2">Verified</th>
                  <th className="text-center p-2">Revenue</th>
                  <th className="text-center p-2">Avg Price</th>
                  <th className="text-left p-2">Last Activity</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {staffStats.map(stat => (
                  <tr key={stat.staffId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2 font-medium text-gray-900 dark:text-white">{stat.staffName}</td>
                    <td className="p-2">
                      <Badge variant="outline">{stat.role}</Badge>
                    </td>
                    <td className="p-2 text-gray-600 dark:text-gray-400">{stat.workingStation}</td>
                    <td className="p-2 text-center font-semibold">{stat.ticketsCreated}</td>
                    <td className="p-2 text-center font-semibold">{stat.ticketsVerified}</td>
                    <td className="p-2 text-center font-semibold">₹{stat.totalRevenue.toFixed(0)}</td>
                    <td className="p-2 text-center">₹{stat.averageTicketPrice.toFixed(0)}</td>
                    <td className="p-2 text-sm text-gray-600 dark:text-gray-400">{stat.lastActivity}</td>
                    <td className="p-2 text-center">
                      <Badge variant={stat.activeToday ? 'default' : 'secondary'}>
                        {stat.activeToday ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPerformance;
