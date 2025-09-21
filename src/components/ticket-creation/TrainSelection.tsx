
import React from 'react';
import { Train, Clock, Users, IndianRupee } from 'lucide-react';
import { getDayName } from '../../utils/trainUtils';

interface TrainSelectionProps {
  availableTrains: any[];
  selectedTrain: any;
  fromStation: string;
  toStation: string;
  travelDate: string;
  onTrainSelect: (train: any) => void;
}

const TrainSelection: React.FC<TrainSelectionProps> = ({
  availableTrains,
  selectedTrain,
  fromStation,
  toStation,
  travelDate,
  onTrainSelect
}) => {
  // Helper function to calculate time difference
  const getTimeStatus = (departureTime: string, arrivalTime: string) => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().substring(0, 5); // HH:MM format
    
    if (departureTime) {
      const depTime = new Date(`1970-01-01T${departureTime}`);
      const currentDateTime = new Date(`1970-01-01T${currentTimeStr}`);
      
      if (currentDateTime > depTime) {
        return { status: 'departed', color: 'text-red-600', message: 'Departed' };
      } else {
        const diffMs = depTime.getTime() - currentDateTime.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
          return { 
            status: 'upcoming', 
            color: 'text-green-600', 
            message: `Departs in ${diffHours}h ${diffMinutes}m` 
          };
        } else {
          return { 
            status: 'upcoming', 
            color: 'text-green-600', 
            message: `Departs in ${diffMinutes}m` 
          };
        }
      }
    }
    
    return { status: 'unknown', color: 'text-gray-500', message: 'Time not available' };
  };

  if (!fromStation || !toStation) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Available Trains</h3>
      {availableTrains.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No trains available for selected route on {new Date(travelDate).toLocaleDateString()}
        </div>
      ) : (
        <div className="space-y-3">
          {availableTrains.map(train => {
            const fromRoute = train.stations?.find((s: any) => s.stationId === fromStation);
            const toRoute = train.stations?.find((s: any) => s.stationId === toStation);
            const timeStatus = getTimeStatus(fromRoute?.departureTime, fromRoute?.arrivalTime);
            
            // Get available classes and their prices
            const availableClasses = [];
            if (fromRoute?.generalPrice > 0) availableClasses.push({ name: 'General', price: fromRoute.generalPrice, seats: 80 });
            if (fromRoute?.sleeperPrice > 0) availableClasses.push({ name: 'Sleeper', price: fromRoute.sleeperPrice, seats: 72 });
            if (fromRoute?.ac3TierPrice > 0) availableClasses.push({ name: '3rd AC', price: fromRoute.ac3TierPrice, seats: 64 });
            if (fromRoute?.ac2TierPrice > 0) availableClasses.push({ name: '2nd AC', price: fromRoute.ac2TierPrice, seats: 48 });
            if (fromRoute?.ac1TierPrice > 0) availableClasses.push({ name: '1st AC', price: fromRoute.ac1TierPrice, seats: 24 });
            if (fromRoute?.chairCarPrice > 0) availableClasses.push({ name: 'Chair Car', price: fromRoute.chairCarPrice, seats: 78 });
            
            return (
              <div 
                key={train.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTrain?.id === train.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => onTrainSelect(train)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Train className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">{train.name}</span>
                      <span className="text-sm text-gray-500">#{train.number}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Running days: {train.train_schedules?.map((s: any) => 
                        getDayName(s.day_of_week).substring(0, 3)
                      ).join(', ')}
                    </div>
                    
                    {/* Train timing information */}
                    <div className="mt-2 flex items-center space-x-4">
                      {fromRoute?.departureTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Departs: {fromRoute.departureTime}
                          </span>
                        </div>
                      )}
                      {toRoute?.arrivalTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Arrives: {toRoute.arrivalTime}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Available Classes and Prices */}
                    {availableClasses.length > 0 && (
                      <div className="mt-3 border-t pt-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">Available Classes:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {availableClasses.map((classInfo, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3 text-gray-500" />
                                <span>{classInfo.name}</span>
                                <span className="text-xs text-gray-500">({classInfo.seats} seats)</span>
                              </div>
                              <div className="flex items-center space-x-1 text-green-600 font-medium">
                                <IndianRupee className="h-3 w-3" />
                                <span>{classInfo.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-sm font-medium ${timeStatus.color}`}>
                      {timeStatus.message}
                    </span>
                    {selectedTrain?.id === train.id && (
                      <span className="text-blue-600 font-medium text-sm">Selected</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainSelection;
