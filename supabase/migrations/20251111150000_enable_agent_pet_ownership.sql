-- Enable Agent Pet Ownership: Allow any user to own pets and create sessions
-- This migration updates RLS policies to support role-switching between Boss and Agent modes

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Fur bosses can manage their own pets" ON public.pets;
DROP POLICY IF EXISTS "Fur bosses can manage their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Fur bosses can manage their pet schedules" ON public.schedules;
DROP POLICY IF EXISTS "Fur bosses can manage schedule times" ON public.schedule_times;
DROP POLICY IF EXISTS "Fur bosses can view their pet activities" ON public.activities;
DROP POLICY IF EXISTS "Fur bosses manage pet care plans" ON public.pet_care_plans;

-- Create new policies allowing ANY user to manage their own pets
CREATE POLICY "Users can manage their own pets"
  ON public.pets FOR ALL
  TO authenticated
  USING (fur_boss_id = auth.uid())
  WITH CHECK (fur_boss_id = auth.uid());

-- Sessions: Allow pet owners to manage sessions
CREATE POLICY "Pet owners can manage sessions for their pets"
  ON public.sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pets WHERE id = sessions.pet_id AND fur_boss_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND fur_boss_id = auth.uid())
  );

-- Schedules: Allow pet owners to manage schedules
CREATE POLICY "Pet owners can manage their pet schedules"
  ON public.schedules FOR ALL
  USING (pet_id IN (SELECT id FROM public.pets WHERE fur_boss_id = auth.uid()));

-- Schedule times: Allow pet owners to manage schedule times
CREATE POLICY "Pet owners can manage schedule times"
  ON public.schedule_times FOR ALL
  USING (schedule_id IN (
    SELECT id FROM public.schedules 
    WHERE pet_id IN (SELECT id FROM public.pets WHERE fur_boss_id = auth.uid())
  ));

-- Activities: Allow pet owners to view activities
CREATE POLICY "Pet owners can view their pet activities"
  ON public.activities FOR SELECT
  USING (pet_id IN (SELECT id FROM public.pets WHERE fur_boss_id = auth.uid()));

-- Care plans: Allow pet owners to manage care plans
CREATE POLICY "Pet owners manage pet care plans"
  ON public.pet_care_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_care_plans.pet_id
        AND pets.fur_boss_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_care_plans.pet_id
        AND pets.fur_boss_id = auth.uid()
    )
  );

-- Prevent self-assignment: agents cannot be assigned to their own pets
CREATE OR REPLACE FUNCTION prevent_self_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.sessions s
    JOIN public.pets p ON p.id = s.pet_id
    WHERE s.id = NEW.session_id 
    AND p.fur_boss_id = NEW.fur_agent_id
  ) THEN
    RAISE EXCEPTION 'Cannot assign yourself to care for your own pet';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_self_assignment
  BEFORE INSERT ON public.session_agents
  FOR EACH ROW EXECUTE FUNCTION prevent_self_assignment();

