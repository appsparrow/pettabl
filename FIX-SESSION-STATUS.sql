-- FIX SESSION STATUS
-- Run this if your session is stuck in "planned" status

-- Option 1: Update ALL sessions to have correct status based on dates
UPDATE sessions
SET status = CASE
  WHEN end_date < CURRENT_DATE THEN 'completed'::session_status
  WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'active'::session_status
  ELSE 'planned'::session_status
END;

-- Option 2: Update a specific session to "active" (replace SESSION_ID)
-- UPDATE sessions
-- SET status = 'active'
-- WHERE id = 'YOUR_SESSION_ID';

-- Option 3: Check what will be updated (run this first to preview)
SELECT 
  id,
  start_date,
  end_date,
  status as current_status,
  CASE
    WHEN end_date < CURRENT_DATE THEN 'completed'
    WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'active'
    ELSE 'planned'
  END as new_status
FROM sessions;

