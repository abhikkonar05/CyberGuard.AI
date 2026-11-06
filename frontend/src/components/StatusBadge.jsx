import React from 'react';

export default function StatusBadge({ status, category, size = 'md' }) {
  const isAttack = status?.toLowerCase() === 'attack' || (category && !category.toLowerCase().includes('benign'));

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold'
  };

  if (!isAttack) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${sizeClasses[size]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {category || 'BENIGN (NORMAL)'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 text-red-400 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
      {category || 'THREAT DETECTED'}
    </span>
  );
}

