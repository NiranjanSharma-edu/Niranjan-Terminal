'use client';

import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

interface BootLine {
  text: string;
  status: 'idle' | 'loading' | 'success' | 'failed';
  delay: number;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [lines, setLines] = useState<BootLine[]>([
    { text: 'Booting NiranjanOS v1.0.0...', status: 'idle', delay: 200 },
    { text: 'Loading Developer Profile...', status: 'idle', delay: 350 },
    { text: 'Loading Projects Repository...', status: 'idle', delay: 400 },
    { text: 'Loading Work Experience...', status: 'idle', delay: 300 },
    { text: 'Loading Certifications...', status: 'idle', delay: 250 },
    { text: 'Connecting GitHub API...', status: 'idle', delay: 500 },
    { text: 'Initializing Terminal Engine...', status: 'idle', delay: 300 },
    { text: 'System Ready.', status: 'idle', delay: 200 }
  ]);
  
  const [currentLineIdx, setCurrentLineIdx] = useState<number>(-1);
  const [progress, setProgress] = useState<number>(0);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  // BIOS-style hardware logs
  const hardwareLogs = [
    'BIOS Date: 07/12/2026 22:00:00 Ver: 08.00.15',
    'CPU: Intel(R) Core(TM) i9-14900K @ 3.20GHz',
    'Speed: 3200MHz  Count: 24',
    'RAM: 32768MB (DDR5 6000MHz)',
    'Disk 0: NVMe SSD 1024GB (OK)',
    'Network: Intel Ethernet Connection I219-V (DHCP Active)',
    'IP Address: 192.168.1.105 (Subnet: 255.255.255.0)',
    '--------------------------------------------------',
    'GRUB Loading Stage 1.5...',
    'GRUB Loading Stage 2...',
    'Loading Linux 5.15.0-x86_64...',
    'Loading initial ramdisk...'
  ];

  // Stage 1: Fast print hardware logs
  useEffect(() => {
    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < hardwareLogs.length) {
        setSystemLogs(prev => [...prev, hardwareLogs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
        // Start booting system modules
        setCurrentLineIdx(0);
      }
    }, 80);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stage 2: Sequence through OS module booting
  useEffect(() => {
    if (currentLineIdx < 0 || currentLineIdx >= lines.length) return;

    const currentLine = lines[currentLineIdx];
    
    // Update status to loading
    setLines(prev => prev.map((l, idx) => 
      idx === currentLineIdx ? { ...l, status: 'loading' } : l
    ));

    const timeout = setTimeout(() => {
      // Update status to success
      setLines(prev => prev.map((l, idx) => 
        idx === currentLineIdx ? { ...l, status: 'success' } : l
      ));
      
      // Update progress bar
      setProgress(Math.round(((currentLineIdx + 1) / lines.length) * 100));

      if (currentLineIdx + 1 < lines.length) {
        setCurrentLineIdx(currentLineIdx + 1);
      } else {
        // All done
        setIsDone(true);
      }
    }, currentLine.delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLineIdx]);

  // Stage 3: Auto-proceed after full boot
  useEffect(() => {
    if (!isDone) return;

    const finalTimeout = setTimeout(() => {
      onComplete();
    }, 800);

    return () => clearTimeout(finalTimeout);
  }, [isDone, onComplete]);

  return (
    <div className="min-h-screen bg-black text-[#00ff66] font-mono p-4 md:p-8 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Curved Screen CRT Overlay Effects */}
      <div className="crt-overlay"></div>
      <div className="crt-scanlines"></div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full space-y-4">
        {/* BIOS Header */}
        <div className="flex justify-between items-start text-xs border-b border-[#00ff66]/20 pb-2">
          <div>NiranjanOS BIOS v1.0.0</div>
          <div>(C) 2026 Niranjan Sharma</div>
        </div>

        {/* Scrolling logs */}
        <div className="text-xs space-y-1 opacity-80 h-32 md:h-40 overflow-hidden flex flex-col justify-end">
          {systemLogs.map((log, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{log}</div>
          ))}
        </div>

        {/* Boot sequence list */}
        {currentLineIdx >= 0 && (
          <div className="space-y-1.5 font-bold text-sm md:text-base border border-[#00ff66]/10 p-4 rounded bg-[#00ff66]/5 shadow-sm">
            {lines.map((line, idx) => {
              if (idx > currentLineIdx) return null;
              
              return (
                <div key={idx} className="flex justify-between items-center">
                  <span>{line.text}</span>
                  {line.status === 'loading' && (
                    <span className="text-yellow-400 animate-pulse">[ LOAD ]</span>
                  )}
                  {line.status === 'success' && (
                    <span className="text-[#00ff66]">[  OK  ]</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress & Bottom Art */}
      <div className="max-w-4xl mx-auto w-full mt-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span>SYSTEM LOADER:</span>
          <span>{progress}%</span>
        </div>
        
        {/* Retro Progress Bar */}
        <div className="w-full bg-[#00ff66]/10 border border-[#00ff66]/30 h-4 rounded overflow-hidden p-[2px]">
          <div 
            className="bg-[#00ff66] h-full rounded-sm transition-all duration-150 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-center text-[10px] opacity-50 animate-pulse mt-2">
          Press ESC to skip diagnostic test
        </div>
      </div>
    </div>
  );
}
