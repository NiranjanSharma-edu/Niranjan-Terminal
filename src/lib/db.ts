import { supabase, isSupabaseConfigured } from './supabase';

// Types
export interface ProfileData {
  name: string;
  location: string;
  role: string;
  status: string;
  specializations: string[];
}

export interface AboutData {
  bullets: string[];
}

export interface EducationData {
  degree: string;
  institution: string;
  gpa: string;
}

export interface SocialsData {
  github: string;
  linkedin: string;
  email: string;
  phone: string;
}

export interface ResumeData {
  url: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Programming' | 'Frameworks' | 'Database' | 'Concepts' | 'Tools';
  level?: string;
  created_at?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration_start: string;
  duration_end: string;
  responsibilities: string[];
  order_idx: number;
  created_at?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface AnalyticEvent {
  id: string;
  type: 'visitor' | 'command' | 'project_view';
  value: string;
  ip_hash: string;
  created_at: string;
}

// Pre-seeded fallback data
const SEED_PROFILE: ProfileData = {
  name: 'Niranjan Sharma',
  location: 'Jaipur, Rajasthan, India',
  role: 'Computer Science Engineer',
  status: 'B.Tech CSE Student (2022-2026)',
  specializations: ['Full Stack Development', 'AI/ML', 'Data Science', 'EV Technology', 'Software Engineering']
};

const SEED_ABOUT: AboutData = {
  bullets: [
    'B.Tech CSE Student at Bikaner Technical University',
    'Passionate about software engineering and developing scalable web applications',
    'Interested in AI, ML, Data Science, and EV Technology',
    'Strong foundation in Java, Python, and JavaScript/TypeScript'
  ]
};

const SEED_EDUCATION: EducationData = {
  degree: 'B.Tech Computer Science & Engineering',
  institution: 'Bikaner Technical University',
  gpa: '8.24/10.0'
};

const SEED_SOCIALS: SocialsData = {
  github: 'https://github.com/niranjansharma',
  linkedin: 'https://linkedin.com/in/niranjansharma',
  email: 'niranjan.sharma.cse@gmail.com',
  phone: '+91-9XXXX-XXXXX'
};

const SEED_RESUME: ResumeData = {
  url: '/resume.pdf'
};

const SEED_SKILLS: Skill[] = [
  { id: 's1', name: 'Java', category: 'Programming', level: 'Advanced' },
  { id: 's2', name: 'Python', category: 'Programming', level: 'Advanced' },
  { id: 's3', name: 'JavaScript', category: 'Programming', level: 'Advanced' },
  { id: 's4', name: 'TypeScript', category: 'Programming', level: 'Intermediate' },
  { id: 's5', name: 'React.js', category: 'Frameworks', level: 'Advanced' },
  { id: 's6', name: 'Next.js', category: 'Frameworks', level: 'Intermediate' },
  { id: 's7', name: 'MySQL', category: 'Database', level: 'Advanced' },
  { id: 's8', name: 'Supabase', category: 'Database', level: 'Intermediate' },
  { id: 's9', name: 'DSA', category: 'Concepts', level: 'Advanced' },
  { id: 's10', name: 'OOP', category: 'Concepts', level: 'Advanced' },
  { id: 's11', name: 'SQL', category: 'Concepts', level: 'Advanced' },
  { id: 's12', name: 'System Design Basics', category: 'Concepts', level: 'Intermediate' },
  { id: 's13', name: 'Git', category: 'Tools', level: 'Advanced' },
  { id: 's14', name: 'GitHub', category: 'Tools', level: 'Advanced' },
  { id: 's15', name: 'Docker', category: 'Tools', level: 'Intermediate' },
  { id: 's16', name: 'AWS', category: 'Tools', level: 'Intermediate' },
  { id: 's17', name: 'VS Code', category: 'Tools', level: 'Advanced' },
  { id: 's18', name: 'CI/CD', category: 'Tools', level: 'Intermediate' }
];

const SEED_EXPERIENCE: Experience[] = [
  {
    id: 'e1',
    company: 'FEYNN Labs',
    role: 'Machine Learning & Data Science Intern',
    duration_start: 'June 2025',
    duration_end: 'August 2025',
    responsibilities: ['Agile Development', 'Technical Planning', 'Data Science Exposure', 'Collaborative Engineering'],
    order_idx: 1
  },
  {
    id: 'e2',
    company: 'Bharat Intern',
    role: 'Frontend Development Intern',
    duration_start: 'June 2023',
    duration_end: 'July 2023',
    responsibilities: ['HTML', 'CSS', 'JavaScript', 'Responsive Development'],
    order_idx: 2
  }
];

const SEED_CERTIFICATIONS: Certification[] = [
  { id: 'c1', name: 'OCI 2025 Certified AI Foundation Associate', issuer: 'Oracle Cloud Infrastructure', date: '2025', link: 'https://oracle.com' },
  { id: 'c2', name: 'OCI 2025 Certified AI Vector Search Professional', issuer: 'Oracle Cloud Infrastructure', date: '2025', link: 'https://oracle.com' },
  { id: 'c3', name: 'Future In Charge: EV & Green Mobility Program', issuer: 'Society of Automotive SAE India', date: '2024', link: 'https://saeindia.org' }
];

const SEED_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Reliance Foundation Scholar', description: 'Selected for the prestigious Reliance Foundation Undergrad Scholarship based on academic merit.' },
  { id: 'a2', title: '5-Star Java Badge (HackerRank)', description: 'Earned 5-star Gold badge in Java coding exercises and algorithmic problem solving.' },
  { id: 'a3', title: '5-Star C++ Badge (HackerRank)', description: 'Earned 5-star Gold badge in C++ programming assessments.' },
  { id: 'a4', title: 'Overall Coordinator', description: 'Serving as the overall coordinator for the Training & Placement Cell, managing campus recruitment drives.' }
];

