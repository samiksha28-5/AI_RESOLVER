import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Clock,
  Sparkles,
  Lock,
  Send,
  CheckCircle,
  Copy,
  RefreshCw,
  Tag,
  BookOpen,
  History,
  AlertCircle,
  Building,
  Mail,
  Phone,
  FileText,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Ticket, TicketMessage, TicketStatus, TicketPriority, KnowledgeArticle } from '../types';

interface TicketDetailPageProps {
  ticketId: string;
  navigate: (path: string) => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ ticketId, navigate }) => {
  const { currentUser, role, canAssignTickets } = useAuth();
  const { showToast } = useNotifications();

  const [ticket, setTicket] = useState<Ticket | undefined>(() => storageService.getTicketById(ticketId));
  const [messages, setMessages] = useState<TicketMessage[]>(() =>
    ticket ? storageService.getMessagesForTicket(ticket.ticketRef) : []
  );
  const users = storageService.getUsers();
  const articles = storageService.getKnowledgeArticles();
  const [customer, setCustomer] = useState(() => (ticket ? storageService.getCustomerById(ticket.customerId) : undefined));

  // Reply & Note drafting state
  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply');
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // AI Reply Generator state
  const [selectedTone, setSelectedTone] = useState<'Professional' | 'Friendly' | 'Concise' | 'Empathetic'>('Professional');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiDraftTelemetry, setAiDraftTelemetry] = useState<{ isLive: boolean } | null>(null);

  // AI Triage Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Conversation Summarization state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [convoSummary, setConvoSummary] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      const updated = storageService.getTicketById(ticketId);
      if (updated) {
        setTicket(updated);
        setMessages(storageService.getMessagesForTicket(updated.ticketRef));
        setCustomer(storageService.getCustomerById(updated.customerId));
      }
    });
    return unsubscribe;
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Ticket Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          The requested reference "{ticketId}" could not be located in this organization workspace.
        </p>
        <Button size="sm" onClick={() => navigate('/tickets')}>
          Return to Tickets
        </Button>
      </div>
    );
  }

  // Related knowledge base articles (keyword match)
  const relatedArticles = articles
    .filter(
      (a) =>
        a.status === 'Published' &&
        (a.category === ticket.category ||
          ticket.subject.toLowerCase().includes(a.category.toLowerCase()) ||
          a.tags.some((tag) => ticket.description.toLowerCase().includes(tag.toLowerCase())))
    )
    .slice(0, 3);

  // Related audit events
  const ticketAuditEvents = storageService
    .getAuditEvents()
    .filter((e) => e.targetId === ticket.id || e.targetRef === ticket.ticketRef)
    .slice(0, 6);

  // Handlers
  const handleStatusChange = (newStatus: TicketStatus) => {
    storageService.updateTicket(ticket.id, { status: newStatus }, currentUser || undefined);
    showToast(`Status updated to ${newStatus}`, 'info');
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    storageService.updateTicket(ticket.id, { priority: newPriority }, currentUser || undefined);
    showToast(`Priority updated to ${newPriority}`, 'info');
  };

  const handleAssigneeChange = (agentId: string) => {
    storageService.updateTicket(
      ticket.id,
      { assignedAgentId: agentId === 'unassigned' ? undefined : agentId },
      currentUser || undefined
    );
    showToast('Ticket assignment updated', 'info');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSending(true);
    try {
      storageService.addMessage(
        ticket.id,
        {
          type: activeTab === 'note' ? 'note' : 'public',
          content: replyContent,
        },
        currentUser || {
          id: 'user_anonymous',
          name: 'Support Agent',
          email: 'agent@resolveai.io',
          avatar: '',
          role: 'agent',
          status: 'active',
        }
      );

      setReplyContent('');
      setAiDraft('');
      showToast(
        activeTab === 'note' ? 'Internal note added (hidden from customer)' : 'Public reply recorded',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Feature A: Run Live AI Analysis
  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await aiService.analyzeTicket({
        subject: ticket.subject,
        description: ticket.description,
        customerName: ticket.customerName,
        category: ticket.category,
        priority: ticket.priority,
      });

      storageService.updateTicket(ticket.id, { aiAnalysis: res.analysis }, currentUser || undefined);
      showToast(
        res.isLiveGemini ? 'Gemini 3.8 Flash triage analysis completed' : 'AI analysis updated',
        'info'
      );
    } catch (err) {
      showToast('AI analysis failed. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Feature B: AI Reply Generator
  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const res = await aiService.generateReply({
        ticketContext: {
          ticketRef: ticket.ticketRef,
          subject: ticket.subject,
          description: ticket.description,
          customerName: ticket.customerName,
        },
        tone: selectedTone,
        knowledgeArticles: relatedArticles,
        agentName: currentUser?.name || 'ResolveAI Support',
      });

      setAiDraft(res.draft);
      setAiDraftTelemetry({ isLive: res.isLiveGemini });
      setActiveTab('reply');
      showToast(
        res.isLiveGemini ? `Gemini generated ${selectedTone} draft` : `${selectedTone} draft generated`,
        'info'
      );
    } catch (err) {
      showToast('Failed to generate draft', 'error');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Feature D: Conversation Summarization
  const handleSummarizeThread = async () => {
    setIsSummarizing(true);
    try {
      const res = await aiService.summarizeTicket(messages, ticket.subject);
      setConvoSummary(res.summary);
      showToast('Conversation thread summarized', 'info');
    } catch (err) {
      showToast('Failed to summarize conversation', 'error');
    } finally {
      setIsSummarizing(false);
    }
  };

  const copyDraftToComposer = () => {
    setReplyContent(aiDraft);
    showToast('Copied draft to response composer', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/tickets')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Back to tickets list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 font-mono">
                {ticket.ticketRef}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-md sm:max-w-xl">
                {ticket.subject}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Logged on {new Date(ticket.createdAt).toLocaleString()} via {ticket.channel} channel
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center space-x-2">
          {ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
            <Button
              size="sm"
              variant="outline"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => handleStatusChange('Open')}
            >
              Reopen Ticket
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => handleStatusChange('Resolved')}
            >
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Timeline / Right Meta Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Conversation Thread & Composer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Conversation Timeline */}
          <Card>
            <CardHeader
              title="Conversation Timeline"
              subtitle={`${messages.length} message(s) recorded in thread`}
              action={
                messages.length > 2 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    onClick={handleSummarizeThread}
                    loading={isSummarizing}
                  >
                    Summarize Thread
                  </Button>
                )
              }
            />

            {/* Conversation Summary Box if generated */}
            {convoSummary && (
              <div className="m-5 mb-0 p-4 rounded-xl bg-violet-50/70 border border-violet-200 text-xs text-violet-950 space-y-2">
                <div className="flex items-center justify-between font-bold text-violet-900">
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span>AI Conversation Summary</span>
                  </span>
                  <button onClick={() => setConvoSummary(null)} className="text-[11px] text-violet-600 hover:text-violet-800 cursor-pointer">
                    Dismiss
                  </button>
                </div>
                <div>
                  <strong>Core Issue:</strong> {convoSummary.mainIssue}
                </div>
                <div>
                  <strong>Recommended Next Step:</strong> {convoSummary.recommendedNextStep}
                </div>
              </div>
            )}

            <CardContent className="space-y-4 pt-4">
              {messages.map((m) => {
                const isInternalNote = m.type === 'note';
                const isCustomer = m.senderRole === 'customer';

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border text-xs transition-colors ${
                      isInternalNote
                        ? 'bg-amber-50/60 border-amber-200/90 text-amber-950'
                        : isCustomer
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-indigo-50/30 border-indigo-100 text-slate-800'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {m.senderAvatar ? (
                          <img src={m.senderAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {m.senderName[0]}
                          </div>
                        )}
                        <span className="font-bold text-slate-900">{m.senderName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold tracking-tight ${
                            isInternalNote
                              ? 'bg-amber-200 text-amber-900'
                              : isCustomer
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isInternalNote ? 'INTERNAL NOTE' : m.senderRole}
                        </span>
                        {isInternalNote && (
                          <span className="flex items-center space-x-1 text-[10px] text-amber-800 font-medium">
                            <Lock className="w-3 h-3" />
                            <span>Hidden from customer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700 pl-8">
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Reply Generator Box */}
          <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/30 to-slate-50">
            <CardHeader
              title={
                <div className="flex items-center space-x-2 text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Reply Generator</span>
                </div>
              }
              subtitle="Draft policy-grounded customer replies powered by Gemini 3.8 Flash."
            />
            <CardContent className="space-y-3">
              {/* Tone Selection Segmented Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 px-2">Tone:</span>
                  {(['Professional', 'Friendly', 'Concise', 'Empathetic'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTone(t)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        selectedTone === t
                          ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={handleGenerateReply}
                  loading={isGeneratingReply}
                >
                  {aiDraft ? 'Regenerate Draft' : 'Generate Draft'}
                </Button>
              </div>

              {/* Draft Output Preview */}
              {aiDraft && (
                <div className="mt-3 p-4 rounded-xl bg-white border border-indigo-200 text-xs shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>Drafted {selectedTone} Response</span>
                      {aiDraftTelemetry?.isLive && (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                          Live Gemini 3.8
                        </span>
                      )}
                    </span>
                    <button
                      onClick={copyDraftToComposer}
                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Use In Composer</span>
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-700 font-mono text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    {aiDraft}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response / Note Composer */}
          <Card>
            <div className="border-b border-slate-200 px-5 pt-3 flex items-center space-x-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('reply')}
                className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'reply'
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Customer-Facing Reply
              </button>
              {role !== 'customer' && (
                <button
                  onClick={() => setActiveTab('note')}
                  className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center space-x-1 ${
                    activeTab === 'note'
                      ? 'border-amber-600 text-amber-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Internal Note (Private)</span>
                </button>
              )}
            </div>

            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={4}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={
                    activeTab === 'note'
                      ? 'Write a private note for other support agents (never visible to customer)...'
                      : `Draft a reply to ${ticket.customerName}...`
                  }
                  className={`w-full text-xs p-3 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                    activeTab === 'note'
                      ? 'bg-amber-50/20 border-amber-200 focus:ring-amber-500/20 focus:border-amber-500'
                      : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {activeTab === 'note'
                      ? 'Notes are audited and restricted to authorized agents.'
                      : 'Message will be delivered to the customer.'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      variant={activeTab === 'note' ? 'secondary' : 'primary'}
                      icon={<Send className="w-3.5 h-3.5" />}
                      disabled={!replyContent.trim()}
                      loading={isSending}
                    >
                      {activeTab === 'note' ? 'Save Internal Note' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Metadata, AI Analysis, Customer Info, Related KB */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Priority Controls */}
          <Card>
            <CardHeader title="Ticket Controls" />
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="New">New</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Customer">Waiting for Customer</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              {canAssignTickets && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Agent</label>
                  <select
                    value={ticket.assignedAgentId || 'unassigned'}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  >
                    <option value="unassigned">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <div className="pt-0.5">
                  <CategoryBadge category={ticket.category} />
                </div>
              </div>

              {/* Order / Ref ID */}
              {ticket.orderId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-0.5">Reference ID</label>
                  <span className="text-xs font-mono font-medium text-slate-800">{ticket.orderId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Triage & Analysis Card */}
          <Card className="border-indigo-100">
            <CardHeader
              title={
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span>AI Triage Analysis</span>
                  </span>
                  <button
                    onClick={handleTriggerAnalysis}
                    disabled={isAnalyzing}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer disabled:opacity-40"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                  </button>
                </div>
              }
            />
            <CardContent className="space-y-3 text-xs">
              {ticket.aiAnalysis ? (
                <>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Sentiment:</span>
                    <span className="font-semibold text-slate-800">{ticket.aiAnalysis.sentiment}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {Math.round(ticket.aiAnalysis.confidenceIndicator * 100)}%
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500 block mb-0.5">Summary:</span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {ticket.aiAnalysis.shortSummary}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-0.5">Suggested Action:</span>
                    <p className="text-slate-700 font-medium">{ticket.aiAnalysis.suggestedNextAction}</p>
                  </div>
                  {ticket.aiAnalysis.potentialUrgencySignals?.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Urgency Signals:</span>
                      <div className="space-y-1">
                        {ticket.aiAnalysis.potentialUrgencySignals.map((sig, i) => (
                          <div key={i} className="text-[11px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-medium">
                            • {sig}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-500 mb-2">No triage analysis on file.</p>
                  <Button size="sm" variant="subtle" onClick={handleTriggerAnalysis} loading={isAnalyzing}>
                    Run Gemini Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader title="Customer Profile" />
            <CardContent className="space-y-2.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">{ticket.customerName}</div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{ticket.customerEmail}</span>
              </div>
              {customer?.company && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.company}</span>
                </div>
              )}
              {customer?.phone && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{customer.phone}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span><strong className="font-mono text-slate-700">{customer?.openTickets || 1}</strong> open ticket(s)</span>
                <button
                  onClick={() => navigate(`/customers/${ticket.customerId}`)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  View Profile →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Grounded Knowledge Articles */}
          <Card>
            <CardHeader title="Related Knowledge Base" subtitle="Grounded organizational policies" />
            <CardContent className="space-y-2 text-xs">
              {relatedArticles.length === 0 ? (
                <div className="text-slate-400 text-xs py-2">No matching knowledge articles found.</div>
              ) : (
                relatedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => navigate(`/knowledge-base/${art.id}`)}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{art.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{art.summary}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Audit History Timeline */}
          <Card>
            <CardHeader title="Ticket Audit Log" subtitle="Append-only lifecycle events" />
            <CardContent className="space-y-3 text-xs">
              {ticketAuditEvents.length === 0 ? (
                <div className="text-slate-400 text-xs py-2">No audit events recorded yet.</div>
              ) : (
                ticketAuditEvents.map((evt) => (
                  <div key={evt.id} className="border-l-2 border-indigo-200 pl-3 py-0.5 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{evt.action}</span>
                      <span className="text-slate-400 font-mono">{new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{evt.details}</p>
                    <div className="text-[10px] text-slate-400">By {evt.actorName}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
