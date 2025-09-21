
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { Train, User, IndianRupee, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PlatformTicket = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get current date and time
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const [formData, setFormData] = useState({
    passengerName: '',
    travelDate: currentDate,
    passengerCount: 1,
    price: 10 // Default platform ticket price
  });

  // Fetch platform tickets for the selected date
  const { data: platformTickets = [] } = useQuery({
    queryKey: ['platform-tickets', formData.travelDate, user?.workingStation],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('*')
        .eq('travel_date', formData.travelDate)
        .order('created_at', { ascending: false });

      // Filter platform tickets and by working station
      if (user?.workingStation) {
        query = query.or(`class_type.eq.platform,ticket_class.eq.platform`).ilike('created_by', `%${user.workingStation}%`);
      } else {
        query = query.or(`class_type.eq.platform,ticket_class.eq.platform`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching platform tickets:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!formData.travelDate,
  });

  // Create platform ticket mutation
  const createPlatformTicketMutation = useMutation({
    mutationFn: async (platformTicketData: {
      passenger_name: string;
      travel_date: string;
      created_time: string;
      price: number;
      passenger_count: number;
      working_station: string;
      created_by: string;
    }) => {
      // Generate a unique 5-digit travel ID for platform ticket
      const travelId = `PLT-${Math.floor(10000 + Math.random() * 90000)}`;
      
      console.log('Creating platform ticket with data:', {
        ...platformTicketData,
        travel_id: travelId
      });
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          passenger_name: platformTicketData.passenger_name,
          travel_date: platformTicketData.travel_date,
          created_time: platformTicketData.created_time,
          price: platformTicketData.price,
          total_price: platformTicketData.price * platformTicketData.passenger_count,
          travel_id: travelId,
          passenger_count: platformTicketData.passenger_count,
          kilometres: 0,
          ticket_class: 'general', // Use 'general' instead of 'platform' for the constraint
          class_type: 'platform', // Use class_type to identify platform tickets
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          is_verified: false,
          created_by: `${platformTicketData.created_by} (${platformTicketData.working_station})`,
          from_station_id: null,
          to_station_id: null,
          route_id: null,
          train_id: null,
          departure_time: null,
          arrival_time: null,
          seat_number: null,
          verified_by: null,
          verified_at: null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Platform ticket creation error:', error);
        throw error;
      }
      
      console.log('Platform ticket created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['platform-tickets'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.passengerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter passenger name",
        variant: "destructive"
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Error",
        description: "Please set a valid price",
        variant: "destructive"
      });
      return;
    }

    if (!user?.workingStation) {
      toast({
        title: "Error",
        description: "Working station not found. Please login again.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPlatformTicketMutation.mutateAsync({
        passenger_name: formData.passengerName.trim(),
        travel_date: formData.travelDate,
        created_time: currentTime,
        price: formData.price,
        passenger_count: formData.passengerCount,
        working_station: user.workingStation,
        created_by: user.username || 'Unknown'
      });
      
      toast({
        title: "Platform Ticket Created Successfully!",
        description: `Passenger: ${formData.passengerName} | Count: ${formData.passengerCount} | Total: ₹${formData.price * formData.passengerCount}`,
      });

      // Reset form
      setFormData({
        passengerName: '',
        travelDate: currentDate,
        passengerCount: 1,
        price: 10
      });
      
    } catch (error) {
      console.error('Platform ticket creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to create platform ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Train className="h-6 w-6 text-green-600" />
            <CardTitle>Platform Ticket</CardTitle>
          </div>
          <CardDescription>
            Create platform tickets for station entry
            {user?.workingStation && (
              <span className="block mt-1 text-green-600 font-medium">
                Station: {user.workingStation}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformPassengerName">Passenger Name *</Label>
                <Input
                  id="platformPassengerName"
                  value={formData.passengerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, passengerName: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformTravelDate">Date *</Label>
                <Input
                  id="platformTravelDate"
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelDate: e.target.value }))}
                  min={currentDate}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformPassengerCount">Number of Passengers *</Label>
                <Select 
                  value={formData.passengerCount.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, passengerCount: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(count => (
                      <SelectItem key={count} value={count.toString()}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{count} Passenger{count > 1 ? 's' : ''}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformPrice">Price per Passenger (₹) *</Label>
                <Input
                  id="platformPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter ticket price"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold text-green-600">₹{formData.price * formData.passengerCount}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={createPlatformTicketMutation.isPending}
            >
              {createPlatformTicketMutation.isPending ? 'Creating Platform Ticket...' : `Create Platform Ticket - ₹${formData.price * formData.passengerCount}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Platform Tickets */}
      {platformTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Platform Tickets ({formData.travelDate})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformTickets.map((ticket: any) => (
                <div 
                  key={ticket.id} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">{ticket.passenger_name}</p>
                      <p className="text-sm text-gray-500">
                        ID: {ticket.travel_id} | Time: {ticket.created_time} | Count: {ticket.passenger_count}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">₹{ticket.total_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlatformTicket;
