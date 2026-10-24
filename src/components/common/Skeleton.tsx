import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  width?: string;
  height?: string;
}> = ({ className = '', width, height }) => {
  return (
    <div
      style={{ width, height }}
      className={`animate-shimmer rounded-md bg-slate-200/70 ${className}`}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6,
}) => {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex items-center space-x-4 border-b border-slate-100 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center space-x-4 py-2.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const MetricSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
};
