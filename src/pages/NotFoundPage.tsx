import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <div className="py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
        404
      </div>
      <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">
        The route you requested could not be located in ResolveAI.
      </p>
      <div className="pt-2">
        <Button size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
