
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useCreateStation } from '../hooks/useSupabaseData';
import { toast } from '../hooks/use-toast';
import { Plus, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const StationForm = () => {
  const { user } = useAuth();
  const createStationMutation = useCreateStation();
  const [newStation, setNewStation] = useState({ name: '', code: '', address: '' });

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStation.name.trim() || !newStation.code.trim()) {
      toast({
        title: "Error",
        description: "Please enter station name and station code",
        variant: "destructive"
      });
      return;
    }

    const codeLength = newStation.code.trim().length;
    if (codeLength < 2 || codeLength > 4) {
      toast({
        title: "Error",
        description: "Station code must be 2-4 letters",
        variant: "destructive"
      });
      return;
    }

    if (!user?.workingStation) {
      toast({
        title: "Error",
        description: "Working station not found. Please contact admin.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicates ONLY within the current working station
    try {
      console.log('Checking duplicates for working station:', user.workingStation);
      
      const { data: existingStations, error } = await supabase
        .from('stations')
        .select('name, code, working_station')
        .eq('working_station', user.workingStation);

      if (error) {
        console.error('Error checking existing stations:', error);
        toast({
          title: "Error",
          description: "Failed to check existing stations. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Existing stations in', user.workingStation, ':', existingStations);

      if (existingStations && existingStations.length > 0) {
        const duplicateName = existingStations.find(
          station => station.name.toLowerCase() === newStation.name.trim().toLowerCase()
        );
        const duplicateCode = existingStations.find(
          station => station.code.toUpperCase() === newStation.code.trim().toUpperCase()
        );

        if (duplicateName) {
          toast({
            title: "Error",
            description: `Station name "${newStation.name}" already exists in ${user.workingStation} station network. Please use a different name.`,
            variant: "destructive"
          });
          return;
        }

        if (duplicateCode) {
          toast({
            title: "Error", 
            description: `Station code "${newStation.code.toUpperCase()}" already exists in ${user.workingStation} station network. Please use a different code.`,
            variant: "destructive"
          });
          return;
        }
      }

      // If no duplicates found, create the station
      await createStationMutation.mutateAsync({
        name: newStation.name.trim(),
        code: newStation.code.toUpperCase().trim(),
        address: newStation.address.trim() || null,
        working_station: user.workingStation
      });

      setNewStation({ name: '', code: '', address: '' });
      
      toast({
        title: "Station Added",
        description: `${newStation.name} (${newStation.code.toUpperCase()}) has been added successfully to ${user.workingStation} station network`
      });
      
    } catch (error: any) {
      console.error('Station creation error:', error);
      
      let errorMessage = "Failed to add station. Please try again.";
      
      // Handle specific PostgreSQL errors as fallback
      if (error?.message?.includes('duplicate key value violates unique constraint')) {
        if (error.message.includes('stations_name_key')) {
          errorMessage = `Station name "${newStation.name}" already exists in the system. Please use a different name.`;
        } else if (error.message.includes('stations_code_key')) {
          errorMessage = `Station code "${newStation.code.toUpperCase()}" already exists in the system. Please use a different code.`;
        } else {
          errorMessage = "A station with this name or code already exists in the system. Please use different values.";
        }
      } else if (error?.code === '23505') {
        errorMessage = "A station with this name or code already exists in the system. Please use different values.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <CardTitle>Add New Station</CardTitle>
        </div>
        <CardDescription>
          Create a new railway station for your network
          {user?.workingStation && (
            <span className="block text-blue-600 font-medium mt-1">
              Will be added to: {user.workingStation} Station Network
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddStation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stationName">Station Name *</Label>
            <Input
              id="stationName"
              value={newStation.name}
              onChange={(e) => setNewStation(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Washim Junction"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stationCode">Station Code (2-4 letters) *</Label>
            <Input
              id="stationCode"
              value={newStation.code}
              onChange={(e) => setNewStation(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., WSIM or WS"
              maxLength={4}
              pattern="[A-Za-z]{2,4}"
              title="Please enter 2-4 letters"
              required
            />
            <p className="text-xs text-gray-500">Station code must be 2-4 letters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stationAddress">Station Address (Optional)</Label>
            <Input
              id="stationAddress"
              value={newStation.address}
              onChange={(e) => setNewStation(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Full postal address"
            />
          </div>
          <Button type="submit" className="w-full" disabled={createStationMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            {createStationMutation.isPending ? 'Adding...' : 'Add Station'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StationForm;
