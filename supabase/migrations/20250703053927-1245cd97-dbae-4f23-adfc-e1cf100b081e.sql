
-- Create a table to store generated reports
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL, -- 'tickets', 'platform_tickets', 'verification_logs', 'revenue'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  working_station TEXT
);

-- Add RLS policies for reports
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all reports" 
  ON public.daily_reports 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can create reports" 
  ON public.daily_reports 
  FOR INSERT 
  WITH CHECK (true);

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to schedule daily report generation
CREATE OR REPLACE FUNCTION public.schedule_daily_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Schedule daily report generation at 8:00 AM
  PERFORM cron.schedule(
    'generate-daily-reports',
    '0 8 * * *', -- 8:00 AM every day
    $$
    SELECT net.http_post(
      url := 'https://jnovtwvstcskzbrrrgbc.supabase.co/functions/v1/generate-daily-reports',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impub3Z0d3ZzdGNza3picnVyZ2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTI4OTIsImV4cCI6MjA2NjQ4ODg5Mn0.bB7OFSYM2RD_f50r4IjRdF9wXz89czY-6Wi9eStPHvc"}'::jsonb,
      body := '{"action": "generate_daily_reports"}'::jsonb
    );
    $$
  );
END;
$$;

-- Call the function to set up the cron job
SELECT public.schedule_daily_reports();
