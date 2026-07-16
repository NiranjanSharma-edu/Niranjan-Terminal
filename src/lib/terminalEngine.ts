import * as db from './db';

export interface CommandOutput {
  text: string;
  html?: string;
  clear?: boolean;
  systemAction?: {
    type: 'set_theme' | 'start_wizard' | 'open_link' | 'unknown';
    payload: string;
  };
}

export interface ProjectItem {
  name: string;
  description?: string | null;
  html_url?: string;
  stargazers_count?: number;
  language?: string | null;
  tech?: string[];
  features?: string[];
}

export interface TerminalContext {
  currentTheme: string;
  projects: ProjectItem[]; // Cached Github or local projects
  currentPath: string;
}

// Helper: Ascii art logo for NiranjanOS
export const ASCII_BANNER = `
             _   __________  ___    _   __    _____    _   __   __   _____ 
            / | / /  _/ __ \\/   |  / | / /   / /   |  / | / /  / /  / ___/ 
           /  |/ // // /_/ / /| | /  |/ /_  / / /| | /  |/ /  /_/   \\__ \\  
          / /|  // // _, _/ ___ |/ /|  / /_/ / ___ |/ /|  /        ___/ /  
         /_/ |_/___/_/ |_/_/__|_/_/_|_/\\____/_/  |_/_/ |_/        /____/   

                        ______                    _             __
                       /_  __/__  _________ ___  (_)___  ____ _/ /
                        / / / _ \\/ ___/ __ \`__ \\/ / __ \\/ __ \`/ / 
                       / / /  __/ /  / / / / / / / / / / /_/ / /  
                      /_/  \\___/_/  /_/ /_/ /_/_/_/ /_/\\__,_/_/   

=============================================================================================
                     NIRANJAN'S TERMINAL v1.0.0 (Kernel 5.15.0-x86_64)
                 Logged in as guest@niranjan.sharma. Type 'help' to begin.
=============================================================================================
`;

export const ASCII_HTML_BANNER = `
<div class="flex flex-col items-center justify-center w-full my-4 select-text">
  <pre class="font-mono text-left leading-none text-glow-primary text-primary select-text text-[1.4vw] min-[640px]:text-xs md:text-sm transition-all duration-300">
             _   __________  ___    _   __    _____    _   __   __   _____ 
            / | / /  _/ __ \\/   |  / | / /   / /   |  / | / /  / /  / ___/ 
           /  |/ // // /_/ / /| | /  |/ /_  / / /| | /  |/ /  /_/   \\__ \\  
          / /|  // // _, _/ ___ |/ /|  / /_/ / ___ |/ /|  /        ___/ /  
         /_/ |_/___/_/ |_/_/__|_/_/_|_/\\____/_/  |_/_/ |_/        /____/   

                        ______                    _             __
                       /_  __/__  _________ ___  (_)___  ____ _/ /
                        / / / _ \\/ ___/ __ \`__ \\/ / __ \\/ __ \`/ / 
                       / / /  __/ /  / / / / / / / / / / /_/ / /  
                      /_/  \\___/_/  /_/ /_/ /_/_/_/ /_/\\__,_/_/   
  </pre>
  <pre class="font-mono text-center select-text text-xs md:text-sm mt-4 text-glow text-foreground opacity-90 w-full">
=============================================================================================
                     NIRANJAN'S TERMINAL v1.0.0 (Kernel 5.15.0-x86_64)
                 Logged in as guest@niranjan.sharma. Type 'help' to begin.
=============================================================================================
  </pre>
</div>
`;


