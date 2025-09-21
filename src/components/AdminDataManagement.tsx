import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  useStations, 
  useCreateStation, 
  useDeleteStation,
  useTrains,
  useCreateTrain,
  useDeleteTrain,
  Station
} from '../hooks/useSupabaseData';
import { Train } from '../utils/trainUtils';
import { MapPin, Train as TrainIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import StationForm from './StationForm';
import TrainForm from './TrainForm';
import StaffManagement from './StaffManagement';

const AdminDataManagement = () => {
  const { data: stations = [], isLoading: stationsLoading } = useStations();
  const { data: trains = [], isLoading: trainsLoading } = useTrains();
  const deleteStationMutation = useDeleteStation();
  const deleteTrainMutation = useDeleteTrain();
  const { toast } = useToast();

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this station? This will also delete all related routes.")) return;
    
    try {
      await deleteStationMutation.mutateAsync(stationId);
      toast({
        title: "Success",
        description: "Station deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete station",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrain = async (trainId: string) => {
    if (!confirm("Are you sure you want to delete this train?")) return;
    
    try {
      await deleteTrainMutation.mutateAsync(trainId);
      toast({
        title: "Success",
        description: "Train deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete train",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Stations
          </TabsTrigger>
          <TabsTrigger value="trains" className="flex items-center gap-2">
            <TrainIcon className="h-4 w-4" />
            Trains
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <TrainIcon className="h-4 w-4" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Station Management</CardTitle>
              <CardDescription>
                Add, edit, and manage railway stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StationForm />
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Existing Stations</h3>
                  {stationsLoading ? (
                    <div>Loading stations...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stations.map((station: Station) => (
                          <TableRow key={station.id}>
                            <TableCell className="font-medium">{station.name}</TableCell>
                            <TableCell>{station.code}</TableCell>
                            <TableCell>{station.address || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {/* TODO: Add edit functionality */}}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStation(station.id)}
                                  disabled={deleteStationMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Train Management</CardTitle>
              <CardDescription>
                Add, edit, and manage trains with their routes and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TrainForm />
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Existing Trains</h3>
                  {trainsLoading ? (
                    <div>Loading trains...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Train Number</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trains.map((train: Train) => (
                          <TableRow key={train.id}>
                            <TableCell className="font-medium">{train.number}</TableCell>
                            <TableCell>{train.name}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {/* TODO: Add edit functionality */}}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteTrain(train.id)}
                                  disabled={deleteTrainMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <StaffManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDataManagement;
