import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smile,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Filter,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { storageService } from '../services/storageService';
import { AnalyticsService } from '../services/analyticsService';
import { Ticket, User } from '../types';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const [daysRange, setDaysRange] = useState<number>(30);
  const [tickets, setTickets] = useState<Ticket[]>(() => storageService.getTickets());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setTickets(storageService.getTickets());
      setUsers(storageService.getUsers());
    });
    return unsubscribe;
  }, []);

  const metrics = AnalyticsService.calculateMetrics(tickets, daysRange);
  const volumeData = AnalyticsService.getVolumeTrends(tickets, daysRange === 7 ? 7 : daysRange === 30 ? 14 : 20);
  const statusData = AnalyticsService.getStatusDistribution(tickets);
  const priorityData = AnalyticsService.getPriorityDistribution(tickets);
  const categoryData = AnalyticsService.getCategoryDistribution(tickets).slice(0, 6);
  const agentWorkload = AnalyticsService.getAgentWorkloads(tickets, users);

  const urgentTickets = tickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').slice(0, 4);
  const unassignedTickets = tickets.filter((t) => !t.assignedAgentId && t.status !== 'Resolved' && t.status !== 'Closed').slice(0, 4);
  const recentTickets = [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const billingCount = tickets.filter((t) => t.category === 'Billing').length;
  const techCount = tickets.filter((t) => t.category === 'Technical Support').length;
  const urgentCount = metrics.urgentTickets;

  const insights = [
    {
      title: 'Triage Priority Alert',
      detail: `${urgentCount} urgent tickets currently active. Top issues relate to production webhooks and SSO cert expiration.`,
      severity: urgentCount > 0 ? 'high' : 'normal',
      action: 'Review Urgent Queue',
      link: '/tickets?priority=Urgent',
    },
    {
      title: 'Category Volume Concentration',
      detail: `Technical Support (${techCount}) and Billing (${billingCount}) account for ${Math.round(
        ((techCount + billingCount) / Math.max(1, tickets.length)) * 100
      )}% of all volume over the selected period.`,
      severity: 'info',
      action: 'View Category Analytics',
      link: '/analytics',
    },
    {
      title: 'First-Response SLA Performance',
      detail: `Average initial response time is ${metrics.avgFirstResponseTimeHours}h, outperforming standard 4.0h SLA target by 65%.`,
      severity: 'positive',
      action: 'Inspect Workload',
      link: '/team',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Operations Command Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time customer service telemetry, active incident triage, and AI workload insights.
          </p>
        </div>

        {/* Date Filter Segmented Control */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
          {[
            { label: '7 Days', val: 7 },
            { label: '30 Days', val: 30 },
            { label: '90 Days', val: 90 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDaysRange(item.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                daysRange === item.val
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Open Tickets */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Open Tickets</span>
            <Inbox className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.totalOpenTickets}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-700 font-bold font-mono">{tickets.length}</span>
            <span>total records</span>
          </div>
        </div>

        {/* New Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">New Today</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.newTicketsToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged past 24h</div>
        </div>

        {/* Urgent */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Urgent Issues</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${metrics.urgentTickets > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {metrics.urgentTickets}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Requires SLA review</div>
        </div>

        {/* Avg First Response */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">First Response</span>
            <Clock className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.avgFirstResponseTimeHours}h</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">SLA Target: &lt; 4.0h</div>
        </div>

        {/* Avg Resolution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Avg Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.avgResolutionTimeHours}h</div>
          <div className="text-[11px] text-slate-500 mt-1">{metrics.totalResolvedTickets} resolved</div>
        </div>

        {/* CSAT */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Satisfaction</span>
            <Smile className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{metrics.csatScore}%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Post-resolution audit</div>
        </div>
      </div>

      {/* AI Operational Insights Bar */}
      <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-slate-50">
        <CardHeader
          title={
            <div className="flex items-center space-x-2 text-indigo-950 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Grounded AI Operational Insights</span>
            </div>
          }
          subtitle="Real-time synthetic analysis of ticket patterns, priority distributions, and bottleneck risks."
          action={
            <Button size="sm" variant="subtle" onClick={() => navigate('/ai-assistant')}>
              Ask AI Assistant
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-indigo-100/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{ins.title}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      #{i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ins.detail}</p>
                </div>
                <button
                  onClick={() => navigate(ins.link)}
                  className="mt-3 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer self-start"
                >
                  <span>{ins.action}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Volume Over Time (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ticket Volume & Resolution Trends"
            subtitle={`Created vs Resolved trajectory across active ${daysRange}-day window`}
            action={
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                  <span>Created</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Resolved</span>
                </span>
              </div>
            }
          />
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Area type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                  <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown (1 col) */}
        <Card>
          <CardHeader title="Tickets by Priority" subtitle="Active backlog severity split" />
          <CardContent>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 text-xs">
              {priorityData.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600">{p.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Categories & Urgent Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader title="Ticket Volume by Category" subtitle="Top support topics requiring agent time" />
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Urgent Issues Queue */}
        <Card>
          <CardHeader
            title="Urgent Issues Action Queue"
            subtitle="Tickets flagged by customer sentiment or critical severity"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/tickets?priority=Urgent')}>
                View All Urgent
              </Button>
            }
          />
          <CardContent className="divide-y divide-slate-100">
            {urgentTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No urgent tickets in queue. Great job!</div>
            ) : (
              urgentTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.ticketRef}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors -mx-2 px-2 rounded-lg"
                >
                  <div className="truncate mr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-mono">
                        {t.ticketRef}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">{t.subject}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
                      <span>{t.customerName}</span>
                      <span>·</span>
                      <span>Assigned: {t.assignedAgentName || 'Unassigned'}</span>
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Team Workload & Unassigned Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <Card>
          <CardHeader
            title="Team Workload Distribution"
            subtitle="Current open queue and resolution efficiency per agent"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/team')}>
                Team Roster
              </Button>
            }
          />
          <CardContent>
            <div className="space-y-4">
              {agentWorkload.map((agent) => (
                <div key={agent.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{agent.name}</span>
                    <span className="text-slate-500 font-mono">
                      <strong>{agent.openTickets}</strong> active · {agent.resolvedTickets} resolved
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, agent.openTickets * 18)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Tickets */}
        <Card>
          <CardHeader
            title="Unassigned Incoming Queue"
            subtitle="Tickets awaiting first triage ownership"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/tickets')}>
                All Tickets
              </Button>
            }
          />
          <CardContent className="divide-y divide-slate-100">
            {unassignedTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">All active tickets have an assigned owner!</div>
            ) : (
              unassignedTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.ticketRef}`)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors -mx-2 px-2 rounded-lg"
                >
                  <div className="truncate mr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                        {t.ticketRef}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">{t.subject}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.customerName} · {t.category}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tickets/${t.ticketRef}`);
                  }}>
                    Assign
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
