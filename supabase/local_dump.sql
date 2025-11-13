


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."activity_type" AS ENUM (
    'feed',
    'walk',
    'letout'
);


ALTER TYPE "public"."activity_type" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'fur_boss',
    'fur_agent',
    'super_admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'planned',
    'active',
    'completed'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."task_type" AS ENUM (
    'feed',
    'walk',
    'play',
    'medication',
    'groom',
    'other'
);


ALTER TYPE "public"."task_type" OWNER TO "postgres";


CREATE TYPE "public"."time_period" AS ENUM (
    'morning',
    'afternoon',
    'evening'
);


ALTER TYPE "public"."time_period" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_pet_agent"("pet_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sessions s
    JOIN public.session_agents sa ON sa.session_id = s.id
    WHERE s.pet_id = pet_uuid
      AND sa.fur_agent_id = user_uuid
  );
$$;


ALTER FUNCTION "public"."is_pet_agent"("pet_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_session_agent"("session_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.session_agents
    WHERE session_id = session_uuid
      AND fur_agent_id = user_uuid
  );
$$;


ALTER FUNCTION "public"."is_session_agent"("session_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_session_owner"("session_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE id = session_uuid
      AND fur_boss_id = user_uuid
  );
$$;


ALTER FUNCTION "public"."is_session_owner"("session_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_self_assignment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."prevent_self_assignment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "activity_type" "public"."activity_type" NOT NULL,
    "time_period" "public"."time_period" NOT NULL,
    "date" "date" NOT NULL,
    "caretaker_id" "uuid" NOT NULL,
    "photo_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."care_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "care_task_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "fur_agent_id" "uuid" NOT NULL,
    "photo_url" "text",
    "notes" "text",
    "paw_points_earned" integer DEFAULT 10,
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."care_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."care_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "task_type" "public"."task_type" NOT NULL,
    "title" "text" NOT NULL,
    "instructions" "text",
    "time_period" "text",
    "valid_from" "date",
    "valid_to" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."care_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pet_care_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "meal_plan" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "daily_frequency" integer DEFAULT 2,
    "feeding_notes" "text",
    "habits" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pet_care_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fur_boss_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "breed" "text",
    "age" integer,
    "photo_url" "text",
    "medical_info" "text",
    "vet_contact" "text",
    "food_preferences" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pet_type" "text"
);


ALTER TABLE "public"."pets" OWNER TO "postgres";


COMMENT ON COLUMN "public"."pets"."pet_type" IS 'Type of pet: dog, cat, fish, bird, rabbit, turtle, hamster, other';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."app_role" DEFAULT 'fur_agent'::"public"."app_role" NOT NULL,
    "avatar_url" "text",
    "paw_points" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "photo_url" "text",
    "phone" "text",
    "address" "text",
    "bio" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedule_times" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "activity_type" "public"."activity_type" NOT NULL,
    "time_period" "public"."time_period" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."schedule_times" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "feeding_instruction" "text" DEFAULT 'Give food and water'::"text",
    "walking_instruction" "text" DEFAULT 'Walk around the block'::"text",
    "letout_instruction" "text" DEFAULT 'Let out in backyard'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_agents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "fur_agent_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."session_agents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fur_boss_id" "uuid" NOT NULL,
    "pet_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "recurrence_rule" "text",
    "status" "public"."session_status" DEFAULT 'planned'::"public"."session_status" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "care_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."care_tasks"
    ADD CONSTRAINT "care_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pet_care_plans"
    ADD CONSTRAINT "pet_care_plans_pet_id_key" UNIQUE ("pet_id");



ALTER TABLE ONLY "public"."pet_care_plans"
    ADD CONSTRAINT "pet_care_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pets"
    ADD CONSTRAINT "pets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_times"
    ADD CONSTRAINT "schedule_times_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schedule_times"
    ADD CONSTRAINT "schedule_times_schedule_id_activity_type_time_period_key" UNIQUE ("schedule_id", "activity_type", "time_period");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pet_id_session_id_key" UNIQUE ("pet_id", "session_id");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_agents"
    ADD CONSTRAINT "session_agents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_agents"
    ADD CONSTRAINT "session_agents_session_id_fur_agent_id_key" UNIQUE ("session_id", "fur_agent_id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activities_date" ON "public"."activities" USING "btree" ("date");



CREATE INDEX "idx_activities_pet_id" ON "public"."activities" USING "btree" ("pet_id");



CREATE INDEX "idx_activities_session_id" ON "public"."activities" USING "btree" ("session_id");



CREATE INDEX "idx_schedule_times_schedule_id" ON "public"."schedule_times" USING "btree" ("schedule_id");



CREATE INDEX "idx_schedules_pet_id" ON "public"."schedules" USING "btree" ("pet_id");



CREATE OR REPLACE TRIGGER "check_self_assignment" BEFORE INSERT ON "public"."session_agents" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_self_assignment"();



CREATE OR REPLACE TRIGGER "update_care_tasks_updated_at" BEFORE UPDATE ON "public"."care_tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pet_care_plans_updated_at" BEFORE UPDATE ON "public"."pet_care_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pets_updated_at" BEFORE UPDATE ON "public"."pets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sessions_updated_at" BEFORE UPDATE ON "public"."sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_caretaker_id_fkey" FOREIGN KEY ("caretaker_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "care_logs_care_task_id_fkey" FOREIGN KEY ("care_task_id") REFERENCES "public"."care_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "care_logs_fur_agent_id_fkey" FOREIGN KEY ("fur_agent_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_logs"
    ADD CONSTRAINT "care_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."care_tasks"
    ADD CONSTRAINT "care_tasks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pet_care_plans"
    ADD CONSTRAINT "pet_care_plans_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pet_care_plans"
    ADD CONSTRAINT "pet_care_plans_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."pets"
    ADD CONSTRAINT "pets_fur_boss_id_fkey" FOREIGN KEY ("fur_boss_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_times"
    ADD CONSTRAINT "schedule_times_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_agents"
    ADD CONSTRAINT "session_agents_fur_agent_id_fkey" FOREIGN KEY ("fur_agent_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_agents"
    ADD CONSTRAINT "session_agents_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_fur_boss_id_fkey" FOREIGN KEY ("fur_boss_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view care logs for their sessions" ON "public"."care_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."sessions" "s"
  WHERE (("s"."id" = "care_logs"."session_id") AND (("s"."fur_boss_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."session_agents" "sa"
          WHERE (("sa"."session_id" = "s"."id") AND ("sa"."fur_agent_id" = "auth"."uid"())))))))));



CREATE POLICY "Fur agents can create care logs" ON "public"."care_logs" FOR INSERT TO "authenticated" WITH CHECK ((("fur_agent_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."session_agents"
  WHERE (("session_agents"."session_id" = "care_logs"."session_id") AND ("session_agents"."fur_agent_id" = "auth"."uid"()))))));



CREATE POLICY "Fur agents can manage activities for assigned sessions" ON "public"."activities" USING (("session_id" IN ( SELECT "session_agents"."session_id"
   FROM "public"."session_agents"
  WHERE ("session_agents"."fur_agent_id" = "auth"."uid"()))));



CREATE POLICY "Fur agents can view assigned pet schedules" ON "public"."schedules" FOR SELECT USING (("pet_id" IN ( SELECT "p"."id"
   FROM (("public"."pets" "p"
     JOIN "public"."sessions" "s" ON (("s"."pet_id" = "p"."id")))
     JOIN "public"."session_agents" "sa" ON (("sa"."session_id" = "s"."id")))
  WHERE ("sa"."fur_agent_id" = "auth"."uid"()))));



CREATE POLICY "Fur agents can view assigned pets" ON "public"."pets" FOR SELECT TO "authenticated" USING ("public"."is_pet_agent"("id", "auth"."uid"()));



CREATE POLICY "Fur agents can view assigned schedule times" ON "public"."schedule_times" FOR SELECT USING (("schedule_id" IN ( SELECT "sc"."id"
   FROM ((("public"."schedules" "sc"
     JOIN "public"."pets" "p" ON (("p"."id" = "sc"."pet_id")))
     JOIN "public"."sessions" "s" ON (("s"."pet_id" = "p"."id")))
     JOIN "public"."session_agents" "sa" ON (("sa"."session_id" = "s"."id")))
  WHERE ("sa"."fur_agent_id" = "auth"."uid"()))));



CREATE POLICY "Fur agents can view assigned sessions" ON "public"."sessions" FOR SELECT TO "authenticated" USING ("public"."is_session_agent"("id", "auth"."uid"()));



CREATE POLICY "Fur agents can view care tasks for their sessions" ON "public"."care_tasks" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."session_agents"
  WHERE (("session_agents"."session_id" = "care_tasks"."session_id") AND ("session_agents"."fur_agent_id" = "auth"."uid"())))));