export async function executeCommand(
  rawInput: string,
  context: TerminalContext
): Promise<CommandOutput> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { text: '' };
  }

  // Parse command and arguments
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Track command analytics in background
  try {
    db.logAnalytics('command', command);
  } catch (err) {
    console.error('Analytics log failed:', err);
  }

  switch (command) {
    case 'help':
      return getHelpOutput();

    case 'clear':
      return { text: '', clear: true };

    case 'banner':
      return { text: ASCII_BANNER, html: ASCII_HTML_BANNER };

    case 'whoami':
      return { text: 'visitor@niranjan.sharma (Guest Developer session)' };

    case 'pwd':
      return { text: context.currentPath };

    case 'date':
      return { text: new Date().toString() };

    case 'about':
      return await getAboutOutput();

    case 'skills':
      return await getSkillsOutput();

    case 'experience':
      return await getExperienceOutput();

    case 'education':
      return await getEducationOutput();

    case 'certifications':
      return await getCertificationsOutput();

    case 'achievements':
      return await getAchievementsOutput();

    case 'socials':
      return await getSocialsOutput();

    case 'resume':
      return await getResumeOutput();

    case 'projects':
      return getProjectsOutput(context.projects);

    case 'project':
      return getProjectDetailOutput(args[0], context.projects);

    case 'theme':
      return setThemeOutput(args[0]);

    case 'contact':
      return handleContactOutput(args);

    case 'ask':
      return await handleAskOutput(args);

    default:
      return {
        text: `NiranjanOS: command not found: '${command}'. Type 'help' for a list of available commands.`
      };
  }
}

// 1. HELP COMMAND
function getHelpOutput(): CommandOutput {
  const commands = [
    { name: 'help', desc: 'Display this user manual' },
    { name: 'banner', desc: 'Show the NiranjanOS welcome screen' },
    { name: 'whoami', desc: 'Display current user session information' },
    { name: 'pwd', desc: 'Print working directory' },
    { name: 'date', desc: 'Display current system date and time' },
    { name: 'clear', desc: 'Clear the terminal output history' },
    { name: 'about', desc: 'A short summary of Niranjan\'s background' },
    { name: 'skills', desc: 'List core technical competencies' },
    { name: 'projects', desc: 'List repositories fetched dynamically from GitHub' },
    { name: 'project <name>', desc: 'Show detailed specifications of a project (e.g. project code-orbit)' },
    { name: 'experience', desc: 'Show professional internships & developer roles' },
    { name: 'education', desc: 'Show university qualifications' },
    { name: 'certifications', desc: 'Show OCI and EV mobility certifications' },
    { name: 'achievements', desc: 'Display scholarships, placement coordinator & badges' },
    { name: 'socials', desc: 'List social links (GitHub, LinkedIn, Email)' },
    { name: 'resume', desc: 'View or download Niranjan\'s PDF Resume' },
    { name: 'contact', desc: 'Open the interactive terminal contact submission wizard' },
    { name: 'theme <name>', desc: 'Switch interface themes: matrix | ubuntu | cyberpunk | hacker | retro' },
    { name: 'ask "<question>"', desc: 'Ask the Gemini AI assistant about Niranjan\'s portfolio' }
  ];

  let html = `<div class="mt-2 text-primary font-bold">NiranjanOS CLI User Manual:</div>`;
  html += `<table class="w-full mt-2 border-collapse text-left max-w-2xl font-mono text-sm">`;
  html += `<thead><tr class="border-b border-muted/50 pb-1 text-secondary"><th class="pr-6 py-1">Command</th><th>Description</th></tr></thead>`;
  html += `<tbody>`;
  commands.forEach(cmd => {
    html += `<tr class="hover:bg-muted/10"><td class="text-accent pr-6 py-1 font-bold">${cmd.name}</td><td class="py-1">${cmd.desc}</td></tr>`;
  });
  html += `</tbody></table>`;

  return {
    text: commands.map(c => `${c.name.padEnd(20)} - ${c.desc}`).join('\n'),
    html
  };
}

// 2. ABOUT COMMAND
async function getAboutOutput(): Promise<CommandOutput> {
  const profile = await db.getProfileData('owner_info') as db.ProfileData;
  const about = await db.getProfileData('about') as db.AboutData;

  const name = profile?.name || 'Niranjan Sharma';
  const role = profile?.role || 'Computer Science Engineer';
  const status = profile?.status || 'B.Tech CSE Student (2022-2026)';
  const loc = profile?.location || 'Jaipur, Rajasthan, India';

  let text = `ABOUT ME\n========\n`;
  text += `Owner:      ${name}\n`;
  text += `Role:       ${role}\n`;
  text += `Status:     ${status}\n`;
  text += `Location:   ${loc}\n\n`;

  let html = `
    <div class="mt-2 space-y-2">
      <div class="text-xl text-primary font-bold border-b border-muted pb-1">${name}</div>
      <div class="text-secondary font-semibold">${role} | ${status} | ${loc}</div>
      <ul class="list-disc pl-5 mt-2 space-y-1 text-foreground">
  `;

  if (about && about.bullets) {
    about.bullets.forEach(bullet => {
      text += `* ${bullet}\n`;
      html += `<li>${bullet}</li>`;
    });
  } else {
    const defaults = [
      'B.Tech CSE Student at Bikaner Technical University',
      'Passionate about software engineering and developing scalable web applications',
      'Interested in AI, ML, Data Science, and EV Technology',
      'Strong foundation in Java, Python, and JavaScript/TypeScript'
    ];
    defaults.forEach(bullet => {
      text += `* ${bullet}\n`;
      html += `<li>${bullet}</li>`;
    });
  }

  html += `</ul></div>`;

  return { text, html };
}

