-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('fur_boss', 'fur_agent', 'super_admin');

-- Create enum for session status
CREATE TYPE public.session_status AS ENUM ('planned', 'active', 'completed');

-- Create enum for task types
CREATE TYPE public.task_type AS ENUM ('feed', 'walk', 'play', 'medication', 'groom', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'fur_agent',
  avatar_url TEXT,
  paw_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fur_boss_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  photo_url TEXT,
  medical_info TEXT,
  vet_contact TEXT,
  food_preferences TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fur_boss_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  recurrence_rule TEXT,
  status session_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create session_agents junction table
CREATE TABLE public.session_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  fur_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, fur_agent_id)
);

ALTER TABLE public.session_agents ENABLE ROW LEVEL SECURITY;

-- Create care_tasks table
CREATE TABLE public.care_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  task_type task_type NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  time_period TEXT,
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;

-- Create care_logs table (completed tasks)
CREATE TABLE public.care_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_task_id UUID NOT NULL REFERENCES public.care_tasks(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  fur_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT,
  notes TEXT,
  paw_points_earned INTEGER DEFAULT 10,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.care_logs ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for pets
CREATE POLICY "Fur bosses can manage their own pets"
  ON public.pets FOR ALL
  TO authenticated
  USING (fur_boss_id = auth.uid());

CREATE POLICY "Fur agents can view pets they're assigned to"
  ON public.pets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_agents sa
      JOIN public.sessions s ON s.id = sa.session_id
      WHERE s.pet_id = pets.id AND sa.fur_agent_id = auth.uid()
    )
  );

-- RLS Policies for sessions
CREATE POLICY "Fur bosses can manage their own sessions"
  ON public.sessions FOR ALL
  TO authenticated
  USING (fur_boss_id = auth.uid());

CREATE POLICY "Fur agents can view sessions they're assigned to"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_agents
      WHERE session_id = sessions.id AND fur_agent_id = auth.uid()
    )
  );

-- RLS Policies for session_agents
CREATE POLICY "Fur bosses can manage session agents"
  ON public.session_agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE id = session_id AND fur_boss_id = auth.uid()
    )
  );

CREATE POLICY "Fur agents can view their assignments"
  ON public.session_agents FOR SELECT
  TO authenticated
  USING (fur_agent_id = auth.uid());

-- RLS Policies for care_tasks
CREATE POLICY "Fur bosses can manage care tasks"
  ON public.care_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE id = session_id AND fur_boss_id = auth.uid()
    )
  );

CREATE POLICY "Fur agents can view care tasks for their sessions"
  ON public.care_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_agents
      WHERE session_id = care_tasks.session_id AND fur_agent_id = auth.uid()
    )
  );

-- RLS Policies for care_logs
CREATE POLICY "Anyone can view care logs for their sessions"
  ON public.care_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id 
      AND (s.fur_boss_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.session_agents sa
        WHERE sa.session_id = s.id AND sa.fur_agent_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Fur agents can create care logs"
  ON public.care_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    fur_agent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.session_agents
      WHERE session_id = care_logs.session_id AND fur_agent_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_care_tasks_updated_at
  BEFORE UPDATE ON public.care_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'fur_agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();