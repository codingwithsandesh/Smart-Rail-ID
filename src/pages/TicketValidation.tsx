import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getTicketByTravelId, updateTicketVerification, createVerificationLog } from '../utils/supabaseUtils';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, AlertTriangle, Clock, Users, MapPin, Ticket, Train, Scan, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TravelIdScanner from '../components/tte/TravelIdScanner';
import VerifiedTicketsList from '../components/tte/VerifiedTicketsList';
import PlatformTicketVerification from '../components/tte/PlatformTicketVerification';

const TicketValidation = () => {
  const { user } = useAuth();
  const [travelId, setTravelId] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [trainInfo, setTrainInfo] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Auto-fill Travel ID with station code prefix
  useEffect(() => {
    if (user?.workingStation && !travelId) {
      let stationCode = '';
      
      // Map working station names to codes
      const stationCodes: { [key: string]: string } = {
        'Washim': 'WHM',
        'Akola': 'AK',
        'Pune': 'PUN',
        'Mumbai': 'MUM',
        'Delhi': 'DLI',
        'Nagpur': 'NGP',
        'Amravati': 'AMV'
      };
      
      stationCode = stationCodes[user.workingStation] || user.workingStation.substring(0, 3).toUpperCase();
      setTravelId(`${stationCode}-`);
    }
  }, [user?.workingStation]);

  const fetchTrainInfo = async (trainId: string) => {
    try {
      const { data: train, error } = await supabase
        .from('trains')
        .select('*')
        .eq('id', trainId)
        .single();
      
      if (error) throw error;
      return train;
    } catch (error) {
      console.error('Error fetching train info:', error);
      return null;
    }
  };

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!travelId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Travel ID",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setTicket(null);
    setTrainInfo(null);

    try {
      const foundTicket = await getTicketByTravelId(travelId.trim());
      
      if (!foundTicket) {
        const result = {
          isValid: false,
          status: 'invalid',
          message: 'Travel ID not found - possible fraud attempt'
        };
        
        await createVerificationLog({
          ticket_id: null,
          travel_id: travelId.trim(),
          verified_by: user?.username || 'Unknown TTE',
          status: 'invalid',
          fraud_attempt: true,
          details: 'Travel ID not found'
        });
        
        setValidationResult(result);
        setIsValidating(false);
        return;
      }

      setTicket(foundTicket);

      // Fetch train information if train_id exists
      if (foundTicket.train_id) {
        const train = await fetchTrainInfo(foundTicket.train_id);
        setTrainInfo(train);
      }

      // Check if ticket has expired
      const now = new Date();
      const expiryTime = new Date(foundTicket.expires_at);
      
      if (now > expiryTime) {
        const result = {
          isValid: false,
          status: 'expired',
          message: 'Ticket has expired'
        };
        
        await createVerificationLog({
          ticket_id: foundTicket.id,
          travel_id: travelId.trim(),
          verified_by: user?.username || 'Unknown TTE',
          status: 'expired',
          fraud_attempt: false,
          details: 'Ticket has expired'
        });
        
        setValidationResult(result);
        setIsValidating(false);
        return;
      }

      // Check if already verified
      if (foundTicket.is_verified) {
        const result = {
          isValid: false,
          status: 'duplicate',
          message: 'Ticket already verified'
        };
        
        await createVerificationLog({
          ticket_id: foundTicket.id,
          travel_id: travelId.trim(),
          verified_by: user?.username || 'Unknown TTE',
          status: 'duplicate',
          fraud_attempt: false,
          details: `Already verified by ${foundTicket.verified_by} at ${foundTicket.verified_at}`
        });
        
        setValidationResult(result);
        setIsValidating(false);
        return;
      }

      // Mark ticket as verified
      await updateTicketVerification(foundTicket.id, user?.username || 'Unknown TTE');
      
      // Log successful verification
      await createVerificationLog({
        ticket_id: foundTicket.id,
        travel_id: travelId.trim(),
        verified_by: user?.username || 'Unknown TTE',
        status: 'valid',
        fraud_attempt: false,
        details: 'Successfully verified'
      });
      
      const result = {
        isValid: true,
        status: 'valid',
        message: 'Ticket verified successfully'
      };
      
      setValidationResult(result);
      
      // Update ticket state to show as verified
      setTicket(prev => ({
        ...prev,
        is_verified: true,
        verified_by: user?.username || 'Unknown TTE',
        verified_at: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'expired':
        return <Clock className="h-8 w-8 text-orange-600" />;
      case 'duplicate':
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
      default:
        return <XCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'duplicate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const resetValidation = () => {
    // Reset but keep station prefix
    const stationCodes: { [key: string]: string } = {
      'Washim': 'WHM',
      'Akola': 'AK',
      'Pune': 'PUN',
      'Mumbai': 'MUM',
      'Delhi': 'DLI',
      'Nagpur': 'NGP',
      'Amravati': 'AMV'
    };
    
    const stationCode = stationCodes[user?.workingStation || ''] || user?.workingStation?.substring(0, 3).toUpperCase() || '';
    setTravelId(`${stationCode}-`);
    setTicket(null);
    setTrainInfo(null);
    setValidationResult(null);
  };

  return (
    <Layout title="Ticket Validation">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ticket Validation</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Validate and verify passenger tickets
              {user?.workingStation && (
                <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  - {user.workingStation} Station
                </span>
              )}
            </p>
          </div>
        </div>

        <Tabs defaultValue="manual-validation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="manual-validation" className="flex items-center space-x-2">
              <Ticket className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center space-x-2">
              <Scan className="h-4 w-4" />
              <span>Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="platform-tickets" className="flex items-center space-x-2">
              <Ticket className="h-4 w-4" />
              <span>Platform</span>
            </TabsTrigger>
            <TabsTrigger value="verified-list" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Verified</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual-validation" className="space-y-6">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-6 w-6 text-blue-600" />
                    <CardTitle>Manual Ticket Validation</CardTitle>
                  </div>
                  <CardDescription>
                    Enter the Travel ID to verify and validate passenger tickets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleValidation} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="travelId" className="text-gray-700 dark:text-gray-300">Travel ID *</Label>
                      <Input
                        id="travelId"
                        value={travelId}
                        onChange={(e) => setTravelId(e.target.value.toUpperCase())}
                        placeholder={`e.g., ${user?.workingStation ? (user.workingStation === 'Washim' ? 'WHM' : user.workingStation === 'Akola' ? 'AK' : 'STN') : 'WHM'}-12345`}
                        required
                        className="font-mono dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Travel ID is pre-filled with your station code. Complete the ID number.
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        disabled={isValidating}
                        className="flex-1"
                      >
                        {isValidating ? 'Validating...' : 'Validate Ticket'}
                      </Button>
                      {(ticket || validationResult) && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={resetValidation}
                        >
                          New Validation
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {validationResult && (
              <Card className={`border-2 ${getStatusColor(validationResult.status)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {getStatusIcon(validationResult.status)}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {validationResult.status === 'valid' ? 'Valid Ticket' : 
                         validationResult.status === 'expired' ? 'Expired Ticket' :
                         validationResult.status === 'duplicate' ? 'Already Verified' : 'Invalid Ticket'}
                      </h3>
                      <p className="text-sm">{validationResult.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {trainInfo && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Train className="h-6 w-6 text-purple-600" />
                    <CardTitle>Train Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Train Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{trainInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Train Number</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">{trainInfo.number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {ticket && (
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Travel ID</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">{ticket.travel_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Passenger Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ticket.passenger_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Passengers</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{ticket.passenger_count}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Class</p>
                      <Badge variant="outline">
                        {ticket.ticket_class.charAt(0).toUpperCase() + ticket.ticket_class.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Journey</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {(ticket as any).from_station?.name} → {(ticket as any).to_station?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ticket.kilometres} KM</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Travel Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{new Date(ticket.travel_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Travel Time</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{ticket.created_time}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">₹{ticket.total_price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expires At</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {new Date(ticket.expires_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {ticket.is_verified && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>Verified by:</strong> {ticket.verified_by}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong>Verified at:</strong> {new Date(ticket.verified_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scanner" className="space-y-6">
            <TravelIdScanner />
          </TabsContent>

          <TabsContent value="platform-tickets" className="space-y-6">
            <PlatformTicketVerification />
          </TabsContent>

          <TabsContent value="verified-list" className="space-y-6">
            <VerifiedTicketsList />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TicketValidation;
