
-- Create tables for better data management
CREATE TABLE public.stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  to_station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  distance INTEGER NOT NULL,
  general_price DECIMAL(10,2) NOT NULL,
  sleeper_price DECIMAL(10,2) NOT NULL,
  ac_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_id TEXT NOT NULL UNIQUE,
  passenger_name TEXT NOT NULL,
  passenger_count INTEGER NOT NULL DEFAULT 1,
  from_station_id UUID REFERENCES public.stations(id),
  to_station_id UUID REFERENCES public.stations(id),
  route_id UUID REFERENCES public.routes(id),
  kilometres INTEGER NOT NULL,
  travel_date DATE NOT NULL,
  created_time TIME NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  ticket_class TEXT NOT NULL CHECK (ticket_class IN ('general', 'sleeper', 'ac')),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id),
  travel_id TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('valid', 'invalid', 'expired', 'duplicate')),
  fraud_attempt BOOLEAN DEFAULT FALSE,
  details TEXT
);

-- Insert default stations
INSERT INTO public.stations (name, code, address) VALUES
('Washim', 'WH', 'Washim Railway Station, Washim, Maharashtra 444505'),
('Akola', 'AK', 'Akola Junction Railway Station, Akola, Maharashtra 444001'),
('Nagpur', 'NG', 'Nagpur Junction Railway Station, Nagpur, Maharashtra 440001'),
('Mumbai', 'MB', 'Chhatrapati Shivaji Maharaj Terminus, Mumbai, Maharashtra 400001'),
('Pune', 'PN', 'Pune Junction Railway Station, Pune, Maharashtra 411001'),
('Nanded', 'ND', 'Nanded Railway Station, Nanded, Maharashtra 431602');

-- Insert default routes
INSERT INTO public.routes (from_station_id, to_station_id, distance, general_price, sleeper_price, ac_price)
SELECT 
  s1.id, s2.id, distance, general_price, sleeper_price, ac_price
FROM (VALUES
  ('Washim', 'Akola', 45, 25.00, 50.00, 100.00),
  ('Washim', 'Nagpur', 165, 85.00, 170.00, 340.00),
  ('Washim', 'Nanded', 120, 60.00, 120.00, 240.00),
  ('Akola', 'Nagpur', 120, 60.00, 120.00, 240.00),
  ('Akola', 'Mumbai', 450, 225.00, 450.00, 900.00)
) AS route_data(from_name, to_name, distance, general_price, sleeper_price, ac_price)
JOIN public.stations s1 ON s1.name = route_data.from_name
JOIN public.stations s2 ON s2.name = route_data.to_name;

-- Enable RLS on all tables
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented)
CREATE POLICY "Allow all operations on stations" ON public.stations FOR ALL USING (true);
CREATE POLICY "Allow all operations on routes" ON public.routes FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON public.tickets FOR ALL USING (true);
CREATE POLICY "Allow all operations on verification_logs" ON public.verification_logs FOR ALL USING (true);
