
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useStations, useCreateRoute } from '../hooks/useSupabaseData';
import { toast } from '../hooks/use-toast';
import { Plus, Route as RouteIcon } from 'lucide-react';

const RouteForm = () => {
  const { data: stations = [] } = useStations();
  const createRouteMutation = useCreateRoute();
  const [newRoute, setNewRoute] = useState({
    fromStationId: '',
    toStationId: '',
    distance: '',
    generalPrice: '',
    sleeperPrice: '',
    acPrice: ''
  });

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoute.fromStationId || !newRoute.toStationId || !newRoute.distance) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (newRoute.fromStationId === newRoute.toStationId) {
      toast({
        title: "Error",
        description: "From and To stations cannot be the same",
        variant: "destructive"
      });
      return;
    }

    try {
      await createRouteMutation.mutateAsync({
        from_station_id: newRoute.fromStationId,
        to_station_id: newRoute.toStationId,
        distance: parseInt(newRoute.distance),
        general_price: parseFloat(newRoute.generalPrice) || 0,
        sleeper_price: parseFloat(newRoute.sleeperPrice) || 0,
        ac_price: parseFloat(newRoute.acPrice) || 0
      });

      setNewRoute({
        fromStationId: '',
        toStationId: '',
        distance: '',
        generalPrice: '',
        sleeperPrice: '',
        acPrice: ''
      });
      
      toast({
        title: "Route Added",
        description: "Route has been added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add route",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <RouteIcon className="h-5 w-5 text-green-600" />
          <CardTitle>Create Travel Route</CardTitle>
        </div>
        <CardDescription>Define a valid travel route between stations with pricing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddRoute} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromStation">From Station *</Label>
              <Select value={newRoute.fromStationId} onValueChange={(value) => setNewRoute(prev => ({ ...prev, fromStationId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select from station" />
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
              <Label htmlFor="toStation">To Station *</Label>
              <Select value={newRoute.toStationId} onValueChange={(value) => setNewRoute(prev => ({ ...prev, toStationId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select to station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.filter(s => s.id !== newRoute.fromStationId).map(station => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name} ({station.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (KM) *</Label>
            <Input
              id="distance"
              type="number"
              value={newRoute.distance}
              onChange={(e) => setNewRoute(prev => ({ ...prev, distance: e.target.value }))}
              placeholder="e.g., 45"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generalPrice">General Class (₹) *</Label>
              <Input
                id="generalPrice"
                type="number"
                step="0.01"
                value={newRoute.generalPrice}
                onChange={(e) => setNewRoute(prev => ({ ...prev, generalPrice: e.target.value }))}
                placeholder="25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleeperPrice">Sleeper Class (₹) *</Label>
              <Input
                id="sleeperPrice"
                type="number"
                step="0.01"
                value={newRoute.sleeperPrice}
                onChange={(e) => setNewRoute(prev => ({ ...prev, sleeperPrice: e.target.value }))}
                placeholder="50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acPrice">AC Class (₹) *</Label>
              <Input
                id="acPrice"
                type="number"
                step="0.01"
                value={newRoute.acPrice}
                onChange={(e) => setNewRoute(prev => ({ ...prev, acPrice: e.target.value }))}
                placeholder="100"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createRouteMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            {createRouteMutation.isPending ? 'Creating...' : 'Create Route'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouteForm;
