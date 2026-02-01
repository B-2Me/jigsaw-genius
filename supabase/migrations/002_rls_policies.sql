-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE solver_runs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- USERS TABLE POLICIES
-- -------------------------------------------------------

-- Users can read their own profile if the email matches
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    email = (select auth.jwt() ->> 'email')
  );

-- Admins can read all users (Checks if the requesting user has 'admin' role in the public.users table)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    exists (
      select 1 from users
      where email = (select auth.jwt() ->> 'email')
      and role = 'admin'
    )
  );

-- -------------------------------------------------------
-- PUZZLE PIECES POLICIES
-- -------------------------------------------------------

CREATE POLICY "Users can read own puzzle pieces" ON puzzle_pieces
  FOR SELECT USING (created_by = (select auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert own puzzle pieces" ON puzzle_pieces
  FOR INSERT WITH CHECK (created_by = (select auth.jwt() ->> 'email'));

CREATE POLICY "Users can update own puzzle pieces" ON puzzle_pieces
  FOR UPDATE USING (created_by = (select auth.jwt() ->> 'email'));

CREATE POLICY "Users can delete own puzzle pieces" ON puzzle_pieces
  FOR DELETE USING (created_by = (select auth.jwt() ->> 'email'));

-- -------------------------------------------------------
-- SOLVER RUNS POLICIES
-- -------------------------------------------------------

CREATE POLICY "Users can read own solver runs" ON solver_runs
  FOR SELECT USING (created_by = (select auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert own solver runs" ON solver_runs
  FOR INSERT WITH CHECK (created_by = (select auth.jwt() ->> 'email'));

CREATE POLICY "Users can update own solver runs" ON solver_runs
  FOR UPDATE USING (created_by = (select auth.jwt() ->> 'email'));

CREATE POLICY "Users can delete own solver runs" ON solver_runs
  FOR DELETE USING (created_by = (select auth.jwt() ->> 'email'));
  