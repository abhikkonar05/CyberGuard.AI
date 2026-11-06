import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Sliders, 
  UploadCloud, 
  Radio, 
  History, 
  Cpu, 
  Info, 
  HelpCircle,
  Activity,
  Terminal
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navItems = [
    { name: 'Dashboard Overview', path: '/', icon: LayoutDashboard },
    { name: 'Manual Traffic Test', path: '/manual-test', icon: Sliders },
    { name: 'CSV File Upload', path: '/csv-upload', icon: UploadCloud },
    { name: 'Real-Time Streaming', path: '/realtime-monitor', icon: Radio },
    { name: 'Detection History', path: '/predictions', icon: History },
    { name: 'Model Performance', path: '/model-training', icon: Cpu },
    { name: 'Model Information', path: '/model-info', icon: Info },
    { name: 'About Project', path: '/about', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0D121F] border-r border-gray-800/80 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800/80 bg-gray-950/40">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider text-white flex items-center gap-1.5">
              CYBER<span className="text-cyan-400">GUARD</span>
            </h1>
            <p className="text-[10px] font-mono text-gray-400 tracking-wider">AI IDS v2.0 • ZERO-DB</p>
          </div>
        </div>

        {/* Live system status badge */}
        <div className="px-4 py-3 mx-3 my-3 bg-gray-900/60 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ENGINE
            </span>
            <span className="text-emerald-400 font-mono font-semibold">PySpark MLlib</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>STORAGE</span>
            <span className="text-cyan-400 font-medium">JSON / CSV File Store</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom environment badge */}
        <div className="p-4 border-t border-gray-800/80 bg-gray-950/60 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-gray-300">CSE-CIC-IDS2018</span>
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            Model: Random Forest (26 feats)
          </div>
        </div>
      </aside>
    </>
  );
}

