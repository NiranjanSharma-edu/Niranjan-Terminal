import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ text: 'Error: Question parameter is required.' }, { status: 400 });
    }

    // 1. Gather all profile context dynamically from database (Supabase or LocalStorage fallback)
    const profile = await db.getProfileData('owner_info') as db.ProfileData;
    const about = await db.getProfileData('about') as db.AboutData;
    const education = await db.getProfileData('education') as db.EducationData;
    const skills = await db.getSkills();
    const experiences = await db.getExperiences();
    const certifications = await db.getCertifications();
    const achievements = await db.getAchievements();

    // Format context block for Gemini
    const context = `
    You are an AI assistant built into the terminal shell "NiranjanOS v1.0.0" for Niranjan Sharma.
    Your job is to answer questions from visitors about Niranjan's projects, experience, skills, certifications, and achievements.
    
    Here is Niranjan's official portfolio context:
    - Name: ${profile?.name || 'Niranjan Sharma'}
    - Role: ${profile?.role || 'Computer Science Engineer'}
    - Status: ${profile?.status || 'B.Tech CSE Student (2022-2026)'}
    - Location: ${profile?.location || 'Jaipur, Rajasthan, India'}
    - Bio details: ${(about?.bullets || []).join('; ')}
    
    Education:
    - Degree: ${education?.degree || 'B.Tech Computer Science & Engineering'}
    - University: ${education?.institution || 'Bikaner Technical University'}
    - Grade: CGPA ${education?.gpa || '8.24'}
    
    Skills:
    ${skills.map(s => `- ${s.name} (${s.category}${s.level ? `, Level: ${s.level}` : ''})`).join('\n')}
    
    Experience:
    ${experiences.map(e => `- ${e.company}: ${e.role} (${e.duration_start} - ${e.duration_end}). Responsibilities: ${e.responsibilities.join(', ')}`).join('\n')}
    
    Certifications:
    ${certifications.map(c => `- ${c.name} issued by ${c.issuer} (${c.date})`).join('\n')}
    
    Achievements:
    ${achievements.map(a => `- ${a.title}: ${a.description}`).join('\n')}
    
    Instructions for your response:
    - Act like a terminal shell assistant. Be extremely concise.
    - Format answers using clean markdown/text layout. Avoid long essays.
    - Use HTML terminal tags if helpful, but plain text works great.
    - If the user asks something completely unrelated to Niranjan or his portfolio (e.g. baking recipes), politely decline and suggest asking about Niranjan's skills or projects.
    `;

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Check if Gemini API key exists
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set. Using local semantic fallback.');
      const fallbackAns = getMockAIFallback(question, { profile, skills, experiences, certifications, achievements });
      return NextResponse.json({ text: fallbackAns, html: `<div class="mt-2 text-foreground font-mono leading-relaxed whitespace-pre-wrap">${fallbackAns}</div>` });
    }

    // 3. Invoke Google Gemini 1.5 Flash API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${context}\n\nVisitor Question: "${question}"\n\nProvide your response now:`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned code ${response.status}: ${errorText}`);
    }

    const resJson = await response.json();
    const responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    
    return NextResponse.json({ text: responseText });

  } catch (err) {
    console.error('Gemini Ask Route Error:', err);
    return NextResponse.json(
      { 
        text: 'NiranjanOS-AI: Connection timeout. Ensure your API keys are configured correctly.', 
        html: '<div class="text-error mt-1">Error: Gemini API key missing or connection timeout.</div>' 
      }, 
      { status: 500 }
    );
  }
}

interface FallbackData {
  profile: db.ProfileData | null;
  skills: db.Skill[];
  experiences: db.Experience[];
  certifications: db.Certification[];
  achievements: db.Achievement[];
}

// Client-side rule parsing when API key is missing
function getMockAIFallback(question: string, data: FallbackData): string {
  const q = question.toLowerCase();

  if (q.includes('skill') || q.includes('programming') || q.includes('languages') || q.includes('tech')) {
    const list = data.skills.map((s) => s.name).slice(0, 8).join(', ');
    return `AI Assistant [DEMO MODE]: Niranjan's core technologies include ${list}, and more. Type 'skills' to view his full catalog.`;
  }

  if (q.includes('intern') || q.includes('experience') || q.includes('work') || q.includes('job')) {
    return `AI Assistant [DEMO MODE]: Niranjan has completed two internships:
- Machine Learning & Data Science Intern at FEYNN Labs (June 2025 - August 2025)
- Frontend Development Intern at Bharat Intern (June 2023 - July 2023)
Type 'experience' for detailed responsibilities.`;
  }

  if (q.includes('certif') || q.includes('oci') || q.includes('oracle')) {
    return `AI Assistant [DEMO MODE]: Niranjan has credentials including:
- OCI 2025 Certified AI Foundation Associate
- OCI 2025 Certified AI Vector Search Professional
- Future In Charge: EV & Green Mobility Program
Type 'certifications' to verify links.`;
  }

  if (q.includes('project') || q.includes('code orbit') || q.includes('sudoku') || q.includes('library')) {
    return `AI Assistant [DEMO MODE]: Niranjan's featured projects are:
1. Code Orbit: Full-stack collaborative coding platform.
2. Library Management System: Core Java DS/OOP project.
3. Sudoku Solver: Backtracking search visualizer.
Type 'projects' to fetch the latest GitHub repositories dynamically.`;
  }

  if (q.includes('achieve') || q.includes('scholar') || q.includes('hackerrank')) {
    return `AI Assistant [DEMO MODE]: Niranjan's achievements:
- Reliance Foundation Scholar
- 5-Star Badges in Java and C++ on HackerRank
- Training & Placement Cell Overall Coordinator.`;
  }

  if (q.includes('education') || q.includes('college') || q.includes('university') || q.includes('gpa')) {
    return `AI Assistant [DEMO MODE]: Niranjan is completing a B.Tech in Computer Science & Engineering at Bikaner Technical University. Cumulative CGPA: 8.24. Type 'education' for summary.`;
  }

  if (q.includes('contact') || q.includes('email') || q.includes('linkedin')) {
    return `AI Assistant [DEMO MODE]: You can contact Niranjan via:
- Email: niranjan.sharma.cse@gmail.com
- LinkedIn: linkedin.com/in/niranjansharma
Type 'contact' to start the interactive message submission wizard.`;
  }

  return `AI Assistant [DEMO MODE]: Hello! I am the Gemini assistant running on NiranjanOS.
I can answer questions regarding Niranjan's skills, internships, achievements, education, and repositories.
Try asking: "What certifications does he have?" or "Tell me about Code Orbit."`;
}