// 3. SKILLS COMMAND
async function getSkillsOutput(): Promise<CommandOutput> {
  const skills = await db.getSkills();

  // Group by category
  const categories: Record<string, string[]> = {
    'Programming': [],
    'Frameworks': [],
    'Database': [],
    'Concepts': [],
    'Tools': []
  };

  skills.forEach(skill => {
    if (categories[skill.category]) {
      categories[skill.category].push(`${skill.name}${skill.level ? ` (${skill.level})` : ''}`);
    }
  });

  let text = `TECHNICAL SKILLS\n================\n`;
  let html = `<div class="mt-2"><div class="text-lg text-primary font-bold border-b border-muted pb-1 mb-2">Technical Skills & Expertise</div>`;

  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      text += `${category}:\n  ${items.join(', ')}\n\n`;
      html += `
        <div class="mb-2">
          <span class="text-secondary font-bold">${category}:</span>
          <span class="text-foreground ml-2">${items.join(' <span class="text-muted">|</span> ')}</span>
        </div>
      `;
    }
  });

  html += `</div>`;

  return { text, html };
}

// 4. PROJECTS COMMAND
function getProjectsOutput(projects: ProjectItem[]): CommandOutput {
  if (!projects || projects.length === 0) {
    // Fallback to seeds if github is loading/empty
    projects = [
      { name: 'code-orbit', description: 'Full-stack collaborative coding platform with Monaco Editor and Judge0 compiler.', html_url: 'https://github.com' },
      { name: 'library-management', description: 'Library management system written in Core Java utilizing HashMaps and Binary Search Trees.', html_url: 'https://github.com' },
      { name: 'sudoku-solver', description: 'Interactive Sudoku Solver in Java with backtracking search and a Swing GUI.', html_url: 'https://github.com' }
    ];
  }

  let text = `PROJECTS LIST\n=============\n`;
  let html = `
    <div class="mt-2">
      <div class="text-lg text-primary font-bold border-b border-muted pb-1 mb-2">Projects Portfolio</div>
      <div class="text-muted text-sm mb-3">Run 'project &lt;name&gt;' for granular specs (e.g. project code-orbit)</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
  `;

  projects.forEach((proj, idx) => {
    const pName = proj.name;
    const pDesc = proj.description || 'No description provided.';
    text += `${idx + 1}. ${pName}\n   ${pDesc}\n   Link: ${proj.html_url}\n\n`;
    html += `
      <div class="border border-border p-2 rounded hover:bg-muted/10 transition-colors">
        <div class="flex items-center justify-between">
          <span class="text-accent font-bold cursor-pointer hover:underline" onclick="window.terminalInstance.handleCommand('project ${pName}')">${pName}</span>
          <span class="text-xs text-muted flex items-center gap-1">
            ${proj.stargazers_count !== undefined ? `★ ${proj.stargazers_count}` : ''}
          </span>
        </div>
        <div class="text-xs text-foreground mt-1 line-clamp-2">${pDesc}</div>
        <div class="mt-1 text-right">
          <a href="${proj.html_url}" target="_blank" class="text-xs text-secondary hover:underline font-bold">git source ↗</a>
        </div>
      </div>
    `;
  });

  html += `</div></div>`;

  return { text, html };
}

