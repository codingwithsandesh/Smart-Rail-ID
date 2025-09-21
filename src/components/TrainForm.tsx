
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useStations } from '../hooks/useSupabaseData';
import { createTrain, createTrainRoute, createTrainSchedule, getDayName } from '../utils/trainUtils';
import { toast } from '../hooks/use-toast';
import { Train, Plus, Clock, MapPin, Calendar, IndianRupee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TrainForm = ({ onTrainCreated }: { onTrainCreated?: () => void }) => {
  const { user } = useAuth();
  const { data: stations = [] } = useStations();
  const [isCreating, setIsCreating] = useState(false);
  
  const [trainData, setTrainData] = useState({
    name: '',
    number: ''
  });

  const [routes, setRoutes] = useState<Array<{
    stationId: string;
    distanceFromStart: number;
    arrivalTime: string;
    departureTime: string;
    haltDuration: number;
    pricing: {
      general: number;
      sleeper: number;
      ac_1_tier: number;
      ac_2_tier: number;
      ac_3_tier: number;
      second_sitting: number;
      ac_3_economy: number;
      chair_car: number;
    };
  }>>([]);

  const [schedules, setSchedules] = useState<number[]>([]);

  const addRoute = () => {
    setRoutes([...routes, {
      stationId: '',
      distanceFromStart: 0,
      arrivalTime: '',
      departureTime: '',
      haltDuration: 0,
      pricing: {
        general: 0,
        sleeper: 0,
        ac_1_tier: 0,
        ac_2_tier: 0,
        ac_3_tier: 0,
        second_sitting: 0,
        ac_3_economy: 0,
        chair_car: 0,
      }
    }]);
  };

  const updateRoute = (index: number, field: string, value: any) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = { ...updatedRoutes[index], [field]: value };
    setRoutes(updatedRoutes);
  };

  const updateRoutePricing = (routeIndex: number, classType: string, price: number) => {
    const updatedRoutes = [...routes];
    updatedRoutes[routeIndex].pricing = {
      ...updatedRoutes[routeIndex].pricing,
      [classType]: price
    };
    setRoutes(updatedRoutes);
  };

  const removeRoute = (index: number) => {
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const toggleSchedule = (dayIndex: number) => {
    if (schedules.includes(dayIndex)) {
      setSchedules(schedules.filter(d => d !== dayIndex));
    } else {
      setSchedules([...schedules, dayIndex]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trainData.name.trim() || !trainData.number.trim()) {
      toast({
        title: "Error",
        description: "Please enter train name and number",
        variant: "destructive"
      });
      return;
    }

    if (routes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one route station",
        variant: "destructive"
      });
      return;
    }

    if (schedules.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day for train schedule",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create train with working station
      const train = await createTrain({
        name: trainData.name.trim(),
        number: trainData.number.trim(),
        working_station: user?.workingStation || null
      });

      // Create routes only for stations with halt times (> 0)
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        if (route.stationId && route.haltDuration > 0) {
          await createTrainRoute({
            train_id: train.id,
            station_id: route.stationId,
            halt_order: i + 1,
            distance_from_start: route.distanceFromStart,
            arrival_time: route.arrivalTime || null,
            departure_time: route.departureTime || null,
            halt_duration: route.haltDuration,
            general_price: route.pricing.general || 0,
            sleeper_price: route.pricing.sleeper || 0,
            ac_1_tier_price: route.pricing.ac_1_tier || 0,
            ac_2_tier_price: route.pricing.ac_2_tier || 0,
            ac_3_tier_price: route.pricing.ac_3_tier || 0,
            second_sitting_price: route.pricing.second_sitting || 0,
            ac_3_economy_price: route.pricing.ac_3_economy || 0,
            chair_car_price: route.pricing.chair_car || 0
          });
        }
      }

      // Create schedules
      for (const dayIndex of schedules) {
        await createTrainSchedule({
          train_id: train.id,
          day_of_week: dayIndex,
          is_active: true
        });
      }

      toast({
        title: "Train Created Successfully!",
        description: `${trainData.name} (${trainData.number}) has been added to ${user?.workingStation || 'general'} station network`
      });

      // Reset form
      setTrainData({ name: '', number: '' });
      setRoutes([]);
      setSchedules([]);
      
      onTrainCreated?.();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create train: " + (error.message || 'Unknown error'),
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const seatClasses = [
    { key: 'general', label: 'General' },
    { key: 'sleeper', label: 'Sleeper' },
    { key: 'ac_2_tier', label: '2nd AC' },
    { key: 'ac_3_tier', label: '3rd AC' },
    { key: 'ac_1_tier', label: '1st AC' },
    { key: 'second_sitting', label: '2nd Sitting' },
    { key: 'ac_3_economy', label: '3rd Economy' },
    { key: 'chair_car', label: 'Chair Car' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Train className="h-6 w-6 text-purple-600" />
          <CardTitle>Add New Train</CardTitle>
        </div>
        <CardDescription>
          Create a new train with routes and schedules
          {user?.workingStation && (
            <span className="block text-purple-600 font-medium mt-1">
              Will be added to: {user.workingStation} Station Network
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Train Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainName">Train Name *</Label>
                <Input
                  id="trainName"
                  value={trainData.name}
                  onChange={(e) => setTrainData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Washim Express"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainNumber">Train Number *</Label>
                <Input
                  id="trainNumber"
                  value={trainData.number}
                  onChange={(e) => setTrainData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="e.g., 12345"
                  required
                />
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Route & Stations with Pricing
              </h3>
              <Button type="button" onClick={addRoute} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Station
              </Button>
            </div>
            
            {routes.map((route, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Station {index + 1}</span>
                  <Button 
                    type="button" 
                    onClick={() => removeRoute(index)} 
                    variant="destructive" 
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
                
                {/* Station Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Station *</Label>
                    <Select 
                      value={route.stationId} 
                      onValueChange={(value) => updateRoute(index, 'stationId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map(station => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name} ({station.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Distance from Start (KM)</Label>
                    <Input
                      type="number"
                      value={route.distanceFromStart}
                      onChange={(e) => updateRoute(index, 'distanceFromStart', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Arrival Time</Label>
                    <Input
                      type="time"
                      value={route.arrivalTime}
                      onChange={(e) => updateRoute(index, 'arrivalTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departure Time</Label>
                    <Input
                      type="time"
                      value={route.departureTime}
                      onChange={(e) => updateRoute(index, 'departureTime', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Halt Duration (minutes) *</Label>
                  <Input
                    type="number"
                    value={route.haltDuration}
                    onChange={(e) => updateRoute(index, 'haltDuration', parseInt(e.target.value) || 0)}
                    placeholder="Enter halt duration"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Only stations with halt duration will be saved with pricing
                  </p>
                </div>

                {/* Show pricing only if halt duration > 0 */}
                {route.haltDuration > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <Label className="font-medium">Ticket Prices for this Station</Label>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {seatClasses.map((seatClass) => (
                        <div key={seatClass.key} className="space-y-1">
                          <Label className="text-sm">{seatClass.label}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={route.pricing[seatClass.key as keyof typeof route.pricing]}
                            onChange={(e) => updateRoutePricing(index, seatClass.key, parseFloat(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Running Days *
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                <div key={dayIndex} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${dayIndex}`}
                    checked={schedules.includes(dayIndex)}
                    onCheckedChange={() => toggleSchedule(dayIndex)}
                  />
                  <Label htmlFor={`day-${dayIndex}`} className="text-sm">
                    {getDayName(dayIndex).substring(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating Train...' : 'Create Train'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrainForm;
