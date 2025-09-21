import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useStations, useCreateTicket, useTicketsByDateRange } from '../hooks/useSupabaseData';
import { generateTravelId, calculateExpiryTime } from '../utils/supabaseUtils';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Train } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Import the components
import PassengerForm from '../components/ticket-creation/PassengerForm';
import JourneyForm from '../components/ticket-creation/JourneyForm';
import TrainSelection from '../components/ticket-creation/TrainSelection';
import ClassSelection from '../components/ticket-creation/ClassSelection';
import SeatSelection from '../components/ticket-creation/SeatSelection';
import JourneySummary from '../components/ticket-creation/JourneySummary';
import RecentTickets from '../components/ticket-creation/RecentTickets';
import PlatformTicket from '../components/ticket-creation/PlatformTicket';

const TicketCreation = () => {
  const { user } = useAuth();
  const { data: stations = [] } = useStations();
  const createTicketMutation = useCreateTicket();
  
  // Get current date and time
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Make travel date editable
  const [travelDate, setTravelDate] = useState(currentDate);
  const { data: recentTickets = [] } = useTicketsByDateRange(travelDate, travelDate);

  console.log('All recent tickets:', recentTickets);
  console.log('User working station:', user?.workingStation);

  // Find working station - improved logic to match exact working station name
  const workingStation = stations.find(station => {
    // Match exact working station name (case-insensitive)
    return station.name.toLowerCase() === user?.workingStation?.toLowerCase();
  });

  console.log('Working station lookup:', { 
    userWorkingStation: user?.workingStation, 
    availableStations: stations.map(s => ({ 
      name: s.name, 
      working_station: s.working_station,
      id: s.id 
    })), 
    foundStation: workingStation ? {
      name: workingStation.name,
      code: workingStation.code,
      working_station: workingStation.working_station,
      id: workingStation.id
    } : null
  });

  const [formData, setFormData] = useState({
    passengerName: '',
    passengerCount: 1,
    fromStation: workingStation?.id || '',
    toStation: '',
  });

  // Set working station as default from station when stations are loaded and workingStation is found
  useEffect(() => {
    if (workingStation && (!formData.fromStation || formData.fromStation !== workingStation.id)) {
      console.log('Setting working station as from station:', workingStation);
      setFormData(prev => ({ ...prev, fromStation: workingStation.id }));
    }
  }, [workingStation]);

  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [availableTrains, setAvailableTrains] = useState<any[]>([]);
  const [trainClasses, setTrainClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [editablePrice, setEditablePrice] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [routeDistance, setRouteDistance] = useState(0);

  const availableToStations = stations.filter(station => station.id !== formData.fromStation);

  const calculateDistance = async (fromStationId: string, toStationId: string) => {
    try {
      // Find trains that connect these stations and calculate distance
      const { data: trainRoutes, error } = await supabase
        .from('train_routes')
        .select(`
          *,
          train:train_id (*)
        `)
        .in('station_id', [fromStationId, toStationId]);

      if (error) throw error;

      // Group routes by train and calculate distance
      const trainDistances: { [key: string]: number } = {};
      
      trainRoutes?.forEach(route => {
        const trainId = route.train_id;
        if (!trainDistances[trainId]) {
          trainDistances[trainId] = 0;
        }
      });

      // For each train, find the distance between from and to stations
      for (const trainId of Object.keys(trainDistances)) {
        const fromRoute = trainRoutes?.find(r => r.train_id === trainId && r.station_id === fromStationId);
        const toRoute = trainRoutes?.find(r => r.train_id === trainId && r.station_id === toStationId);
        
        if (fromRoute && toRoute) {
          const distance = Math.abs(toRoute.distance_from_start - fromRoute.distance_from_start);
          trainDistances[trainId] = distance;
        }
      }

      // Set the distance from the first available train (they should all be similar)
      const distances = Object.values(trainDistances).filter(d => d > 0);
      if (distances.length > 0) {
        setRouteDistance(distances[0]);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      setRouteDistance(0);
    }
  };

  const loadAvailableTrains = async (fromStationId: string, toStationId: string) => {
    try {
      const dayOfWeek = new Date(travelDate).getDay();
      
      // Find trains that have both stations in their route and get seat/price info
      const { data: trainRoutes, error } = await supabase
        .from('train_routes')
        .select(`
          *,
          train:train_id (
            *,
            train_schedules!inner (*),
            train_classes (*)
          )
        `)
        .in('station_id', [fromStationId, toStationId]);
      
      if (error) throw error;
      
      // Group by train and check if train has both stations
      const trainMap = new Map();
      
      trainRoutes?.forEach(route => {
        const train = route.train;
        if (!trainMap.has(train.id)) {
          trainMap.set(train.id, {
            train: train,
            stations: [],
            classes: train.train_classes || []
          });
        }
        trainMap.get(train.id).stations.push({
          stationId: route.station_id,
          haltOrder: route.halt_order,
          distanceFromStart: route.distance_from_start,
          arrivalTime: route.arrival_time,
          departureTime: route.departure_time,
          // Include all class prices from train_routes
          generalPrice: route.general_price,
          sleeperPrice: route.sleeper_price,
          ac3TierPrice: route.ac_3_tier_price,
          ac2TierPrice: route.ac_2_tier_price,
          ac1TierPrice: route.ac_1_tier_price,
          chairCarPrice: route.chair_car_price,
          secondSittingPrice: route.second_sitting_price,
          ac3EconomyPrice: route.ac_3_economy_price
        });
      });
      
      // Filter trains that have both stations and run on selected date
      const filteredTrains = Array.from(trainMap.values())
        .filter(trainData => {
          const stations = trainData.stations;
          const hasFromStation = stations.some(s => s.stationId === fromStationId);
          const hasToStation = stations.some(s => s.stationId === toStationId);
          const fromStation = stations.find(s => s.stationId === fromStationId);
          const toStation = stations.find(s => s.stationId === toStationId);
          
          // Check if train runs on selected date
          const runsOnDate = trainData.train.train_schedules?.some(
            (schedule: any) => schedule.day_of_week === dayOfWeek && schedule.is_active
          );
          
          return hasFromStation && hasToStation && fromStation && toStation && 
                 fromStation.haltOrder < toStation.haltOrder && runsOnDate;
        })
        .map(trainData => ({
          ...trainData.train,
          stations: trainData.stations,
          classes: trainData.classes,
          seatsAndPrices: trainData.stations.find(s => s.stationId === fromStationId) // Get pricing from origin station
        }));
      
      console.log('Available trains with seats and prices:', filteredTrains);
      setAvailableTrains(filteredTrains);
    } catch (error) {
      console.error('Error loading trains:', error);
      setAvailableTrains([]);
    }
  };

  const handleFromStationChange = async (stationId: string) => {
    // Only allow changing from station if it's not the working station
    if (workingStation && stationId !== workingStation.id) {
      toast({
        title: "Error",
        description: "From station must be your working station",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({ ...prev, fromStation: stationId, toStation: '' }));
    setSelectedTrain(null);
    setAvailableTrains([]);
    setTrainClasses([]);
    setSelectedClass('');
    setEditablePrice(0);
    setSelectedSeat('');
    setTotalPrice(0);
    setRouteDistance(0);
  };

  const handleToStationChange = async (stationId: string) => {
    setFormData(prev => ({ ...prev, toStation: stationId }));
    
    if (formData.fromStation && stationId) {
      await loadAvailableTrains(formData.fromStation, stationId);
      await calculateDistance(formData.fromStation, stationId);
    }
    
    // Reset selections when route changes
    setSelectedTrain(null);
    setTrainClasses([]);
    setSelectedClass('');
    setEditablePrice(0);
    setSelectedSeat('');
    setTotalPrice(0);
  };

  const handlePassengerCountChange = (count: number) => {
    setFormData(prev => ({ ...prev, passengerCount: count }));
    // Recalculate total price if price is set
    if (editablePrice > 0) {
      setTotalPrice(editablePrice * count);
    }
  };

  const handleTrainSelect = async (train: any) => {
    console.log('Train selected with seats and prices:', train);
    setSelectedTrain(train);
    setSelectedClass('');
    setEditablePrice(0);
    setSelectedSeat('');
    setTotalPrice(0);
    
    // Load train classes and pricing from train_routes with database seat info
    try {
      const { data: routeData, error } = await supabase
        .from('train_routes')
        .select('*')
        .eq('train_id', train.id)
        .in('station_id', [formData.fromStation, formData.toStation])
        .order('halt_order');
      
      if (error) throw error;
      
      console.log('Route data loaded with prices:', routeData);
      
      if (routeData && routeData.length >= 2) {
        // Get pricing from the from station route
        const fromRoute = routeData.find(r => r.station_id === formData.fromStation);
        
        if (fromRoute) {
          // Create class options based on available pricing from database
          const classOptions = [];
          
          // Check all available class types and their prices from database
          const classTypes = [
            { type: 'general', field: 'general_price', name: 'General', seats: 80, defaultPrice: 50 },
            { type: 'sleeper', field: 'sleeper_price', name: 'Sleeper', seats: 72, defaultPrice: 100 },
            { type: 'ac_3_tier', field: 'ac_3_tier_price', name: '3rd AC', seats: 64, defaultPrice: 250 },
            { type: 'ac_2_tier', field: 'ac_2_tier_price', name: '2nd AC', seats: 48, defaultPrice: 400 },
            { type: 'ac_1_tier', field: 'ac_1_tier_price', name: '1st AC', seats: 24, defaultPrice: 600 },
            { type: 'chair_car', field: 'chair_car_price', name: 'Chair Car', seats: 78, defaultPrice: 120 },
            { type: 'second_sitting', field: 'second_sitting_price', name: '2nd Sitting', seats: 108, defaultPrice: 40 },
            { type: 'ac_3_economy', field: 'ac_3_economy_price', name: '3rd AC Economy', seats: 83, defaultPrice: 200 }
          ];
          
          // Add all classes - use database price if available, otherwise use default price
          classTypes.forEach(classType => {
            const price = fromRoute[classType.field] || classType.defaultPrice;
            classOptions.push({
              class_type: classType.type,
              base_price: price,
              display_name: classType.name,
              total_seats: classType.seats
            });
          });
          
          console.log('Available classes with all options:', classOptions);
          setTrainClasses(classOptions);
        } else {
          console.error('Could not find route data for from station');
          // Fallback to all default classes
          setTrainClasses([
            { class_type: 'general', base_price: 50, display_name: 'General', total_seats: 80 },
            { class_type: 'sleeper', base_price: 100, display_name: 'Sleeper', total_seats: 72 },
            { class_type: 'ac_3_tier', base_price: 250, display_name: '3rd AC', total_seats: 64 },
            { class_type: 'ac_2_tier', base_price: 400, display_name: '2nd AC', total_seats: 48 },
            { class_type: 'ac_1_tier', base_price: 600, display_name: '1st AC', total_seats: 24 },
            { class_type: 'chair_car', base_price: 120, display_name: 'Chair Car', total_seats: 78 },
            { class_type: 'second_sitting', base_price: 40, display_name: '2nd Sitting', total_seats: 108 },
            { class_type: 'ac_3_economy', base_price: 200, display_name: '3rd AC Economy', total_seats: 83 }
          ]);
        }
      } else {
        console.error('Insufficient route data found');
        // Fallback to all default classes
        setTrainClasses([
          { class_type: 'general', base_price: 50, display_name: 'General', total_seats: 80 },
          { class_type: 'sleeper', base_price: 100, display_name: 'Sleeper', total_seats: 72 },
          { class_type: 'ac_3_tier', base_price: 250, display_name: '3rd AC', total_seats: 64 },
          { class_type: 'ac_2_tier', base_price: 400, display_name: '2nd AC', total_seats: 48 },
          { class_type: 'ac_1_tier', base_price: 600, display_name: '1st AC', total_seats: 24 },
          { class_type: 'chair_car', base_price: 120, display_name: 'Chair Car', total_seats: 78 },
          { class_type: 'second_sitting', base_price: 40, display_name: '2nd Sitting', total_seats: 108 },
          { class_type: 'ac_3_economy', base_price: 200, display_name: '3rd AC Economy', total_seats: 83 }
        ]);
      }
    } catch (error) {
      console.error('Error loading train classes:', error);
      // Set all default classes if database query fails
      setTrainClasses([
        { class_type: 'general', base_price: 50, display_name: 'General', total_seats: 80 },
        { class_type: 'sleeper', base_price: 100, display_name: 'Sleeper', total_seats: 72 },
        { class_type: 'ac_3_tier', base_price: 250, display_name: '3rd AC', total_seats: 64 },
        { class_type: 'ac_2_tier', base_price: 400, display_name: '2nd AC', total_seats: 48 },
        { class_type: 'ac_1_tier', base_price: 600, display_name: '1st AC', total_seats: 24 },
        { class_type: 'chair_car', base_price: 120, display_name: 'Chair Car', total_seats: 78 },
        { class_type: 'second_sitting', base_price: 40, display_name: '2nd Sitting', total_seats: 108 },
        { class_type: 'ac_3_economy', base_price: 200, display_name: '3rd AC Economy', total_seats: 83 }
      ]);
    }
  };

  const handleClassSelect = (classType: string) => {
    setSelectedClass(classType);
    setSelectedSeat('');
    
    // Set initial price from loaded classes
    const trainClass = trainClasses.find((tc: any) => tc.class_type === classType);
    if (trainClass) {
      setEditablePrice(trainClass.base_price);
      setTotalPrice(trainClass.base_price * formData.passengerCount);
    }
  };

  // Handle editable price change
  const handlePriceChange = (newPrice: number) => {
    setEditablePrice(newPrice);
    setTotalPrice(newPrice * formData.passengerCount);
  };

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeat(seatNumber);
  };

  // Handle travel date change
  const handleTravelDateChange = async (newDate: string) => {
    setTravelDate(newDate);
    
    // Reload available trains for the new date
    if (formData.fromStation && formData.toStation) {
      await loadAvailableTrains(formData.fromStation, formData.toStation);
    }
    
    // Reset selections when date changes
    setSelectedTrain(null);
    setTrainClasses([]);
    setSelectedClass('');
    setEditablePrice(0);
    setSelectedSeat('');
    setTotalPrice(0);
  };

  // Generate available seats for selected class
  const getAvailableSeats = () => {
    if (!selectedTrain || !selectedClass) return [];
    
    const trainClass = trainClasses.find((tc: any) => tc.class_type === selectedClass);
    if (!trainClass) return [];
    
    const seats = [];
    const totalSeats = trainClass.total_seats;
    
    for (let i = 1; i <= Math.min(totalSeats, 50); i++) { // Limit to 50 seats for demo
      const seatNumber = `${selectedClass.toUpperCase()}-${i}`;
      seats.push({
        number: seatNumber,
        available: true, // In real app, check against booked seats
        price: editablePrice
      });
    }
    
    return seats;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.passengerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter passenger name",
        variant: "destructive"
      });
      return;
    }

    if (!formData.fromStation || !formData.toStation) {
      toast({
        title: "Error", 
        description: "Please select both from and to stations",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTrain) {
      toast({
        title: "Error",
        description: "Please select a train",
        variant: "destructive"
      });
      return;
    }

    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSeat) {
      toast({
        title: "Error",
        description: "Please select a seat",
        variant: "destructive"
      });
      return;
    }

    if (routeDistance === 0) {
      toast({
        title: "Error",
        description: "Route distance not available",
        variant: "destructive"
      });
      return;
    }

    if (editablePrice <= 0) {
      toast({
        title: "Error",
        description: "Please set a valid price",
        variant: "destructive"
      });
      return;
    }

    try {
      const fromStation = stations.find(s => s.id === formData.fromStation);
      // Use the working station code for ticket ID generation
      const travelId = generateTravelId(workingStation?.code || fromStation?.code || 'GN');
      const expiresAt = calculateExpiryTime(travelDate, currentTime);
      
      // Get train route details for departure/arrival times
      const fromRoute = selectedTrain.stations?.find((s: any) => s.stationId === formData.fromStation);
      const toRoute = selectedTrain.stations?.find((s: any) => s.stationId === formData.toStation);

      const ticketData = {
        travel_id: travelId,
        passenger_name: formData.passengerName.trim(),
        passenger_count: formData.passengerCount,
        from_station_id: formData.fromStation,
        to_station_id: formData.toStation,
        route_id: null, // Not using routes table anymore
        train_id: selectedTrain.id,
        kilometres: routeDistance,
        travel_date: travelDate,
        created_time: currentTime,
        expires_at: expiresAt,
        price: editablePrice,
        total_price: totalPrice,
        ticket_class: 'general', // Always use 'general' for ticket_class constraint
        class_type: selectedClass, // Use class_type for actual class selection
        seat_number: selectedSeat,
        departure_time: fromRoute?.departureTime || null,
        arrival_time: toRoute?.arrivalTime || null,
        is_verified: false,
        verified_by: null,
        verified_at: null,
        created_by: user?.username || 'Unknown'
      };

      await createTicketMutation.mutateAsync(ticketData);
      
      toast({
        title: "Ticket Created Successfully!",
        description: `Travel ID: ${travelId} | Train: ${selectedTrain.name} | Seat: ${selectedSeat} | Total: ₹${totalPrice}`,
      });

      // Reset form
      setFormData({
        passengerName: '',
        passengerCount: 1,
        fromStation: workingStation?.id || '',
        toStation: '',
      });
      setSelectedTrain(null);
      setAvailableTrains([]);
      setTrainClasses([]);
      setSelectedClass('');
      setEditablePrice(0);
      setSelectedSeat('');
      setTotalPrice(0);
      setRouteDistance(0);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  const availableSeats = getAvailableSeats();

  return (
    <Layout title="Ticket Management">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Management</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create railway tickets and platform tickets
              {user?.workingStation && (
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  - {user.workingStation} Station
                </span>
              )}
            </p>
          </div>
        </div>

        <Tabs defaultValue="railway-ticket" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="railway-ticket" className="flex items-center space-x-2">
              <Train className="h-4 w-4" />
              <span>Railway Ticket</span>
            </TabsTrigger>
            <TabsTrigger value="platform-ticket" className="flex items-center space-x-2">
              <Ticket className="h-4 w-4" />
              <span>Platform Ticket</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="railway-ticket" className="space-y-8">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Train className="h-6 w-6 text-blue-600" />
                    <CardTitle>Railway Ticket Booking</CardTitle>
                  </div>
                  <CardDescription>
                    Create a new railway ticket with passenger details and journey information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Passenger Information */}
                    <PassengerForm
                      passengerName={formData.passengerName}
                      passengerCount={formData.passengerCount}
                      onPassengerNameChange={(name) => setFormData(prev => ({ ...prev, passengerName: name }))}
                      onPassengerCountChange={handlePassengerCountChange}
                    />

                    {/* Journey Details */}
                    <JourneyForm
                      travelDate={travelDate}
                      fromStation={formData.fromStation}
                      toStation={formData.toStation}
                      currentDate={currentDate}
                      workingStation={workingStation}
                      availableToStations={availableToStations}
                      onTravelDateChange={handleTravelDateChange}
                      onFromStationChange={handleFromStationChange}
                      onToStationChange={handleToStationChange}
                    />

                    {/* Available Trains */}
                    <TrainSelection
                      availableTrains={availableTrains}
                      selectedTrain={selectedTrain}
                      fromStation={formData.fromStation}
                      toStation={formData.toStation}
                      travelDate={travelDate}
                      onTrainSelect={handleTrainSelect}
                    />

                    {/* Class Selection - Show when train is selected and classes are loaded */}
                    {selectedTrain && trainClasses.length > 0 && (
                      <ClassSelection
                        trainClasses={trainClasses}
                        selectedClass={selectedClass}
                        editablePrice={editablePrice}
                        totalPrice={totalPrice}
                        passengerCount={formData.passengerCount}
                        routeDistance={routeDistance}
                        onClassSelect={handleClassSelect}
                        onPriceChange={handlePriceChange}
                      />
                    )}

                    {/* Seat Selection - Show when class is selected */}
                    {selectedTrain && selectedClass && trainClasses.length > 0 && (
                      <SeatSelection
                        availableSeats={getAvailableSeats()}
                        selectedSeat={selectedSeat}
                        onSeatSelect={handleSeatSelect}
                      />
                    )}

                    {/* Journey Summary */}
                    <JourneySummary
                      selectedTrain={selectedTrain}
                      selectedClass={selectedClass}
                      selectedSeat={selectedSeat}
                      editablePrice={editablePrice}
                      totalPrice={totalPrice}
                      routeDistance={routeDistance}
                      travelDate={travelDate}
                      passengerCount={formData.passengerCount}
                      trainClasses={trainClasses}
                      currentTime={currentTime}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={!selectedTrain || !selectedClass || !selectedSeat || editablePrice <= 0 || createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? 'Creating Ticket...' : `Book Ticket - ₹${totalPrice}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Recent Railway Tickets Section - Only show railway tickets */}
            <RecentTickets
              recentTickets={recentTickets}
              stations={stations}
              travelDate={travelDate}
              ticketType="railway"
            />
          </TabsContent>

          <TabsContent value="platform-ticket" className="space-y-8">
            <PlatformTicket />
            
            {/* Recent Platform Tickets Section - Only show platform tickets */}
            <RecentTickets
              recentTickets={recentTickets}
              stations={stations}
              travelDate={travelDate}
              ticketType="platform"
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TicketCreation;
