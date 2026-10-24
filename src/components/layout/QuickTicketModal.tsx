import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TicketCategory, TicketPriority, TicketChannel } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { aiService } from '../../services/aiService';
import { Sparkles, AlertCircle } from 'lucide-react';

interface QuickTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const QuickTicketModal: React.FC<QuickTicketModalProps> = ({ isOpen, onClose, navigate }) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.role === 'customer' ? currentUser.name : '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.role === 'customer' ? currentUser.email : '');
  const [customerCompany, setCustomerCompany] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Technical Support');
  const [priority, setPriority] = useState<TicketPriority>('Normal');
  const [channel, setChannel] = useState<TicketChannel>('web');
  const [orderId, setOrderId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTriage, setAiTriage] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!subject.trim()) errs.subject = 'Subject is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!customerName.trim()) errs.customerName = 'Customer name is required.';
    if (!customerEmail.trim() || !customerEmail.includes('@')) errs.customerEmail = 'Valid email is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAIAnalyze = async () => {
    if (!subject.trim() || !description.trim()) {
      setErrors((prev) => ({
        ...prev,
        description: 'Provide subject and description first to trigger AI triage.',
      }));
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeTicket({
        subject,
        description,
        customerName,
        category,
        priority,
      });
      setAiTriage(result.analysis);
      if (result.analysis.category) {
        setCategory(result.analysis.category);
      }
      if (result.analysis.recommendedPriority) {
        setPriority(result.analysis.recommendedPriority);
      }
      showToast(
        result.isLiveGemini ? 'Gemini 3.8 Flash analyzed ticket triage' : 'AI triage recommendations applied',
        'info'
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const newTicket = storageService.createTicket(
        {
          subject,
          description,
          customerName,
          customerEmail,
          customerCompany,
          category,
          priority,
          channel,
          orderId,
          tags: aiTriage?.potentialUrgencySignals?.length ? ['ai-triaged'] : [],
        },
        currentUser || undefined
      );

      showToast(`Ticket ${newTicket.ticketRef} created successfully`, 'success');
      onClose();
      navigate(`/tickets/${newTicket.ticketRef}`);

      // Reset fields
      setSubject('');
      setDescription('');
      setAiTriage(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to create ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Support Ticket"
      description="Log a new customer issue with automated reference generation and AI triage."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ticket Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Production 500 error on checkout webhook or Missing invoice"
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {errors.subject && <p className="text-[11px] text-red-600 mt-1">{errors.subject}</p>}
        </div>

        {/* Customer Info row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Elena Rostova"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.customerName && <p className="text-[11px] text-red-600 mt-1">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="elena@novatech.co"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.customerEmail && <p className="text-[11px] text-red-600 mt-1">{errors.customerEmail}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
            <input
              type="text"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              placeholder="NovaTech Solutions"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={isAnalyzing || !description.trim()}
              className="inline-flex items-center space-x-1.5 text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze with AI Triage'}</span>
            </button>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste raw customer inquiry, steps to reproduce, or exception logs..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {errors.description && <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>}
        </div>

        {/* AI Triage Banner if run */}
        {aiTriage && (
          <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center space-x-1 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Triage Recommendation ({aiTriage.sentiment} Sentiment)</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-200 font-mono tabular-nums">
                Confidence: {Math.round(aiTriage.confidenceIndicator * 100)}%
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">{aiTriage.shortSummary}</p>
            <div className="text-[11px] text-slate-700 pt-1">
              <strong>Next Action:</strong> {aiTriage.suggestedNextAction}
            </div>
          </div>
        )}

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="Technical Support">Technical Support</option>
              <option value="Billing">Billing</option>
              <option value="Order and Delivery">Order and Delivery</option>
              <option value="Returns and Refunds">Returns and Refunds</option>
              <option value="Account Access">Account Access</option>
              <option value="Product Inquiry">Product Inquiry</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as TicketChannel)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="web">Web Form</option>
              <option value="email">Email</option>
              <option value="chat">Live Chat</option>
              <option value="phone">Phone / Voice</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-9811"
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
