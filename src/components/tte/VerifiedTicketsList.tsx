
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, User, MapPin, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface VerifiedTicket {
  id: string;
  travel_id: string;
  passenger_name: string;
  ticket_class: string;
  total_price: number;
  verified_at: string;
  verified_by: string;
  travel_date: string;
  from_station?: { name: string };
  to_station?: { name: string };
}

const VerifiedTicketsList = () => {
  const { user } = useAuth();
  const [verifiedTickets, setVerifiedTickets] = useState<VerifiedTicket[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [totalChecked, setTotalChecked] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedTickets();
  }, [user]);

  const fetchVerifiedTickets = async () => {
    if (!user?.username) return;

    try {
      setIsLoading(true);
      
      // Fetch tickets verified by current TTE
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          travel_id,
          passenger_name,
          ticket_class,
          total_price,
          verified_at,
          verified_by,
          travel_date,
          from_station:stations!from_station_id(name),
          to_station:stations!to_station_id(name)
        `)
        .eq('verified_by', user.username)
        .eq('is_verified', true)
        .order('verified_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setVerifiedTickets(tickets || []);

      // Get counts for statistics
      const { data: validTickets, error: validError } = await supabase
        .from('tickets')
        .select('id')
        .eq('verified_by', user.username)
        .eq('is_verified', true);

      if (!validError) {
        setValidCount(validTickets?.length || 0);
      }

      // Get total verification logs for this TTE
      const { data: logs, error: logsError } = await supabase
        .from('verification_logs')
        .select('id')
        .eq('verified_by', user.username);

      if (!logsError) {
        setTotalChecked(logs?.length || 0);
      }

    } catch (error) {
      console.error('Error fetching verified tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading verified tickets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <CardTitle>Verified Tickets Summary</CardTitle>
        </div>
        <CardDescription>
          Your ticket verification activity and recent verifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{validCount}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Valid Tickets</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalChecked}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total Checked</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalChecked > 0 ? Math.round((validCount / totalChecked) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Success Rate</div>
          </div>
        </div>

        {/* Recent Verified Tickets */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Verified Tickets
          </h3>
          {verifiedTickets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No verified tickets yet
            </div>
          ) : (
            <div className="space-y-3">
              {verifiedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="font-mono">
                        {ticket.travel_id}
                      </Badge>
                      <Badge variant="secondary">
                        {ticket.ticket_class.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ₹{ticket.total_price}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{ticket.passenger_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(ticket.travel_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {ticket.from_station && ticket.to_station && (
                    <div className="flex items-center space-x-2 mt-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {ticket.from_station.name} → {ticket.to_station.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2 text-xs text-green-600 dark:text-green-400">
                    <Clock className="h-3 w-3" />
                    <span>Verified on {new Date(ticket.verified_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifiedTicketsList;
