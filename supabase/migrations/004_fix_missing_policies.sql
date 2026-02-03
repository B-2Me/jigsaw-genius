-- 1. FIX THE SORTING BUG (Rename columns to match frontend expectations)
-- Your frontend is looking for 'created_at', but schema 001 used 'created_date'
ALTER TABLE global_stats RENAME COLUMN created_date TO created_at;
ALTER TABLE page_views RENAME COLUMN created_date TO created_at;
ALTER TABLE users RENAME COLUMN created_date TO created_at;
ALTER TABLE puzzle_pieces RENAME COLUMN created_date TO created_at;
ALTER TABLE solver_runs RENAME COLUMN created_date TO created_at;

-- 2. GLOBAL STATS POLICIES
-- Allow any user (even anonymous) to see the total run counts
CREATE POLICY "Enable read access for all users" ON public.global_stats
  FOR SELECT USING (true);

-- Allow authenticated users to increment the stats (required for SolverContext updates)
CREATE POLICY "Enable update/insert for authenticated users" ON public.global_stats
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. PAGE VIEWS POLICIES
-- Allow the frontend to record a visit
CREATE POLICY "Enable insert for all visitors" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Only Admins can see the visitor list and online count
CREATE POLICY "Admins can view all page views" ON public.page_views
  FOR SELECT USING (
    exists (
      SELECT 1 FROM public.users
      WHERE email = (select auth.jwt() ->> 'email')
      AND role = 'admin'
    )
  );

-- 4. MANUALLY SET YOURSELF AS ADMIN (Optional/Safety)
-- Replace 'your-email@example.com' with your actual email to unlock SolverControls.jsx
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'nate.sd@gmail.com';
