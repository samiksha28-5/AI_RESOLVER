import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, ArrowRight, X } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tickets = storageService.getTickets();
  const customers = storageService.getCustomers();
  const articles = storageService.getKnowledgeArticles();

  const q = query.trim().toLowerCase();

  const matchedTickets = q
    ? tickets.filter(
        (t) =>
          t.ticketRef.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedArticles = q
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 z-10 transition-all">
          {/* Search Input Bar */}
          <div className="flex items-center px-4.5 border-b border-slate-100">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets, customers, articles, or policies (e.g. RES-1042, refund, okta)..."
              className="w-full py-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {!q ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Type a ticket ID, customer name, or policy keyword to search across ResolveAI.
              </div>
            ) : matchedTickets.length === 0 && matchedArticles.length === 0 && matchedCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No matching results found for "{query}".
              </div>
            ) : (
              <>
                {/* Tickets */}
                {matchedTickets.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                      <span>Tickets</span>
                      <span className="font-mono tabular-nums">{matchedTickets.length} found</span>
                    </div>
                    <div className="space-y-1">
                      {matchedTickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelect(`/tickets/${t.ticketRef}`)}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <span className="font-mono tabular-nums text-xs font-semibold text-slate-900 shrink-0">
                              {t.ticketRef}
                            </span>
                            <span className="text-xs font-medium text-slate-900 truncate">{t.subject}</span>
                            <span className="text-[11px] text-slate-400 truncate">({t.customerName})</span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[11px] text-slate-500 font-medium capitalize">
                              {t.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles */}
                {matchedArticles.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                      <span>Knowledge Base</span>
                      <span className="font-mono tabular-nums">{matchedArticles.length} found</span>
                    </div>
                    <div className="space-y-1">
                      {matchedArticles.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => handleSelect(`/knowledge-base/${a.id}`)}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-medium text-slate-900 truncate">{a.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{a.summary}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers */}
                {matchedCustomers.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                      <span>Customers</span>
                      <span className="font-mono tabular-nums">{matchedCustomers.length} found</span>
                    </div>
                    <div className="space-y-1">
                      {matchedCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelect(`/customers/${c.id}`)}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-medium text-slate-900">{c.name}</span>
                              {c.company && (
                                <span className="text-xs text-slate-500 ml-1.5 font-normal">
                                  — {c.company}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums">{c.openTickets} open</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
