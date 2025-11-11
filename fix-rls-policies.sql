-- =====================================================
-- FIX RLS POLICIES - Run this in Supabase SQL Editor
-- =====================================================
-- This fixes the "infinite recursion detected" error
-- =====================================================

-- Step 1: Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Fur bosses can manage their own pets" ON public.pets;
DROP POLICY IF EXISTS "Fur agents can view pets they're assigned to" ON public.pets;
DROP POLICY IF EXISTS "Fur bosses can manage their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Fur agents can view sessions they're assigned to" ON public.sessions;
DROP POLICY IF EXISTS "Fur bosses can manage session agents" ON public.session_agents;
DROP POLICY IF EXISTS "Fur agents can view their assignments" ON public.session_agents;

-- Step 2: Recreate pets policies (simplified to avoid recursion)
CREATE POLICY "Fur bosses can manage their own pets"
  ON public.pets FOR ALL
  TO authenticated
  USING (fur_boss_id = auth.uid())
  WITH CHECK (fur_boss_id = auth.uid());

CREATE POLICY "Fur agents can view assigned pets"
  ON public.pets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      INNER JOIN public.session_agents sa ON sa.session_id = s.id
      WHERE s.pet_id = pets.id 
        AND sa.fur_agent_id = auth.uid()
    )
  );

-- Step 3: Recreate sessions policies
CREATE POLICY "Fur bosses can manage their own sessions"
  ON public.sessions FOR ALL
  TO authenticated
  USING (fur_boss_id = auth.uid())
  WITH CHECK (fur_boss_id = auth.uid());

CREATE POLICY "Fur agents can view assigned sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_agents sa
      WHERE sa.session_id = sessions.id 
        AND sa.fur_agent_id = auth.uid()
    )
  );

-- Step 4: Recreate session_agents policies (simplified)
CREATE POLICY "Session agents: fur boss can manage"
  ON public.session_agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_agents.session_id 
        AND s.fur_boss_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_agents.session_id 
        AND s.fur_boss_id = auth.uid()
    )
  );

CREATE POLICY "Session agents: fur agent can view own"
  ON public.session_agents FOR SELECT
  TO authenticated
  USING (fur_agent_id = auth.uid());

-- Step 5: Add super admin policies (optional but recommended)
CREATE POLICY "Super admin full access to pets"
  ON public.pets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin full access to sessions"
  ON public.sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin full access to session_agents"
  ON public.session_agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- DONE! The RLS policies are now fixed.
-- Refresh your app and try adding a pet again.
-- =====================================================