// Helper to initialize local storage
const initializeLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const initKey = (key: string, seed: unknown) => {
    if (!localStorage.getItem(`niranjanos_${key}`)) {
      localStorage.setItem(`niranjanos_${key}`, JSON.stringify(seed));
    }
  };

  initKey('owner_info', SEED_PROFILE);
  initKey('about', SEED_ABOUT);
  initKey('education', SEED_EDUCATION);
  initKey('socials', SEED_SOCIALS);
  initKey('resume', SEED_RESUME);
  initKey('skills', SEED_SKILLS);
  initKey('experience', SEED_EXPERIENCE);
  initKey('certifications', SEED_CERTIFICATIONS);
  initKey('achievements', SEED_ACHIEVEMENTS);
  initKey('messages', [] as ContactMessage[]);
  initKey('analytics', [] as AnalyticEvent[]);
};

// Execute initialization
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}

// Local Storage helpers
const getLocal = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  const val = localStorage.getItem(`niranjanos_${key}`);
  return val ? JSON.parse(val) : seed;
};

const setLocal = <T>(key: string, val: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`niranjanos_${key}`, JSON.stringify(val));
};

// Generic DB access functions
export async function getProfileData(key: string): Promise<unknown> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profile_data')
      .select('value')
      .eq('key', key)
      .single();
    if (!error && data) return data.value;
  }
  
  // Fallback to local storage/seed
  if (key === 'owner_info') return getLocal('owner_info', SEED_PROFILE);
  if (key === 'about') return getLocal('about', SEED_ABOUT);
  if (key === 'education') return getLocal('education', SEED_EDUCATION);
  if (key === 'socials') return getLocal('socials', SEED_SOCIALS);
  if (key === 'resume') return getLocal('resume', SEED_RESUME);
  return null;
}

export async function updateProfileData(key: string, value: unknown): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('profile_data')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (!error) return true;
    console.error('Supabase update failed:', error);
  }

  // Local storage fallback
  setLocal(key, value);
  return true;
}

export async function getSkills(): Promise<Skill[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (!error && data) return data;
  }
  return getLocal('skills', SEED_SKILLS);
}

export async function addSkill(name: string, category: Skill['category'], level: string): Promise<Skill> {
  const newSkill: Skill = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    category,
    level,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('skills')
      .insert({ name, category, level })
      .select()
      .single();
    if (!error && data) return data;
    console.error('Supabase insert skill failed:', error);
  }

  const skills = getLocal('skills', SEED_SKILLS);
  skills.push(newSkill);
  setLocal('skills', skills);
  return newSkill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.error('Supabase delete skill failed:', error);
  }

  const skills = getLocal('skills', SEED_SKILLS);
  const filtered = skills.filter(s => s.id !== id);
  setLocal('skills', filtered);
  return true;
}

export async function getExperiences(): Promise<Experience[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('order_idx', { ascending: true });
    if (!error && data) return data;
  }
  return getLocal('experience', SEED_EXPERIENCE);
}

