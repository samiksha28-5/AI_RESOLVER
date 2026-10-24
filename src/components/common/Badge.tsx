import React from 'react';
import { TicketPriority, TicketStatus } from '../../types';

export const PriorityBadge: React.FC<{ priority: TicketPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const styles: Record<TicketPriority, { bg: string; dot: string; text: string }> = {
    Urgent: {
      bg: 'bg-rose-50 border-rose-200/80 text-rose-800',
      dot: 'bg-rose-600 ring-rose-400/30',
      text: 'Urgent',
    },
    High: {
      bg: 'bg-amber-50 border-amber-200/80 text-amber-900',
      dot: 'bg-amber-500 ring-amber-400/30',
      text: 'High',
    },
    Normal: {
      bg: 'bg-blue-50 border-blue-200/80 text-blue-900',
      dot: 'bg-blue-500 ring-blue-400/30',
      text: 'Normal',
    },
    Low: {
      bg: 'bg-slate-50 border-slate-200 text-slate-700',
      dot: 'bg-slate-400 ring-slate-300',
      text: 'Low',
    },
  };

  const current = styles[priority] || styles.Normal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ring-2 ${current.dot}`} />
      <span className="tracking-tight">{current.text}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TicketStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<TicketStatus, string> = {
    New: 'bg-sky-50 text-sky-800 border-sky-200/80',
    Open: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    'In Progress': 'bg-purple-50 text-purple-800 border-purple-200/80',
    'Waiting for Customer': 'bg-amber-50 text-amber-800 border-amber-200/80',
    Resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    Closed: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
        styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'
      } ${className}`}
    >
      {status}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string; className?: string }> = ({
  category,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/80 ${className}`}
    >
      {category}
    </span>
  );
};
