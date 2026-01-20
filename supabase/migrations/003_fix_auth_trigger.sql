-- Migration 003: Fix Auth Trigger and RLS for User Registration
-- This migration hardens the signup trigger and ensures RLS doesn't block it

-- ============================================================================
-- PART 1: Drop and recreate trigger with explicit schema references
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create hardened trigger function with explicit schema references and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into users_profile with explicit schema
  -- Use ON CONFLICT to handle race conditions
  INSERT INTO public.users_profile (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into gamification_stats with explicit schema
  -- Use ON CONFLICT to handle race conditions
  INSERT INTO public.gamification_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Return NEW to continue the trigger chain
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    -- In production, you'd log to a monitoring system
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 2: Update RLS policies to allow trigger inserts
-- ============================================================================

-- Drop existing INSERT policies for users_profile and gamification_stats
-- We need to allow both authenticated users AND the trigger (service role)

-- Users Profile - Allow inserts from both trigger and users themselves
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users_profile;
DROP POLICY IF EXISTS "Allow trigger inserts" ON public.users_profile;

-- Create policy that allows both trigger (service_role) and user inserts
CREATE POLICY "Users can insert own profile"
  ON public.users_profile FOR INSERT
  WITH CHECK (
    auth.uid() = id OR auth.role() = 'service_role'
  );

-- Gamification Stats - Allow inserts from trigger only
DROP POLICY IF EXISTS "Users can insert own stats" ON public.gamification_stats;
DROP POLICY IF EXISTS "Allow trigger inserts for stats" ON public.gamification_stats;

CREATE POLICY "Allow gamification stats creation"
  ON public.gamification_stats FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

-- ============================================================================
-- PART 3: Ensure all columns have proper defaults or are nullable
-- ============================================================================

-- Users profile - ensure nullable fields are properly set
ALTER TABLE public.users_profile
  ALTER COLUMN display_name DROP NOT NULL IF EXISTS;

ALTER TABLE public.users_profile
  ALTER COLUMN avatar_url DROP NOT NULL IF EXISTS;

-- Gamification stats - ensure all fields have defaults
ALTER TABLE public.gamification_stats
  ALTER COLUMN total_xp SET DEFAULT 0;

ALTER TABLE public.gamification_stats
  ALTER COLUMN level SET DEFAULT 1;

ALTER TABLE public.gamification_stats
  ALTER COLUMN current_streak SET DEFAULT 0;

ALTER TABLE public.gamification_stats
  ALTER COLUMN longest_streak SET DEFAULT 0;

-- ============================================================================
-- PART 4: Add helpful indexes for auth queries
-- ============================================================================

-- Index on users_profile(id) for fast lookups (may already exist as PRIMARY KEY)
-- Index on gamification_stats(user_id) for fast lookups (may already exist)

-- Ensure we have index on gamification_stats.user_id
CREATE INDEX IF NOT EXISTS idx_gamification_stats_user_id 
  ON public.gamification_stats(user_id);

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- To verify the trigger is working:
-- 1. Check trigger exists:
--    SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- 2. Check function exists:
--    SELECT proname, prosecdef FROM pg_proc WHERE proname = 'handle_new_user';
--
-- 3. Test signup and verify:
--    SELECT * FROM public.users_profile WHERE id = 'test-user-id';
--    SELECT * FROM public.gamification_stats WHERE user_id = 'test-user-id';
