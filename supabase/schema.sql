-- =============================================================
-- UniVerse — Complete Supabase Schema
-- Manipal University Jaipur Smart Campus Platform
-- =============================================================
-- Run this entire file in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================

-- ─── 1. Enable required extensions ──────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 2. Custom types ───────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'club_member', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_genre AS ENUM ('Technical', 'Cultural', 'Fun', 'Sports', 'Workshops', 'Competitions', 'Gaming');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_pricing AS ENUM ('Free', 'Paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 3. Profiles table ─────────────────────────────────────
-- Extends Supabase auth.users with application-specific data.
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  role          user_role NOT NULL DEFAULT 'student',
  avatar_url    TEXT,
  points        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ADMIN EMAIL CONFIGURATION ─────────────────────────────
-- ONLY this email will be assigned the 'admin' role automatically.
-- Everyone else gets 'student'. Role CANNOT be set from the client.
-- ────────────────────────────────────────────────────────────

-- Auto-create a profile when a new user signs up.
-- SECURITY: role is ALWAYS determined server-side by email.
-- The client-provided role in raw_user_meta_data is IGNORED.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
  admin_email TEXT := 'archit.2430030203@muj.manipal.edu';
BEGIN
  -- Determine role based on email — NOT from client metadata
  IF NEW.email = admin_email THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    assigned_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists, then re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. Clubs table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL UNIQUE,
  description   TEXT DEFAULT '',
  banner_url    TEXT,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. Club memberships ───────────────────────────────────
-- Links club_member users to their clubs.
CREATE TABLE IF NOT EXISTS club_memberships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- ─── 6. Events table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  venue             TEXT NOT NULL DEFAULT '',
  date              DATE NOT NULL,
  genre             event_genre NOT NULL DEFAULT 'Technical',
  event_type        event_pricing NOT NULL DEFAULT 'Free',
  poster_url        TEXT,
  reward_points     INTEGER NOT NULL DEFAULT 10,
  registration_limit INTEGER,  -- NULL means unlimited
  status            event_status NOT NULL DEFAULT 'pending',
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. Registrations table ────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ─── 8. Announcements table ────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL DEFAULT '',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 9. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_club_id ON events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_announcements_club_id ON announcements(club_id);
CREATE INDEX IF NOT EXISTS idx_club_memberships_user_id ON club_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ─── 10. Updated_at trigger ────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_clubs_updated_at ON clubs;
CREATE TRIGGER set_clubs_updated_at
  BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_events_updated_at ON events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 11. Row Level Security ────────────────────────────────

-- Helper function: get role for the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: check if user is a member of a given club
CREATE OR REPLACE FUNCTION public.is_club_member(p_club_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships
    WHERE user_id = auth.uid() AND club_id = p_club_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── PROFILES ──
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Profiles: anyone can read" ON profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Profiles: users can update their own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Profiles: admin can update any" ON profiles FOR UPDATE USING (get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── CLUBS ──
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Clubs: anyone can read" ON clubs FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Clubs: admin can insert" ON clubs FOR INSERT WITH CHECK (get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Clubs: admin can update" ON clubs FOR UPDATE USING (get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Clubs: admin can delete" ON clubs FOR DELETE USING (get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── CLUB MEMBERSHIPS ──
ALTER TABLE club_memberships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Club memberships: anyone can read" ON club_memberships FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Club memberships: admin can manage" ON club_memberships FOR ALL USING (get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── EVENTS ──
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Events: anyone can read approved" ON events FOR SELECT USING (status = 'approved' OR created_by = auth.uid() OR get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Events: club members can insert" ON events FOR INSERT WITH CHECK (get_user_role() IN ('club_member', 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Events: creator or admin can update" ON events FOR UPDATE USING (created_by = auth.uid() OR get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Events: admin can delete" ON events FOR DELETE USING (get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── REGISTRATIONS ──
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Registrations: users can read own" ON registrations FOR SELECT USING (user_id = auth.uid() OR get_user_role() IN ('admin', 'club_member')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Registrations: users can insert own" ON registrations FOR INSERT WITH CHECK (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Registrations: users can delete own" ON registrations FOR DELETE USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── ANNOUNCEMENTS ──
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Announcements: anyone can read" ON announcements FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Announcements: club members or admin can insert" ON announcements FOR INSERT WITH CHECK (get_user_role() IN ('club_member', 'admin')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Announcements: creator or admin can delete" ON announcements FOR DELETE USING (created_by = auth.uid() OR get_user_role() = 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 12. Prevent client-side role tampering ────────────────
-- This trigger BLOCKS any profile update that tries to change the role field
-- unless the updater is the admin themselves.
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'archit.2430030203@muj.manipal.edu';
  updater_email TEXT;
BEGIN
  -- If role is not being changed, allow the update
  IF OLD.role = NEW.role THEN
    RETURN NEW;
  END IF;

  -- Get the email of the user performing the update
  SELECT email INTO updater_email FROM public.profiles WHERE id = auth.uid();

  -- Only the admin can change roles
  IF updater_email = admin_email THEN
    RETURN NEW;
  END IF;

  -- Block the role change
  NEW.role := OLD.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_role_change ON profiles;
CREATE TRIGGER protect_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- ─── 13. Seed Data ─────────────────────────────────────────

-- Seed clubs
INSERT INTO clubs (name, description) VALUES
  ('ACM', 'Association for Computing Machinery — the premier tech club promoting coding, hackathons, and development workshops.'),
  ('IEEE', 'Institute of Electrical and Electronics Engineers — a hub for tech talks, cybersecurity challenges, and innovation.'),
  ('Cinephilia', 'The campus film society — screenings, film critique, and student filmmaking.'),
  ('Randomize()', 'The competitive programming and algorithms club — code golf, CTFs, and logical challenges.'),
  ('Shabd', 'The literary and poetry club — open mics, spoken word, and creative writing.'),
  ('Coreographia', 'The dance society — classical, contemporary, hip-hop showcases and workshops.'),
  ('Glitch', 'The gaming club — esports tournaments, LAN parties, and game dev meetups.'),
  ('Shutterbug', 'The photography club — photo walks, portfolio reviews, and exhibitions.'),
  ('Crescendo', 'The music society — jam sessions, band battles, and acoustic evenings.'),
  ('Enactus MUJ', 'Social entrepreneurship club — building sustainable business solutions for communities.')
ON CONFLICT (name) DO NOTHING;

-- Seed 25+ realistic campus events (all approved for immediate display)
INSERT INTO events (title, description, club_id, date, venue, genre, event_type, reward_points, registration_limit, status) VALUES
  -- ACM Events
  ('Hackathon 2026',
   '48-hour coding marathon with exciting prizes. Build innovative solutions, collaborate with developers, and pitch your ideas to a panel of industry judges. Food and accommodation provided.',
   (SELECT id FROM clubs WHERE name = 'ACM'), '2026-06-20', 'Main Auditorium, Block A', 'Competitions', 'Free', 30, 200, 'approved'),
  ('Web Dev Bootcamp',
   'Intensive 2-day workshop covering React, Next.js, Tailwind CSS, and modern deployment with Vercel. Perfect for beginners who want to build production-ready web apps.',
   (SELECT id FROM clubs WHERE name = 'ACM'), '2026-06-10', 'Computer Lab 2, Block D', 'Workshops', 'Paid', 25, 60, 'approved'),
  ('ACM Code Sprint',
   'A 3-hour rapid-fire coding competition. Solve 10 algorithmic challenges across increasing difficulty levels. Leaderboard-based ranking with prizes for top 3.',
   (SELECT id FROM clubs WHERE name = 'ACM'), '2026-07-05', 'Computer Lab 5, Block D', 'Competitions', 'Free', 20, 100, 'approved'),
  ('Cloud Computing Workshop',
   'Learn AWS fundamentals — EC2, S3, Lambda, and DynamoDB. Hands-on labs with free AWS credits for participants. Bring your laptop!',
   (SELECT id FROM clubs WHERE name = 'ACM'), '2026-07-18', 'Seminar Hall 2, Block C', 'Workshops', 'Free', 20, 80, 'approved'),

  -- IEEE Events
  ('TechTalk: AI & Future',
   'An insightful talk on the future of artificial intelligence, covering LLMs, robotics, ethical AI, and the impact on employment. Guest speaker from Google DeepMind.',
   (SELECT id FROM clubs WHERE name = 'IEEE'), '2026-06-25', 'Seminar Hall 3, Block C', 'Technical', 'Free', 15, 150, 'approved'),
  ('Cipher: CTF Challenge',
   'Capture The Flag cybersecurity competition. 12 hours of puzzle-cracking, vulnerability exploitation, and forensics. Solo or team participation allowed.',
   (SELECT id FROM clubs WHERE name = 'IEEE'), '2026-07-08', 'Seminar Hall 1, Block C', 'Competitions', 'Free', 25, 80, 'approved'),
  ('Intro to Machine Learning',
   'Hands-on workshop covering ML fundamentals with Python, scikit-learn, and real-world datasets. Build your first classifier from scratch.',
   (SELECT id FROM clubs WHERE name = 'IEEE'), '2026-07-20', 'Computer Lab 1, Block D', 'Technical', 'Paid', 30, 50, 'approved'),
  ('IoT Innovation Challenge',
   'Build a working IoT prototype in 24 hours using Arduino, Raspberry Pi, and sensors. Components provided. Best prototype wins ₹10,000.',
   (SELECT id FROM clubs WHERE name = 'IEEE'), '2026-08-02', 'Innovation Lab, Block E', 'Competitions', 'Free', 25, 40, 'approved'),

  -- Cinephilia Events
  ('Film Screening Night',
   'Join us for a curated selection of award-winning international short films followed by a panel discussion on cinematography and storytelling techniques.',
   (SELECT id FROM clubs WHERE name = 'Cinephilia'), '2026-06-18', 'Mini Theatre, Student Centre', 'Cultural', 'Paid', 10, 120, 'approved'),
  ('Documentary Premiere',
   'Screening of student-produced documentaries exploring social issues in Rajasthan. Q&A session with filmmakers after each screening.',
   (SELECT id FROM clubs WHERE name = 'Cinephilia'), '2026-07-03', 'Mini Theatre, Student Centre', 'Cultural', 'Free', 10, 100, 'approved'),
  ('Screenplay Writing Workshop',
   'Learn the art of screenplay writing from basics to advanced. Covering story structure, dialogue, character arcs, and formatting. Includes script feedback sessions.',
   (SELECT id FROM clubs WHERE name = 'Cinephilia'), '2026-07-25', 'Room 204, Block B', 'Workshops', 'Paid', 15, 40, 'approved'),

  -- Randomize() Events
  ('Code Golf Championship',
   'Solve challenges in the fewest characters possible. Test your ability to write the most concise, elegant code. Languages allowed: Python, JS, C++.',
   (SELECT id FROM clubs WHERE name = 'Randomize()'), '2026-07-02', 'Computer Lab 5, Block D', 'Competitions', 'Free', 20, 80, 'approved'),
  ('Git & GitHub Masterclass',
   'Master version control from scratch. Learn branching, merging, rebasing, pull requests, CI/CD, and collaborative open-source workflows.',
   (SELECT id FROM clubs WHERE name = 'Randomize()'), '2026-06-30', 'Computer Lab 3, Block D', 'Workshops', 'Free', 15, 60, 'approved'),
  ('Competitive Programming Bootcamp',
   'A 5-day intensive CP training covering graphs, DP, segment trees, and contest strategies. Ideal for ICPC and CodeChef/Codeforces preparation.',
   (SELECT id FROM clubs WHERE name = 'Randomize()'), '2026-08-10', 'Computer Lab 4, Block D', 'Workshops', 'Paid', 35, 50, 'approved'),

  -- Shabd Events
  ('Open Mic Poetry Night',
   'Express yourself through poetry, spoken word, and storytelling. All languages welcome. Share your stories with the campus under the stars.',
   (SELECT id FROM clubs WHERE name = 'Shabd'), '2026-06-22', 'Open Air Theatre', 'Cultural', 'Free', 10, NULL, 'approved'),
  ('Creative Writing Workshop',
   'Learn techniques for fiction, flash fiction, and microstories. Guided exercises, peer critique, and publishing tips from a published author.',
   (SELECT id FROM clubs WHERE name = 'Shabd'), '2026-07-12', 'Room 301, Block B', 'Workshops', 'Free', 15, 35, 'approved'),
  ('Music Jam Night',
   'Unplug and unwind with live indie and acoustic performances by student artists. Open stage — bring your instruments and perform!',
   (SELECT id FROM clubs WHERE name = 'Shabd'), '2026-07-28', 'Open Air Theatre', 'Cultural', 'Free', 10, NULL, 'approved'),

  -- Coreographia Events
  ('Dance Showcase: Rhythms',
   'Annual dance showcase featuring 15+ performances from classical Kathak to hip-hop crews. 3 hours of stunning choreography and live music.',
   (SELECT id FROM clubs WHERE name = 'Coreographia'), '2026-07-15', 'Main Auditorium, Block A', 'Cultural', 'Paid', 15, 500, 'approved'),
  ('Hip-Hop Workshop',
   'Learn hip-hop fundamentals — popping, locking, breaking, and freestyle. No experience needed. Wear comfortable clothes and bring water.',
   (SELECT id FROM clubs WHERE name = 'Coreographia'), '2026-06-28', 'Dance Studio, Sports Complex', 'Workshops', 'Free', 10, 30, 'approved'),

  -- Glitch Events
  ('Valorant Campus Cup',
   '5v5 Valorant tournament with live commentary and streaming. Assemble your squad and compete for the campus champion title. Prize pool: ₹15,000.',
   (SELECT id FROM clubs WHERE name = 'Glitch'), '2026-06-27', 'Gaming Arena, Block E', 'Gaming', 'Free', 20, 100, 'approved'),
  ('FIFA Showdown 2026',
   '1v1 FIFA tournament on PS5. 64-player bracket-style elimination with live stream on the big screen. Walk-ins welcome until slots fill up.',
   (SELECT id FROM clubs WHERE name = 'Glitch'), '2026-07-22', 'Gaming Arena, Block E', 'Gaming', 'Paid', 15, 64, 'approved'),
  ('Game Dev Jam',
   '48-hour game development hackathon using Unity or Godot. Theme revealed at kickoff. Best game wins hardware prizes. Solo or team (max 3).',
   (SELECT id FROM clubs WHERE name = 'Glitch'), '2026-08-05', 'Computer Lab 2, Block D', 'Competitions', 'Free', 30, 60, 'approved'),

  -- Shutterbug Events
  ('Campus Photo Walk',
   'Explore hidden gems of the Manipal University campus through your lens. Led by award-winning photographers. DSLR, mirrorless, or phone — all welcome.',
   (SELECT id FROM clubs WHERE name = 'Shutterbug'), '2026-06-15', 'Meet at Main Gate', 'Cultural', 'Free', 10, NULL, 'approved'),
  ('Night Photography Workshop',
   'Master night and long-exposure photography. Learn light painting, star trails, and cityscape techniques. Tripod required (limited loaners available).',
   (SELECT id FROM clubs WHERE name = 'Shutterbug'), '2026-07-10', 'Terrace, Block A', 'Workshops', 'Free', 15, 25, 'approved'),

  -- Crescendo Events
  ('Battle of the Bands',
   'Campus-wide band competition. 8 bands, 3 judges, 1 winner. Rock, indie, jazz, fusion — all genres welcome. Apply with a demo track.',
   (SELECT id FROM clubs WHERE name = 'Crescendo'), '2026-07-30', 'Open Air Theatre', 'Cultural', 'Paid', 20, 300, 'approved'),
  ('Acoustic Evening',
   'An intimate evening of acoustic covers and originals. Coffee, fairy lights, and soulful music. Open mic slots available — sign up at the venue.',
   (SELECT id FROM clubs WHERE name = 'Crescendo'), '2026-06-24', 'Student Centre Lawn', 'Cultural', 'Free', 10, NULL, 'approved')
ON CONFLICT DO NOTHING;
