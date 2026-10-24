import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[ResolveAI] Gemini API client successfully initialized.');
  } catch (err) {
    console.warn('[ResolveAI] Failed to initialize Gemini API client:', err);
  }
} else {
  console.log('[ResolveAI] No GEMINI_API_KEY detected. Running in transparent deterministic AI fallback mode.');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Status check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
      model: 'gemini-3.8-flash',
      version: '1.0.0',
    });
  });

  // Feature A: Automatic ticket analysis
  app.post('/api/gemini/analyze-ticket', async (req, res) => {
    const { subject, description, customerName, category, priority } = req.body || {};

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required for analysis.' });
    }

    // If Gemini client is active, execute real GenAI call
    if (aiClient) {
      try {
        const prompt = `You are the lead triage engine for ResolveAI, a customer support platform. Analyze the following incoming customer ticket.
Customer: ${customerName || 'Anonymous Customer'}
Current Stated Category: ${category || 'Uncategorized'}
Current Stated Priority: ${priority || 'Normal'}
Subject: ${subject}
Description:
${description}

Provide a structured, unbiased evaluation. Do NOT fabricate order numbers or customer interactions.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are ResolveAI triage classifier. You must categorize customer issues strictly and accurately.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: 'One of: Billing, Order and Delivery, Returns and Refunds, Technical Support, Account Access, Product Inquiry, General Inquiry, Other',
                },
                sentiment: {
                  type: Type.STRING,
                  description: 'One of: Positive, Neutral, Frustrated, Highly Frustrated, Urgent, Satisfied',
                },
                recommendedPriority: {
                  type: Type.STRING,
                  description: 'One of: Low, Normal, High, Urgent',
                },
                shortSummary: {
                  type: Type.STRING,
                  description: 'A 1-2 sentence executive summary of the issue.',
                },
                customerIntent: {
                  type: Type.STRING,
                  description: 'Primary objective or request of the customer (e.g. Requesting invoice correction, Inquiring delivery timeline, Reporting broken authentication).',
                },
                suggestedNextAction: {
                  type: Type.STRING,
                  description: 'Actionable recommendation for the human support agent.',
                },
                confidenceIndicator: {
                  type: Type.NUMBER,
                  description: 'Confidence between 0.0 and 1.0',
                },
                potentialUrgencySignals: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Specific phrases or factors indicating urgency.',
                },
              },
              required: [
                'category',
                'sentiment',
                'recommendedPriority',
                'shortSummary',
                'customerIntent',
                'suggestedNextAction',
                'confidenceIndicator',
                'potentialUrgencySignals',
              ],
            },
          },
        });

        const rawJson = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawJson);
        return res.json({
          analysis: parsed,
          isLiveGemini: true,
          model: 'gemini-3.8-flash',
        });
      } catch (err: any) {
        console.error('[ResolveAI] Gemini analysis error:', err);
        // Fall back gracefully with clear indicator
      }
    }

    // Deterministic rule-based fallback when Gemini API key is missing or failed
    const textLower = `${subject} ${description}`.toLowerCase();
    let detectedCategory = category || 'General Inquiry';
    let detectedPriority = priority || 'Normal';
    let sentiment = 'Neutral';
    const urgencySignals: string[] = [];

    if (textLower.includes('urgent') || textLower.includes('asap') || textLower.includes('emergency') || textLower.includes('down') || textLower.includes('broken')) {
      detectedPriority = 'Urgent';
      urgencySignals.push('Customer included urgent distress keywords');
    } else if (textLower.includes('charge') || textLower.includes('double') || textLower.includes('refund') || textLower.includes('money')) {
      detectedPriority = 'High';
      urgencySignals.push('Financial or billing dispute involves pending transactions');
    }

    if (textLower.includes('refund') || textLower.includes('return') || textLower.includes('exchange')) {
      detectedCategory = 'Returns and Refunds';
    } else if (textLower.includes('bill') || textLower.includes('invoice') || textLower.includes('charged') || textLower.includes('payment') || textLower.includes('subscription')) {
      detectedCategory = 'Billing';
    } else if (textLower.includes('shipping') || textLower.includes('delivery') || textLower.includes('tracking') || textLower.includes('package') || textLower.includes('order')) {
      detectedCategory = 'Order and Delivery';
    } else if (textLower.includes('password') || textLower.includes('login') || textLower.includes('2fa') || textLower.includes('account') || textLower.includes('locked')) {
      detectedCategory = 'Account Access';
    } else if (textLower.includes('bug') || textLower.includes('error') || textLower.includes('crash') || textLower.includes('api') || textLower.includes('integration') || textLower.includes('500')) {
      detectedCategory = 'Technical Support';
    }

    if (textLower.includes('angry') || textLower.includes('ridiculous') || textLower.includes('unacceptable') || textLower.includes('furious')) {
      sentiment = 'Highly Frustrated';
    } else if (textLower.includes('disappointed') || textLower.includes('frustrated') || textLower.includes('issue') || textLower.includes('problem')) {
      sentiment = 'Frustrated';
    } else if (textLower.includes('thank') || textLower.includes('great') || textLower.includes('appreciate')) {
      sentiment = 'Positive';
    }

    const fallbackAnalysis = {
      category: detectedCategory,
      sentiment: sentiment,
      recommendedPriority: detectedPriority,
      shortSummary: `Customer is inquiring regarding ${subject.toLowerCase()}. Key focus is resolving ${detectedCategory.toLowerCase()} concerns promptly.`,
      customerIntent: `Resolve issue regarding ${subject}`,
      suggestedNextAction: `Review customer account history, verify details, and provide a direct response regarding ${detectedCategory.toLowerCase()}.`,
      confidenceIndicator: 0.88,
      potentialUrgencySignals: urgencySignals.length > 0 ? urgencySignals : ['Standard queue processing recommended'],
    };

    return res.json({
      analysis: fallbackAnalysis,
      isLiveGemini: false,
      model: 'Deterministic Fallback Engine (Add GEMINI_API_KEY for live GenAI)',
    });
  });

  // Feature B: AI reply generator
  app.post('/api/gemini/generate-reply', async (req, res) => {
    const { ticketContext, tone = 'Professional', knowledgeArticles = [], agentName = 'ResolveAI Agent' } = req.body || {};

    if (!ticketContext || !ticketContext.subject) {
      return res.status(400).json({ error: 'Ticket context is required.' });
    }

    if (aiClient) {
      try {
        const kbContextString = Array.isArray(knowledgeArticles) && knowledgeArticles.length > 0
          ? knowledgeArticles.map((k: any) => `[Article: ${k.title}]\n${k.summary || ''}\n${k.content || ''}`).join('\n\n')
          : 'No specific knowledge base articles matched.';

        const prompt = `You are an expert customer support agent drafting an email response on ResolveAI.
Agent Name: ${agentName}
Selected Tone: ${tone}
Customer Name: ${ticketContext.customerName || 'Valued Customer'}
Ticket Reference: ${ticketContext.ticketRef || 'REF-N/A'}
Ticket Subject: ${ticketContext.subject}
Ticket Description:
${ticketContext.description}

Authorized Organization Knowledge Base Articles:
${kbContextString}

Guidelines:
1. Tone must be strictly ${tone}. (Professional: polished & polite; Friendly: warm & reassuring; Concise: direct & bulleted; Empathetic: compassionate & validation-first).
2. Do NOT invent order numbers, fake tracking codes, or specific refund amounts not provided in the prompt.
3. If referencing organization policies, ground them in the provided Knowledge Base articles.
4. Output only the drafted response message, ready for human agent review. Never automatically send.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const replyDraft = response.text?.trim() || '';
        return res.json({
          draft: replyDraft,
          isLiveGemini: true,
          tone: tone,
        });
      } catch (err: any) {
        console.error('[ResolveAI] Gemini reply generation error:', err);
      }
    }

    // Deterministic fallback response based on tone and ticket context
    const customer = ticketContext.customerName || 'Valued Customer';
    let draft = '';

    if (tone === 'Concise') {
      draft = `Hi ${customer},\n\nThank you for reaching out to us regarding "${ticketContext.subject}".\n\nHere is what we are doing to assist:\n- We have received your request and logged it under reference ${ticketContext.ticketRef || 'your ticket'}.\n- Our support team is currently verifying the details and will provide a resolution within standard operating hours.\n\nPlease reply directly to this message if you have any supplementary details.\n\nBest,\n${agentName}\nResolveAI Support Team`;
    } else if (tone === 'Friendly') {
      draft = `Hello ${customer}!\n\nThanks so much for reaching out to us! We understand you're inquiring about "${ticketContext.subject}", and I'm very happy to help look into this for you.\n\nI'm reviewing your ticket details right now so we can get this sorted out as smoothly and quickly as possible. If you happen to have any screenshots or additional background information, feel free to send them over.\n\nI'll follow up shortly with our next update. Have a wonderful day!\n\nWarm regards,\n${agentName}\nResolveAI Customer Success`;
    } else if (tone === 'Empathetic') {
      draft = `Dear ${customer},\n\nI truly appreciate you reaching out, and I am so sorry to hear about the inconvenience you have experienced with "${ticketContext.subject}". I understand how frustrating this can be, and I want to reassure you that we are giving this our full attention.\n\nOur team is prioritizing your case right now. We are actively investigating the underlying cause to make sure this is resolved thoroughly and does not happen again.\n\nPlease know that we are here to support you every step of the way. I will keep you closely informed as soon as we make progress.\n\nSincerely,\n${agentName}\nResolveAI Support Team`;
    } else {
      // Professional
      draft = `Dear ${customer},\n\nThank you for contacting ResolveAI support regarding "${ticketContext.subject}".\n\nWe have reviewed the details you submitted and our support operations team is actively addressing your request. To ensure an accurate resolution, we are verifying the necessary records against our organizational policies.\n\nWe will provide you with a comprehensive update as soon as the review is complete. If you require any immediate updates in the interim, please do not hesitate to reply to this communication.\n\nSincerely,\n${agentName}\nResolveAI Support Team`;
    }

    return res.json({
      draft: draft,
      isLiveGemini: false,
      tone: tone,
    });
  });

  // Feature C: Grounded Knowledge Assistant & conversational chat
  app.post('/api/gemini/grounded-chat', async (req, res) => {
    const { message, articles = [], history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (aiClient) {
      try {
        const publishedArticles = Array.isArray(articles) ? articles.filter((a: any) => a.status === 'Published') : [];
        const kbText = publishedArticles.length > 0
          ? publishedArticles.map((a: any) => `[DOCUMENT ID: ${a.id} | TITLE: "${a.title}" | CATEGORY: ${a.category}]\nSummary: ${a.summary}\nContent:\n${a.content}`).join('\n\n---\n\n')
          : 'NO PUBLISHED KNOWLEDGE BASE ARTICLES ARE AVAILABLE.';

        const conversationContext = Array.isArray(history) && history.length > 0
          ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
          : '';

        const prompt = `You are ResolveAI's Grounded Knowledge Assistant. Your role is to answer questions strictly and accurately using ONLY the published organization knowledge-base articles provided below.

Strict Grounding Rules:
1. Base your answer solely on the facts directly stated in the authorized knowledge base articles.
2. If the answer cannot be found in the provided articles, you MUST clearly state: "I cannot find sufficient information in our published knowledge base to answer this question. I recommend escalating to a human support specialist."
3. Never fabricate policies, SLAs, refund percentages, or internal contact numbers.
4. When providing information, explicitly cite the matching article titles (e.g., "[Source: Refund & Return Policy]").

Authorized Knowledge Base Articles:
${kbText}

${conversationContext ? `Prior Conversation:\n${conversationContext}\n` : ''}
Current Question: ${message}

Answer:`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const answerText = response.text?.trim() || '';

        // Extract cited sources from the text
        const matchedSources = publishedArticles.filter((art: any) => 
          answerText.toLowerCase().includes(art.title.toLowerCase()) ||
          message.toLowerCase().includes(art.category.toLowerCase()) ||
          art.tags?.some((t: string) => message.toLowerCase().includes(t.toLowerCase()))
        );

        return res.json({
          answer: answerText,
          sources: matchedSources.map((s: any) => ({
            id: s.id,
            title: s.title,
            category: s.category,
          })),
          isLiveGemini: true,
        });
      } catch (err: any) {
        console.error('[ResolveAI] Grounded chat error:', err);
      }
    }

    // Deterministic grounded response fallback
    const qLower = message.toLowerCase();
    const publishedArticles = Array.isArray(articles) ? articles.filter((a: any) => a.status === 'Published') : [];
    
    // Find matching articles using keyword search
    const matching = publishedArticles.filter((art: any) => {
      const artText = `${art.title} ${art.summary} ${art.content} ${(art.tags || []).join(' ')}`.toLowerCase();
      const keywords = qLower.split(/\s+/).filter((w: string) => w.length > 3);
      return keywords.some((kw: string) => artText.includes(kw));
    });

    if (matching.length === 0) {
      return res.json({
        answer: 'I cannot find sufficient information in our published knowledge base to answer this question. I recommend escalating to a human support specialist.',
        sources: [],
        isLiveGemini: false,
      });
    }

    const primary = matching[0];
    const answer = `Based on our published article "${primary.title}":\n\n${primary.summary}\n\nKey highlights:\n${primary.content.split('\n').filter((l: string) => l.trim().length > 10).slice(0, 3).join('\n')}\n\nFor additional support or unique edge cases, please consult our team or review the full article.`;

    return res.json({
      answer,
      sources: matching.slice(0, 3).map((s: any) => ({
        id: s.id,
        title: s.title,
        category: s.category,
      })),
      isLiveGemini: false,
    });
  });

  // Feature D: Conversation summarization
  app.post('/api/gemini/summarize', async (req, res) => {
    const { messages = [], ticketSubject = '' } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required for summarization.' });
    }

    if (aiClient) {
      try {
        const dialogText = messages
          .map((m: any) => `[${m.type === 'note' ? 'INTERNAL NOTE' : 'MESSAGE'} by ${m.senderName || 'Unknown'} at ${m.createdAt}]: ${m.content}`)
          .join('\n');

        const prompt = `You are a conversation summarizer for ResolveAI. Summarize the following customer support ticket conversation thread.
Ticket Subject: ${ticketSubject}

Conversation History:
${dialogText}

Output a concise, strictly factual summary following this exact JSON format.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mainIssue: {
                  type: Type.STRING,
                  description: "Customer's core problem or inquiry.",
                },
                stepsAttempted: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Actions or diagnostic steps already taken by customer or agent.',
                },
                importantFacts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Key identifiers, dates, policies, or facts mentioned.',
                },
                outstandingQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Unresolved questions or pending customer/team inputs.',
                },
                recommendedNextStep: {
                  type: Type.STRING,
                  description: 'Optimal immediate next action for the agent.',
                },
              },
              required: [
                'mainIssue',
                'stepsAttempted',
                'importantFacts',
                'outstandingQuestions',
                'recommendedNextStep',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json({
          summary: parsed,
          isLiveGemini: true,
        });
      } catch (err: any) {
        console.error('[ResolveAI] Summarization error:', err);
      }
    }

    // Deterministic fallback summary
    const firstMsg = messages[0]?.content || ticketSubject;
    const fallbackSummary = {
      mainIssue: `Customer initiated ticket regarding: "${ticketSubject}". Issue relates to: ${firstMsg.slice(0, 120)}...`,
      stepsAttempted: [
        'Ticket submitted through designated support channel',
        `Agent acknowledged inquiry across ${messages.length} thread message(s)`,
      ],
      importantFacts: [
        `Conversation depth: ${messages.length} message(s) recorded`,
        `Subject context: ${ticketSubject}`,
      ],
      outstandingQuestions: [
        'Awaiting customer confirmation on whether proposed resolution resolves the concern',
      ],
      recommendedNextStep: 'Follow up with customer or proceed with ticket closure if no reply within SLA window.',
    };

    return res.json({
      summary: fallbackSummary,
      isLiveGemini: false,
    });
  });

  // Server-side Vite or Production Static Serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ResolveAI] Fullstack server actively running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ResolveAI] Fatal server startup error:', err);
  process.exit(1);
});
