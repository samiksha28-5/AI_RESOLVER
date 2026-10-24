import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Building, User, Mail, Lock } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const SignupPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { signup } = useAuth();
  const { showToast } = useNotifications();

  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !name.trim() || !email.trim() || !password.trim()) {
      showToast('All fields are required to register', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, password, orgName);
      showToast('Organization workspace created!', 'success');
      navigate('/onboarding');
    } catch (err) {
      showToast('Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
          R
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create your ResolveAI Account</h2>
        <p className="mt-1 text-xs text-slate-400">
          Launch your AI-assisted support workspace in under 2 minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Cloud Technologies"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Lin"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <Button type="submit" size="md" className="w-full mt-3" loading={isLoading}>
              Continue to Onboarding →
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
