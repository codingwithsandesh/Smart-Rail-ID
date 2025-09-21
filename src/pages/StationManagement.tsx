import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import StationForm from '../components/StationForm';
import StationEditForm from '../components/StationEditForm';
import TrainForm from '../components/TrainForm';
import TrainEditForm from '../components/TrainEditForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useStations, useDeleteStation, useTrains, useDeleteTrain } from '../hooks/useSupabaseData';
import { toast } from '../hooks/use-toast';
import { MapPin, Trash2, Edit, Eye, Train, Search } from 'lucide-react';
import { getTrainWithDetails, getDayName, getClassDisplayName } from '../utils/trainUtils';
import { useAuth } from '../contexts/AuthContext';

const StationManagement = () => {
  const { user } = useAuth();
  const { data: stations = [], isLoading: stationsLoading, error: stationsError, refetch: refetchStations } = useStations();
  const { data: trains = [], isLoading: trainsLoading, error: trainsError, refetch: refetchTrains } = useTrains();
  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [editingTrain, setEditingTrain] = useState<any>(null);
  const [stationSearch, setStationSearch] = useState('');
  const [trainSearch, setTrainSearch] = useState('');
  
  const deleteStationMutation = useDeleteStation();
  const deleteTrainMutation = useDeleteTrain();

  // Filter stations based on search
  const filteredStations = useMemo(() => {
    if (!stationSearch.trim()) return stations;
    return stations.filter(station => 
      station.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      station.code.toLowerCase().includes(stationSearch.toLowerCase())
    );
  }, [stations, stationSearch]);

  // Filter trains based on search
  const filteredTrains = useMemo(() => {
    if (!trainSearch.trim()) return trains;
    return trains.filter(train => 
      train.name.toLowerCase().includes(trainSearch.toLowerCase()) ||
      train.number.toLowerCase().includes(trainSearch.toLowerCase())
    );
  }, [trains, trainSearch]);

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteStationMutation.mutateAsync(stationId);
      toast({
        title: "Station Deleted",
        description: "Station has been deleted successfully"
      });
      refetchStations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete station. It may be used in existing routes.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTrain = async (trainId: string) => {
    if (!confirm('Are you sure you want to delete this train? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTrainMutation.mutateAsync(trainId);
      toast({
        title: "Train Deleted",
        description: "Train has been deleted successfully"
      });
      refetchTrains();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete train",
        variant: "destructive"
      });
    }
  };

  const handleViewTrainDetails = async (trainId: string) => {
    try {
      const trainDetails = await getTrainWithDetails(trainId);
      setSelectedTrain(trainDetails);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load train details",
        variant: "destructive"
      });
    }
  };

  const handleEditStation = (station: any) => {
    setEditingStation(station);
  };

  const handleEditTrain = (train: any) => {
    setEditingTrain(train);
  };

  const handleStationEditSuccess = () => {
    refetchStations();
    setEditingStation(null);
  };

  const handleTrainEditSuccess = () => {
    refetchTrains();
    setEditingTrain(null);
  };

  if (stationsLoading || trainsLoading) {
    return (
      <Layout title="Station & Train Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading station and train data...</div>
        </div>
      </Layout>
    );
  }

  if (stationsError || trainsError) {
    return (
      <Layout title="Station & Train Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading data. Please try again.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Station & Train Management">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Station Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Station Management</h2>
            {user?.workingStation && (
              <div className="text-sm text-blue-600 font-medium">
                Managing: {user.workingStation} Station
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Station */}
            <StationForm />

            {/* Station List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Stations ({filteredStations.length})</CardTitle>
                <CardDescription>Manage your railway stations</CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search stations..."
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredStations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {stationSearch ? 'No stations found matching your search' : 'No stations found'}
                    </p>
                  ) : (
                    filteredStations.map(station => (
                      <div key={station.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{station.name}</span>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {station.code}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{station.address || 'No address'}</p>
                          </div>
                          <div className="flex space-x-1 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditStation(station)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStation(station.id)}
                              disabled={deleteStationMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Train Management Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Train Management</h2>
          
          {/* Add New Train */}
          <TrainForm onTrainCreated={() => refetchTrains()} />

          {/* Trains List */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Trains ({filteredTrains.length})</CardTitle>
              <CardDescription>Manage your trains and their schedules</CardDescription>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trains..."
                  value={trainSearch}
                  onChange={(e) => setTrainSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredTrains.length === 0 ? (
                <div className="text-center py-8">
                  <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {trainSearch ? 'No trains found matching your search' : 'No trains found'}
                  </p>
                  {!trainSearch && (
                    <p className="text-sm text-gray-400">Create your first train using the form above</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTrains.map(train => (
                    <div key={train.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Train className="h-5 w-5 text-purple-600" />
                            <span className="font-medium text-lg">{train.name}</span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{train.number}
                            </span>
                            {train.working_station && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {train.working_station}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTrainDetails(train.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTrain(train)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTrain(train.id)}
                            disabled={deleteTrainMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Train Details Modal */}
          {selectedTrain && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Train Details: {selectedTrain.name}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedTrain(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Route Details */}
                <div>
                  <h4 className="font-semibold mb-3">Route Information</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Station</TableHead>
                          <TableHead>Distance</TableHead>
                          <TableHead>Arrival</TableHead>
                          <TableHead>Departure</TableHead>
                          <TableHead>Halt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTrain.train_routes
                          ?.sort((a: any, b: any) => a.halt_order - b.halt_order)
                          .map((route: any) => (
                          <TableRow key={route.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span>{route.station?.name} ({route.station?.code})</span>
                              </div>
                            </TableCell>
                            <TableCell>{route.distance_from_start} KM</TableCell>
                            <TableCell>{route.arrival_time || '-'}</TableCell>
                            <TableCell>{route.departure_time || '-'}</TableCell>
                            <TableCell>{route.halt_duration || 0} min</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Schedule Details */}
                <div>
                  <h4 className="font-semibold mb-3">Running Schedule</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrain.train_schedules?.map((schedule: any) => (
                      <span 
                        key={schedule.id}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {getDayName(schedule.day_of_week)}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialogs */}
      {editingStation && (
        <StationEditForm
          station={editingStation}
          isOpen={!!editingStation}
          onClose={() => setEditingStation(null)}
          onSuccess={handleStationEditSuccess}
        />
      )}

      {editingTrain && (
        <TrainEditForm
          train={editingTrain}
          isOpen={!!editingTrain}
          onClose={() => setEditingTrain(null)}
          onSuccess={handleTrainEditSuccess}
        />
      )}
    </Layout>
  );
};

export default StationManagement;
