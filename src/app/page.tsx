'use client';

import React, { useState, useEffect } from 'react';
import BootScreen from '@/components/BootScreen';
import Terminal from '@/components/Terminal';

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasBooted = sessionStorage.getItem('niranjanos_booted');
      if (hasBooted === 'true') {
        setBooted(true);
      }
      setLoading(false);
    }
  }, []);

  const handleBootComplete = () => {
    setBooted(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('niranjanos_booted', 'true');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-[#00ff66] font-mono p-8">Loading system kernel...</div>;
  }

  if (!booted) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return <Terminal />;
}
