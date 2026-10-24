import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  Sparkles,
  BookOpen,
  Users,
  UserCheck,
  BarChart3,
  SlidersHorizontal,
  History,
  Settings,
  Building2,
  ChevronDown,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  navigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { role, currentUser } = useAuth();
  const org = storageService.getOrganization();
  const tickets = storageService.getTickets();
  const openCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const urgentCount = tickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Tickets',
      path: '/tickets',
      icon: Ticket,
      badge: openCount > 0 ? openCount : undefined,
      badgeUrgent: urgentCount > 0 ? urgentCount : undefined,
    },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'Knowledge Base', path: '/knowledge-base', icon: BookOpen },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Team', path: '/team', icon: UserCheck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Automation Rules', path: '/automation', icon: SlidersHorizontal },
    { label: 'Activity Log', path: '/activity', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => handleNav('/dashboard')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold text-base transition-transform group-hover:scale-105">
            R
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-white tracking-tight">ResolveAI</span>
              <span className="text-[9px] font-semibold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">Customer Operations</p>
          </div>
        </div>

        {/* Organization Switcher */}
        <div
          className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-750 flex items-center justify-between text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => handleNav('/settings')}
        >
          <div className="flex items-center space-x-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate font-medium text-slate-200 text-[11px]">{org.name}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center space-x-1 shrink-0 font-mono">
                {item.badgeUrgent ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.badgeUrgent}
                  </span>
                ) : null}
                {item.badge && !item.badgeUrgent ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold tabular-nums ${
                      isActive ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer / Role indicator */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/95 text-xs">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-750">
          <div className="flex items-center space-x-2 truncate">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-bold text-slate-200 capitalize">{role} Role</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.name}</p>
            </div>
          </div>
          <button
            onClick={() => handleNav('/settings')}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Switch
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen shrink-0 sticky top-0 z-30">{content}</aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
