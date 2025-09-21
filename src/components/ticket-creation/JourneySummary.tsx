
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface JourneySummaryProps {
  selectedTrain: any;
  selectedClass: string;
  selectedSeat: string;
  editablePrice: number;
  totalPrice: number;
  routeDistance: number;
  travelDate: string;
  passengerCount: number;
  trainClasses: any[];
  currentTime: string;
}

const JourneySummary: React.FC<JourneySummaryProps> = ({
  selectedTrain,
  selectedClass,
  selectedSeat,
  editablePrice,
  totalPrice,
  routeDistance,
  travelDate,
  passengerCount,
  trainClasses,
  currentTime
}) => {
  if (!selectedTrain || !selectedClass || !selectedSeat || editablePrice <= 0) return null;

  return (
    <>
      {/* Travel Date & Time Display */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Travel Date & Time
        </h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Date: {new Date(travelDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Current Time: {currentTime}
          </p>
        </div>
      </div>

      {/* Journey Summary */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <h4 className="font-semibold text-blue-900">Journey Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Train: {selectedTrain.name} (#{selectedTrain.number})</p>
          <p>Class: {trainClasses.find(tc => tc.class_type === selectedClass)?.display_name}</p>
          <p>Seat: {selectedSeat}</p>
          <p>Distance: {routeDistance} KM</p>
          <p>Travel Date: {new Date(travelDate).toLocaleDateString()}</p>
          <p>Passengers: {passengerCount}</p>
          <p className="font-semibold text-lg">Total Amount: ₹{totalPrice}</p>
        </div>
      </div>
    </>
  );
};

export default JourneySummary;
