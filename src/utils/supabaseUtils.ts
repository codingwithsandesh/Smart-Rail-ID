
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Station = Tables<'stations'>;
export type Route = Tables<'routes'>;
export type Ticket = Tables<'tickets'>;
export type VerificationLog = Tables<'verification_logs'>;
export type Staff = Tables<'staff'>;

export const getStations = async (): Promise<Station[]> => {
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const getRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select(`
      *,
      from_station:from_station_id(name, code),
      to_station:to_station_id(name, code)
    `);
  
  if (error) throw error;
  return data || [];
};

export const getRoutesByStation = async (stationId: string): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select(`
      *,
      from_station:from_station_id(name, code),
      to_station:to_station_id(name, code)
    `)
    .eq('from_station_id', stationId);
  
  if (error) throw error;
  return data || [];
};

export const getRouteInfo = async (fromStationId: string, toStationId: string): Promise<Route | null> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('from_station_id', fromStationId)
    .eq('to_station_id', toStationId)
    .single();
  
  if (error) return null;
  return data;
};

export const createTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> => {
  const { data, error } = await supabase
    .from('tickets')
    .insert(ticketData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getTicketByTravelId = async (travelId: string): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      from_station:from_station_id(name, code),
      to_station:to_station_id(name, code)
    `)
    .eq('travel_id', travelId)
    .single();
  
  if (error) return null;
  return data;
};

export const updateTicketVerification = async (
  ticketId: string, 
  verifiedBy: string
): Promise<void> => {
  const { error } = await supabase
    .from('tickets')
    .update({
      is_verified: true,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString()
    })
    .eq('id', ticketId);
  
  if (error) throw error;
};

export const createVerificationLog = async (
  logData: Omit<VerificationLog, 'id' | 'verified_at'>
): Promise<void> => {
  const { error } = await supabase
    .from('verification_logs')
    .insert(logData);
  
  if (error) throw error;
};

export const getTicketsByDateRange = async (startDate: string, endDate: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      from_station:from_station_id(name, code),
      to_station:to_station_id(name, code)
    `)
    .gte('travel_date', startDate)
    .lte('travel_date', endDate)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const deleteTicketsByDate = async (date: string): Promise<void> => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('travel_date', date);
  
  if (error) throw error;
};

export const generateTravelId = (stationCode: string): string => {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${stationCode}-${randomNumber}`;
};

export const calculateExpiryTime = (travelDate: string, travelTime: string): string => {
  const travelDateTime = new Date(`${travelDate}T${travelTime}`);
  // Add exactly 24 hours to expire at the same time next day
  travelDateTime.setHours(travelDateTime.getHours() + 24);
  return travelDateTime.toISOString();
};

export const getStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createStaff = async (staffData: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .insert(staffData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateStaff = async (id: string, staffData: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .update(staffData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteStaff = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
