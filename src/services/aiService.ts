import { AIAnalysisResult, KnowledgeArticle, Ticket } from '../types';

export interface AnalysisResponse {
  analysis: AIAnalysisResult;
  isLiveGemini: boolean;
  model: string;
}

export interface ReplyResponse {
  draft: string;
  isLiveGemini: boolean;
  tone: string;
}

export interface GroundedChatResponse {
  answer: string;
  sources: { id: string; title: string; category: string }[];
  isLiveGemini: boolean;
}

export interface SummarizeResponse {
  summary: {
    mainIssue: string;
    stepsAttempted: string[];
    importantFacts: string[];
    outstandingQuestions: string[];
    recommendedNextStep: string;
  };
  isLiveGemini: boolean;
}

class AIService {
  public async checkHealth(): Promise<{ status: string; hasGeminiKey: boolean; model: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AI health check failed:', e);
    }
    return { status: 'offline', hasGeminiKey: false, model: 'Local Engine' };
  }

  public async analyzeTicket(data: {
    subject: string;
    description: string;
    customerName?: string;
    category?: string;
    priority?: string;
  }): Promise<AnalysisResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const res = await fetch('/api/gemini/analyze-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      return {
        analysis: {
          ...json.analysis,
          isLiveGemini: json.isLiveGemini,
          model: json.model,
          analyzedAt: new Date().toISOString(),
        },
        isLiveGemini: json.isLiveGemini,
        model: json.model || 'gemini-3.8-flash',
      };
    } catch (err) {
      console.warn('[ResolveAI] Client-side fallback for ticket analysis:', err);
      // Clean deterministic fallback
      const text = `${data.subject} ${data.description}`.toLowerCase();
      const isUrgent = text.includes('urgent') || text.includes('down') || text.includes('crash');
      return {
        analysis: {
          category: (data.category as any) || 'General Inquiry',
          sentiment: isUrgent ? 'Frustrated' : 'Neutral',
          recommendedPriority: isUrgent ? 'Urgent' : 'Normal',
          shortSummary: `Inquiry regarding "${data.subject.slice(0, 60)}". Triage suggests direct human review.`,
          customerIntent: `Resolve issue regarding ${data.subject}`,
          suggestedNextAction: 'Review customer ticket timeline and provide grounded policy response.',
          confidenceIndicator: 0.85,
          potentialUrgencySignals: isUrgent ? ['Critical terms present in request'] : ['Standard ticket lifecycle'],
          isLiveGemini: false,
          model: 'Fallback Rule Engine',
          analyzedAt: new Date().toISOString(),
        },
        isLiveGemini: false,
        model: 'Fallback Rule Engine',
      };
    }
  }

  public async generateReply(data: {
    ticketContext: {
      ticketRef: string;
      subject: string;
      description: string;
      customerName: string;
    };
    tone: 'Professional' | 'Friendly' | 'Concise' | 'Empathetic';
    knowledgeArticles?: KnowledgeArticle[];
    agentName?: string;
  }): Promise<ReplyResponse> {
    try {
      const res = await fetch('/api/gemini/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Reply generation error');
      return await res.json();
    } catch (err) {
      console.warn('[ResolveAI] Reply generator fallback:', err);
      const name = data.ticketContext.customerName || 'Valued Customer';
      return {
        draft: `Dear ${name},\n\nThank you for reaching out to us regarding "${data.ticketContext.subject}".\n\nWe have received your ticket (${data.ticketContext.ticketRef}) and are reviewing the details in our support queue. We will provide an update as soon as possible.\n\nBest regards,\n${data.agentName || 'ResolveAI Support Team'}`,
        isLiveGemini: false,
        tone: data.tone,
      };
    }
  }

  public async groundedChat(data: {
    message: string;
    articles: KnowledgeArticle[];
    history?: { role: 'user' | 'assistant'; text: string }[];
  }): Promise<GroundedChatResponse> {
    try {
      const res = await fetch('/api/gemini/grounded-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Grounded chat request failed');
      return await res.json();
    } catch (err) {
      console.warn('[ResolveAI] Grounded chat fallback:', err);
      return {
        answer: 'I cannot find sufficient information in our published knowledge base to answer this question. I recommend escalating to a human support specialist.',
        sources: [],
        isLiveGemini: false,
      };
    }
  }

  public async summarizeTicket(messages: any[], ticketSubject: string): Promise<SummarizeResponse> {
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, ticketSubject }),
      });
      if (!res.ok) throw new Error('Summarization failed');
      return await res.json();
    } catch (err) {
      console.warn('[ResolveAI] Summarization fallback:', err);
      return {
        summary: {
          mainIssue: `Customer inquiry regarding: ${ticketSubject}`,
          stepsAttempted: ['Ticket received in queue', 'Initial messages exchanged'],
          importantFacts: [`Thread length: ${messages.length} messages`],
          outstandingQuestions: ['Awaiting customer verification of resolution'],
          recommendedNextStep: 'Confirm customer issue resolution before closing ticket.',
        },
        isLiveGemini: false,
      };
    }
  }
}

export const aiService = new AIService();
