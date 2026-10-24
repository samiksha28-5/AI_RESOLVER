import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  CheckCheck,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Sparkles,
  ChevronRight,
  Inbox,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { Avatar } from '../common/Avatar';

interface HeaderProps {
  pageTitle: string;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenQuickTicket: () => void;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenQuickTicket,
  navigate,
}) => {
  const { currentUser, role, loginDemo, logout, isDemoUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const roles: { label: string; role: UserRole; desc: string }[] = [
    { label: 'Administrator', role: 'admin', desc: 'Sarah Lin — Full workspace & settings access' },
    { label: 'Support Manager', role: 'manager', desc: 'Alex Rivera — Team workload & triage analytics' },
    { label: 'Support Agent', role: 'agent', desc: 'David Chen — Ticket handling & AI replies' },
    { label: 'Customer Portal', role: 'customer', desc: 'Elena Rostova — Submit & track personal tickets' },
  ];

  const displayedNotifications = notifFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <header className="sticky top-0 z-20 h-15 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Contextual Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span className="hidden sm:inline-block font-semibold text-slate-800">ResolveAI</span>
          <span className="hidden sm:inline-block text-slate-300">/</span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-500 text-xs transition-colors cursor-pointer"
          title="Search (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline-block font-normal">Search tickets, articles...</span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick Ticket Action */}
        <button
          onClick={onOpenQuickTicket}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline-block">New Ticket</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Segmented Filter */}
              <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100 flex items-center space-x-1 text-[11px]">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    notifFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    notifFilter === 'unread' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {displayedNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <Inbox className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span>No notifications to show.</span>
                  </div>
                ) : (
                  displayedNotifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        setShowNotifications(false);
                        navigate(n.link);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-800 truncate mr-2">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.createdAt}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{n.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Role Switcher Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1 pl-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <Avatar src={currentUser?.avatar} name={currentUser?.name || 'User'} size="sm" />
            <div className="hidden sm:block text-left text-xs">
              <span className="font-semibold text-slate-800 block truncate max-w-[100px]">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium capitalize block">{role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-1.5 flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-tight">
                    {role}
                  </span>
                  {isDemoUser && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                      Demo Session
                    </span>
                  )}
                </div>
              </div>

              {/* Fast Role Switcher */}
              <div className="p-2 border-b border-slate-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Persona
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      loginDemo(r.role);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      role === r.role ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc.split('—')[0]}</div>
                    </div>
                    {role === r.role && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Workspace Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
