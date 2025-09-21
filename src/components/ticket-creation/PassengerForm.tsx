
import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users } from 'lucide-react';

interface PassengerFormProps {
  passengerName: string;
  passengerCount: number;
  onPassengerNameChange: (name: string) => void;
  onPassengerCountChange: (count: number) => void;
}

const PassengerForm: React.FC<PassengerFormProps> = ({
  passengerName,
  passengerCount,
  onPassengerNameChange,
  onPassengerCountChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Passenger Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="passengerName">Passenger Name *</Label>
        <Input
          id="passengerName"
          value={passengerName}
          onChange={(e) => onPassengerNameChange(e.target.value)}
          placeholder="Enter full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passengerCount">Number of Passengers *</Label>
        <Select 
          value={passengerCount.toString()} 
          onValueChange={(value) => onPassengerCountChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map(count => (
              <SelectItem key={count} value={count.toString()}>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{count} Passenger{count > 1 ? 's' : ''}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PassengerForm;
