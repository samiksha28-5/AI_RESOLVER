import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-xl',
};

// Deterministic subtle pastel colors based on name
const getPalette = (name: string) => {
  const hues = [
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-slate-100 text-slate-700 border-slate-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % hues.length;
  return hues[index];
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className = '' }) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  const palette = getPalette(name);

  if (!src || hasError) {
    return (
      <div
        className={`rounded-full flex items-center justify-center font-bold border select-none shrink-0 ${sizeClasses[size]} ${palette} ${className}`}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover border border-slate-200/80 shrink-0 ${sizeClasses[size]} ${className}`}
    />
  );
};
