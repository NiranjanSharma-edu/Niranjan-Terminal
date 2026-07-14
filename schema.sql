-- NiranjanOS Supabase Database Schema
-- Run this script in the SQL Editor of your Supabase project.

-- 1. PROFILE DATA TABLE
CREATE TABLE IF NOT EXISTS public.profile_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profile_data ENABLE ROW LEVEL SECURITY;

-- 2. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Programming', 'Frameworks', 'Database', 'Concepts', 'Tools')),
    level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 3. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    duration_start TEXT NOT NULL,
    duration_end TEXT NOT NULL,
    responsibilities TEXT[] NOT NULL,
    order_idx INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

-- 4. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- 5. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 6. MESSAGES (Contact submission)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 7. ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('visitor', 'command', 'project_view')),
    value TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;


--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Public Read Access Policies (For Portfolio)
CREATE POLICY "Allow public read access for profile_data" ON public.profile_data
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access for skills" ON public.skills
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access for experience" ON public.experience
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access for certifications" ON public.certifications
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access for achievements" ON public.achievements
    FOR SELECT TO public USING (true);

-- Public Write Access Policies (For visitors submitting contacts & analytics)
CREATE POLICY "Allow public insert access for messages" ON public.messages
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public insert access for analytics" ON public.analytics
    FOR INSERT TO public WITH CHECK (true);

-- Admin (Authenticated) Write Access Policies
CREATE POLICY "Allow admin full access for profile_data" ON public.profile_data
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access for skills" ON public.skills
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access for experience" ON public.experience
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access for certifications" ON public.certifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin full access for achievements" ON public.achievements
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin select/delete access for messages" ON public.messages
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin select/delete access for analytics" ON public.analytics
    FOR SELECT TO authenticated USING (true);


--------------------------------------------------------------------------------
-- PRE-SEEDING INITIAL DATA
--------------------------------------------------------------------------------

-- Seeding profile_data
INSERT INTO public.profile_data (key, value) VALUES
('owner_info', '{
  "name": "Niranjan Sharma",
  "location": "Jaipur, Rajasthan, India",
  "role": "Computer Science Engineer",
  "status": "B.Tech CSE Student (2022-2026)",
  "specializations": ["Full Stack Development", "AI/ML", "Data Science", "EV Technology", "Software Engineering"]
}'::jsonb),
('about', '{
  "bullets": [
    "B.Tech CSE Student at Bikaner Technical University",
    "Passionate about software engineering and developing scalable web applications",
    "Interested in AI, ML, Data Science, and EV Technology",
    "Strong foundation in Java, Python, and JavaScript/TypeScript"
  ]
}'::jsonb),
('education', '{
  "degree": "B.Tech Computer Science & Engineering",
  "institution": "Bikaner Technical University",
  "gpa": "8.24/10.0"
}'::jsonb),
('socials', '{
  "github": "https://github.com",
  "linkedin": "https://linkedin.com",
  "email": "niranjan.sharma.cse@gmail.com",
  "phone": "+91-9XXXX-XXXXX"
}'::jsonb),
('resume', '{
  "url": "/resume.pdf"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seeding skills
INSERT INTO public.skills (name, category, level) VALUES
('Java', 'Programming', 'Advanced'),
('Python', 'Programming', 'Advanced'),
('JavaScript', 'Programming', 'Advanced'),
('TypeScript', 'Programming', 'Intermediate'),
('React.js', 'Frameworks', 'Advanced'),
('Next.js', 'Frameworks', 'Intermediate'),
('MySQL', 'Database', 'Advanced'),
('Supabase', 'Database', 'Intermediate'),
('DSA', 'Concepts', 'Advanced'),
('OOP', 'Concepts', 'Advanced'),
('SQL', 'Concepts', 'Advanced'),
('System Design Basics', 'Concepts', 'Intermediate'),
('Git', 'Tools', 'Advanced'),
('GitHub', 'Tools', 'Advanced'),
('Docker', 'Tools', 'Intermediate'),
('AWS', 'Tools', 'Intermediate'),
('VS Code', 'Tools', 'Advanced'),
('CI/CD', 'Tools', 'Intermediate');

-- Seeding experience
INSERT INTO public.experience (company, role, duration_start, duration_end, responsibilities, order_idx) VALUES
('FEYNN Labs', 'Machine Learning & Data Science Intern', 'June 2025', 'August 2025', ARRAY['Agile Development', 'Technical Planning', 'Data Science Exposure', 'Collaborative Engineering'], 1),
('Bharat Intern', 'Frontend Development Intern', 'June 2023', 'July 2023', ARRAY['HTML', 'CSS', 'JavaScript', 'Responsive Development'], 2);

-- Seeding certifications
INSERT INTO public.certifications (name, issuer, date, link) VALUES
('OCI 2025 Certified AI Foundation Associate', 'Oracle Cloud Infrastructure', '2025', 'https://oracle.com'),
('OCI 2025 Certified AI Vector Search Professional', 'Oracle Cloud Infrastructure', '2025', 'https://oracle.com'),
('Future In Charge: EV & Green Mobility Program', 'Society of Automotive Engineers', '2024', 'https://sae.org');

-- Seeding achievements
INSERT INTO public.achievements (title, description) VALUES
('Reliance Foundation Scholar', 'Awarded prestigious scholarship for academic and extracurricular excellence'),
('5-Star Java Badge (HackerRank)', 'Top rank in Java programming problem-solving assessments'),
('5-Star C++ Badge (HackerRank)', 'Top rank in C++ programming assessments'),
('Overall Coordinator', 'Training & Placement Cell, coordinating placements and student drives');
