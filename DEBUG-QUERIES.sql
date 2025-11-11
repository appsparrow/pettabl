-- DEBUG QUERIES FOR AGENT DASHBOARD ISSUE
-- Run these in Supabase SQL Editor to diagnose the problem

-- 1. Check all sessions and their status
SELECT 
  s.id,
  s.start_date,
  s.end_date,
  s.status,
  p.name as pet_name,
  pb.name as boss_name
FROM sessions s
JOIN pets p ON p.id = s.pet_id
JOIN profiles pb ON pb.id = s.fur_boss_id
ORDER BY s.created_at DESC;

-- 2. Check session_agents assignments
SELECT 
  sa.id,
  sa.session_id,
  s.status as session_status,
  s.start_date,
  s.end_date,
  pa.name as agent_name,
  pa.email as agent_email,
  p.name as pet_name
FROM session_agents sa
JOIN sessions s ON s.id = sa.session_id
JOIN profiles pa ON pa.id = sa.fur_agent_id
JOIN pets p ON p.id = s.pet_id
ORDER BY sa.created_at DESC;

-- 3. Check if there are any ACTIVE sessions with agents
SELECT 
  s.id as session_id,
  s.status,
  s.start_date,
  s.end_date,
  p.name as pet_name,
  pa.name as agent_name,
  pa.email as agent_email,
  pa.id as agent_id
FROM sessions s
JOIN pets p ON p.id = s.pet_id
JOIN session_agents sa ON sa.session_id = s.id
JOIN profiles pa ON pa.id = sa.fur_agent_id
WHERE s.status = 'active';

-- 4. Check schedules
SELECT 
  sc.id,
  sc.pet_id,
  sc.session_id,
  p.name as pet_name,
  sc.feeding_instruction,
  sc.walking_instruction,
  sc.letout_instruction
FROM schedules sc
JOIN pets p ON p.id = sc.pet_id;

-- 5. Check schedule times
SELECT 
  st.id,
  st.schedule_id,
  st.activity_type,
  st.time_period,
  p.name as pet_name
FROM schedule_times st
JOIN schedules sc ON sc.id = st.schedule_id
JOIN pets p ON p.id = sc.pet_id;

-- 6. Get the agent's user ID (replace with actual email)
SELECT id, name, email, role 
FROM profiles 
WHERE role = 'fur_agent';

-- 7. Simulate the agent dashboard query (replace YOUR_AGENT_ID)
-- SELECT 
--   sa.session_id,
--   s.id,
--   s.pet_id,
--   s.start_date,
--   s.end_date,
--   s.status
-- FROM session_agents sa
-- INNER JOIN sessions s ON s.id = sa.session_id
-- WHERE sa.fur_agent_id = 'YOUR_AGENT_ID'
--   AND s.status = 'active';

