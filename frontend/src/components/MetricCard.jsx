import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'cyan', change, alert = false }) {
  const colorThemes = {
    cyan: {
      border: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      value: 'text-cyan-400'
    },
    emerald: {
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      value: 'text-emerald-400'
    },
    red: {
      border: 'border-red-500/30',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      value: 'text-red-400'
    },
    purple: {
      border: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
      value: 'text-purple-400'
    },
    amber: {
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      value: 'text-amber-400'
    }
  };

  const theme = colorThemes[color] || colorThemes.cyan;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-900/80 backdrop-blur-md border ${theme.border} ${theme.glow} p-5 transition-all duration-300 hover:border-opacity-60`}>
      {alert && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute transform rotate-45 bg-red-500/20 text-red-400 text-[10px] font-mono font-bold text-center py-0.5 right-[-35px] top-[18px] w-[120px] border-b border-red-500/40">
            ALERT
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 font-mono">{title}</p>
          <h3 className={`mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight ${theme.value}`}>
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg border border-white/5 ${theme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800/80 pt-2.5">
          <span>{subtitle}</span>
          {change && (
            <span className={`font-mono font-semibold ${change.startsWith('+') ? (color === 'red' ? 'text-red-400' : 'text-emerald-400') : 'text-gray-400'}`}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

