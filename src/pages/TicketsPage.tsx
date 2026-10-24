import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  CheckSquare,
  Square,
  UserCheck,
  Tag,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { storageService } from '../services/storageService';
import { AnalyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types';

interface TicketsPageProps {
  navigate: (path: string) => void;
  initialPriorityFilter?: string;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({ navigate, initialPriorityFilter }) => {
  const { currentUser, role, canAssignTickets, canExportData } = useAuth();
  const { showToast } = useNotifications();

  const [tickets, setTickets] = useState<Ticket[]>(() => storageService.getTickets());
  const [isLoading, setIsLoading] = useState(false);
  const users = storageService.getUsers();

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setTickets(storageService.getTickets());
    });
    return unsubscribe;
  }, []);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriorityFilter || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [filterPreset, setFilterPreset] = useState<string>('all');

  // Multi-select bulk action state
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<TicketStatus | ''>('');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');

  // Sorting and pagination
  const [sortField, setSortField] = useState<keyof Ticket>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Presets handler
  const handleApplyPreset = (preset: string) => {
    setFilterPreset(preset);
    setSelectedTicketIds([]);
    setCurrentPage(1);

    if (preset === 'all') {
      setSelectedStatus('all');
      setSelectedPriority('all');
      setSelectedAssignee('all');
    } else if (preset === 'my_assigned') {
      setSelectedStatus('all');
      setSelectedPriority('all');
      setSelectedAssignee(currentUser?.id || 'all');
    } else if (preset === 'urgent_high') {
      setSelectedStatus('all');
      setSelectedPriority('Urgent');
      setSelectedAssignee('all');
    } else if (preset === 'unassigned') {
      setSelectedStatus('all');
      setSelectedPriority('all');
      setSelectedAssignee('unassigned');
    } else if (preset === 'waiting_customer') {
      setSelectedStatus('Waiting for Customer');
      setSelectedPriority('all');
      setSelectedAssignee('all');
    } else if (preset === 'resolved') {
      setSelectedStatus('Resolved');
      setSelectedPriority('all');
      setSelectedAssignee('all');
    }
  };

  // Filter & Search Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (role === 'customer' && currentUser?.name) {
        if (ticket.customerEmail.toLowerCase() !== currentUser.email.toLowerCase() && ticket.customerName !== currentUser.name) {
          return false;
        }
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = ticket.ticketRef.toLowerCase().includes(q);
        const matchesSub = ticket.subject.toLowerCase().includes(q);
        const matchesCust = ticket.customerName.toLowerCase().includes(q);
        const matchesEmail = ticket.customerEmail.toLowerCase().includes(q);
        if (!matchesRef && !matchesSub && !matchesCust && !matchesEmail) {
          return false;
        }
      }

      if (selectedStatus !== 'all' && ticket.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && ticket.priority !== selectedPriority) return false;
      if (selectedCategory !== 'all' && ticket.category !== selectedCategory) return false;

      if (selectedAssignee !== 'all') {
        if (selectedAssignee === 'unassigned') {
          if (ticket.assignedAgentId) return false;
        } else if (ticket.assignedAgentId !== selectedAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, searchTerm, selectedStatus, selectedPriority, selectedCategory, selectedAssignee, role, currentUser]);

  // Sort
  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined) aVal = '';
      if (bVal === undefined) bVal = '';

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortField, sortDirection]);

  // Paginated items
  const totalPages = Math.ceil(sortedTickets.length / pageSize) || 1;
  const paginatedTickets = sortedTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: keyof Ticket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedTicketIds.length === paginatedTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(paginatedTickets.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusApply = () => {
    if (!bulkStatus || selectedTicketIds.length === 0) return;
    storageService.bulkUpdateTickets(selectedTicketIds, { status: bulkStatus }, currentUser || undefined);
    showToast(`Updated status for ${selectedTicketIds.length} ticket(s)`, 'success');
    setSelectedTicketIds([]);
    setBulkStatus('');
  };

  const handleBulkAssignApply = () => {
    if (!bulkAssignee || selectedTicketIds.length === 0) return;
    storageService.bulkUpdateTickets(
      selectedTicketIds,
      { assignedAgentId: bulkAssignee === 'unassigned' ? undefined : bulkAssignee },
      currentUser || undefined
    );
    showToast(`Updated assignment for ${selectedTicketIds.length} ticket(s)`, 'success');
    setSelectedTicketIds([]);
    setBulkAssignee('');
  };

  const handleExportCSV = () => {
    if (!canExportData) {
      showToast('Exporting data requires Support Manager or Administrator privileges.', 'error');
      return;
    }
    const csv = AnalyticsService.exportTicketsCSV(sortedTickets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resolveai-tickets-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${sortedTickets.length} tickets to CSV`, 'info');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setSelectedAssignee('all');
    setFilterPreset('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedCategory !== 'all' ||
    selectedAssignee !== 'all';

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Support Tickets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming inquiries, triage priorities, and coordinate agent resolutions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {canExportData && (
            <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCSV}>
              Export CSV
            </Button>
          )}
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => navigate('/tickets/new')}>
            New Ticket
          </Button>
        </div>
      </div>

      {/* Preset tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Tickets' },
          { id: 'my_assigned', label: 'My Assigned Queue' },
          { id: 'urgent_high', label: 'Urgent & Critical' },
          { id: 'unassigned', label: 'Unassigned' },
          { id: 'waiting_customer', label: 'Waiting for Customer' },
          { id: 'resolved', label: 'Resolved Archive' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleApplyPreset(tab.id)}
            className={`px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              filterPreset === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold bg-indigo-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, subject, customer..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Select */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setFilterPreset('custom');
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Customer">Waiting for Customer</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Select */}
          <div className="md:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setFilterPreset('custom');
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFilterPreset('custom');
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Billing">Billing</option>
              <option value="Order and Delivery">Order & Delivery</option>
              <option value="Returns and Refunds">Returns & Refunds</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Account Access">Account Access</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Assignee Select */}
          <div className="md:col-span-2">
            <select
              value={selectedAssignee}
              onChange={(e) => {
                setSelectedAssignee(e.target.value);
                setFilterPreset('custom');
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none bg-white"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Indicators & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
            <span>
              Showing <strong className="font-mono text-slate-800">{sortedTickets.length}</strong> of{' '}
              <strong className="font-mono text-slate-800">{tickets.length}</strong> tickets
            </span>
            <button
              onClick={clearAllFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Operations Bar */}
      {selectedTicketIds.length > 0 && canAssignTickets && (
        <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md border border-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <span className="font-bold bg-slate-800 px-2.5 py-1 rounded-md font-mono">
              {selectedTicketIds.length} ticket(s) selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Status */}
            <div className="flex items-center space-x-1">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as TicketStatus)}
                className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="">Change Status...</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Customer">Waiting for Customer</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <Button size="sm" variant="subtle" onClick={handleBulkStatusApply} disabled={!bulkStatus}>
                Apply
              </Button>
            </div>

            {/* Bulk Assign */}
            <div className="flex items-center space-x-1">
              <select
                value={bulkAssignee}
                onChange={(e) => setBulkAssignee(e.target.value)}
                className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
              >
                <option value="">Reassign To...</option>
                <option value="unassigned">Unassign</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <Button size="sm" variant="subtle" onClick={handleBulkAssignApply} disabled={!bulkAssignee}>
                Assign
              </Button>
            </div>

            <button
              onClick={() => setSelectedTicketIds([])}
              className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Ticket Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {canAssignTickets && (
                  <th className="p-3 w-8 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer" aria-label="Select all">
                      {selectedTicketIds.length > 0 && selectedTicketIds.length === paginatedTickets.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                )}
                <th className="p-3.5 cursor-pointer hover:text-slate-800 select-none" onClick={() => toggleSort('ticketRef')}>
                  <div className="flex items-center space-x-1">
                    <span>Reference</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-800 select-none" onClick={() => toggleSort('subject')}>
                  <div className="flex items-center space-x-1">
                    <span>Subject</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-800 select-none" onClick={() => toggleSort('customerName')}>
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-800 select-none" onClick={() => toggleSort('priority')}>
                  <div className="flex items-center space-x-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-800 select-none" onClick={() => toggleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Assignee</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-800 select-none" onClick={() => toggleSort('updatedAt')}>
                  <div className="flex items-center space-x-1">
                    <span>Last Updated</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No tickets match your query</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t) => {
                  const isSelected = selectedTicketIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/tickets/${t.ticketRef}`)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {canAssignTickets && (
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleToggleSelect(t.id)} className="cursor-pointer" aria-label="Select row">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="p-3.5 font-bold text-indigo-600 whitespace-nowrap font-mono">
                        <div className="flex items-center space-x-1">
                          <span>{t.ticketRef}</span>
                          {t.aiAnalysis && (
                            <span title="AI Triaged">
                              <Sparkles className="w-3 h-3 text-violet-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-900 max-w-xs truncate">
                        <div className="truncate font-semibold">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate">{t.description}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{t.customerName}</div>
                        {t.customerCompany && (
                          <div className="text-[11px] text-slate-400">{t.customerCompany}</div>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <CategoryBadge category={t.category} />
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        {t.assignedAgentName ? (
                          <span className="font-medium text-slate-700">{t.assignedAgentName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                        {new Date(t.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="font-mono">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedTickets.length)} of {sortedTickets.length} tickets
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
