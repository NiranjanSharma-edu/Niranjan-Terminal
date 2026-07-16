'use client';

import React, { useState, useEffect, useRef } from 'react';
import { executeCommand, ASCII_BANNER, ASCII_HTML_BANNER, CommandOutput, ProjectItem } from '@/lib/terminalEngine';
import { Terminal as TermIcon, Cpu, HardDrive, Wifi, Volume2, VolumeX, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import * as db from '@/lib/db';

// Synthesize mechanical keyboard typing sound using Web Audio API
function playTypeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Randomized pitch slightly to sound more natural
    osc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

// Synthesize error beep
function playErrorSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

const COMMAND_LIST = [
  'help', 'banner', 'clear', 'about', 'skills', 'projects', 
  'experience', 'education', 'certifications', 'achievements', 
  'socials', 'resume', 'contact', 'whoami', 'pwd', 'date', 
  'theme matrix', 'theme ubuntu', 'theme cyberpunk', 'theme hacker', 'theme retro',
  'ask "'
];

export default function Terminal() {
  const [history, setHistory] = useState<Array<{ command: string; output: CommandOutput }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [theme, setTheme] = useState('default');
  const [isCRT, setIsCRT] = useState(true);
  const [isSound, setIsSound] = useState(true);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  
  // Terminal Contact Wizard State
  const [wizardStep, setWizardStep] = useState<'idle' | 'name' | 'email' | 'message'>('idle');
  const [wizardData, setWizardData] = useState({ name: '', email: '', message: '' });

  // UI state
  const [systemStats, setSystemStats] = useState({ cpu: 12, ram: 42, activeUsers: 1 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Load theme and setup initial banner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('niranjanos_theme') || 'default';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);

      const savedCRT = localStorage.getItem('niranjanos_crt');
      if (savedCRT !== null) {
        setIsCRT(savedCRT === 'true');
      }
      
      const savedSound = localStorage.getItem('niranjanos_sound');
      if (savedSound !== null) {
        setIsSound(savedSound === 'true');
      }

      const savedCmdHistory = localStorage.getItem('niranjanos_cmd_history');
      if (savedCmdHistory) {
        setCommandHistory(JSON.parse(savedCmdHistory));
      }
    }

    // Add welcome banner
    setHistory([{ command: 'banner', output: { text: ASCII_BANNER, html: ASCII_HTML_BANNER } }]);
    
    // Fetch repositories
    fetchRepos();

    // Simulated CPU/RAM dashboard metrics
    const statsInterval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(8 + Math.random() * 15),
        ram: Math.floor(38 + Math.random() * 5),
        activeUsers: Math.floor(1 + Math.random() * 3)
      });
    }, 4000);

    return () => clearInterval(statsInterval);
  }, []);

  // Expose terminal handleCommand globally for clickable HTML items
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).terminalInstance = {
      handleCommand: (cmd: string) => {
        setInputValue(cmd);
        setTimeout(() => {
          triggerSubmit(cmd);
        }, 50);
      }
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).terminalInstance;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, wizardStep, wizardData]);

  // Scroll to bottom whenever history expands
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, wizardStep]);

  // Sync state variables with browser storage
  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('niranjanos_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleCRT = () => {
    const val = !isCRT;
    setIsCRT(val);
    localStorage.setItem('niranjanos_crt', String(val));
  };

  const toggleSound = () => {
    const val = !isSound;
    setIsSound(val);
    localStorage.setItem('niranjanos_sound', String(val));
  };

  // Fetch repositories from API or local fallback
  const fetchRepos = async () => {
    try {
      const res = await fetch('/api/github');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setProjects(data);
          return;
        }
      }
    } catch {
      console.warn('Could not fetch projects from GitHub API, falling back...');
    }
  };

  // Handle Autocomplete (Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Typing sound
    if (isSound && e.key !== 'Enter' && e.key !== 'Tab') {
      playTypeSound();
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (suggestions.length > 0) {
        const nextIdx = (activeSuggestionIdx + 1) % suggestions.length;
        setActiveSuggestionIdx(nextIdx);
        setInputValue(suggestions[nextIdx]);
      } else {
        // Find matching commands
        const matches = COMMAND_LIST.filter(c => c.startsWith(inputValue.toLowerCase()));
        if (matches.length > 0) {
          setSuggestions(matches);
          setActiveSuggestionIdx(0);
          setInputValue(matches[0]);
        } else {
          if (isSound) playErrorSound();
        }
      }
      return;
    }

    // Clear suggestions if typing
    if (e.key !== 'Tab') {
      setSuggestions([]);
    }

    // Command History Navigation (Up/Down Arrows)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx < commandHistory.length) {
        setHistoryIdx(nextIdx);
        setInputValue(commandHistory[commandHistory.length - 1 - nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIdx - 1;
      if (nextIdx >= 0) {
        setHistoryIdx(nextIdx);
        setInputValue(commandHistory[commandHistory.length - 1 - nextIdx]);
      } else {
        setHistoryIdx(-1);
        setInputValue('');
      }
    }
  };

  // Form submission dispatcher
  const triggerSubmit = async (commandToRun: string) => {
    const val = commandToRun.trim();
    if (!val && wizardStep === 'idle') return;

    if (isSound) playTypeSound();

    // Reset history index
    setHistoryIdx(-1);

    // 1. Interactive Contact Wizard Processing
    if (wizardStep !== 'idle') {
      handleWizardInput(val);
      setInputValue('');
      return;
    }

    // Save history
    const updatedHistory = [...commandHistory, val];
    setCommandHistory(updatedHistory);
    localStorage.setItem('niranjanos_cmd_history', JSON.stringify(updatedHistory));

    setInputValue('');

    // Special logic for AI ask command
    if (val.toLowerCase().startsWith('ask ')) {
      // Print local loading message instantly
      const cleanQuestion = val.substring(4).replace(/^['"]|['"]$/g, '').trim();
      setHistory(prev => [
        ...prev,
        {
          command: val,
          output: {
            text: `Querying AI assistant for: "${cleanQuestion}"`,
            html: `
              <div class="mt-2 text-foreground text-xs flex items-center gap-2 font-mono">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Searching profile and generating answer...
              </div>
            `
          }
        }
      ]);

      // Call AI endpoint
      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: cleanQuestion })
        });
        
        if (response.ok) {
          const data = await response.json();
          setHistory(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              command: val,
              output: {
                text: data.text,
                html: `<div class="mt-2 text-foreground leading-relaxed whitespace-pre-wrap border-l border-muted/50 pl-3">${data.html || data.text}</div>`
              }
            };
            return copy;
          });
          return;
        }
      } catch (err) {
        console.error(err);
      }

      // Fallback if AI endpoint failed
      setHistory(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          command: val,
          output: {
            text: 'AI response unavailable. Please verify your GEMINI_API_KEY environment variable configuration.',
            html: '<div class="text-error mt-1">Error: Gemini API key missing or connection timeout.</div>'
          }
        };
        return copy;
      });
      return;
    }

    // Execute standard command
    const output = await executeCommand(val, {
      currentTheme: theme,
      projects,
      currentPath: '/home/niranjan'
    });

    if (output.clear) {
      setHistory([]);
      return;
    }

    // Handle System Actions
    if (output.systemAction) {
      const { type, payload } = output.systemAction;
      if (type === 'set_theme') {
        updateTheme(payload);
      } else if (type === 'start_wizard' && payload === 'contact') {
        setWizardStep('name');
        setHistory(prev => [...prev, { command: val, output }]);
        return;
      }
    }

    setHistory(prev => [...prev, { command: val, output }]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSubmit(inputValue);
  };

  // Interactive step-by-step form state machine
  const handleWizardInput = async (input: string) => {
    const clean = input.trim();

    if (wizardStep === 'name') {
      if (!clean) {
        setHistory(prev => [...prev, { command: '', output: { text: 'Name cannot be empty. Please enter your name: ' } }]);
        return;
      }
      setWizardData(prev => ({ ...prev, name: clean }));
      setWizardStep('email');
      setHistory(prev => [...prev, { command: `Name: ${clean}`, output: { text: 'Enter your email address: ' } }]);
    } 
    
    else if (wizardStep === 'email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clean)) {
        setHistory(prev => [...prev, { command: `Email: ${clean}`, output: { text: 'Invalid email address. Please enter a valid email: ' } }]);
        return;
      }
      setWizardData(prev => ({ ...prev, email: clean }));
      setWizardStep('message');
      setHistory(prev => [...prev, { command: `Email: ${clean}`, output: { text: 'Type your message/feedback: ' } }]);
    } 
    
    else if (wizardStep === 'message') {
      if (!clean) {
        setHistory(prev => [...prev, { command: '', output: { text: 'Message content is empty. Please enter your message: ' } }]);
        return;
      }
      
      const finalMsg = { ...wizardData, message: clean };
      setHistory(prev => [...prev, { command: `Message: ${clean}`, output: { text: 'Submitting message to database...' } }]);
      
      // Perform write
      try {
        await db.submitMessage(finalMsg.name, finalMsg.email, finalMsg.message);
        
        // Trigger confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: theme === 'cyberpunk' ? ['#ff0055', '#00f0ff', '#ffe600'] : ['#4ade80', '#569cd6', '#c586c0']
        });

        setHistory(prev => [
          ...prev, 
          { 
            command: 'System Response', 
            output: { 
              text: 'Message submitted successfully! Thank you for getting in touch, Niranjan will receive it.',
              html: `
                <div class="text-success font-bold mt-1">✔ Message submitted successfully!</div>
                <div class="text-xs text-muted">A record was stored in Supabase/local memory. Thank you for connecting!</div>
              ` 
            } 
          }
        ]);
      } catch {
        setHistory(prev => [...prev, { command: 'Error', output: { text: 'Failed to write message. Please try again later.' } }]);
      }

      // Reset wizard
      setWizardStep('idle');
      setWizardData({ name: '', email: '', message: '' });
    }
  };

  // Keyboard prompts depending on active theme
  const getPromptText = () => {
    if (wizardStep === 'name') return 'Enter your name: ';
    if (wizardStep === 'email') return 'Enter your email: ';
    if (wizardStep === 'message') return 'Type your message: ';

    switch (theme) {
      case 'matrix': return 'guest@matrix:~#';
      case 'ubuntu': return 'niranjan@ubuntu:~$';
      case 'cyberpunk': return 'cyber@neon:~$';
      case 'hacker': return 'root@hacker:~#';
      case 'retro': return 'operator@crt:~$';
      default: return 'visitor@niranjan:~$';
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between select-text cursor-text pb-4 transition-all duration-300"
      onClick={focusInput}
    >
      {/* CRT Display Visual Effects */}
      {isCRT && (
        <>
          <div className="crt-overlay"></div>
          <div className="crt-scanlines animate-flicker"></div>
        </>
      )}

      {/* Terminal Grid Container */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 flex flex-col md:flex-row gap-6">
        
        {/* Terminal console main window */}
        <div className="flex-1 flex flex-col rounded border border-border bg-black/85 panel-glow overflow-hidden min-h-[500px]">
          {/* Header Bar */}
          <div className="bg-border/60 px-4 py-2 border-b border-border flex items-center justify-between select-none">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <TermIcon className="w-3.5 h-3.5 text-primary" />
              <span>niranjan@os-workstation: ~</span>
            </div>
            {/* Control buttons */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error cursor-pointer opacity-85 hover:opacity-100" onClick={() => setHistory([])}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-warning cursor-pointer opacity-85 hover:opacity-100" onClick={() => setInputValue('clear')}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-success cursor-pointer opacity-85 hover:opacity-100" onClick={focusInput}></span>
            </div>
          </div>

          {/* Output log */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[600px] terminal-scroll text-sm space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="space-y-1">
                {/* Don't show command if empty */}
                {item.command && (
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold select-none">{getPromptText()}</span>
                    <span className="text-foreground font-mono">{item.command}</span>
                  </div>
                )}
                {/* HTML render takes priority for beautiful formatting */}
                {item.output.html ? (
                  <div dangerouslySetInnerHTML={{ __html: item.output.html }} />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground select-text opacity-95">{item.output.text}</div>
                )}
              </div>
            ))}

            {/* If in interactive form, display helper */}
            {wizardStep !== 'idle' && (
              <div className="text-xs text-yellow-400 font-bold border border-yellow-400/20 p-2 rounded bg-yellow-400/5 select-none max-w-md animate-pulse">
                [CONTACT FORM ACTIVE] To cancel, refresh the page.
              </div>
            )}

            <div ref={terminalBottomRef} />
          </div>

          {/* Input Prompt Box */}
          <form onSubmit={handleFormSubmit} className="p-4 border-t border-border flex items-center gap-2 select-none">
            <span className="text-secondary font-bold whitespace-nowrap">{getPromptText()}</span>
            <div className="flex-1 flex items-center relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none text-foreground font-mono text-sm caret-transparent select-text"
                autoComplete="off"
                autoFocus
              />
              {/* Fake Blinking Cursor caret */}
              <div 
                className="absolute pointer-events-none caret-blink h-4 w-1" 
                style={{ 
                  left: `${inputValue.length * 8.4}px`, 
                  top: '2px', 
                  maxWidth: '100%',
                  opacity: inputValue.length > 60 ? 0 : 1 // Hide caret on long lines to prevent visual wrap bugs
                }}
              ></div>
            </div>
          </form>
        </div>

        {/* Sidebar System Monitor Dashboard widgets */}
        <div className="w-full md:w-64 space-y-4 select-none">
          {/* Dashboard Header */}
          <div className="border border-border p-4 rounded bg-black/85 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary border-b border-border pb-2">
              <Cpu className="w-4 h-4" />
              <span>SYSTEM DIAGNOSTICS</span>
            </div>
            
            <div className="space-y-3 text-xs">
              {/* CPU status */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>CPU IN-USE:</span>
                  <span className="font-bold">{systemStats.cpu}%</span>
                </div>
                <div className="w-full bg-muted/20 h-1.5 rounded overflow-hidden">
                  <div className="bg-success h-full transition-all duration-500" style={{ width: `${systemStats.cpu * 4}%` }}></div>
                </div>
              </div>

              {/* RAM status */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>MEM UTILIZATION:</span>
                  <span className="font-bold">{systemStats.ram}%</span>
                </div>
                <div className="w-full bg-muted/20 h-1.5 rounded overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${systemStats.ram}%` }}></div>
                </div>
              </div>

              {/* Network connection */}
              <div className="flex items-center justify-between text-[10px] border-t border-border/50 pt-2 mt-2">
                <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-success" /> NETWORK:</span>
                <span className="text-success font-bold">CONNECTED (1Gbps)</span>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-secondary" /> DISK READS:</span>
                <span className="text-foreground">0.05 MB/s</span>
              </div>
            </div>
          </div>

          {/* Quick Control panel widget */}
          <div className="border border-border p-4 rounded bg-black/85 flex flex-col gap-2">
            <div className="text-xs font-bold text-primary border-b border-border pb-2">
              QUICK OPTIONS
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {/* Sound Toggle */}
              <button 
                onClick={toggleSound}
                className="flex items-center justify-center gap-1.5 p-1.5 border border-border rounded hover:bg-muted/10 transition-colors text-[10px] font-bold text-foreground"
              >
                {isSound ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-success" />
                    <span>AUDIO ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-muted" />
                    <span>MUTED</span>
                  </>
                )}
              </button>

              {/* CRT Toggle */}
              <button 
                onClick={toggleCRT}
                className="flex items-center justify-center gap-1.5 p-1.5 border border-border rounded hover:bg-muted/10 transition-colors text-[10px] font-bold text-foreground"
              >
                <Eye className={`w-3.5 h-3.5 ${isCRT ? 'text-success' : 'text-muted'}`} />
                <span>CRT: {isCRT ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            
            {/* Quick Link to Admin Dashboard */}
            <a 
              href="/admin" 
              className="mt-2 text-center border border-dashed border-muted text-muted hover:border-primary hover:text-primary transition-colors py-2 rounded text-[10px] font-bold block"
            >
              ⚙ ACCESS CONTROL DASHBOARD
            </a>
          </div>

          {/* Quick Guide commands help widget */}
          <div className="border border-border p-4 rounded bg-black/85 text-[10px] space-y-2 text-muted leading-relaxed">
            <div className="font-bold text-secondary border-b border-border pb-1">COMMAND REFERENCE</div>
            <div>
              • Type <span className="text-accent">help</span> to view all commands.<br />
              • Type <span className="text-accent">skills</span> to view technical stacks.<br />
              • Type <span className="text-accent">projects</span> to fetch GitHub repos.<br />
              • Type <span className="text-accent">contact</span> to message Niranjan.<br />
              • Type <span className="text-accent">ask &quot;...&quot;</span> for Gemini AI.
            </div>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <footer className="text-center text-[10px] text-muted select-none mt-6">
        NiranjanOS v1.0.0 © 2026. Made with Next.js 15, Supabase & Tailwind.
      </footer>
    </div>
  );
}
