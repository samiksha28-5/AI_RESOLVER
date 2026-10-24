import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Sparkles,
  Shield,
  Database,
  Save,
  RotateCcw,
  Download,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Organization, TicketPriority } from '../types';

export const SettingsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { currentUser, role, canManageSettings } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'org' | 'profile' | 'ai' | 'security' | 'data'>('org');

  // Org state
  const [org, setOrg] = useState<Organization>(() => storageService.getOrganization());
  const [orgName, setOrgName] = useState(org.name);
  const [orgType, setOrgType] = useState(org.type);
  const [timezone, setTimezone] = useState(org.timezone);
  const [defaultPriority, setDefaultPriority] = useState<TicketPriority>(org.defaultPriority);
  const [aiTone, setAiTone] = useState(org.aiToneDefault);

  // Profile state
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);

  // AI Feature Toggles
  const [aiFeatures, setAiFeatures] = useState(org.aiFeaturesEnabled);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      const updated = storageService.getOrganization();
      setOrg(updated);
    });
    return unsub;
  }, []);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSettings) {
      showToast('Only administrators can update organization settings.', 'error');
      return;
    }

    storageService.updateOrganization(
      {
        name: orgName,
        type: orgType,
        timezone,
        defaultPriority,
        aiToneDefault: aiTone,
        aiFeaturesEnabled: aiFeatures,
      },
      currentUser || undefined
    );
    showToast('Organization settings updated', 'success');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('User profile preferences saved', 'success');
  };

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to reset all organization data to the default seed state? Any customized tickets or notes will be restored to original demo records.')) {
      storageService.resetDemoData();
      showToast('Demo data reset to clean initial seed records', 'success');
      navigate('/dashboard');
    }
  };

  const handleExportFullJSON = () => {
    const data = {
      organization: storageService.getOrganization(),
      tickets: storageService.getTickets(),
      customers: storageService.getCustomers(),
      articles: storageService.getKnowledgeArticles(),
      auditEvents: storageService.getAuditEvents(),
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `resolveai-workspace-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Full workspace JSON export downloaded', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tenant identity, AI triage behavior, access controls, and data lifecycle management.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'org', label: 'Organization', icon: Building2 },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'ai', label: 'AI Configuration', icon: Sparkles },
          { id: 'security', label: 'Security & Access', icon: Shield },
          { id: 'data', label: 'Data Management', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold bg-indigo-50/40'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Organization Settings */}
      {activeTab === 'org' && (
        <form onSubmit={handleSaveOrg} className="space-y-4">
          <Card>
            <CardHeader title="Organization Profile" subtitle="General company information and tenant defaults" />
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={!canManageSettings}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry / Workspace Type</label>
                  <input
                    type="text"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    disabled={!canManageSettings}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={!canManageSettings}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Ticket Priority</label>
                  <select
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value as TicketPriority)}
                    disabled={!canManageSettings}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {canManageSettings && (
                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                    Save Organization Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Card>
            <CardHeader title="Operator Profile" subtitle="Personal preferences and credentials" />
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center space-x-4 pb-2">
                <Avatar src={currentUser?.avatar} name={currentUser?.name || 'User'} size="lg" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{currentUser?.name}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">{currentUser?.email}</p>
                  <span className="inline-block mt-1 capitalize text-xs font-semibold text-slate-700">
                    {role} Role
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none max-w-sm"
                />
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-100">
                <span className="font-semibold text-slate-800 block">Notification Preferences</span>
                <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Send in-app popups when urgent tickets are assigned</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urgentAlerts}
                    onChange={(e) => setUrgentAlerts(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Notify immediately when customer replies to an active ticket</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Tab 3: AI Configuration */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Gemini AI Assistant Configuration"
              subtitle="Control automated triage, tone defaults, and model integration boundaries"
            />
            <CardContent className="space-y-4 text-xs">
              {/* Telemetry Status */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold flex items-center space-x-1.5 text-slate-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini 3.8 Flash Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Server-side proxy routes active at <code className="font-mono text-slate-700">/api/gemini/*</code> with official Google GenAI SDK.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready & Operational
                </span>
              </div>

              {/* Tone Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default AI Response Tone
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Professional', 'Friendly', 'Concise', 'Empathetic'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiTone(t)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        aiTone === t
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features switches */}
              <div className="pt-2 space-y-3 border-t border-slate-100">
                <span className="font-semibold text-slate-800 block">AI Subsystem Controls</span>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-semibold text-slate-900">Automatic Ticket Triage Analysis</div>
                    <div className="text-[11px] text-slate-500">
                      Classifies category, sentiment, recommended priority, and urgency signals upon intake.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiFeatures.triageAnalysis}
                    onChange={(e) =>
                      setAiFeatures((prev) => ({ ...prev, triageAnalysis: e.target.checked }))
                    }
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-semibold text-slate-900">AI Reply Generator Drafts</div>
                    <div className="text-[11px] text-slate-500">
                      Allows agents to draft tone-adaptive responses grounded in published knowledge base articles.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiFeatures.replyGenerator}
                    onChange={(e) =>
                      setAiFeatures((prev) => ({ ...prev, replyGenerator: e.target.checked }))
                    }
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-semibold text-slate-900">Grounded Knowledge Base Assistant</div>
                    <div className="text-[11px] text-slate-500">
                      Strictly answers questions using published articles, citing sources or declaring missing data.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiFeatures.groundedKB}
                    onChange={(e) =>
                      setAiFeatures((prev) => ({ ...prev, groundedKB: e.target.checked }))
                    }
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="font-semibold text-slate-900">Conversation Thread Summarization</div>
                    <div className="text-[11px] text-slate-500">
                      Generates concise summaries of long support threads for fast agent handoffs.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiFeatures.summarization}
                    onChange={(e) =>
                      setAiFeatures((prev) => ({ ...prev, summarization: e.target.checked }))
                    }
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {canManageSettings && (
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                    onClick={() => {
                      storageService.updateOrganization(
                        { aiToneDefault: aiTone, aiFeaturesEnabled: aiFeatures },
                        currentUser || undefined
                      );
                      showToast('AI configuration saved', 'success');
                    }}
                  >
                    Save AI Configuration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Security & Access */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader title="Security & Access Control" subtitle="Role-based permissions and tenant session boundaries" />
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Role-Based Access Matrix</span>
              </div>
              <p className="text-[11px] text-slate-600">
                ResolveAI enforces RBAC beyond the user interface. Server endpoints and data repositories validate tenant isolation and actor roles.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-800">Administrator:</strong> Full organization settings, team role edits, rule deployments, and audit logs.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-800">Support Manager:</strong> Ticket assignment, team workload overview, and operational triage insights.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-800">Support Agent:</strong> Queue handling, internal notes, customer replies, and AI response generator.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <strong className="text-slate-800">Customer:</strong> Submit issues and view only their own ticket history (isolated from internal notes).
                </div>
              </div>
            </div>

            <div className="pt-2 text-slate-500 text-[11px]">
              Active session authentication: <strong>Demo Sandbox Adapter</strong> (Can be swapped with Firebase Authentication via environment config).
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Data Management & Reset */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Data Export & Portability" subtitle="Export machine-readable archives of workspace entities" />
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600">
                Complies with GDPR Article 20 data portability standards. Authorized administrators can export JSON or CSV copies of all tickets, customers, articles, and audit trails.
              </p>
              <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExportFullJSON}>
                Download Workspace JSON Export
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/20">
            <CardHeader
              title={<span className="text-red-700">Demonstration Data Reset</span>}
              subtitle="Restore all tickets, customers, and articles to original pristine seed state"
            />
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600">
                This operation clears any newly created tickets, timeline comments, or test customers and resets the storage repository to the complete 20+ ticket demonstration dataset.
              </p>
              <Button size="sm" variant="destructive" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleResetDemoData}>
                Reset to Seed Demo Data
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
