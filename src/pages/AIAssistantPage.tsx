import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { useNotifications } from '../context/NotificationContext';
import { KnowledgeArticle, Ticket as TicketType } from '../types';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { id: string; title: string; category: string }[];
  isLiveGemini?: boolean;
  timestamp: string;
}

export const AIAssistantPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { showToast } = useNotifications();

  const [articles] = useState<KnowledgeArticle[]>(() => storageService.getKnowledgeArticles());
  const [tickets] = useState<TicketType[]>(() => storageService.getTickets());
  const [selectedTicketId, setSelectedTicketId] = useState<string>('none');

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome_01',
      role: 'assistant',
      content:
        'Hello! I am ResolveAI’s Grounded Knowledge Assistant, powered by Gemini 3.8 Flash.\n\nI answer inquiries grounded strictly in your organization’s published policies, assist with troubleshooting workflows, and summarize complex ticket context.\n\nHow can I help your support operations today?',
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedPrompts = [
    'What is our policy on refund timelines and return shipping fees?',
    'How do I troubleshoot a 401 Unauthorized API error for a customer?',
    'What are the mandatory IdP claim mappings for SSO SAML setup?',
    'What should agents do when carrier tracking has no updates for 4 days?',
    'What are our GDPR Article 20 data export procedures?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: MessageItem = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let promptWithContext = text;
      if (selectedTicketId !== 'none') {
        const ticket = tickets.find((t) => t.ticketRef === selectedTicketId);
        if (ticket) {
          promptWithContext = `[Context Ticket ${ticket.ticketRef}: "${ticket.subject}" (Customer: ${ticket.customerName}, Category: ${ticket.category})]\nQuestion: ${text}`;
        }
      }

      const res = await aiService.groundedChat({
        message: promptWithContext,
        articles: articles,
        history: messages.slice(-4).map((m) => ({ role: m.role, text: m.content })),
      });

      const assistantMsg: MessageItem = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        isLiveGemini: res.isLiveGemini,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      showToast('Error communicating with AI service', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard', 'info');
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content: 'Conversation history cleared. Grounded knowledge base ready for your queries.',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast('Conversation reset', 'info');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Knowledge Assistant</h2>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              Gemini 3.8 Flash Grounded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Strictly grounded Q&A leveraging your organization’s <span className="font-semibold text-slate-700 font-mono tabular-nums">{articles.filter((a) => a.status === 'Published').length}</span> published knowledge base articles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ticket Context Picker */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Context:</span>
            <select
              value={selectedTicketId}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">None (General Knowledge)</option>
              {tickets.slice(0, 10).map((t) => (
                <option key={t.ticketRef} value={t.ticketRef}>
                  {t.ticketRef} · {t.subject.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          <Button size="sm" variant="outline" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleClear}>
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Prompts:</span>
        </span>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-colors whitespace-nowrap cursor-pointer text-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Conversation Card */}
      <Card className="h-[65vh] flex flex-col">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs transition-all ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 space-x-4">
                    <span
                      className={`font-semibold text-xs ${
                        isUser ? 'text-indigo-100' : 'text-slate-900 flex items-center space-x-1.5'
                      }`}
                    >
                      {!isUser && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                      <span>{isUser ? 'You' : 'ResolveAI Grounded Assistant'}</span>
                      {!isUser && m.isLiveGemini && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium ml-1">
                          Live Gemini
                        </span>
                      )}
                    </span>
                    <span className={`text-[10px] font-mono tabular-nums ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {m.timestamp}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed text-xs space-y-2">
                    {m.content}
                  </div>

                  {/* Grounded Source Citations */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Verified Knowledge Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src) => (
                          <button
                            key={src.id}
                            onClick={() => navigate(`/knowledge-base/${src.id}`)}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span className="font-medium">{src.title}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-[10px] text-slate-500">{src.category}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Action (Copy) */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center space-x-1.5 cursor-pointer transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs shadow-xs max-w-xl w-full space-y-2.5">
                <div className="flex items-center space-x-2 text-indigo-600 font-medium">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing grounded response with Gemini 3.8 Flash...</span>
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask any policy question, procedure query, or troubleshooting step..."
              className="flex-1 text-xs px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white placeholder-slate-400"
            />
            <Button
              type="submit"
              size="md"
              icon={<Send className="w-3.5 h-3.5" />}
              disabled={!inputMessage.trim() || isLoading}
            >
              Send
            </Button>
          </form>
          <div className="text-[11px] text-slate-400 mt-2 text-center flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strictly grounded in published organizational policies. Zero hallucinations.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
