
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface ClassSelectionProps {
  trainClasses: any[];
  selectedClass: string;
  editablePrice: number;
  totalPrice: number;
  passengerCount: number;
  routeDistance: number;
  onClassSelect: (classType: string) => void;
  onPriceChange: (price: number) => void;
}

const ClassSelection: React.FC<ClassSelectionProps> = ({
  trainClasses,
  selectedClass,
  editablePrice,
  totalPrice,
  passengerCount,
  routeDistance,
  onClassSelect,
  onPriceChange
}) => {
  // Define all possible train classes with their display names and default prices
  const allClassTypes = [
    { type: 'general', name: 'General', shortName: 'GEN', defaultPrice: 50 },
    { type: 'sleeper', name: 'Sleeper', shortName: 'SL', defaultPrice: 100 },
    { type: 'ac_3_tier', name: '3rd AC', shortName: '3A', defaultPrice: 250 },
    { type: 'ac_2_tier', name: '2nd AC', shortName: '2A', defaultPrice: 400 },
    { type: 'ac_1_tier', name: '1st AC', shortName: '1A', defaultPrice: 600 },
    { type: 'chair_car', name: 'Chair Car', shortName: 'CC', defaultPrice: 120 },
    { type: 'second_sitting', name: '2nd Sitting', shortName: '2S', defaultPrice: 40 },
    { type: 'ac_3_economy', name: '3rd AC Economy', shortName: '3E', defaultPrice: 200 }
  ];

  // If no trainClasses provided, use all default classes
  const availableClasses = trainClasses.length > 0 ? trainClasses : allClassTypes.map(classType => ({
    class_type: classType.type,
    display_name: classType.name,
    short_name: classType.shortName,
    base_price: classType.defaultPrice,
    total_seats: 50 // Default seat count
  }));

  // Create enhanced class list with display information
  const enhancedClasses = availableClasses.map(trainClass => {
    const classInfo = allClassTypes.find(ct => ct.type === trainClass.class_type);
    return {
      ...trainClass,
      display_name: classInfo?.name || trainClass.display_name || trainClass.class_type,
      short_name: classInfo?.shortName || trainClass.short_name || trainClass.class_type.toUpperCase(),
      base_price: trainClass.base_price || classInfo?.defaultPrice || 50
    };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Travel Class</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {enhancedClasses.map((trainClass: any) => (
          <div
            key={trainClass.class_type}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedClass === trainClass.class_type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onClassSelect(trainClass.class_type)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{trainClass.display_name}</h4>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {trainClass.short_name}
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ₹{trainClass.base_price}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {trainClass.total_seats || 50} seats • {routeDistance} KM
                </p>
              </div>
              {selectedClass === trainClass.class_type && (
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price Input - Shows after class selection */}
      {selectedClass && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">
              Class: {enhancedClasses.find(tc => tc.class_type === selectedClass)?.display_name}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Distance: {routeDistance} KM</span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ticketPrice" className="text-gray-700 dark:text-gray-300">Price per Passenger (₹) *</Label>
            <Input
              id="ticketPrice"
              type="number"
              value={editablePrice}
              onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
              placeholder="Enter ticket price"
              min="0"
              step="0.01"
              required
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Base price: ₹{enhancedClasses.find(tc => tc.class_type === selectedClass)?.base_price} (editable)
            </p>
          </div>
          
          {editablePrice > 0 && (
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border">
              <p>Price per passenger: ₹{editablePrice}</p>
              <p className="font-semibold">Total for {passengerCount} passenger{passengerCount > 1 ? 's' : ''}: ₹{totalPrice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassSelection;
