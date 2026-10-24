import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      {icon && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
