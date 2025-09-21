
-- Update all existing trains to be associated with Washim station
UPDATE public.trains 
SET working_station = 'Washim' 
WHERE working_station IS NULL;

-- Update all existing stations to be associated with Washim working station
UPDATE public.stations 
SET working_station = 'Washim' 
WHERE working_station IS NULL;

-- Update all existing tickets to be created by Washim station
UPDATE public.tickets 
SET created_by = CASE 
  WHEN created_by = 'Unknown' OR created_by = '' OR created_by IS NULL 
  THEN 'Washim-Staff'
  ELSE created_by || '-Washim'
END
WHERE created_by NOT LIKE '%Washim%';

-- Update all existing verification logs to be verified by Washim station
UPDATE public.verification_logs 
SET verified_by = CASE 
  WHEN verified_by = 'Unknown' OR verified_by = '' OR verified_by IS NULL 
  THEN 'Washim-TTE'
  ELSE verified_by || '-Washim'
END
WHERE verified_by NOT LIKE '%Washim%';

-- Update all existing staff to be associated with Washim station
UPDATE public.staff 
SET working_station = 'Washim' 
WHERE working_station IS NULL;
