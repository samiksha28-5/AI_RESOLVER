import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Shield,
  Ticket,
  BookOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { storageService } from '../services/storageService';
import { AuditEvent } from '../types';

export const ActivityPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [events, setEvents] = useState<AuditEvent[]>(() => storageService.getAuditEvents());
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setEvents(storageService.getAuditEvents());
    });
    return unsub;
  }, []);

  const actionTypes = Array.from(new Set(events.map((e) => e.action)));

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterAction !== 'all' && e.action !== filterAction) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          e.details.toLowerCase().includes(q) ||
          e.actorName.toLowerCase().includes(q) ||
          (e.targetRef && e.targetRef.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, filterAction, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Audit & Activity Log</h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit trail recording state transitions, operator notes, ticket routing, and policy revisions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, ticket ref, or event details..."
            className="w-full text-xs py-1 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Event Actions</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Feed */}
      <Card>
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={<History className="w-6 h-6" />}
            title="No Activity Events Found"
            description={searchTerm ? `No events matched "${searchTerm}".` : 'No audit events recorded yet.'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 text-xs hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5 p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/70 shrink-0">
                    {evt.targetType === 'ticket' ? (
                      <Ticket className="w-4 h-4" />
                    ) : evt.targetType === 'article' ? (
                      <BookOpen className="w-4 h-4" />
                    ) : evt.targetType === 'rule' ? (
                      <SlidersHorizontal className="w-4 h-4" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{evt.action}</span>
                      {evt.targetRef && (
                        <span className="font-mono tabular-nums text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {evt.targetRef}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs">{evt.details}</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 pt-0.5">
                      <span>Actor: <strong className="text-slate-700 font-medium">{evt.actorName}</strong></span>
                      <span>·</span>
                      <span className="capitalize text-slate-500 font-medium">
                        {evt.actorRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 whitespace-nowrap shrink-0 font-mono tabular-nums">
                  <div>{new Date(evt.createdAt).toLocaleDateString()}</div>
                  <div className="text-[10px] text-slate-400">{new Date(evt.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
