-- Enable UUID extension (still good practice, though gen_random_uuid is native)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable Moddatetime for automatic timestamp updates
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- 1. USERS TABLE
CREATE TABLE users (
  -- Changed to gen_random_uuid() to fix the error
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PAGE VIEWS
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT,
  visitor_email TEXT,
  created_by TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GLOBAL STATS
CREATE TABLE IF NOT EXISTS global_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_name TEXT,
  stat_value INTEGER,
  created_by TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PUZZLE PIECES
CREATE TABLE IF NOT EXISTS puzzle_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id INTEGER,
  edges JSONB,
  position INTEGER,
  rotation INTEGER,
  is_hint BOOLEAN,
  placement_score INTEGER,
  created_by TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SOLVER RUNS
CREATE TABLE IF NOT EXISTS solver_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number INTEGER,
  final_score INTEGER,
  execution_time INTEGER,
  pieces_placed JSONB,
  hint_adjacency_stats JSONB,
  created_by TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUTOMATIC UPDATE TRIGGERS
CREATE OR REPLACE TRIGGER handle_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_date);

CREATE OR REPLACE TRIGGER handle_updated_at BEFORE UPDATE ON page_views
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_date);

CREATE OR REPLACE TRIGGER handle_updated_at BEFORE UPDATE ON puzzle_pieces
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_date);

CREATE OR REPLACE TRIGGER handle_updated_at BEFORE UPDATE ON solver_runs
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_date);
  