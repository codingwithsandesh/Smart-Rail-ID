
-- Create function to get daily reports with proper filtering
CREATE OR REPLACE FUNCTION public.get_daily_reports(station_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  report_date DATE,
  report_type TEXT,
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  working_station TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dr.id,
    dr.report_date,
    dr.report_type,
    dr.file_name,
    dr.file_path,
    dr.file_size,
    dr.created_at,
    dr.working_station
  FROM public.daily_reports dr
  WHERE 
    CASE 
      WHEN station_filter IS NOT NULL THEN 
        dr.working_station = station_filter OR dr.working_station IS NULL
      ELSE TRUE
    END
  ORDER BY dr.created_at DESC
  LIMIT 50;
END;
$$;
