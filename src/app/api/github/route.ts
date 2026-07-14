import { NextResponse } from 'next/server';
import { getProfileData, SocialsData } from '@/lib/db';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  tech: string[];
  updated_at: string;
}

// Simple in-memory cache for GitHub API responses (caches for 10 minutes)
let cache: GitHubRepo[] | null = null;
let lastFetched = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();
  
  if (cache && (now - lastFetched) < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    // 1. Fetch socials dynamically to find GitHub username (fully automated, no hardcoding)
    const socials = await getProfileData('socials') as SocialsData;
    let username = 'niranjansharma'; // Safe default fallback

    if (socials && socials.github) {
      const urlParts = socials.github.replace(/\/$/, '').split('/');
      const parsedUsername = urlParts[urlParts.length - 1];
      if (parsedUsername && parsedUsername !== 'github.com') {
        username = parsedUsername;
      }
    }

    // 2. Query GitHub API
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'NiranjanOS-Portfolio-App'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers,
      next: { revalidate: 600 } // Next.js level caching (10 minutes)
    });

    if (!res.ok) {
      throw new Error(`GitHub responded with status: ${res.status}`);
    }

    const repos = await res.json();
    
    // 3. Format repository details
    const formattedRepos: GitHubRepo[] = (repos as Array<{
      id: number;
      name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
      language: string | null;
      fork: boolean;
      updated_at: string;
    }>)
      .filter((repo) => !repo.fork) // Exclude forks
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
        tech: repo.language ? [repo.language] : ['TypeScript'],
        updated_at: repo.updated_at
      }));

    // Cache results
    cache = formattedRepos;
    lastFetched = now;

    return NextResponse.json(formattedRepos);
  } catch (err) {
    console.error('Failed to fetch repositories from GitHub:', err);
    
    // Return fallback list on errors (e.g. rate limit, offline)
    const fallbackProjects = [
      {
        id: 1,
        name: 'code-orbit',
        description: 'Full-stack collaborative coding platform with Monaco Editor and Judge0 integration.',
        html_url: 'https://github.com/niranjansharma/code-orbit',
        stargazers_count: 14,
        language: 'TypeScript',
        tech: ['React.js', 'Next.js', 'Supabase', 'Monaco API', 'Docker']
      },
      {
        id: 2,
        name: 'library-management',
        description: 'Library management system written in Core Java using HashMap and Binary Search Trees.',
        html_url: 'https://github.com/niranjansharma/library-management',
        stargazers_count: 5,
        language: 'Java',
        tech: ['Java', 'OOP', 'Data Structures']
      },
      {
        id: 3,
        name: 'sudoku-solver',
        description: 'Sudoku solver program written in Java with visual backtracking pathfinding and a Swing GUI.',
        html_url: 'https://github.com/niranjansharma/sudoku-solver',
        stargazers_count: 8,
        language: 'Java',
        tech: ['Java', 'Swing UI', 'Algorithms']
      }
    ];

    return NextResponse.json(fallbackProjects);
  }
}
