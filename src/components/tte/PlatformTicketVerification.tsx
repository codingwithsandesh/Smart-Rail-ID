
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Ticket, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

interface PlatformTicket {
  id: string;
  travel_id: string;
  passenger_name: string;
  total_price: number;
  travel_date: string;
  created_time: string;
  expires_at: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
}

const PlatformTicketVerification = () => {
  const { user } = useAuth();
  const [platformId, setPlatformId] = useState('');
  const [ticket, setTicket] = useState<PlatformTicket | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | 'expired' | 'duplicate' | null>(null);

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platformId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Platform Ticket ID",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setTicket(null);

    try {
      // Search for platform tickets (tickets with class_type = 'platform')
      const { data: foundTicket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('travel_id', platformId.trim())
        .eq('class_type', 'platform')
        .single();

      if (error || !foundTicket) {
        setValidationResult('invalid');
        toast({
          title: "Invalid Platform Ticket",
          description: "Platform ticket not found",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      setTicket(foundTicket);

      // Check if ticket has expired
      const now = new Date();
      const expiryTime = new Date(foundTicket.expires_at);
      
      if (now > expiryTime) {
        setValidationResult('expired');
        toast({
          title: "Expired Platform Ticket",
          description: "This platform ticket has expired",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      // Check if already verified
      if (foundTicket.is_verified) {
        setValidationResult('duplicate');
        toast({
          title: "Already Verified",
          description: `Platform ticket already verified by ${foundTicket.verified_by}`,
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          is_verified: true,
          verified_by: user?.username || 'Unknown TTE',
          verified_at: new Date().toISOString()
        })
        .eq('id', foundTicket.id);

      if (updateError) throw updateError;

      // Log verification
      const { error: logError } = await supabase
        .from('verification_logs')
        .insert({
          ticket_id: foundTicket.id,
          travel_id: platformId.trim(),
          verified_by: user?.username || 'Unknown TTE',
          status: 'valid',
          fraud_attempt: false,
          details: 'Platform ticket successfully verified'
        });

      if (logError) console.error('Error logging verification:', logError);

      setValidationResult('valid');
      setTicket(prev => prev ? { ...prev, is_verified: true, verified_by: user?.username || 'Unknown TTE', verified_at: new Date().toISOString() } : null);
      
      toast({
        title: "Platform Ticket Verified",
        description: "Platform ticket verified successfully",
      });

    } catch (error) {
      console.error('Platform ticket validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate platform ticket",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const resetValidation = () => {
    setPlatformId('');
    setTicket(null);
    setValidationResult(null);
  };

  const getStatusIcon = () => {
    switch (validationResult) {
      case 'valid':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'expired':
        return <XCircle className="h-8 w-8 text-orange-600" />;
      case 'duplicate':
        return <XCircle className="h-8 w-8 text-yellow-600" />;
      default:
        return <XCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (validationResult) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Ticket className="h-6 w-6 text-indigo-600" />
          <CardTitle>Platform Ticket Verification</CardTitle>
        </div>
        <CardDescription>
          Verify platform entry tickets for station access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleValidation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformId">Platform Ticket ID *</Label>
            <Input
              id="platformId"
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value.toUpperCase())}
              placeholder="e.g., PLT-1234567890-123"
              required
              className="font-mono"
            />
          </div>
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={isValidating}
              className="flex-1"
            >
              {isValidating ? 'Validating...' : 'Verify Platform Ticket'}
            </Button>
            {(ticket || validationResult) && (
              <Button 
                type="button" 
                variant="outline"
                onClick={resetValidation}
              >
                Reset
              </Button>
            )}
          </div>
        </form>

        {validationResult && (
          <Card className={`border-2 ${getStatusColor()}`}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                {getStatusIcon()}
                <div>
                  <h3 className="text-lg font-semibold">
                    {validationResult === 'valid' ? 'Valid Platform Ticket' : 
                     validationResult === 'expired' ? 'Expired Platform Ticket' :
                     validationResult === 'duplicate' ? 'Already Verified' : 'Invalid Platform Ticket'}
                  </h3>
                  <p className="text-sm">
                    {validationResult === 'valid' ? 'Platform access granted' :
                     validationResult === 'expired' ? 'Ticket has expired' :
                     validationResult === 'duplicate' ? 'Ticket already used' : 'Ticket not found'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {ticket && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ticket ID</p>
                  <p className="font-mono font-semibold">{ticket.travel_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-semibold">₹{ticket.total_price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passenger</p>
                  <p className="font-semibold">{ticket.passenger_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valid Date</p>
                    <p className="font-semibold">{new Date(ticket.travel_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expires At</p>
                  <p className="font-semibold text-sm">{new Date(ticket.expires_at).toLocaleString()}</p>
                </div>
              </div>

              {ticket.is_verified && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    ✓ Verified by {ticket.verified_by} at {ticket.verified_at ? new Date(ticket.verified_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformTicketVerification;
