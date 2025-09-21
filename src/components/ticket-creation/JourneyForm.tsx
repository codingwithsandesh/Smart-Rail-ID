
import React, { useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface Station {
  id: string;
  name: string;
  code: string;
  working_station?: string;
}

interface JourneyFormProps {
  travelDate: string;
  fromStation: string;
  toStation: string;
  currentDate: string;
  workingStation: Station | undefined;
  availableToStations: Station[];
  onTravelDateChange: (date: string) => void;
  onFromStationChange: (stationId: string) => void;
  onToStationChange: (stationId: string) => void;
}

const JourneyForm: React.FC<JourneyFormProps> = ({
  travelDate,
  fromStation,
  toStation,
  currentDate,
  workingStation,
  availableToStations,
  onTravelDateChange,
  onFromStationChange,
  onToStationChange
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Debug logging for working station
  useEffect(() => {
    console.log('JourneyForm - User working station:', user?.workingStation);
    console.log('JourneyForm - Working station prop:', workingStation);
    console.log('JourneyForm - From station value:', fromStation);
  }, [user?.workingStation, workingStation, fromStation]);

  // Automatically set from station to working station when component mounts
  useEffect(() => {
    if (workingStation && !fromStation) {
      console.log('Auto-setting from station to working station:', workingStation.id);
      onFromStationChange(workingStation.id);
    }
  }, [workingStation, fromStation, onFromStationChange]);

  // Show working station info more clearly
  const workingStationDisplay = workingStation 
    ? `${workingStation.name} (${workingStation.code})` 
    : user?.workingStation 
      ? `${user.workingStation} Station` 
      : 'Working station not found - please contact admin';

  // Check if we have a valid working station
  const hasValidWorkingStation = Boolean(workingStation || user?.workingStation);

  console.log('JourneyForm render - hasValidWorkingStation:', hasValidWorkingStation);
  console.log('JourneyForm render - workingStationDisplay:', workingStationDisplay);

  return (
    <div className="space-y-4 md:space-y-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
        {t('journey.title')}
      </h3>
      
      {/* Debug info for working station */}
      {!hasValidWorkingStation && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Debug Info:</strong> Working station not properly loaded.
            <br />User: {user?.username || 'Not logged in'}
            <br />User Working Station: {user?.workingStation || 'Not set'}
            <br />Working Station Object: {workingStation ? 'Found' : 'Not found'}
          </p>
        </div>
      )}
      
      {/* Travel Date */}
      <div className="space-y-2">
        <Label htmlFor="travelDate" className="text-gray-700 dark:text-gray-300">
          {t('journey.travelDate')} *
        </Label>
        <Input
          id="travelDate"
          type="date"
          value={travelDate}
          onChange={(e) => onTravelDateChange(e.target.value)}
          min={currentDate}
          required
          className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <Label htmlFor="fromStation" className="text-gray-700 dark:text-gray-300">
            {t('journey.fromStation')} *
          </Label>
          <div className="relative">
            <Input
              id="fromStation"
              type="text"
              value={workingStationDisplay}
              readOnly
              className={`cursor-not-allowed ${
                hasValidWorkingStation 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-600'
              }`}
              title={hasValidWorkingStation ? "This is your working station - tickets can only be created from here" : "Working station not found - please contact admin"}
            />
            {hasValidWorkingStation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  WORKING STATION
                </Badge>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {hasValidWorkingStation ? 'Tickets can only be created from your assigned working station' : 'Contact admin to set up your working station'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toStation" className="text-gray-700 dark:text-gray-300">
            {t('journey.toStation')} *
          </Label>
          <Select 
            value={toStation} 
            onValueChange={onToStationChange}
            disabled={!fromStation || !hasValidWorkingStation}
          >
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder={hasValidWorkingStation ? t('journey.selectDestination') : 'Select working station first'} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {availableToStations.map(station => (
                <SelectItem key={station.id} value={station.id} className="dark:text-white dark:hover:bg-gray-700">
                  {station.name} ({station.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Debug info for available stations */}
          {availableToStations.length === 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              No destination stations available. Available stations: {availableToStations.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyForm;
