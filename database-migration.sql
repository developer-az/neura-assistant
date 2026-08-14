-- Baseline migration from Neura productivity schema
-- Safe to run on a fresh or existing project. Old task/goal/insight tables are left in place
-- but unused. New Baseline tables are created below.

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

ALTER TABLE focuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_drawings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users own focuses" ON focuses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users own attributes" ON attributes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users own weekly_ratings" ON weekly_ratings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users own page_drawings" ON page_drawings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
