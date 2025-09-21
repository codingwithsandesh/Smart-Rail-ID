
import React from 'react';

interface SeatSelectionProps {
  availableSeats: any[];
  selectedSeat: string;
  onSeatSelect: (seatNumber: string) => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  availableSeats,
  selectedSeat,
  onSeatSelect
}) => {
  if (availableSeats.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Seat</h3>
      <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
        <div className="grid grid-cols-6 gap-2">
          {availableSeats.map((seat) => (
            <button
              key={seat.number}
              type="button"
              className={`p-2 text-xs border rounded transition-colors ${
                selectedSeat === seat.number
                  ? 'bg-blue-500 text-white border-blue-500'
                  : seat.available
                  ? 'bg-green-50 border-green-200 hover:bg-green-100'
                  : 'bg-red-50 border-red-200 cursor-not-allowed'
              }`}
              onClick={() => seat.available && onSeatSelect(seat.number)}
              disabled={!seat.available}
            >
              <div className="text-center">
                <div className="font-medium">{seat.number}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600">
        <span className="inline-block w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></span>
        Available
        <span className="inline-block w-3 h-3 bg-red-100 border border-red-200 rounded mr-2 ml-4"></span>
        Occupied
        <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2 ml-4"></span>
        Selected
      </p>
    </div>
  );
};

export default SeatSelection;
