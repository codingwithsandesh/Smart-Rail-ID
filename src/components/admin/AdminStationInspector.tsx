
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAllStations } from '../../hooks/useSupabaseData';
import { MapPin, Search, Building, AlertCircle } from 'lucide-react';

const AdminStationInspector = () => {
  const { data: allStations = [], isLoading, error } = useAllStations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByWorkingStation, setFilterByWorkingStation] = useState('all');

  // Debug logging
  useEffect(() => {
    console.log('AdminStationInspector - All stations:', allStations);
    console.log('AdminStationInspector - Loading:', isLoading);
    console.log('AdminStationInspector - Error:', error);
    console.log('AdminStationInspector - Total stations count:', allStations?.length || 0);
  }, [allStations, isLoading, error]);

  // Get unique working stations for filter
  const workingStations = Array.from(new Set(
    allStations
      .map(station => station.working_station)
      .filter(Boolean)
  )).sort();

  console.log('AdminStationInspector - Working stations:', workingStations);

  // Filter stations based on search and working station filter
  const filteredStations = allStations.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (station.address && station.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesWorkingStation = 
      filterByWorkingStation === 'all' || 
      station.working_station === filterByWorkingStation ||
      (filterByWorkingStation === 'unassigned' && !station.working_station);
    
    return matchesSearch && matchesWorkingStation;
  });

  console.log('AdminStationInspector - Filtered stations:', filteredStations.length);

  // Group stations by working station
  const groupedStations = filteredStations.reduce((groups, station) => {
    const workingStation = station.working_station || 'Unassigned';
    if (!groups[workingStation]) {
      groups[workingStation] = [];
    }
    groups[workingStation].push(station);
    return groups;
  }, {} as Record<string, typeof allStations>);

  console.log('AdminStationInspector - Grouped stations:', Object.keys(groupedStations));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading all stations...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Error Loading Stations</span>
            </div>
            <p className="text-sm text-red-700">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-blue-600" />
            <CardTitle>Station Inspector - All Networks</CardTitle>
          </div>
          <CardDescription>
            View all stations across all working station networks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Debug Info:</strong> 
              Total stations loaded: {allStations.length} | 
              Working station networks: {workingStations.length} | 
              Filtered results: {filteredStations.length}
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stations by name, code, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Select value={filterByWorkingStation} onValueChange={setFilterByWorkingStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by working station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Working Stations</SelectItem>
                  <SelectItem value="unassigned">Unassigned Stations</SelectItem>
                  {workingStations.map(ws => (
                    <SelectItem key={ws} value={ws}>{ws}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{allStations.length}</div>
              <div className="text-sm text-blue-600">Total Stations</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{workingStations.length}</div>
              <div className="text-sm text-green-600">Working Networks</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{filteredStations.length}</div>
              <div className="text-sm text-purple-600">Filtered Results</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {allStations.filter(s => !s.working_station).length}
              </div>
              <div className="text-sm text-orange-600">Unassigned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show message if no stations */}
      {allStations.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No Stations Found</p>
            <p className="text-sm">No stations are available in the database. Please add stations first.</p>
          </CardContent>
        </Card>
      )}

      {/* Grouped Station List */}
      {Object.keys(groupedStations).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedStations)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([workingStation, stations]) => (
            <Card key={workingStation}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">
                      {workingStation === 'Unassigned' ? 'Unassigned Stations' : `${workingStation} Network`}
                    </CardTitle>
                  </div>
                  <Badge variant={workingStation === 'Unassigned' ? 'destructive' : 'outline'}>
                    {stations.length} station{stations.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stations.map(station => (
                    <div key={station.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {station.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Code: {station.code}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {station.code}
                        </Badge>
                      </div>
                      
                      {station.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          📍 {station.address}
                        </p>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-400 space-y-1">
                        <div>ID: {station.id}</div>
                        <div>Created: {new Date(station.created_at).toLocaleDateString()}</div>
                        {station.working_station && (
                          <div className="text-blue-600">Network: {station.working_station}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No results message */}
      {filteredStations.length === 0 && allStations.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">No Matching Stations</p>
            <p className="text-sm">No stations found matching your search criteria.</p>
            <Button 
              onClick={() => { setSearchTerm(''); setFilterByWorkingStation('all'); }} 
              variant="outline" 
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminStationInspector;
