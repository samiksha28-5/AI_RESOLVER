import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Phone,
  Plus,
  Edit,
  Save,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { storageService } from '../services/storageService';
import { useNotifications } from '../context/NotificationContext';
import { Customer, Ticket as TicketType } from '../types';

interface CustomerDetailPageProps {
  customerId: string;
  navigate: (path: string) => void;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, navigate }) => {
  const { showToast } = useNotifications();

  const [customer, setCustomer] = useState<Customer | undefined>(() =>
    storageService.getCustomerById(customerId)
  );
  const [customerTickets, setCustomerTickets] = useState<TicketType[]>([]);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      const c = storageService.getCustomerById(customerId);
      if (c) {
        setCustomer(c);
        setNotesText(c.notes || '');
        setCustomerTickets(
          storageService.getTickets().filter((t) => t.customerId === c.id || t.customerEmail === c.email)
        );
      }
    });

    const c = storageService.getCustomerById(customerId);
    if (c) {
      setCustomer(c);
      setNotesText(c.notes || '');
      setCustomerTickets(
        storageService.getTickets().filter((t) => t.customerId === c.id || t.customerEmail === c.email)
      );
    }

    return unsub;
  }, [customerId]);

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Customer Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">No customer record matches ID "{customerId}".</p>
        <Button size="sm" onClick={() => navigate('/customers')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const handleSaveNotes = () => {
    storageService.updateCustomer(customer.id, { notes: notesText });
    setIsEditingNotes(false);
    showToast('Customer account notes updated', 'success');
  };

  const resolvedCount = customerTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </button>

        <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => navigate('/tickets/new')}>
          Create Ticket for Customer
        </Button>
      </div>

      {/* Customer Header Card */}
      <Card>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <Avatar src={customer.avatar} name={customer.name} size="xl" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{customer.company || 'Individual Client'}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center space-x-1 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.email}</span>
                </span>
                {customer.phone && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center space-x-1 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customer.phone}</span>
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="flex items-center space-x-1 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Member since {customer.customerSince}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Mini Stats with Tabular Numerals */}
          <div className="flex items-center space-x-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 text-center self-start sm:self-auto">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Total Tickets</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">{customerTickets.length}</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Open</div>
              <div className="text-lg font-bold text-amber-700 font-mono tabular-nums">{customer.openTickets}</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Resolved</div>
              <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">{resolvedCount}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Notes */}
      <Card>
        <CardHeader
          title="Account Intelligence & Notes"
          subtitle="Operational context, contract tier, and SLA preferences"
          action={
            !isEditingNotes ? (
              <Button size="sm" variant="outline" icon={<Edit className="w-3 h-3" />} onClick={() => setIsEditingNotes(true)}>
                Edit Notes
              </Button>
            ) : (
              <Button size="sm" icon={<Save className="w-3 h-3" />} onClick={handleSaveNotes}>
                Save Notes
              </Button>
            )
          }
        />
        <CardContent>
          {isEditingNotes ? (
            <textarea
              rows={4}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              {customer.notes || 'No private notes logged for this customer account.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ticket History */}
      <Card>
        <CardHeader
          title={`Ticket History (${customerTickets.length})`}
          subtitle="All inquiries, complaints, and requests submitted by this customer"
        />
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {customerTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No tickets have been recorded for this customer yet.
              </div>
            ) : (
              customerTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.ticketRef}`)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="truncate mr-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono tabular-nums text-xs font-semibold text-slate-900">
                        {t.ticketRef}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">{t.subject}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>Assigned to {t.assignedAgentName || 'Unassigned'}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
