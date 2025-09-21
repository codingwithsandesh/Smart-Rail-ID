import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getStations, 
  getRoutes, 
  getRoutesByStation, 
  createTicket, 
  getTicketsByDateRange,
  deleteTicketsByDate
} from '../utils/supabaseUtils';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { 
  getTrains, 
  getTrainWithDetails, 
  getAvailableTrains, 
  createTrain, 
  deleteTrain,
  Train
} from '../utils/trainUtils';
import { useAuth } from '../contexts/AuthContext';

export type Station = Tables<'stations'>;
export type Route = Tables<'routes'>;
export type Ticket = Tables<'tickets'>;

export const useStations = () => {  
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      console.log('Fetching all stations (no working station filter)');
      
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching stations:', error);
        throw error;
      }
      
      console.log('All stations fetched:', data?.length || 0);
      return data || [];
    },
  });
};

// Update the useAllStations hook to ensure it always fetches data properly
export const useAllStations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['all-stations'],
    queryFn: async () => {
      console.log('useAllStations - Fetching all stations for admin inspection');
      
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('working_station, name');
      
      if (error) {
        console.error('useAllStations - Error fetching all stations:', error);
        throw error;
      }
      
      console.log('useAllStations - All stations fetched successfully:', data?.length || 0);
      return data || [];
    },
    // Remove the enabled condition to always fetch data
    enabled: true,
  });
};

export const useRoutes = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['routes', user?.workingStation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          from_station:stations!routes_from_station_id_fkey(name, code, working_station),
          to_station:stations!routes_to_station_id_fkey(name, code, working_station)
        `);
      
      if (error) throw error;
      
      // Filter routes based on working station - only show routes where both stations belong to user's working station
      if (user?.workingStation) {
        const filteredData = data?.filter(route => 
          route.from_station?.working_station === user.workingStation &&
          route.to_station?.working_station === user.workingStation
        ) || [];
        return filteredData;
      }
      
      return [];
    },
  });
};

export const useRoutesByStation = (stationId: string) => {
  return useQuery({
    queryKey: ['routes', 'by-station', stationId],
    queryFn: () => getRoutesByStation(stationId),
    enabled: !!stationId,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useCreateStation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (stationData: Omit<Station, 'id' | 'created_at'>) => {
      console.log('Creating station with working station:', user?.workingStation);
      
      const { data, error } = await supabase
        .from('stations')
        .insert({
          ...stationData,
          working_station: user?.workingStation || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routeData: Omit<Route, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('routes')
        .insert(routeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useDeleteStation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stationId: string) => {
      const { error } = await supabase
        .from('stations')
        .delete()
        .eq('id', stationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stations'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useTicketsByDateRange = (startDate: string, endDate: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tickets', 'date-range', startDate, endDate, user?.workingStation, user?.role],
    queryFn: async () => {
      console.log('Fetching tickets for date range:', { startDate, endDate, workingStation: user?.workingStation, role: user?.role });
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          from_station:stations!tickets_from_station_id_fkey(name, code, working_station),
          to_station:stations!tickets_to_station_id_fkey(name, code, working_station),
          train:trains(name, number, working_station)
        `)
        .gte('travel_date', startDate)
        .lte('travel_date', endDate)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      console.log('Raw tickets fetched:', data?.length || 0);
      
      // Filter tickets based on working station - only show tickets that belong to user's working station
      let filteredData = data || [];
      
      if (user?.workingStation) {
        filteredData = data?.filter(ticket => {
          // Check if ticket belongs to the working station through created_by field
          const createdByMatch = ticket.created_by && ticket.created_by.includes(user.workingStation);
          
          // Check if from/to stations belong to working station
          const fromStationMatch = ticket.from_station?.working_station === user.workingStation;
          const toStationMatch = ticket.to_station?.working_station === user.workingStation;
          
          // Check if train belongs to working station
          const trainMatch = ticket.train?.working_station === user.workingStation;
          
          return createdByMatch || fromStationMatch || toStationMatch || trainMatch;
        }) || [];
      }

      console.log('Filtered tickets for', user?.workingStation, ':', filteredData.length);
      return filteredData;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useDeleteTicketsByDate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTicketsByDate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useTrains = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['trains', user?.workingStation, user?.role],
    queryFn: async () => {
      console.log('Fetching trains for working station:', user?.workingStation, 'role:', user?.role);
      
      let query = supabase
        .from('trains')
        .select('*')
        .order('name');
      
      // Filter trains by working station - only show trains that belong to user's working station
      if (user?.workingStation) {
        query = query.eq('working_station', user.workingStation);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching trains:', error);
        throw error;
      }
      
      console.log('Trains found for station:', user?.workingStation, 'count:', data?.length || 0);
      return data || [];
    },
  });
};

