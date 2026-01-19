-- Enable Row Level Security on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users Profile Policies
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- TODOs Policies
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- Research Ideas Policies
CREATE POLICY "Users can view own research ideas"
  ON research_ideas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research ideas"
  ON research_ideas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research ideas"
  ON research_ideas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own research ideas"
  ON research_ideas FOR DELETE
  USING (auth.uid() = user_id);

-- Gamification Stats Policies
CREATE POLICY "Users can view own gamification stats"
  ON gamification_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification stats"
  ON gamification_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity Log Policies
CREATE POLICY "Users can view own activity log"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity log"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
