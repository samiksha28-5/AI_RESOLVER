import React, { useState } from 'react';
import { Shield, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';

export const LoginPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { loginDemo, loginWithEmail } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      showToast('Signed in successfully', 'success');
      navigate('/dashboard');
    } catch (e) {
      showToast('Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = (role: UserRole) => {
    loginDemo(role);
    showToast(`Signed in as demo ${role}`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
          R
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to ResolveAI</h2>
        <p className="mt-1 text-xs text-slate-400">
          Production-quality AI Customer Support & Issue Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Quick Demo Sign-in Banner */}
          <div className="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-2.5">
            <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>One-Click Portfolio Demo Access</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Select any role persona to test full features and role-based permissions immediately:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoSignIn('admin')}
                className="p-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-left font-medium text-slate-800 hover:bg-indigo-50/40 transition-colors cursor-pointer text-xs"
              >
                <div className="font-bold text-indigo-700">Administrator</div>
                <div className="text-[10px] text-slate-500">Sarah Lin</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('manager')}
                className="p-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-left font-medium text-slate-800 hover:bg-indigo-50/40 transition-colors cursor-pointer text-xs"
              >
                <div className="font-bold text-indigo-700">Support Manager</div>
                <div className="text-[10px] text-slate-500">Alex Rivera</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('agent')}
                className="p-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-left font-medium text-slate-800 hover:bg-indigo-50/40 transition-colors cursor-pointer text-xs"
              >
                <div className="font-bold text-indigo-700">Support Agent</div>
                <div className="text-[10px] text-slate-500">David Chen</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('customer')}
                className="p-2 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-left font-medium text-slate-800 hover:bg-indigo-50/40 transition-colors cursor-pointer text-xs"
              >
                <div className="font-bold text-indigo-700">Customer Portal</div>
                <div className="text-[10px] text-slate-500">Elena Rostova</div>
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold text-[10px]">Or with email credentials</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.lin@resolveai.io"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <Button type="submit" size="md" className="w-full mt-2" loading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a workspace yet?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
