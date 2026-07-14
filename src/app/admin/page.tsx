'use client';

import React, { useState, useEffect } from 'react';
import * as db from '@/lib/db';
import { 
  Terminal as TermIcon, ShieldAlert, Cpu, Award, Briefcase, 
  Settings, Key, LogOut, Check, Plus, Trash2, Mail, BarChart2,
  ExternalLink, FileText
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'about' | 'skills' | 'experience' | 'certifications' | 'messages'>('analytics');

  // Loaded database states
  const [ownerInfo, setOwnerInfo] = useState<db.ProfileData | null>(null);
  const [aboutData, setAboutData] = useState<db.AboutData | null>(null);
  const [education, setEducation] = useState<db.EducationData | null>(null);
  const [socials, setSocials] = useState<db.SocialsData | null>(null);
  const [resume, setResume] = useState<db.ResumeData | null>(null);
  const [skills, setSkills] = useState<db.Skill[]>([]);
  const [experiences, setExperiences] = useState<db.Experience[]>([]);
  const [certifications, setCertifications] = useState<db.Certification[]>([]);
  const [messages, setMessages] = useState<db.ContactMessage[]>([]);
  const [analytics, setAnalytics] = useState<db.AnalyticEvent[]>([]);

  // Form states for adding items
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Programming' as db.Skill['category'], level: 'Intermediate' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', date: '', link: '' });
  const [newExp, setNewExp] = useState({ company: '', role: '', duration_start: '', duration_end: '', responsibilities: '', order_idx: '1' });
  
  // Status feedback states
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Check session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('niranjanos_admin_auth');
      if (session === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch all db resources upon authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAllData();
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      const info = await db.getProfileData('owner_info');
      const abt = await db.getProfileData('about');
      const edu = await db.getProfileData('education');
      const soc = await db.getProfileData('socials');
      const res = await db.getProfileData('resume');
      const skls = await db.getSkills();
      const exps = await db.getExperiences();
      const crts = await db.getCertifications();
      const msgs = await db.getMessages();
      const anl = await db.getAnalytics();

      setOwnerInfo(info as db.ProfileData);
      setAboutData(abt as db.AboutData);
      setEducation(edu as db.EducationData);
      setSocials(soc as db.SocialsData);
      setResume(res as db.ResumeData);
      setSkills(skls);
      setExperiences(exps);
      setCertifications(crts);
      setMessages(msgs);
      setAnalytics(anl);
    } catch (e) {
      console.error('Error fetching dashboard content:', e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default fallback password: 'admin123'
    if (password === 'admin123' || password === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
      sessionStorage.setItem('niranjanos_admin_auth', 'true');
    } else {
      setLoginError('Access denied: Invalid Administrator Passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('niranjanos_admin_auth');
  };

  // Submit profile edits
  const saveProfileData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerInfo || !aboutData || !education || !socials || !resume) return;

    setSaveStatus('Saving Changes...');
    try {
      await db.updateProfileData('owner_info', ownerInfo);
      await db.updateProfileData('about', aboutData);
      await db.updateProfileData('education', education);
      await db.updateProfileData('socials', socials);
      await db.updateProfileData('resume', resume);

      setSaveStatus('Settings updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
      setSaveStatus('Error saving details.');
    }
  };

  // Add Skill handler
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    try {
      const added = await db.addSkill(newSkill.name, newSkill.category, newSkill.level);
      setSkills(prev => [...prev, added]);
      setNewSkill({ name: '', category: 'Programming', level: 'Intermediate' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await db.deleteSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Add Cert handler
  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name.trim() || !newCert.issuer.trim()) return;

    try {
      const added = await db.addCertification({
        name: newCert.name,
        issuer: newCert.issuer,
        date: newCert.date || new Date().getFullYear().toString(),
        link: newCert.link
      });
      setCertifications(prev => [...prev, added]);
      setNewCert({ name: '', issuer: '', date: '', link: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
      await db.deleteCertification(id);
      setCertifications(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Add Experience handler
  const handleAddExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.company.trim() || !newExp.role.trim()) return;

    // Parse multiline responsibilities string to array
    const respArr = newExp.responsibilities
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    try {
      const added = await db.addExperience({
        company: newExp.company,
        role: newExp.role,
        duration_start: newExp.duration_start,
        duration_end: newExp.duration_end || 'Present',
        responsibilities: respArr,
        order_idx: parseInt(newExp.order_idx) || 1
      });
      setExperiences(prev => [...prev, added].sort((a, b) => a.order_idx - b.order_idx));
      setNewExp({ company: '', role: '', duration_start: '', duration_end: '', responsibilities: '', order_idx: '1' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience record?')) return;
    try {
      await db.deleteExperience(id);
      setExperiences(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMsg = async (id: string) => {
    try {
      await db.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Aggregate Analytics metrics
  const getAnalyticsSummary = () => {
    const totalVisits = analytics.filter(a => a.type === 'visitor').length;
    const totalCmds = analytics.filter(a => a.type === 'command').length;
    
    // Group project views
    const projectViews: Record<string, number> = {};
    analytics.filter(a => a.type === 'project_view').forEach(e => {
      projectViews[e.value] = (projectViews[e.value] || 0) + 1;
    });

    const popularProjects = Object.entries(projectViews)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Group top command usage
    const commandUsage: Record<string, number> = {};
    analytics.filter(a => a.type === 'command').forEach(e => {
      commandUsage[e.value] = (commandUsage[e.value] || 0) + 1;
    });
    const topCommands = Object.entries(commandUsage)
      .map(([cmd, count]) => ({ cmd, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalVisits, totalCmds, popularProjects, topCommands };
  };

  const metrics = getAnalyticsSummary();

  // Authentication Gate Panel
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative font-mono text-[#00ff66]">
        {/* Curvature lines */}
        <div className="crt-overlay"></div>
        <div className="crt-scanlines animate-flicker"></div>

        <div className="w-full max-w-md border border-[#00ff66]/30 p-6 rounded bg-[#00ff66]/5 panel-glow select-none">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Settings className="w-12 h-12 text-[#00ff66] animate-spin" style={{ animationDuration: '8s' }} />
            <h1 className="text-xl font-bold tracking-wider">NiranjanOS CONTROL PANEL</h1>
            <p className="text-[10px] text-[#00ff66]/75 text-center">PRIVILEGED ACCESS REQUIRED. ENTER PASSCODE.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold block text-muted">SYSTEM ADMINISTRATIVE KEY:</label>
              <div className="flex border border-[#00ff66]/40 rounded overflow-hidden bg-black items-center px-3">
                <Key className="w-4 h-4 text-[#00ff66]/60 mr-2" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2 bg-transparent text-[#00ff66] font-mono outline-none border-none text-sm placeholder-[#00ff66]/20"
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-500 text-xs font-bold bg-red-500/10 border border-red-500/20 p-2 rounded flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#00ff66] text-black font-bold text-xs py-2 rounded hover:bg-[#00ff66]/80 transition-colors uppercase tracking-wider"
            >
              Authorize Console
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs text-[#00ff66]/60 hover:underline flex items-center justify-center gap-1">
              ← Return to CLI Terminal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-foreground font-mono flex flex-col md:flex-row transition-all duration-300">
      
      {/* Sidebar Control Panel Nav */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-black/60 flex flex-col justify-between shrink-0 p-4 select-none">
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Settings className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '10s' }} />
            <div>
              <div className="text-sm font-bold text-foreground">SYSTEM CONSOLE</div>
              <div className="text-[9px] text-muted font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span>
                <span>SECURE HOST SESSION</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1 text-xs">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${activeTab === 'analytics' ? 'bg-primary text-black font-bold' : 'hover:bg-muted/15 text-foreground'}`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>System Analytics</span>
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${activeTab === 'about' ? 'bg-primary text-black font-bold' : 'hover:bg-muted/15 text-foreground'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Bio & Profile Links</span>
            </button>
            <button 
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${activeTab === 'skills' ? 'bg-primary text-black font-bold' : 'hover:bg-muted/15 text-foreground'}`}
            >
              <Cpu className="w-4 h-4" />
              <span>Skills Catalog</span>
            </button>
            <button 
              onClick={() => setActiveTab('experience')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${activeTab === 'experience' ? 'bg-primary text-black font-bold' : 'hover:bg-muted/15 text-foreground'}`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Work Experience</span>
            </button>
            <button 
              onClick={() => setActiveTab('certifications')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${activeTab === 'certifications' ? 'bg-primary text-black font-bold' : 'hover:bg-muted/15 text-foreground'}`}
            >
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors ${activeTab === 'messages' ? 'bg-primary text-black font-bold' : 'hover:bg-muted/15 text-foreground'} flex justify-between`}
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>User Feedback</span>
              </span>
              {messages.length > 0 && (
                <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">{messages.length}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Back and Logout buttons */}
        <div className="pt-6 border-t border-border flex flex-col gap-2 mt-6">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 text-center text-xs border border-border py-1.5 rounded hover:bg-muted/10 transition-colors text-foreground font-bold"
          >
            <TermIcon className="w-3.5 h-3.5" />
            <span>Launch CLI Terminal</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-center text-xs bg-error/15 border border-error/30 text-error py-1.5 rounded hover:bg-error/25 transition-colors font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Admin Auth</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Connection Mode Warning */}
        {!isSupabaseConfigured && (
          <div className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded p-2 mb-4 font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>[DEMO MODE ACTIVE] Supabase URL/Key missing. Edits will write to your browser localStorage and reflect instantly in the terminal engine.</span>
          </div>
        )}

        {/* Tab 1: System Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-primary flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> SYSTEM ANALYTICS METRICS
            </h2>

            {/* Metric counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-border p-4 rounded bg-black/40">
                <div className="text-[10px] text-muted font-bold">TOTAL PORTFOLIO HITS</div>
                <div className="text-2xl font-bold mt-1 text-accent">{metrics.totalVisits}</div>
              </div>
              <div className="border border-border p-4 rounded bg-black/40">
                <div className="text-[10px] text-muted font-bold">COMMANDS EXECUTED</div>
                <div className="text-2xl font-bold mt-1 text-secondary">{metrics.totalCmds}</div>
              </div>
              <div className="border border-border p-4 rounded bg-black/40">
                <div className="text-[10px] text-muted font-bold">MESSAGES RECEIVED</div>
                <div className="text-2xl font-bold mt-1 text-success">{messages.length}</div>
              </div>
              <div className="border border-border p-4 rounded bg-black/40">
                <div className="text-[10px] text-muted font-bold">SKILLS IN CATALOG</div>
                <div className="text-2xl font-bold mt-1 text-primary">{skills.length}</div>
              </div>
            </div>

            {/* Popular Projects and Command Usage lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-border p-4 rounded bg-black/35 space-y-3">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-2">MOST VIEWED PROJECTS</h3>
                {metrics.popularProjects.length === 0 ? (
                  <div className="text-xs text-muted pt-1">No project views logged yet. Run project details in CLI.</div>
                ) : (
                  <table className="w-full text-xs text-left font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 pb-1 text-muted">
                        <th className="py-1">Project Name</th>
                        <th className="text-right">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.popularProjects.map((p, idx) => (
                        <tr key={idx} className="hover:bg-muted/5 border-b border-border/10">
                          <td className="py-2 text-foreground font-bold">{p.name}</td>
                          <td className="py-2 text-right text-accent font-bold">{p.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border border-border p-4 rounded bg-black/35 space-y-3">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-2">TOP EXECUTED COMMANDS</h3>
                {metrics.topCommands.length === 0 ? (
                  <div className="text-xs text-muted pt-1">No command histories recorded.</div>
                ) : (
                  <table className="w-full text-xs text-left font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 pb-1 text-muted">
                        <th className="py-1">Command</th>
                        <th className="text-right">Execution Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topCommands.map((c, idx) => (
                        <tr key={idx} className="hover:bg-muted/5 border-b border-border/10">
                          <td className="py-2 text-foreground font-bold">{c.cmd}</td>
                          <td className="py-2 text-right text-accent font-bold">{c.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: About & Socials */}
        {activeTab === 'about' && ownerInfo && aboutData && education && socials && resume && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" /> BIO & PROFILE LINKS CONFIG
            </h2>

            <form onSubmit={saveProfileData} className="space-y-6 max-w-3xl">
              
              {/* About Owner Info Grid */}
              <div className="border border-border p-4 rounded bg-black/30 space-y-4">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">OWNER METADATA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Developer Name:</label>
                    <input 
                      type="text"
                      value={ownerInfo.name}
                      onChange={(e) => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Current Role:</label>
                    <input 
                      type="text"
                      value={ownerInfo.role}
                      onChange={(e) => setOwnerInfo({ ...ownerInfo, role: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Status Info:</label>
                    <input 
                      type="text"
                      value={ownerInfo.status}
                      onChange={(e) => setOwnerInfo({ ...ownerInfo, status: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Location:</label>
                    <input 
                      type="text"
                      value={ownerInfo.location}
                      onChange={(e) => setOwnerInfo({ ...ownerInfo, location: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Bullet bio lists */}
              <div className="border border-border p-4 rounded bg-black/30 space-y-3">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">ABOUT DESCRIPTION BULLETS</h3>
                <div className="space-y-2 text-xs">
                  {aboutData.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...aboutData.bullets];
                          updated[idx] = e.target.value;
                          setAboutData({ bullets: updated });
                        }}
                        className="flex-1 bg-black border border-border p-2 rounded text-foreground outline-none focus:border-primary"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const filtered = aboutData.bullets.filter((_, bIdx) => bIdx !== idx);
                          setAboutData({ bullets: filtered });
                        }}
                        className="p-2 border border-error/30 text-error hover:bg-error/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button"
                    onClick={() => setAboutData({ bullets: [...aboutData.bullets, ''] })}
                    className="flex items-center gap-1.5 border border-dashed border-muted text-muted hover:border-primary hover:text-primary transition-colors text-xs px-3 py-1.5 rounded mt-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Description Paragraph
                  </button>
                </div>
              </div>

              {/* Education block */}
              <div className="border border-border p-4 rounded bg-black/30 space-y-4">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">EDUCATION CREDENTIAL</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Degree / Major:</label>
                    <input 
                      type="text"
                      value={education.degree}
                      onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">University Name:</label>
                    <input 
                      type="text"
                      value={education.institution}
                      onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Grade (CGPA):</label>
                    <input 
                      type="text"
                      value={education.gpa}
                      onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels and Resume URL */}
              <div className="border border-border p-4 rounded bg-black/30 space-y-4">
                <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">COMMUNICATION & FILE LINKS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">GitHub URL:</label>
                    <input 
                      type="text"
                      value={socials.github}
                      onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">LinkedIn URL:</label>
                    <input 
                      type="text"
                      value={socials.linkedin}
                      onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Email Contact:</label>
                    <input 
                      type="email"
                      value={socials.email}
                      onChange={(e) => setSocials({ ...socials, email: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted font-bold block">Resume File path / Link:</label>
                    <input 
                      type="text"
                      value={resume.url}
                      onChange={(e) => setResume({ ...resume, url: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save response feedback indicator */}
              <div className="flex items-center gap-4 pt-2">
                <button 
                  type="submit" 
                  className="bg-primary text-black font-bold text-xs px-6 py-2.5 rounded hover:bg-opacity-95 transition-all shadow-md"
                >
                  Save Profile Configuration
                </button>
                {saveStatus && (
                  <span className="text-xs text-success font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> {saveStatus}
                  </span>
                )}
              </div>

            </form>
          </div>
        )}

        {/* Tab 3: Skills List */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5" /> SKILLS CATALOG MANAGEMENT
            </h2>

            {/* Add new skill form */}
            <div className="border border-border p-4 rounded bg-black/30 max-w-3xl space-y-3">
              <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">ADD TECHNICAL COMPETENCY</h3>
              <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                <div className="space-y-1">
                  <label className="text-muted block">Skill Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Docker" 
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full bg-black border border-border p-2 rounded outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted block">Category:</label>
                  <select 
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as db.Skill['category'] })}
                    className="w-full bg-black border border-border p-2 rounded outline-none text-foreground"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Frameworks">Frameworks</option>
                    <option value="Database">Database</option>
                    <option value="Concepts">Concepts</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted block">Level (optional):</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Advanced" 
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                    className="w-full bg-black border border-border p-2 rounded outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-success text-black font-bold p-2.5 rounded hover:bg-success/90 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </form>
            </div>

            {/* List skills */}
            <div className="border border-border p-4 rounded bg-black/25 max-w-3xl space-y-2">
              <h3 className="text-xs font-bold text-secondary border-b border-border pb-2">CURRENT SKILLS CATALOG</h3>
              
              <div className="divide-y divide-border/30 text-xs">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex justify-between items-center py-2 hover:bg-muted/5 px-1.5">
                    <div>
                      <span className="font-bold text-foreground">{skill.name}</span>
                      {skill.level && <span className="text-[10px] text-muted ml-2">({skill.level})</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-muted/20 text-[10px] px-2 py-0.5 rounded text-secondary font-bold">{skill.category}</span>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-error hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {skills.length === 0 && (
                  <div className="text-xs text-muted py-4 text-center">No skills registered.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Work Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-primary flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> WORK EXPERIENCE DATABASE
            </h2>

            {/* Add work experience */}
            <div className="border border-border p-4 rounded bg-black/30 max-w-3xl space-y-4">
              <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">REGISTER ROLE / INTERNSHIP</h3>
              <form onSubmit={handleAddExp} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-muted block">Company Name:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. FEYNN Labs"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded outline-none text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted block">Role / Title:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ML Intern"
                      value={newExp.role}
                      onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-muted block">Start Date:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. June 2025"
                      value={newExp.duration_start}
                      onChange={(e) => setNewExp({ ...newExp, duration_start: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted block">End Date:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. August 2025 (or Present)"
                      value={newExp.duration_end}
                      onChange={(e) => setNewExp({ ...newExp, duration_end: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted block">Display Order Index:</label>
                    <input 
                      type="number" 
                      placeholder="1"
                      value={newExp.order_idx}
                      onChange={(e) => setNewExp({ ...newExp, order_idx: e.target.value })}
                      className="w-full bg-black border border-border p-2 rounded outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-muted block">Responsibilities (One bullet per line):</label>
                  <textarea 
                    placeholder="Agile Development&#10;Technical Planning&#10;Data Analysis"
                    value={newExp.responsibilities}
                    onChange={(e) => setNewExp({ ...newExp, responsibilities: e.target.value })}
                    rows={4}
                    className="w-full bg-black border border-border p-2 rounded outline-none font-mono"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="bg-success text-black font-bold px-4 py-2 rounded hover:bg-success/90 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Experience Record
                </button>
              </form>
            </div>

            {/* List experience */}
            <div className="max-w-3xl space-y-4">
              <h3 className="text-xs font-bold text-secondary border-b border-border pb-2">EXPERIENCE RECORDS</h3>
              
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border border-border p-4 rounded bg-black/15 flex justify-between gap-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-accent text-sm">{exp.company}</span>
                        <span className="text-muted">|</span>
                        <span className="text-foreground font-semibold">{exp.role}</span>
                      </div>
                      <div className="text-[10px] text-muted font-semibold">
                        Duration: {exp.duration_start} – {exp.duration_end} (Sort Order: {exp.order_idx})
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5 mt-2 font-mono text-[11px] text-foreground">
                        {exp.responsibilities.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleDeleteExp(exp.id)}
                      className="text-error hover:text-red-400 self-start p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {experiences.length === 0 && (
                  <div className="text-xs text-muted text-center py-4">No experience records found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Certifications */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-primary flex items-center gap-2">
              <Award className="w-5 h-5" /> CERTIFICATIONS REGISTRY
            </h2>

            {/* Add certification form */}
            <div className="border border-border p-4 rounded bg-black/30 max-w-3xl space-y-3">
              <h3 className="text-xs font-bold text-secondary border-b border-border pb-1">REGISTER CERTIFICATION</h3>
              <form onSubmit={handleAddCert} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-muted block">Certificate Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. OCI AI Vector Search Professional" 
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="w-full bg-black border border-border p-2 rounded outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted block">Issuer Org:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Oracle" 
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full bg-black border border-border p-2 rounded outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted block">Year Issued:</label>
                  <input 
                    type="text" 
                    placeholder="2025" 
                    value={newCert.date}
                    onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                    className="w-full bg-black border border-border p-2 rounded outline-none"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-muted block">Verification Link (optional):</label>
                  <input 
                    type="text" 
                    placeholder="https://..." 
                    value={newCert.link}
                    onChange={(e) => setNewCert({ ...newCert, link: e.target.value })}
                    className="w-full bg-black border border-border p-2 rounded outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-success text-black font-bold p-2.5 rounded hover:bg-success/90 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Cert
                </button>
              </form>
            </div>

            {/* List Certs */}
            <div className="border border-border p-4 rounded bg-black/25 max-w-3xl space-y-2">
              <h3 className="text-xs font-bold text-secondary border-b border-border pb-2">CURRENT REGISTRY</h3>
              
              <div className="divide-y divide-border/30 text-xs">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-center py-2.5 hover:bg-muted/5 px-1.5">
                    <div>
                      <span className="font-bold text-foreground">{cert.name}</span>
                      <span className="text-[10px] text-muted ml-2">({cert.issuer}, {cert.date})</span>
                      {cert.link && (
                        <a href={cert.link} target="_blank" className="text-primary hover:underline text-[10px] ml-2 inline-flex items-center gap-0.5">
                          verify <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteCert(cert.id)}
                      className="text-error hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {certifications.length === 0 && (
                  <div className="text-xs text-muted py-4 text-center">No certifications registered.</div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-2 text-primary flex items-center gap-2">
              <Mail className="w-5 h-5" /> MESSAGES & USER FEEDBACK
            </h2>

            <div className="space-y-4 max-w-3xl">
              {messages.map((msg) => (
                <div key={msg.id} className="border border-border p-4 rounded bg-black/20 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-accent text-sm">{msg.name}</div>
                      <div className="text-secondary font-semibold">{msg.email}</div>
                      <div className="text-[10px] text-muted">{new Date(msg.created_at).toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteMsg(msg.id)}
                      className="text-error hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <div className="text-xs text-foreground bg-black/40 border border-border/55 p-3 rounded font-mono leading-relaxed select-text whitespace-pre-wrap">
                    {msg.message}
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-xs text-muted text-center py-8 border border-dashed border-border rounded">
                  No feedback messages found in database yet.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
