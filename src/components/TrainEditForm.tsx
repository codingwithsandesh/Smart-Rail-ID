
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Train } from '../utils/trainUtils';
import { useStations } from '../hooks/useSupabaseData';
import { getTrainWithDetails, getDayName, createTrainRoute, createTrainSchedule } from '../utils/trainUtils';
import { Plus, IndianRupee, MapPin, Calendar } from 'lucide-react';

interface TrainEditFormProps {
  train: Train;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TrainEditForm = ({ train, isOpen, onClose, onSuccess }: TrainEditFormProps) => {
  const { data: stations = [] } = useStations();
  const [isUpdating, setIsUpdating] = useState(false);
  const [trainDetails, setTrainDetails] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: train.name,
    number: train.number
  });

  const [routes, setRoutes] = useState<Array<{
    id?: string;
    stationId: string;
    distanceFromStart: number;
    arrivalTime: string;
    departureTime: string;
    haltDuration: number;
    pricing: {
      general: number;
      sleeper: number;
      ac2: number;
      ac3: number;
      ac1: number;
      '2s': number;
      '3e': number;
      cc: number;
      other: number;
    };
  }>>([]);

  const [schedules, setSchedules] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && train.id) {
      loadTrainDetails();
    }
  }, [isOpen, train.id]);

  const loadTrainDetails = async () => {
    try {
      const details = await getTrainWithDetails(train.id);
      setTrainDetails(details);
      
      // Load routes
      const routeData = details.train_routes?.map((route: any) => ({
        id: route.id,
        stationId: route.station_id,
        distanceFromStart: route.distance_from_start,
        arrivalTime: route.arrival_time || '',
        departureTime: route.departure_time || '',
        haltDuration: route.halt_duration || 0,
        pricing: {
          general: route.general_price || 0,
          sleeper: route.sleeper_price || 0,
          ac2: route.ac_2_tier_price || 0,
          ac3: route.ac_3_tier_price || 0,
          ac1: route.ac_1_tier_price || 0,
          '2s': route.second_sitting_price || 0,
          '3e': route.ac_3_economy_price || 0,
          cc: route.chair_car_price || 0,
          other: 0
        }
      })) || [];
      setRoutes(routeData);

      // Load schedules
      const scheduleData = details.train_schedules?.map((schedule: any) => schedule.day_of_week) || [];
      setSchedules(scheduleData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load train details",
        variant: "destructive"
      });
    }
  };

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
        ac2: 0,
        ac3: 0,
        ac1: 0,
        '2s': 0,
        '3e': 0,
        cc: 0,
        other: 0
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
    
    if (!formData.name.trim() || !formData.number.trim()) {
      toast({
        title: "Error",
        description: "Please enter train name and number",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Update basic train info
      const { error: trainError } = await supabase
        .from('trains')
        .update({
          name: formData.name.trim(),
          number: formData.number.trim()
        })
        .eq('id', train.id);

      if (trainError) throw trainError;

      // Delete existing routes and schedules
      await supabase.from('train_routes').delete().eq('train_id', train.id);
      await supabase.from('train_schedules').delete().eq('train_id', train.id);

      // Create new routes
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
            ac_1_tier_price: route.pricing.ac1 || 0,
            ac_2_tier_price: route.pricing.ac2 || 0,
            ac_3_tier_price: route.pricing.ac3 || 0,
            second_sitting_price: route.pricing['2s'] || 0,
            ac_3_economy_price: route.pricing['3e'] || 0,
            chair_car_price: route.pricing.cc || 0
          });
        }
      }

      // Create new schedules
      for (const dayIndex of schedules) {
        await createTrainSchedule({
          train_id: train.id,
          day_of_week: dayIndex,
          is_active: true
        });
      }

      toast({
        title: "Train Updated",
        description: `${formData.name} has been updated successfully`
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update train",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const seatClasses = [
    { key: 'general', label: 'General' },
    { key: 'sleeper', label: 'Sleeper' },
    { key: 'ac2', label: '2nd AC' },
    { key: 'ac3', label: '3rd AC' },
    { key: 'ac1', label: '1st AC' },
    { key: '2s', label: '2nd Sitting' },
    { key: '3e', label: '3rd Economy' },
    { key: 'cc', label: 'Chair Car' },
    { key: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Train</DialogTitle>
          <DialogDescription>Update train information, routes, and schedules</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Train Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTrainName">Train Name *</Label>
                <Input
                  id="editTrainName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Washim Express"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTrainNumber">Train Number *</Label>
                <Input
                  id="editTrainNumber"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
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
                </div>

                {/* Show pricing only if halt duration > 0 */}
                {route.haltDuration > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <Label className="font-medium">Ticket Prices for this Station</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
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
                    id={`edit-day-${dayIndex}`}
                    checked={schedules.includes(dayIndex)}
                    onCheckedChange={() => toggleSchedule(dayIndex)}
                  />
                  <Label htmlFor={`edit-day-${dayIndex}`} className="text-sm">
                    {getDayName(dayIndex).substring(0, 3)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Train'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrainEditForm;
