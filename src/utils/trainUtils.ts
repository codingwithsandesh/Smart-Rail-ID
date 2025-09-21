
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Train = Tables<'trains'>;
export type TrainRoute = Tables<'train_routes'>;
export type TrainSchedule = Tables<'train_schedules'>;

export const getTrains = async (): Promise<Train[]> => {
  const { data, error } = await supabase
    .from('trains')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getTrainWithDetails = async (trainId: string) => {
  const { data: train, error: trainError } = await supabase
    .from('trains')
    .select(`
      *,
      train_routes!inner(
        *,
        station:stations(name, code)
      ),
      train_schedules(*)
    `)
    .eq('id', trainId)
    .single();
  
  if (trainError) throw trainError;
  return train;
};

export const getAvailableTrains = async (fromStationId: string, toStationId: string, travelDate: string, workingStation?: string) => {
  let query = supabase
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
    `);

  // Filter by working station if provided
  if (workingStation) {
    query = query.eq('working_station', workingStation);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  // Filter trains that pass through both stations in correct order
  const availableTrains = data.filter(train => {
    const routes = train.train_routes;
    const fromRoute = routes.find(r => r.station_id === fromStationId);
    const toRoute = routes.find(r => r.station_id === toStationId);
    
    return fromRoute && toRoute && fromRoute.halt_order < toRoute.halt_order;
  });
  
  return availableTrains;
};

export const createTrain = async (trainData: Omit<Train, 'id' | 'created_at'>, workingStation?: string): Promise<Train> => {
  console.log('Creating train with data:', trainData);
  
  const { data, error } = await supabase
    .from('trains')
    .insert({
      name: trainData.name,
      number: trainData.number,
      working_station: workingStation || trainData.working_station || null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating train:', error);
    throw error;
  }
  
  console.log('Train created successfully:', data);
  return data;
};

export const deleteTrain = async (trainId: string): Promise<void> => {
  const { error } = await supabase
    .from('trains')
    .delete()
    .eq('id', trainId);
  
  if (error) throw error;
};

// New utility functions that were missing
export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Unknown';
};

export const getClassDisplayName = (classType: string): string => {
  const classNames: { [key: string]: string } = {
    'general': 'General',
    'sleeper': 'Sleeper',
    'ac_1_tier': '1st AC',
    'ac_2_tier': '2nd AC',
    'ac_3_tier': '3rd AC',
    'chair_car': 'Chair Car',
    'second_sitting': '2nd Sitting',
    'ac_3_economy': '3rd Economy',
    'platform': 'Platform Ticket'
  };
  return classNames[classType] || classType;
};

export const createTrainRoute = async (routeData: {
  train_id: string;
  station_id: string;
  halt_order: number;
  distance_from_start: number;
  arrival_time: string | null;
  departure_time: string | null;
  halt_duration: number;
  general_price: number;
  sleeper_price: number;
  ac_1_tier_price: number;
  ac_2_tier_price: number;
  ac_3_tier_price: number;
  second_sitting_price: number;
  ac_3_economy_price: number;
  chair_car_price: number;
}) => {
  const { data, error } = await supabase
    .from('train_routes')
    .insert(routeData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createTrainSchedule = async (scheduleData: {
  train_id: string;
  day_of_week: number;
  is_active: boolean;
}) => {
  const { data, error } = await supabase
    .from('train_schedules')
    .insert(scheduleData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
