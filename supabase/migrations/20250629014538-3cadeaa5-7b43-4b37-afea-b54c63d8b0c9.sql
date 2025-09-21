
-- Create enum for staff roles
CREATE TYPE public.staff_role AS ENUM ('ticket_creator', 'tte');

-- Create staff table to store ticket creators and TTEs
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role staff_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (assuming admins are authenticated users for now)
CREATE POLICY "Authenticated users can manage staff" 
  ON public.staff 
  FOR ALL 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_staff_staff_id ON public.staff(staff_id);
CREATE INDEX idx_staff_role ON public.staff(role);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_updated_at();