export async function addExperience(exp: Omit<Experience, 'id'>): Promise<Experience> {
  const newExp: Experience = {
    ...exp,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('experience')
      .insert(exp)
      .select()
      .single();
    if (!error && data) return data;
    console.error('Supabase insert experience failed:', error);
  }

  const experiences = getLocal('experience', SEED_EXPERIENCE);
  experiences.push(newExp);
  experiences.sort((a, b) => a.order_idx - b.order_idx);
  setLocal('experience', experiences);
  return newExp;
}

export async function updateExperience(id: string, exp: Partial<Experience>): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('experience')
      .update(exp)
      .eq('id', id);
    if (!error) return true;
    console.error('Supabase update experience failed:', error);
  }

  const experiences = getLocal('experience', SEED_EXPERIENCE);
  const updated = experiences.map(e => e.id === id ? { ...e, ...exp } : e);
  updated.sort((a, b) => a.order_idx - b.order_idx);
  setLocal('experience', updated);
  return true;
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('experience')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.error('Supabase delete experience failed:', error);
  }

  const experiences = getLocal('experience', SEED_EXPERIENCE);
  const filtered = experiences.filter(e => e.id !== id);
  setLocal('experience', filtered);
  return true;
}

export async function getCertifications(): Promise<Certification[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) return data;
  }
  return getLocal('certifications', SEED_CERTIFICATIONS);
}

export async function addCertification(cert: Omit<Certification, 'id'>): Promise<Certification> {
  const newCert: Certification = {
    ...cert,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('certifications')
      .insert(cert)
      .select()
      .single();
    if (!error && data) return data;
    console.error('Supabase insert certification failed:', error);
  }

  const certifications = getLocal('certifications', SEED_CERTIFICATIONS);
  certifications.push(newCert);
  setLocal('certifications', certifications);
  return newCert;
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.error('Supabase delete certification failed:', error);
  }

  const certifications = getLocal('certifications', SEED_CERTIFICATIONS);
  const filtered = certifications.filter(c => c.id !== id);
  setLocal('certifications', filtered);
  return true;
}

export async function getAchievements(): Promise<Achievement[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) return data;
  }
  return getLocal('achievements', SEED_ACHIEVEMENTS);
}

export async function addAchievement(ach: Omit<Achievement, 'id'>): Promise<Achievement> {
  const newAch: Achievement = {
    ...ach,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('achievements')
      .insert(ach)
      .select()
      .single();
    if (!error && data) return data;
    console.error('Supabase insert achievement failed:', error);
  }

  const achievements = getLocal('achievements', SEED_ACHIEVEMENTS);
  achievements.push(newAch);
  setLocal('achievements', achievements);
  return newAch;
}

export async function deleteAchievement(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);
    if (!error) return true;
    console.error('Supabase delete achievement failed:', error);
  }

  const achievements = getLocal('achievements', SEED_ACHIEVEMENTS);
  const filtered = achievements.filter(a => a.id !== id);
  setLocal('achievements', filtered);
  return true;
}

// Contact messages CRUD
export async function submitMessage(name: string, email: string, message: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('messages')
      .insert({ name, email, message });
    if (!error) return true;
    console.error('Supabase submit message failed:', error);
  }

  // Local storage fallback
  const messages = getLocal('messages', [] as ContactMessage[]);
  messages.push({
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    message,
    created_at: new Date().toISOString()
  });
  setLocal('messages', messages);
  return true;
}

export async function getMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return getLocal('messages', [] as ContactMessage[]);
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    if (!error) return true;
  }
  const messages = getLocal('messages', [] as ContactMessage[]);
  const filtered = messages.filter(m => m.id !== id);
  setLocal('messages', filtered);
  return true;
}

// Analytics logging
export async function logAnalytics(type: AnalyticEvent['type'], value: string, ip_hash?: string): Promise<boolean> {
  const ip = ip_hash || 'local';
  
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('analytics')
      .insert({ type, value, ip_hash: ip });
    if (!error) return true;
  }

  const analytics = getLocal('analytics', [] as AnalyticEvent[]);
  analytics.push({
    id: Math.random().toString(36).substr(2, 9),
    type,
    value,
    ip_hash: ip,
    created_at: new Date().toISOString()
  });
  setLocal('analytics', analytics);
  return true;
}

export async function getAnalytics(): Promise<AnalyticEvent[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }
  return getLocal('analytics', [] as AnalyticEvent[]);
}
