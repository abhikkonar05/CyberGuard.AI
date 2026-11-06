import React, { useState, useEffect } from 'react';
import { Menu, Bell, ShieldCheck, RefreshCw, Radio } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ onMenuToggle }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pingBackend = async () => {
    setBackendStatus('checking');
    const res = await checkHealth();
    setBackendStatus(res.online ? 'online' : 'offline');
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0D121F]/90 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Left section: mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 text-gray-400 hover:text-white rounded-lg lg:hidden hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-sm font-mono font-semibold tracking-wider text-gray-200 uppercase hidden sm:block">
            SOC Operations Center <span className="text-gray-500 font-normal">| Network Telemetry</span>
          </h2>
        </div>
      </div>

      {/* Right section: System clock, API status badge, alerts */}
      <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs">
        {/* Backend status indicator */}
        <div 
          onClick={pingBackend}
          className={`cursor-pointer px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all ${
            backendStatus === 'online' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : backendStatus === 'offline' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
          }`}
          title="Click to re-check Django API health"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${
            backendStatus === 'online' ? 'bg-emerald-400' : backendStatus === 'offline' ? 'bg-amber-400' : 'bg-gray-400'
          }`} />
          <span className="text-[11px] font-semibold">
            API: {backendStatus.toUpperCase()}
          </span>
          <RefreshCw className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
        </div>

        {/* Kafka stream indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-md">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>KAFKA: READY</span>
        </div>

        {/* Live system clock */}
        <div className="hidden sm:block text-gray-400 bg-gray-900/80 px-2.5 py-1 rounded-md border border-gray-800">
          {currentTime}
        </div>

        {/* System security shield */}
        <div className="p-2 bg-gray-800/60 text-cyan-400 rounded-lg border border-gray-700/60" title="Zero-Database File System Protection">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