CREATE POLICY "Fur agents view assigned care plans" ON "public"."pet_care_plans" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."sessions" "s"
     JOIN "public"."session_agents" "sa" ON (("sa"."session_id" = "s"."id")))
  WHERE (("s"."pet_id" = "pet_care_plans"."pet_id") AND ("sa"."fur_agent_id" = "auth"."uid"())))));



CREATE POLICY "Fur bosses can manage care tasks" ON "public"."care_tasks" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."sessions"
  WHERE (("sessions"."id" = "care_tasks"."session_id") AND ("sessions"."fur_boss_id" = "auth"."uid"())))));



CREATE POLICY "Pet owners can manage schedule times" ON "public"."schedule_times" USING (("schedule_id" IN ( SELECT "schedules"."id"
   FROM "public"."schedules"
  WHERE ("schedules"."pet_id" IN ( SELECT "pets"."id"
           FROM "public"."pets"
          WHERE ("pets"."fur_boss_id" = "auth"."uid"()))))));



CREATE POLICY "Pet owners can manage sessions for their pets" ON "public"."sessions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."pets"
  WHERE (("pets"."id" = "sessions"."pet_id") AND ("pets"."fur_boss_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."pets"
  WHERE (("pets"."id" = "sessions"."pet_id") AND ("pets"."fur_boss_id" = "auth"."uid"())))));



