import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { storageService } from '../services/storageService';
import { AnalyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Customer } from '../types';

export const CustomersPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { canExportData } = useAuth();
  const { showToast } = useNotifications();

  const [customers, setCustomers] = useState<Customer[]>(() => storageService.getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New customer form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCustomers(storageService.getCustomers());
    });
    return unsubscribe;
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const q = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q))
    );
  }, [customers, searchTerm]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    const created = storageService.createCustomer({
      name,
      email,
      phone,
      company,
      notes,
    });

    showToast(`Customer record created for ${created.name}`, 'success');
    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setNotes('');
  };

  const handleExportCSV = () => {
    const csv = AnalyticsService.exportCustomersCSV(filteredCustomers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resolveai-customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredCustomers.length} customers to CSV`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Accounts, organizational relationships, lifetime support volume, and active inquiries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canExportData && (
            <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExportCSV}>
              Export CSV
            </Button>
          )}
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsModalOpen(true)}>
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex items-center space-x-2 text-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by customer name, email address, or company..."
          className="w-full text-xs py-1 focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No Customers Found"
            description={searchTerm ? `No matching accounts for "${searchTerm}".` : 'No customer records found.'}
            actionText="Add New Customer"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Contact Email</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Since</th>
                  <th className="p-3.5 text-right">Total Cases</th>
                  <th className="p-3.5 text-right">Open Cases</th>
                  <th className="p-3.5">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => navigate(`/customers/${cust.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <Avatar src={cust.avatar} name={cust.name} size="sm" />
                        <span>{cust.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 whitespace-nowrap font-mono text-[11px]">{cust.email}</td>
                    <td className="p-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {cust.company || '—'}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap font-mono tabular-nums">{cust.phone || '—'}</td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap font-mono tabular-nums">{cust.customerSince}</td>
                    <td className="p-3.5 text-right font-mono tabular-nums text-slate-800 font-semibold">{cust.totalTickets}</td>
                    <td className="p-3.5 text-right font-mono tabular-nums">
                      <span
                        className={`font-semibold ${
                          cust.openTickets > 0 ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      >
                        {cust.openTickets}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">{cust.lastInteraction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Customer"
        description="Add a customer profile to track tickets and enterprise accounts."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Hayes"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. j.hayes@company.com"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enterprise Inc."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Account Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contract tier, special requirements, or SLA expectations..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
