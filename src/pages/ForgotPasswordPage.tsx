import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ForgotPasswordPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
          R
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your registered email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Check Your Inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We have dispatched password reset instructions to <strong>{email}</strong>. Follow the link in the message to select a new password.
              </p>
              <div className="pt-4">
                <Button size="sm" variant="outline" onClick={() => navigate('/login')}>
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <Button type="submit" size="md" className="w-full">
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
