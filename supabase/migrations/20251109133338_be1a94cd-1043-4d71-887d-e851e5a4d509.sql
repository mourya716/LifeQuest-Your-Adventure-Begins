-- Create profiles table to store user game data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  coins INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_quest_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  coin_reward INTEGER DEFAULT 5 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  quest_date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for quests
CREATE POLICY "Users can view their own quests"
  ON public.quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quests"
  ON public.quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests"
  ON public.quests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quests"
  ON public.quests FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, xp, level, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    0,
    1,
    0
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_level_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award achievement for reaching level 5
  IF NEW.level >= 5 AND OLD.level < 5 THEN
    INSERT INTO public.achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (NEW.id, 'level_5', 'Novice Adventurer', 'Reached Level 5')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Award achievement for reaching level 10
  IF NEW.level >= 10 AND OLD.level < 10 THEN
    INSERT INTO public.achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (NEW.id, 'level_10', 'Experienced Hero', 'Reached Level 10')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  -- Award achievement for reaching level 20
  IF NEW.level >= 20 AND OLD.level < 20 THEN
    INSERT INTO public.achievements (user_id, achievement_type, achievement_name, achievement_description)
    VALUES (NEW.id, 'level_20', 'Master Champion', 'Reached Level 20')
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to check achievements when profile updates
CREATE TRIGGER check_achievements_on_level_up
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.level > OLD.level)
  EXECUTE FUNCTION public.check_level_achievements();

-- Enable realtime for quests and profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.quests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;