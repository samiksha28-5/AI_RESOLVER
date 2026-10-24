import React, { useState, useEffect } from 'react';
import {
  Download,
  Clock,
  CheckCircle2,
  RotateCcw,
  Smile,
  Info,
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
} from 'recharts';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { storageService } from '../services/storageService';
import { AnalyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Ticket } from '../types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-lg p-3 text-xs text-white min-w-[140px]">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-3 py-0.5">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
            </span>
            <span className="font-mono tabular-nums font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { canExportData } = useAuth();
  const { showToast } = useNotifications();

  const [daysRange, setDaysRange] = useState<number>(30);
  const [tickets, setTickets] = useState<Ticket[]>(() => storageService.getTickets());
  const users = storageService.getUsers();

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setTickets(storageService.getTickets());
    });
    return unsub;
  }, []);

  const metrics = AnalyticsService.calculateMetrics(tickets, daysRange);
  const volumeData = AnalyticsService.getVolumeTrends(tickets, daysRange === 7 ? 7 : daysRange === 30 ? 14 : 20);
  const categoryData = AnalyticsService.getCategoryDistribution(tickets);
  const agentWorkload = AnalyticsService.getAgentWorkloads(tickets, users);

  const handleExportCSV = () => {
    if (!canExportData) {
      showToast('Exporting analytics data requires Manager or Administrator privileges.', 'error');
      return;
    }
    const csv = AnalyticsService.exportTicketsCSV(tickets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resolveai-analytics-report-${daysRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported analytics telemetry report (${daysRange} days)`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Service Quality Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Empirical SLA benchmarks, resolution velocity, team efficiency, and customer satisfaction indices.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Date Range Segmented Controls */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {[
              { label: '7 Days', val: 7 },
              { label: '30 Days', val: 30 },
              { label: '90 Days', val: 90 },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setDaysRange(d.val)}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  daysRange === d.val
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {canExportData && (
            <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCSV}>
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>First-Response Time</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.avgFirstResponseTimeHours} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Target: &lt; 4.0 hrs</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Avg Resolution Time</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.avgResolutionTimeHours} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">{metrics.totalResolvedTickets} cases closed</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Customer Satisfaction</span>
            <Smile className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.csatScore}<span className="text-sm font-normal text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Positive rating ratio</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Ticket Reopened Rate</span>
            <RotateCcw className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.reopenedRatePercent}<span className="text-sm font-normal text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Under 5% target boundary</div>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <Card>
        <CardHeader
          title="Incident Creation vs Resolution Trajectory"
          subtitle={`Aggregated daily metrics across the selected ${daysRange}-day window`}
        />
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="anCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="anResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="created" stroke="#4f46e5" strokeWidth={2} fill="url(#anCreated)" name="Tickets Created" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#anResolved)" name="Tickets Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Row: Categories & Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Volume Distribution by Category" subtitle="Identifies operational friction areas across tickets" />
          <CardContent>
            <div className="h-64 w-full">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Resolution Efficiency */}
        <Card>
          <CardHeader title="Agent Resolution Efficiency" subtitle="Workload distribution and avg resolution velocity" />
          <CardContent className="space-y-3.5">
            {agentWorkload.map((agent) => {
              const totalAgentTickets = agent.resolvedTickets + agent.openTickets;
              const resolveRatio = totalAgentTickets > 0 ? Math.round((agent.resolvedTickets / totalAgentTickets) * 100) : 0;

              return (
                <div key={agent.name} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{agent.name}</span>
                    <span className="text-slate-500 font-normal font-mono tabular-nums text-[11px]">
                      {agent.resolvedTickets} resolved · {agent.openTickets} open
                    </span>
                  </div>

                  {/* Resolution ratio progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${resolveRatio}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Avg Resolution Velocity:</span>
                    <span className="font-mono tabular-nums font-bold text-indigo-700">{agent.avgHours} hours</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Methodology & Documentation Note */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-slate-800 mb-0.5">SLA Calculation Documentation</div>
          <p className="leading-relaxed text-[11px]">
            First-response time is computed as the elapsed duration from initial ticket creation until the first public message recorded by an authorized support agent. Resolution time is calculated from creation to the earliest transition into a qualifying Resolved state. All timestamps adhere to tenant timezone configuration.
          </p>
        </div>
      </div>
    </div>
  );
};
