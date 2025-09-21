
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TableStats {
  total: number;
  filled: number;
}

interface DatabaseStats {
  stations: TableStats;
  routes: TableStats;
  trains: TableStats;
  tickets: TableStats;
  staff: TableStats;
  verificationLogs: TableStats;
}

export const useDatabaseStats = () => {
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({
    stations: { total: 0, filled: 0 },
    routes: { total: 0, filled: 0 },
    trains: { total: 0, filled: 0 },
    tickets: { total: 0, filled: 0 },
    staff: { total: 0, filled: 0 },
    verificationLogs: { total: 0, filled: 0 }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDatabaseStats = async () => {
      try {
        const [stationsRes, routesRes, trainsRes, ticketsRes, staffRes, logsRes] = await Promise.all([
          supabase.from('stations').select('*', { count: 'exact' }),
          supabase.from('routes').select('*', { count: 'exact' }),
          supabase.from('trains').select('*', { count: 'exact' }),
          supabase.from('tickets').select('*', { count: 'exact' }),
          supabase.from('staff').select('*', { count: 'exact' }),
          supabase.from('verification_logs').select('*', { count: 'exact' })
        ]);

        setDatabaseStats({
          stations: { total: stationsRes.count || 0, filled: stationsRes.count || 0 },
          routes: { total: routesRes.count || 0, filled: routesRes.count || 0 },
          trains: { total: trainsRes.count || 0, filled: trainsRes.count || 0 },
          tickets: { total: ticketsRes.count || 0, filled: ticketsRes.count || 0 },
          staff: { total: staffRes.count || 0, filled: staffRes.count || 0 },
          verificationLogs: { total: logsRes.count || 0, filled: logsRes.count || 0 }
        });
      } catch (error) {
        console.error('Error fetching database stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabaseStats();
  }, []);

  return { databaseStats, isLoading };
};