// 5. PROJECT DETAIL COMMAND
function getProjectDetailOutput(name: string, projects: ProjectItem[]): CommandOutput {
  if (!name) {
    return {
      text: 'Usage: project <project-name>. Example: project code-orbit\nRun "projects" to see names.'
    };
  }

  // Find project
  const cleanName = name.toLowerCase().trim();
  let proj = projects.find(p => p.name.toLowerCase() === cleanName);

  // Check fallback seeds if not found
  if (!proj) {
    const fallbacks = [
      {
        name: 'code-orbit',
        description: 'Full-stack collaborative coding platform.',
        features: ['Real-time editing & sync', 'Monaco Code Editor integration', 'Judge0 containerized sandbox compiler', 'Supabase Realtime backend', 'GitHub OAuth auth'],
        tech: ['React.js', 'Next.js', 'Supabase', 'Docker', 'Monaco API'],
        html_url: 'https://github.com'
      },
      {
        name: 'library-management',
        description: 'Library book tracking system.',
        features: ['Binary Search Tree lookups', 'Dynamic OOP inventory structure', 'HashMap indexing', 'File system backups'],
        tech: ['Core Java', 'Collections Framework', 'DSA'],
        html_url: 'https://github.com'
      },
      {
        name: 'sudoku-solver',
        description: 'Visualizer for resolving Sudoku games.',
        features: ['Backtracking pathfinding visualization', 'Custom puzzle inputs', 'Swing Graphical UI', 'Speed adjustments'],
        tech: ['Java', 'Swing UI', 'Algorithms'],
        html_url: 'https://github.com'
      }
    ];
    proj = fallbacks.find(p => p.name.toLowerCase() === cleanName);
  }

  if (!proj) {
    return {
      text: `NiranjanOS: Project "${name}" not found. Type 'projects' to list valid repositories.`
    };
  }

  // Track project view analytic event in background
  try {
    db.logAnalytics('project_view', proj.name);
  } catch (err) {
    console.error('Analytics log failed:', err);
  }

  // Parse details
  const pName = proj.name;
  const pDesc = proj.description || 'No description available.';
  const pUrl = proj.html_url || 'https://github.com';
  const pTech = proj.tech || (proj.language ? [proj.language] : ['TypeScript', 'React.js']);
  
  // Custom features lists depending on project
  let pFeatures: string[] = proj.features || [];
  if (pFeatures.length === 0) {
    if (pName.includes('orbit')) {
      pFeatures = ['Real-time collaboration', 'Monaco Editor', 'Judge0 integration', 'Google/GitHub authentication', 'Supabase backend'];
    } else if (pName.includes('library')) {
      pFeatures = ['Core Java', 'HashMap', 'Binary Search Tree', 'OOP Design'];
    } else if (pName.includes('sudoku')) {
      pFeatures = ['Java', 'Backtracking search', 'Swing GUI'];
    } else {
      pFeatures = ['GitHub dynamic sync', 'Next.js rendering', 'Standard open-source architecture'];
    }
  }

  let text = `PROJECT: ${pName}\n`;
  text += `========================================\n`;
  text += `Description:\n  ${pDesc}\n\n`;
  text += `Tech Stack:\n  ${pTech.join(', ')}\n\n`;
  text += `Key Features:\n`;
  pFeatures.forEach(f => {
    text += `  - ${f}\n`;
  });
  text += `\nGitHub Repository: ${pUrl}\n`;

  const html = `
    <div class="mt-2 max-w-2xl border border-muted p-4 rounded bg-bg/50">
      <div class="flex items-center justify-between border-b border-muted pb-2">
        <span class="text-xl text-primary font-bold">${pName.toUpperCase()}</span>
        <a href="${pUrl}" target="_blank" class="text-xs text-accent hover:underline flex items-center gap-1">Git Repo ↗</a>
      </div>
      
      <div class="mt-3">
        <span class="text-secondary font-bold block">Description:</span>
        <p class="text-sm text-foreground mt-1">${pDesc}</p>
      </div>

      <div class="mt-3">
        <span class="text-secondary font-bold block">Tech Stack:</span>
        <div class="flex flex-wrap gap-2 mt-1">
          ${pTech.map((t: string) => `<span class="bg-muted/30 border border-muted/50 text-xs px-2 py-0.5 rounded text-foreground">${t}</span>`).join('')}
        </div>
      </div>

      <div class="mt-3">
        <span class="text-secondary font-bold block">Core Specifications:</span>
        <ul class="list-disc pl-5 mt-1 text-sm text-foreground space-y-0.5">
          ${pFeatures.map((f: string) => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  return { text, html };
}

// 6. EXPERIENCE COMMAND
async function getExperienceOutput(): Promise<CommandOutput> {
  const experiences = await db.getExperiences();

  let text = `WORK EXPERIENCE\n===============\n`;
  let html = `<div class="mt-2"><div class="text-lg text-primary font-bold border-b border-muted pb-1 mb-2">Professional Experience</div><div class="space-y-4 max-w-2xl">`;

  experiences.forEach(exp => {
    text += `${exp.company}\n`;
    text += `${exp.role}\n`;
    text += `${exp.duration_start} - ${exp.duration_end}\n`;
    text += `Responsibilities:\n`;
    exp.responsibilities.forEach(r => {
      text += `  * ${r}\n`;
    });
    text += `\n`;

    html += `
      <div class="border-l-2 border-primary pl-3 py-1">
        <div class="flex justify-between items-start">
          <span class="text-accent font-bold text-md">${exp.company}</span>
          <span class="text-xs text-muted font-bold">${exp.duration_start} - ${exp.duration_end}</span>
        </div>
        <div class="text-xs text-secondary font-semibold">${exp.role}</div>
        <ul class="list-disc pl-5 mt-2 text-xs space-y-1 text-foreground">
          ${exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
        </ul>
      </div>
    `;
  });

  html += `</div></div>`;

  return { text, html };
}

// 7. EDUCATION COMMAND
async function getEducationOutput(): Promise<CommandOutput> {
  const edu = await db.getProfileData('education') as db.EducationData;

  const degree = edu?.degree || 'B.Tech Computer Science & Engineering';
  const inst = edu?.institution || 'Bikaner Technical University';
  const gpa = edu?.gpa || '8.24';

  let text = `EDUCATION\n=========\n`;
  text += `Degree:      ${degree}\n`;
  text += `University:  ${inst}\n`;
  text += `Grade:       CGPA ${gpa}\n`;

  const html = `
    <div class="mt-2 border-l-2 border-primary pl-3 py-1 max-w-xl">
      <div class="text-accent font-bold text-md">${degree}</div>
      <div class="text-xs text-secondary font-semibold">${inst}</div>
      <div class="text-xs text-foreground mt-1">Cumulative Grade: <span class="font-bold text-success">${gpa}</span></div>
    </div>
  `;

  return { text, html };
}

// 8. CERTIFICATIONS COMMAND
async function getCertificationsOutput(): Promise<CommandOutput> {
  const certs = await db.getCertifications();

  let text = `CERTIFICATIONS\n==============\n`;
  let html = `<div class="mt-2"><div class="text-lg text-primary font-bold border-b border-muted pb-1 mb-2">Professional Certifications</div><ul class="list-disc pl-5 space-y-2 max-w-xl">`;

  certs.forEach(c => {
    text += `* ${c.name} - Issued by ${c.issuer} (${c.date})\n`;
    html += `
      <li>
        <span class="text-foreground">${c.name}</span> 
        <span class="text-muted">(${c.issuer}, ${c.date})</span>
        ${c.link ? `<a href="${c.link}" target="_blank" class="text-accent hover:underline text-xs ml-1">verify ↗</a>` : ''}
      </li>
    `;
  });

  html += `</ul></div>`;

  return { text, html };
}

// 9. ACHIEVEMENTS COMMAND
async function getAchievementsOutput(): Promise<CommandOutput> {
  const achs = await db.getAchievements();

  let text = `ACHIEVEMENTS\n============\n`;
  let html = `<div class="mt-2"><div class="text-lg text-primary font-bold border-b border-muted pb-1 mb-2">Academic & Career Milestones</div><ul class="list-disc pl-5 space-y-2 max-w-xl">`;

  achs.forEach(a => {
    text += `* ${a.title} - ${a.description}\n`;
    html += `
      <li>
        <span class="text-accent font-bold">${a.title}</span>: 
        <span class="text-foreground">${a.description}</span>
      </li>
    `;
  });

  html += `</ul></div>`;

  return { text, html };
}

// 10. SOCIALS COMMAND
async function getSocialsOutput(): Promise<CommandOutput> {
  const socials = await db.getProfileData('socials') as db.SocialsData;

  const github = socials?.github || 'https://github.com';
  const linkedin = socials?.linkedin || 'https://linkedin.com';
  const email = socials?.email || 'niranjan.sharma.cse@gmail.com';
  const phone = socials?.phone || '+91-9XXXX-XXXXX';

  let text = `SOCIAL CHANNELS\n===============\n`;
  text += `GitHub:   ${github}\n`;
  text += `LinkedIn: ${linkedin}\n`;
  text += `Email:    ${email}\n`;
  text += `Phone:    ${phone}\n`;

  const html = `
    <div class="mt-2 max-w-md">
      <div class="text-lg text-primary font-bold border-b border-muted pb-1 mb-2">Niranjan's Channels</div>
      <div class="grid grid-cols-2 gap-2 mt-2">
        <div class="text-secondary font-bold">GitHub:</div>
        <div><a href="${github}" target="_blank" class="text-accent hover:underline">${github.replace('https://', '')}</a></div>
        
        <div class="text-secondary font-bold">LinkedIn:</div>
        <div><a href="${linkedin}" target="_blank" class="text-accent hover:underline">${linkedin.replace('https://', '')}</a></div>
        
        <div class="text-secondary font-bold">Email:</div>
        <div><a href="mailto:${email}" class="text-accent hover:underline">${email}</a></div>
        
        <div class="text-secondary font-bold">Phone:</div>
        <div class="text-foreground">${phone}</div>
      </div>
    </div>
  `;

  return { text, html };
}

// 11. RESUME COMMAND
async function getResumeOutput(): Promise<CommandOutput> {
  const resume = await db.getProfileData('resume') as db.ResumeData;
  const url = resume?.url || '/resume.pdf';

  const text = `RESUME DOCUMENT\n===============\nResume PDF URL: ${url}\nOpen in browser or run "resume view" to load.`;
  const html = `
    <div class="mt-2 p-3 border border-border rounded max-w-md bg-bg/50">
      <div class="text-md text-primary font-bold mb-1">Niranjan Sharma - CV</div>
      <div class="text-xs text-foreground mb-3">View or download the current PDF resume document.</div>
      <div class="flex gap-3">
        <a href="${url}" download class="bg-primary text-black font-bold text-xs px-3 py-1.5 rounded hover:bg-opacity-80 transition-colors">
          Download PDF ⤓
        </a>
        <a href="${url}" target="_blank" class="border border-border text-foreground font-bold text-xs px-3 py-1.5 rounded hover:bg-muted/10 transition-colors">
          View in Browser ↗
        </a>
      </div>
    </div>
  `;

  return { text, html };
}

// 12. THEME COMMAND
function setThemeOutput(theme: string): CommandOutput {
  const themes = ['matrix', 'ubuntu', 'cyberpunk', 'hacker', 'retro'];
  if (!theme) {
    return {
      text: `Usage: theme <name>. Supported themes: ${themes.join(', ')}`
    };
  }

  const cleanTheme = theme.toLowerCase().trim();
  if (!themes.includes(cleanTheme)) {
    return {
      text: `Theme "${theme}" is not supported. Supported themes: ${themes.join(', ')}`
    };
  }

  return {
    text: `System theme changed to: "${cleanTheme}"`,
    systemAction: {
      type: 'set_theme',
      payload: cleanTheme
    }
  };
}

// 13. CONTACT COMMAND
function handleContactOutput(args: string[]): CommandOutput {
  let text = 'Starting interactive contact wizard...\n';
  text += 'Type details as prompted to submit message directly to Niranjan\'s database.';

  return {
    text,
    systemAction: {
      type: 'start_wizard',
      payload: 'contact'
    }
  };
}

// 14. ASK COMMAND (AI)
async function handleAskOutput(args: string[]): Promise<CommandOutput> {
  const question = args.join(' ');
  if (!question) {
    return {
      text: 'Usage: ask "<your-question>". Example: ask "What internships has Niranjan completed?"'
    };
  }

  // Trim quotes if user included them
  const cleanedQuestion = question.replace(/^['"]|['"]$/g, '').trim();

  // If in browser client mode, we make an API call to /api/ask
  if (typeof window !== 'undefined') {
    return {
      text: `Searching knowledgebase and querying Gemini for: "${cleanedQuestion}"...`,
      html: `
        <div class="mt-2 text-foreground animate-pulse text-xs flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-accent animate-ping"></span>
          Querying Gemini AI Assistant...
        </div>
      `
    };
  }

  // Server side (fallback simulation)
  return {
    text: `Querying AI assistant for: "${cleanedQuestion}"`
  };
}
