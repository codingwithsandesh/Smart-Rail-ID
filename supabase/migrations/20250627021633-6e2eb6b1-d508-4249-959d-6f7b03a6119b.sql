
-- Create trains table
CREATE TABLE public.trains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create train_routes table to define which stations a train visits
CREATE TABLE public.train_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  train_id UUID REFERENCES public.trains(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
  halt_order INTEGER NOT NULL, -- Order of stations (1, 2, 3, etc.)
  distance_from_start INTEGER NOT NULL, -- Total distance from starting station
  arrival_time TIME,
  departure_time TIME,
  halt_duration INTEGER DEFAULT 0, -- Duration in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(train_id, halt_order),
  UNIQUE(train_id, station_id)
);

-- Create train_schedules table for days when train runs
CREATE TABLE public.train_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  train_id UUID REFERENCES public.trains(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(train_id, day_of_week)
);

-- Create train_classes table for different seat classes
CREATE TABLE public.train_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  train_id UUID REFERENCES public.trains(id) ON DELETE CASCADE NOT NULL,
  class_type TEXT NOT NULL, -- 'general', 'sleeper', '2a', '3a', '1a', 'cc'
  base_price NUMERIC NOT NULL DEFAULT 0,
  price_per_km NUMERIC NOT NULL DEFAULT 0,
  total_seats INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(train_id, class_type)
);

-- Update tickets table to include train information
ALTER TABLE public.tickets 
ADD COLUMN train_id UUID REFERENCES public.trains(id),
ADD COLUMN class_type TEXT DEFAULT 'general',
ADD COLUMN seat_number TEXT,
ADD COLUMN departure_time TIME,
ADD COLUMN arrival_time TIME;

-- Create indexes for better performance
CREATE INDEX idx_train_routes_train_id ON public.train_routes(train_id);
CREATE INDEX idx_train_routes_station_id ON public.train_routes(station_id);
CREATE INDEX idx_train_schedules_train_id ON public.train_schedules(train_id);
CREATE INDEX idx_train_schedules_day ON public.train_schedules(day_of_week);
CREATE INDEX idx_train_classes_train_id ON public.train_classes(train_id);
CREATE INDEX idx_tickets_train_id ON public.tickets(train_id);
