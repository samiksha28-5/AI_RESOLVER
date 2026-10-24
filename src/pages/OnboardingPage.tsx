import React, { useState } from 'react';
import {
  Building2,
  FolderTree,
  UserPlus,
  BookOpen,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const OnboardingPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { setCompletedOnboarding, currentUser } = useAuth();
  const { showToast } = useNotifications();

  const org = storageService.getOrganization();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState(org.name || 'Acme Cloud Technologies');
  const [orgType, setOrgType] = useState(org.type || 'SaaS & Enterprise Services');
  const [timezone, setTimezone] = useState(org.timezone || 'America/Los_Angeles (PST)');
  const [categories, setCategories] = useState<string[]>([...org.supportCategories]);
  const [newCatInput, setNewCatInput] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      storageService.updateOrganization({
        name: orgName,
        type: orgType,
        timezone,
        supportCategories: categories,
      });
      setCompletedOnboarding(true);
      showToast('Onboarding completed! Welcome to ResolveAI.', 'success');
      navigate('/dashboard');
    }
  };

  const handleAddCategory = () => {
    if (newCatInput.trim() && !categories.includes(newCatInput.trim())) {
      setCategories([...categories, newCatInput.trim()]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Step Indicator */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'Workspace Identity'}
              {step === 2 && 'Industry Classification'}
              {step === 3 && 'Support Categories'}
              {step === 4 && 'Team Members'}
              {step === 5 && 'Knowledge Base Import'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Content per Step */}
        <Card className="shadow-lg border-slate-200">
          {/* Step 1: Organization Name & Timezone */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Configure Your Organization</h2>
                  <p className="text-xs text-slate-500">Set up the tenant identifier and operational timezone.</p>
                </div>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Acme Cloud Technologies"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="America/Los_Angeles (PST)">America/Los Angeles (PST / UTC-8)</option>
                    <option value="America/New_York (EST)">America/New York (EST / UTC-5)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT / UTC+0)</option>
                    <option value="Europe/Paris (CET)">Europe/Paris (CET / UTC+1)</option>
                    <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT / UTC+8)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Organization Type */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Choose Workspace Type</h2>
                  <p className="text-xs text-slate-500">This fine-tunes AI triage prompt behavior and category weighting.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { title: 'SaaS & Enterprise Services', desc: 'Software platforms, APIs, SSO, and subscription billing' },
                  { title: 'E-commerce & Retail', desc: 'Physical orders, shipping transit, tracking, and returns' },
                  { title: 'Higher Education & Academy', desc: 'Student enrollment, LMS authentication, and faculty requests' },
                  { title: 'Professional & Agency Services', desc: 'Client ticketing, project milestones, and contract SLAs' },
                ].map((type) => (
                  <div
                    key={type.title}
                    onClick={() => setOrgType(type.title)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      orgType === type.title
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{type.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{type.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Categories */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Support Categories</h2>
                  <p className="text-xs text-slate-500">Configure routing buckets used for classification and automation.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Add category (e.g. VIP Enterprise)..."
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                  <Button size="sm" type="button" onClick={handleAddCategory}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Team Invite */}
          {step === 4 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add Team Members</h2>
                  <p className="text-xs text-slate-500">Invite initial operators or proceed with pre-configured demo team.</p>
                </div>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Colleague Work Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                  Tip: 4 demo agents (Sarah Lin, Alex Rivera, David Chen, Maya Patel) are already seeded for your exploration.
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Knowledge Base Seed */}
          {step === 5 && (
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Authoritative Knowledge Base</h2>
                  <p className="text-xs text-slate-500">8 sample operational policies have been initialized for grounded AI Q&A.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-700">
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Refund & Return Guidelines (30-day SLA window) loaded</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>API Authentication & 120 req/min rate limit troubleshooting loaded</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>SSO SAML 2.0 configuration guide loaded</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
            {step > 1 ? (
              <Button size="sm" variant="outline" icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} onClick={handleNext}>
              {step === 5 ? 'Open Workspace Dashboard' : 'Next Step'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
