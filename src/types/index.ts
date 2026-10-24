export type UserRole = 'admin' | 'manager' | 'agent' | 'customer';

export type TicketStatus =
  | 'New'
  | 'Open'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Resolved'
  | 'Closed';

export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TicketCategory =
  | 'Billing'
  | 'Order and Delivery'
  | 'Returns and Refunds'
  | 'Technical Support'
  | 'Account Access'
  | 'Product Inquiry'
  | 'General Inquiry'
  | 'Other';

export type TicketChannel = 'email' | 'web' | 'chat' | 'phone';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: 'active' | 'away' | 'offline';
  department?: string;
  assignedTicketsCount?: number;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  timezone: string;
  defaultPriority: TicketPriority;
  supportCategories: string[];
  aiToneDefault: 'Professional' | 'Friendly' | 'Concise' | 'Empathetic';
  aiFeaturesEnabled: {
    triageAnalysis: boolean;
    replyGenerator: boolean;
    groundedKB: boolean;
    summarization: boolean;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  customerSince: string;
  totalTickets: number;
  openTickets: number;
  lastInteraction: string;
  notes?: string;
  avatar?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  type: 'public' | 'note'; // 'note' is internal-only and NEVER shown to customers
  content: string;
  createdAt: string;
  attachments?: { name: string; size: string }[];
}

export interface TicketEvent {
  id: string;
  ticketId: string;
  actorId: string;
  actorName: string;
  type:
    | 'created'
    | 'status_changed'
    | 'priority_changed'
    | 'assigned'
    | 'note_added'
    | 'reply_sent'
    | 'reopened'
    | 'rule_executed';
  details: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  category: TicketCategory;
  sentiment: string;
  recommendedPriority: TicketPriority;
  shortSummary: string;
  customerIntent: string;
  suggestedNextAction: string;
  confidenceIndicator: number;
  potentialUrgencySignals: string[];
  isLiveGemini?: boolean;
  model?: string;
  analyzedAt: string;
}

export interface Ticket {
  id: string;
  ticketRef: string; // e.g. "RES-1042"
  subject: string;
  description: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  assignedAgentId?: string;
  assignedAgentName?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  firstResponseAt?: string;
  aiAnalysis?: AIAnalysisResult;
  tags: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  status: 'Draft' | 'Published' | 'Archived';
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  helpfulCount: number;
}

export type AutomationTrigger =
  | 'ticket_created'
  | 'priority_changed'
  | 'status_changed'
  | 'ticket_assigned';

export type AutomationConditionField =
  | 'category'
  | 'priority'
  | 'status'
  | 'is_unassigned';

export type AutomationActionType =
  | 'set_priority'
  | 'assign_agent'
  | 'add_tag'
  | 'set_status';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditionField: AutomationConditionField;
  conditionOperator: 'equals' | 'contains' | 'is_true';
  conditionValue: string;
  actionType: AutomationActionType;
  actionValue: string;
  enabled: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  link: string;
  type: 'assigned' | 'urgent' | 'customer_reply' | 'rule_failed' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'ticket' | 'article' | 'rule' | 'organization' | 'customer';
  targetId: string;
  targetRef?: string;
  details: string;
  createdAt: string;
}
