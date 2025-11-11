-- Add pet care plan table for structured feeding & habit instructions

CREATE TABLE public.pet_care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  meal_plan JSONB NOT NULL DEFAULT '[]',
  daily_frequency INTEGER DEFAULT 2,
  feeding_notes TEXT,
  habits JSONB NOT NULL DEFAULT '[]',
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pet_id)
);

ALTER TABLE public.pet_care_plans ENABLE ROW LEVEL SECURITY;

-- Helper function reuse note: previous migrations define is_session_owner/is_pet_agent
-- Allow fur bosses to manage care plans for their pets
CREATE POLICY "Fur bosses manage pet care plans"
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

-- Allow assigned agents to view care plans for their sessions
CREATE POLICY "Fur agents view assigned care plans"
  ON public.pet_care_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sessions s
      JOIN public.session_agents sa ON sa.session_id = s.id
      WHERE s.pet_id = pet_care_plans.pet_id
        AND sa.fur_agent_id = auth.uid()
    )
  );

-- Update timestamp on changes
CREATE TRIGGER update_pet_care_plans_updated_at
  BEFORE UPDATE ON public.pet_care_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
