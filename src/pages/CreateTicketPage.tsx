import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, Check } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TicketCategory, TicketPriority, TicketChannel } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { aiService } from '../services/aiService';

interface CreateTicketPageProps {
  navigate: (path: string) => void;
}

export const CreateTicketPage: React.FC<CreateTicketPageProps> = ({ navigate }) => {
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
    if (!description.trim()) errs.description = 'Detailed description is required.';
    if (!customerName.trim()) errs.customerName = 'Customer name is required.';
    if (!customerEmail.trim() || !customerEmail.includes('@')) errs.customerEmail = 'Valid email is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAIAnalyze = async () => {
    if (!subject.trim() || !description.trim()) {
      setErrors((prev) => ({
        ...prev,
        description: 'Please input subject and description before running AI triage.',
      }));
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await aiService.analyzeTicket({
        subject,
        description,
        customerName,
        category,
        priority,
      });

      setAiTriage(res.analysis);
      if (res.analysis.category) setCategory(res.analysis.category);
      if (res.analysis.recommendedPriority) setPriority(res.analysis.recommendedPriority);

      showToast(
        res.isLiveGemini ? 'Gemini 3.8 Flash analyzed issue intent' : 'AI triage applied',
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
          tags: aiTriage ? ['ai-triaged'] : [],
        },
        currentUser || undefined
      );

      showToast(`Ticket ${newTicket.ticketRef} created successfully`, 'success');
      navigate(`/tickets/${newTicket.ticketRef}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/tickets')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Support Ticket</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a new customer inquiry with automatic routing and AI triage recommendation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Ticket Information" />
          <CardContent className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue (e.g. Cannot connect to SAML SSO provider)"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.subject && <p className="text-[11px] text-red-600 mt-1">{errors.subject}</p>}
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
                  className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze with AI Triage'}</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide complete customer complaint, steps attempted, or relevant logs..."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.description && <p className="text-[11px] text-red-600 mt-1">{errors.description}</p>}
            </div>

            {/* AI Triage Banner */}
            {aiTriage && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-900">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Triage Analysis ({aiTriage.sentiment} Sentiment)</span>
                  </span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-200 font-mono tabular-nums">
                    Confidence: {Math.round(aiTriage.confidenceIndicator * 100)}%
                  </span>
                </div>
                <p className="text-slate-700 text-xs">{aiTriage.shortSummary}</p>
                <div className="text-xs text-slate-800">
                  <strong>Suggested Next Action:</strong> {aiTriage.suggestedNextAction}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader title="Customer Contact Details" />
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Marcus Vance"
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
                placeholder="marcus@aerologistics.com"
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
                placeholder="AeroLogistics Global"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification & Metadata */}
        <Card>
          <CardHeader title="Classification & Routing" />
          <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
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
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
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
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="web">Web Portal</option>
                <option value="email">Email Support</option>
                <option value="chat">Live Chat</option>
                <option value="phone">Phone / Voice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Order / Ref ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-98124"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate('/tickets')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} icon={<Send className="w-3.5 h-3.5" />}>
            Create Ticket
          </Button>
        </div>
      </form>
    </div>
  );
};
