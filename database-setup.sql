-- Baseline — personal self-rating notebook
-- Run in Supabase SQL Editor

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A focus = one main objective (e.g. "Tennis mastery")
CREATE TABLE IF NOT EXISTS focuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attributes inside a focus (e.g. forehand, serve)
CREATE TABLE IF NOT EXISTS attributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  focus_id UUID REFERENCES focuses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  current_score NUMERIC(5,1) DEFAULT 5 CHECK (current_score >= 0 AND current_score <= 10),
  sort_order INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly self-ratings (absolute score + delta from prior)
CREATE TABLE IF NOT EXISTS weekly_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  score NUMERIC(5,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  delta NUMERIC(5,1) NOT NULL DEFAULT 0,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (attribute_id, week_start)
);

-- Laminated-sheet drawings per page
CREATE TABLE IF NOT EXISTS page_drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_key TEXT NOT NULL,
  strokes JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, page_key)
);

CREATE INDEX IF NOT EXISTS idx_focuses_user_id ON focuses(user_id);
CREATE INDEX IF NOT EXISTS idx_attributes_focus_id ON attributes(focus_id);
CREATE INDEX IF NOT EXISTS idx_attributes_user_id ON attributes(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_ratings_attribute_id ON weekly_ratings(attribute_id);
CREATE INDEX IF NOT EXISTS idx_weekly_ratings_week_start ON weekly_ratings(week_start);
CREATE INDEX IF NOT EXISTS idx_page_drawings_user_page ON page_drawings(user_id, page_key);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE focuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_drawings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users own focuses" ON focuses;
DROP POLICY IF EXISTS "Users own attributes" ON attributes;
DROP POLICY IF EXISTS "Users own weekly_ratings" ON weekly_ratings;
DROP POLICY IF EXISTS "Users own page_drawings" ON page_drawings;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users own focuses" ON focuses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own attributes" ON attributes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own weekly_ratings" ON weekly_ratings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own page_drawings" ON page_drawings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS focuses_updated_at ON focuses;
CREATE TRIGGER focuses_updated_at BEFORE UPDATE ON focuses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS attributes_updated_at ON attributes;
CREATE TRIGGER attributes_updated_at BEFORE UPDATE ON attributes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
