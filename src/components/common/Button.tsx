import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-2 select-none';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[30px]',
    md: 'text-xs sm:text-sm px-4 py-2 min-h-[36px]',
    lg: 'text-sm px-5 py-2.5 min-h-[42px]',
  };

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs border border-indigo-600/50',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90 active:bg-slate-300',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs hover:border-slate-400 active:bg-slate-100',
    destructive:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-700 active:bg-rose-800',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-transparent',
    subtle:
      'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 active:bg-indigo-200/60',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
