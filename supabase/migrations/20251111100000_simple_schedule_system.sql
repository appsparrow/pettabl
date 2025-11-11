-- Simple Schedule System (inspired by old DingDongDog)
-- This replaces the complex pet_care_plans with a simpler approach

-- Create enum for time periods
CREATE TYPE public.time_period AS ENUM ('morning', 'afternoon', 'evening');

-- Create enum for activity types
CREATE TYPE public.activity_type AS ENUM ('feed', 'walk', 'letout');

-- Create schedules table (per pet/session)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  feeding_instruction TEXT DEFAULT 'Give food and water',
  walking_instruction TEXT DEFAULT 'Walk around the block',
  letout_instruction TEXT DEFAULT 'Let out in backyard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pet_id, session_id)
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create schedule_times table (what times activities should happen)
CREATE TABLE public.schedule_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  time_period time_period NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(schedule_id, activity_type, time_period)
);

ALTER TABLE public.schedule_times ENABLE ROW LEVEL SECURITY;

-- Create activities table (log of completed activities)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  time_period time_period NOT NULL,
  date DATE NOT NULL,
  caretaker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedules
CREATE POLICY "Fur bosses can manage their pet schedules"
  ON public.schedules FOR ALL
  USING (pet_id IN (SELECT id FROM public.pets WHERE fur_boss_id = auth.uid()));

CREATE POLICY "Fur agents can view assigned pet schedules"
  ON public.schedules FOR SELECT
  USING (pet_id IN (
    SELECT p.id FROM public.pets p
    INNER JOIN public.sessions s ON s.pet_id = p.id
    INNER JOIN public.session_agents sa ON sa.session_id = s.id
    WHERE sa.fur_agent_id = auth.uid()
  ));

-- RLS Policies for schedule_times
CREATE POLICY "Fur bosses can manage schedule times"
  ON public.schedule_times FOR ALL
  USING (schedule_id IN (
    SELECT id FROM public.schedules 
    WHERE pet_id IN (SELECT id FROM public.pets WHERE fur_boss_id = auth.uid())
  ));

CREATE POLICY "Fur agents can view assigned schedule times"
  ON public.schedule_times FOR SELECT
  USING (schedule_id IN (
    SELECT sc.id FROM public.schedules sc
    INNER JOIN public.pets p ON p.id = sc.pet_id
    INNER JOIN public.sessions s ON s.pet_id = p.id
    INNER JOIN public.session_agents sa ON sa.session_id = s.id
    WHERE sa.fur_agent_id = auth.uid()
  ));

-- RLS Policies for activities
CREATE POLICY "Fur bosses can view their pet activities"
  ON public.activities FOR SELECT
  USING (pet_id IN (SELECT id FROM public.pets WHERE fur_boss_id = auth.uid()));

CREATE POLICY "Fur agents can manage activities for assigned sessions"
  ON public.activities FOR ALL
  USING (session_id IN (
    SELECT session_id FROM public.session_agents WHERE fur_agent_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_schedules_pet_id ON public.schedules(pet_id);
CREATE INDEX idx_schedule_times_schedule_id ON public.schedule_times(schedule_id);
CREATE INDEX idx_activities_session_id ON public.activities(session_id);
CREATE INDEX idx_activities_date ON public.activities(date);
CREATE INDEX idx_activities_pet_id ON public.activities(pet_id);

