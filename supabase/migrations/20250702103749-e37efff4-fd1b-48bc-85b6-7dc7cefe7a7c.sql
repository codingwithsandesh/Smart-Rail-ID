
-- First, let's see what values are currently allowed in the ticket_class check constraint
-- and update it to include 'platform'
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_ticket_class_check;

-- Add a new check constraint that allows 'platform' as a valid ticket class
ALTER TABLE public.tickets ADD CONSTRAINT tickets_ticket_class_check 
CHECK (ticket_class IN ('general', 'sleeper', 'ac_3_tier', 'ac_2_tier', 'ac_1_tier', 'chair_car', 'second_sitting', 'ac_3_economy', 'platform'));