CREATE POLICY "Pet owners can manage their pet schedules" ON "public"."schedules" USING (("pet_id" IN ( SELECT "pets"."id"
   FROM "public"."pets"
  WHERE ("pets"."fur_boss_id" = "auth"."uid"()))));



CREATE POLICY "Pet owners can view their pet activities" ON "public"."activities" FOR SELECT USING (("pet_id" IN ( SELECT "pets"."id"
   FROM "public"."pets"
  WHERE ("pets"."fur_boss_id" = "auth"."uid"()))));



CREATE POLICY "Pet owners manage pet care plans" ON "public"."pet_care_plans" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."pets"
  WHERE (("pets"."id" = "pet_care_plans"."pet_id") AND ("pets"."fur_boss_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."pets"
  WHERE (("pets"."id" = "pet_care_plans"."pet_id") AND ("pets"."fur_boss_id" = "auth"."uid"())))));



CREATE POLICY "Session agents: fur agent can view own" ON "public"."session_agents" FOR SELECT TO "authenticated" USING (("fur_agent_id" = "auth"."uid"()));



CREATE POLICY "Session agents: fur boss can delete" ON "public"."session_agents" FOR DELETE TO "authenticated" USING ("public"."is_session_owner"("session_id", "auth"."uid"()));



CREATE POLICY "Session agents: fur boss can insert" ON "public"."session_agents" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_session_owner"("session_id", "auth"."uid"()));



CREATE POLICY "Session agents: fur boss can update" ON "public"."session_agents" FOR UPDATE TO "authenticated" USING ("public"."is_session_owner"("session_id", "auth"."uid"())) WITH CHECK ("public"."is_session_owner"("session_id", "auth"."uid"()));



CREATE POLICY "Session agents: fur boss can view" ON "public"."session_agents" FOR SELECT TO "authenticated" USING ("public"."is_session_owner"("session_id", "auth"."uid"()));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage their own pets" ON "public"."pets" TO "authenticated" USING (("fur_boss_id" = "auth"."uid"())) WITH CHECK (("fur_boss_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("recipient_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("recipient_id" = "auth"."uid"()));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."care_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."care_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pet_care_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_times" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_pet_agent"("pet_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_pet_agent"("pet_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_pet_agent"("pet_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_session_agent"("session_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_session_agent"("session_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_session_agent"("session_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_session_owner"("session_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_session_owner"("session_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_session_owner"("session_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_self_assignment"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_self_assignment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_self_assignment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."care_logs" TO "anon";
GRANT ALL ON TABLE "public"."care_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."care_logs" TO "service_role";



GRANT ALL ON TABLE "public"."care_tasks" TO "anon";
GRANT ALL ON TABLE "public"."care_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."care_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."pet_care_plans" TO "anon";
GRANT ALL ON TABLE "public"."pet_care_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."pet_care_plans" TO "service_role";



GRANT ALL ON TABLE "public"."pets" TO "anon";
GRANT ALL ON TABLE "public"."pets" TO "authenticated";
GRANT ALL ON TABLE "public"."pets" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_times" TO "anon";
GRANT ALL ON TABLE "public"."schedule_times" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_times" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."session_agents" TO "anon";
GRANT ALL ON TABLE "public"."session_agents" TO "authenticated";
GRANT ALL ON TABLE "public"."session_agents" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