export const useTrainDetails = (trainId: string) => {
  return useQuery({
    queryKey: ['train', trainId],
    queryFn: () => getTrainWithDetails(trainId),
    enabled: !!trainId,
  });
};

export const useAvailableTrains = (fromStationId: string, toStationId: string, travelDate: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['available-trains', fromStationId, toStationId, travelDate, user?.workingStation],
    queryFn: async () => {
      console.log('Fetching available trains for route and working station:', {
        fromStationId,
        toStationId,
        workingStation: user?.workingStation
      });
      
      if (user?.workingStation) {
        // Get trains that belong to the working station and have routes through the specified stations
        const { data, error } = await supabase
          .from('trains')
          .select(`
            *,
            train_routes!inner(
              station_id,
              halt_order,
              departure_time,
              arrival_time,
              general_price,
              sleeper_price,
              ac_3_tier_price,
              ac_2_tier_price,
              ac_1_tier_price,
              chair_car_price,
              second_sitting_price,
              ac_3_economy_price
            )
          `)
          .eq('working_station', user.workingStation);
        
        if (error) {
          console.error('Error fetching available trains:', error);
          throw error;
        }
        
        // Filter trains that actually pass through both stations in correct order
        const availableTrains = data.filter(train => {
          const routes = train.train_routes;
          const fromRoute = routes.find(r => r.station_id === fromStationId);
          const toRoute = routes.find(r => r.station_id === toStationId);
          
          return fromRoute && toRoute && fromRoute.halt_order < toRoute.halt_order;
        });
        
        console.log('Available trains found:', availableTrains);
        return availableTrains;
      }
      
      // Return empty array if no working station
      return [];
    },
    enabled: !!fromStationId && !!toStationId && !!travelDate,
  });
};

export const useCreateTrain = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (trainData: any) => {
      // Add working station to train data for newly created trains
      const trainWithStation = {
        ...trainData,
        working_station: user?.workingStation || null
      };
      
      console.log('Creating train with working station:', trainWithStation);
      return createTrain(trainWithStation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trains'] });
    },
  });
};

export const useDeleteTrain = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTrain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trains'] });
    },
  });
};

export const useVerificationLogs = (startDate?: string, endDate?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['verification-logs', startDate, endDate, user?.workingStation],
    queryFn: async () => {
      console.log('Fetching verification logs with params:', { startDate, endDate, workingStation: user?.workingStation });
      
      let query = supabase
        .from('verification_logs')
        .select(`
          *,
          ticket:tickets(
            *,
            from_station:stations!tickets_from_station_id_fkey(name, code, working_station),
            to_station:stations!tickets_to_station_id_fkey(name, code, working_station),
            train:trains(name, number, working_station)
          )
        `)
        .order('verified_at', { ascending: false });

      if (startDate && endDate) {
        query = query.gte('verified_at', startDate).lte('verified_at', endDate + 'T23:59:59');
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching verification logs:', error);
        throw error;
      }

      console.log('Raw verification logs fetched:', data?.length || 0);

      // Filter by working station - only show verification logs that belong to user's working station
      let filteredData = data || [];
      if (user?.workingStation) {
        filteredData = data?.filter(log => {
          if (!log.ticket) return false;
          
          // Check if verification was done by someone from this working station
          const verifiedByMatch = log.verified_by?.includes(user.workingStation);
          
          // Check if ticket belongs to this working station
          const ticketFromStationMatch = log.ticket.from_station?.working_station === user.workingStation;
          const ticketToStationMatch = log.ticket.to_station?.working_station === user.workingStation;
          const ticketTrainMatch = log.ticket.train?.working_station === user.workingStation;
          const ticketCreatedByMatch = log.ticket.created_by?.includes(user.workingStation);
          
          return verifiedByMatch || ticketFromStationMatch || ticketToStationMatch || ticketTrainMatch || ticketCreatedByMatch;
        }) || [];
      }

      console.log('Filtered verification logs for', user?.workingStation, ':', filteredData.length);
      return filteredData;
    },
  });
};
