import {
  Ticket,
  Customer,
  User,
  KnowledgeArticle,
  AutomationRule,
  NotificationItem,
  AuditEvent,
  TicketMessage,
  Organization,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketChannel,
  AutomationTrigger,
} from '../types';
import {
  initialOrganization,
  initialUsers,
  initialCustomers,
  initialKnowledgeArticles,
  initialAutomationRules,
  initialNotifications,
  initialAuditEvents,
  initialTickets,
  initialMessages,
} from '../data/seedData';

const STORAGE_KEY = 'resolveai_db_v1';

export interface AppState {
  organization: Organization;
  users: User[];
  customers: Customer[];
  tickets: Ticket[];
  messages: Record<string, TicketMessage[]>;
  articles: KnowledgeArticle[];
  rules: AutomationRule[];
  notifications: NotificationItem[];
  auditEvents: AuditEvent[];
}

type Listener = () => void;

class StorageService {
  private state: AppState;
  private listeners: Set<Listener> = new Set();
  private isEvaluatingRule = false; // Prevents recursive loops

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('[ResolveAI] Failed to read from localStorage:', e);
    }
    return this.getDefaultState();
  }

  private getDefaultState(): AppState {
    return {
      organization: { ...initialOrganization },
      users: [...initialUsers],
      customers: [...initialCustomers],
      tickets: [...initialTickets],
      messages: { ...initialMessages },
      articles: [...initialKnowledgeArticles],
      rules: [...initialAutomationRules],
      notifications: [...initialNotifications],
      auditEvents: [...initialAuditEvents],
    };
  }

  private persist() {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error('[ResolveAI] Failed to save state to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  public resetDemoData() {
    this.state = this.getDefaultState();
    this.persist();
  }

  // --- Organization ---
  public getOrganization(): Organization {
    return { ...this.state.organization };
  }

  public updateOrganization(org: Partial<Organization>, actor?: User) {
    this.state.organization = { ...this.state.organization, ...org };
    if (actor) {
      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'Updated Settings',
        targetType: 'organization',
        targetId: this.state.organization.id,
        targetRef: this.state.organization.name,
        details: `Updated workspace settings (${Object.keys(org).join(', ')})`,
        createdAt: new Date().toISOString(),
      });
    }
    this.persist();
  }

  // --- Users & Team ---
  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public inviteUser(user: Omit<User, 'id'>, actor?: User): User {
    const newUser: User = {
      ...user,
      id: 'user_' + Date.now(),
      assignedTicketsCount: 0,
    };
    this.state.users.push(newUser);
    if (actor) {
      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'Invited Team Member',
        targetType: 'organization',
        targetId: newUser.id,
        targetRef: newUser.name,
        details: `Invited ${newUser.name} as ${newUser.role}`,
        createdAt: new Date().toISOString(),
      });
    }
    this.persist();
    return newUser;
  }

  public updateUserRole(userId: string, newRole: User['role'], actor?: User) {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      user.role = newRole;
      if (actor) {
        this.logAuditEvent({
          id: 'audit_' + Date.now(),
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: 'Changed Role',
          targetType: 'organization',
          targetId: user.id,
          targetRef: user.name,
          details: `Changed role of ${user.name} to ${newRole}`,
          createdAt: new Date().toISOString(),
        });
      }
      this.persist();
    }
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return [...this.state.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.state.customers.find((c) => c.id === id);
  }

  public updateCustomer(id: string, updates: Partial<Customer>) {
    const customer = this.state.customers.find((c) => c.id === id);
    if (customer) {
      Object.assign(customer, updates);
      this.persist();
    }
  }

  public createCustomer(data: Omit<Customer, 'id' | 'totalTickets' | 'openTickets' | 'customerSince' | 'lastInteraction'>): Customer {
    const newCust: Customer = {
      ...data,
      id: 'cust_' + Date.now(),
      customerSince: new Date().toISOString().split('T')[0],
      totalTickets: 0,
      openTickets: 0,
      lastInteraction: 'Just now',
    };
    this.state.customers.unshift(newCust);
    this.persist();
    return newCust;
  }

  // --- Tickets ---
  public getTickets(): Ticket[] {
    return [...this.state.tickets];
  }

  public getTicketById(idOrRef: string): Ticket | undefined {
    return this.state.tickets.find((t) => t.id === idOrRef || t.ticketRef === idOrRef);
  }

  public createTicket(
    data: {
      subject: string;
      description: string;
      customerName: string;
      customerEmail: string;
      customerCompany?: string;
      category: TicketCategory;
      priority: TicketPriority;
      channel: TicketChannel;
      orderId?: string;
      tags?: string[];
    },
    actor?: User
  ): Ticket {
    // Generate clean human-readable reference, e.g. RES-1043
    const maxNum = this.state.tickets.reduce((max, t) => {
      const match = t.ticketRef.match(/RES-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);

    const newRef = `RES-${maxNum + 1}`;
    const now = new Date().toISOString();

    // Link customer or create
    let customer = this.state.customers.find((c) => c.email.toLowerCase() === data.customerEmail.toLowerCase());
    if (!customer) {
      customer = this.createCustomer({
        name: data.customerName,
        email: data.customerEmail,
        company: data.customerCompany,
      });
    }

    customer.totalTickets += 1;
    customer.openTickets += 1;
    customer.lastInteraction = 'Just now';

    const newTicket: Ticket = {
      id: newRef,
      ticketRef: newRef,
      subject: data.subject.trim(),
      description: data.description.trim(),
      customerId: customer.id,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim(),
      customerCompany: data.customerCompany?.trim() || customer.company,
      category: data.category,
      priority: data.priority,
      status: 'New',
      channel: data.channel,
      orderId: data.orderId?.trim(),
      createdAt: now,
      updatedAt: now,
      tags: data.tags || [],
    };

    this.state.tickets.unshift(newTicket);

    // Initial message in timeline
    this.state.messages[newRef] = [
      {
        id: 'msg_' + Date.now(),
        ticketId: newRef,
        senderId: customer.id,
        senderName: data.customerName,
        senderRole: 'customer',
        type: 'public',
        content: data.description,
        createdAt: now,
      },
    ];

    // Notification for urgent ticket
    if (data.priority === 'Urgent') {
      this.state.notifications.unshift({
        id: 'notif_' + Date.now(),
        title: 'Urgent Ticket Logged',
        description: `${newRef}: ${data.subject}`,
        link: `/tickets/${newRef}`,
        type: 'urgent',
        read: false,
        createdAt: 'Just now',
      });
    }

    // Log audit event
    this.logAuditEvent({
      id: 'audit_' + Date.now(),
      actorId: actor?.id || customer.id,
      actorName: actor?.name || customer.name,
      actorRole: actor?.role || 'customer',
      action: 'Ticket Created',
      targetType: 'ticket',
      targetId: newTicket.id,
      targetRef: newTicket.ticketRef,
      details: `Created new ticket "${newTicket.subject}" via ${newTicket.channel}`,
      createdAt: now,
    });

    // Centralized automation rule evaluation
    this.evaluateAutomationRules(newTicket, 'ticket_created');

    this.persist();
    return newTicket;
  }

  public updateTicket(
    id: string,
    updates: Partial<Ticket>,
    actor?: User,
    reason?: string
  ): Ticket | undefined {
    const ticket = this.getTicketById(id);
    if (!ticket) return undefined;

    const previousStatus = ticket.status;
    const previousPriority = ticket.priority;
    const previousAssignee = ticket.assignedAgentId;
    const now = new Date().toISOString();

    // Check permitted status transitions
    if (updates.status && updates.status !== previousStatus) {
      // Validate transition
      if (previousStatus === 'Resolved' || previousStatus === 'Closed') {
        if (updates.status !== 'Open') {
          // Reopening can only go to Open
          updates.status = 'Open';
        }
      }

      if (updates.status === 'Resolved' && !ticket.resolvedAt) {
        ticket.resolvedAt = now;
      }

      // Update customer open count
      const customer = this.getCustomerById(ticket.customerId);
      if (customer) {
        if ((updates.status === 'Resolved' || updates.status === 'Closed') && !(previousStatus === 'Resolved' || previousStatus === 'Closed')) {
          customer.openTickets = Math.max(0, customer.openTickets - 1);
        } else if ((previousStatus === 'Resolved' || previousStatus === 'Closed') && updates.status === 'Open') {
          customer.openTickets += 1;
        }
      }

      // Audit status change
      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor?.id || 'system',
        actorName: actor?.name || 'System Operator',
        actorRole: actor?.role || 'agent',
        action: updates.status === 'Open' && (previousStatus === 'Resolved' || previousStatus === 'Closed') ? 'Ticket Reopened' : 'Status Changed',
        targetType: 'ticket',
        targetId: ticket.id,
        targetRef: ticket.ticketRef,
        details: reason || `Status changed from ${previousStatus} to ${updates.status}`,
        createdAt: now,
      });
    }

    if (updates.priority && updates.priority !== previousPriority) {
      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor?.id || 'system',
        actorName: actor?.name || 'System Operator',
        actorRole: actor?.role || 'agent',
        action: 'Priority Changed',
        targetType: 'ticket',
        targetId: ticket.id,
        targetRef: ticket.ticketRef,
        details: `Priority updated from ${previousPriority} to ${updates.priority}`,
        createdAt: now,
      });
    }

    if (updates.assignedAgentId !== undefined && updates.assignedAgentId !== previousAssignee) {
      const newAgent = updates.assignedAgentId ? this.getUserById(updates.assignedAgentId) : null;
      updates.assignedAgentName = newAgent ? newAgent.name : undefined;

      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor?.id || 'system',
        actorName: actor?.name || 'System Operator',
        actorRole: actor?.role || 'agent',
        action: 'Assignment Changed',
        targetType: 'ticket',
        targetId: ticket.id,
        targetRef: ticket.ticketRef,
        details: newAgent ? `Assigned to ${newAgent.name}` : 'Unassigned ticket',
        createdAt: now,
      });

      if (newAgent && actor?.id !== newAgent.id) {
        this.state.notifications.unshift({
          id: 'notif_' + Date.now(),
          title: 'Ticket Assigned to You',
          description: `${ticket.ticketRef}: "${ticket.subject}"`,
          link: `/tickets/${ticket.ticketRef}`,
          type: 'assigned',
          read: false,
          createdAt: 'Just now',
        });
      }
    }

    Object.assign(ticket, updates);
    ticket.updatedAt = now;

    // Trigger automation rules
    if (updates.priority && updates.priority !== previousPriority) {
      this.evaluateAutomationRules(ticket, 'priority_changed');
    }
    if (updates.status && updates.status !== previousStatus) {
      this.evaluateAutomationRules(ticket, 'status_changed');
    }
    if (updates.assignedAgentId !== undefined && updates.assignedAgentId !== previousAssignee) {
      this.evaluateAutomationRules(ticket, 'ticket_assigned');
    }

    this.persist();
    return ticket;
  }

  public bulkUpdateTickets(
    ids: string[],
    updates: { status?: TicketStatus; priority?: TicketPriority; assignedAgentId?: string },
    actor?: User
  ) {
    ids.forEach((id) => {
      this.updateTicket(id, updates, actor, `Bulk operation executed on ${ids.length} tickets`);
    });
  }

  // --- Messages & Notes ---
  public getMessagesForTicket(ticketId: string): TicketMessage[] {
    return this.state.messages[ticketId] || [];
  }

  public addMessage(
    ticketId: string,
    message: {
      type: 'public' | 'note';
      content: string;
      attachments?: { name: string; size: string }[];
    },
    actor: User
  ): TicketMessage {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const now = new Date().toISOString();
    const newMsg: TicketMessage = {
      id: 'msg_' + Date.now(),
      ticketId: ticket.ticketRef,
      senderId: actor.id,
      senderName: actor.name,
      senderRole: actor.role,
      senderAvatar: actor.avatar,
      type: message.type,
      content: message.content.trim(),
      createdAt: now,
      attachments: message.attachments,
    };

    if (!this.state.messages[ticket.ticketRef]) {
      this.state.messages[ticket.ticketRef] = [];
    }
    this.state.messages[ticket.ticketRef].push(newMsg);

    ticket.updatedAt = now;
    if (message.type === 'public' && !ticket.firstResponseAt && actor.role !== 'customer') {
      ticket.firstResponseAt = now;
    }

    // Status auto-progression if agent public reply
    if (message.type === 'public' && actor.role !== 'customer' && ticket.status === 'New') {
      ticket.status = 'Waiting for Customer';
    }

    // Customer reply moves to Open / In Progress
    if (message.type === 'public' && actor.role === 'customer') {
      if (ticket.status === 'Waiting for Customer' || ticket.status === 'Resolved') {
        ticket.status = 'Open';
      }
      this.state.notifications.unshift({
        id: 'notif_' + Date.now(),
        title: 'Customer Replied',
        description: `${actor.name} replied on ${ticket.ticketRef}`,
        link: `/tickets/${ticket.ticketRef}`,
        type: 'customer_reply',
        read: false,
        createdAt: 'Just now',
      });
    }

    this.logAuditEvent({
      id: 'audit_' + Date.now(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: message.type === 'note' ? 'Internal Note Added' : 'Public Reply Recorded',
      targetType: 'ticket',
      targetId: ticket.id,
      targetRef: ticket.ticketRef,
      details: message.type === 'note' ? 'Added private operational note' : 'Sent customer-facing response',
      createdAt: now,
    });

    this.persist();
    return newMsg;
  }

  // --- Knowledge Base ---
  public getKnowledgeArticles(): KnowledgeArticle[] {
    return [...this.state.articles];
  }

  public getArticleById(id: string): KnowledgeArticle | undefined {
    return this.state.articles.find((a) => a.id === id);
  }

  public createArticle(
    data: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpfulCount'>,
    actor: User
  ): KnowledgeArticle {
    const now = new Date().toISOString();
    const newArt: KnowledgeArticle = {
      ...data,
      id: 'kb_' + Date.now(),
      createdAt: now,
      updatedAt: now,
      views: 0,
      helpfulCount: 0,
    };
    this.state.articles.unshift(newArt);
    this.logAuditEvent({
      id: 'audit_' + Date.now(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'Article Created',
      targetType: 'article',
      targetId: newArt.id,
      targetRef: newArt.title,
      details: `Created knowledge base article with status ${newArt.status}`,
      createdAt: now,
    });
    this.persist();
    return newArt;
  }

  public updateArticle(id: string, updates: Partial<KnowledgeArticle>, actor: User) {
    const art = this.getArticleById(id);
    if (art) {
      const prevStatus = art.status;
      Object.assign(art, updates);
      art.updatedAt = new Date().toISOString();

      if (updates.status && updates.status !== prevStatus) {
        this.logAuditEvent({
          id: 'audit_' + Date.now(),
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: updates.status === 'Published' ? 'Article Published' : 'Article Status Changed',
          targetType: 'article',
          targetId: art.id,
          targetRef: art.title,
          details: `Article status changed from ${prevStatus} to ${updates.status}`,
          createdAt: new Date().toISOString(),
        });
      }
      this.persist();
    }
  }

  public deleteArticle(id: string, actor: User) {
    const index = this.state.articles.findIndex((a) => a.id === id);
    if (index !== -1) {
      const art = this.state.articles[index];
      this.state.articles.splice(index, 1);
      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'Article Deleted',
        targetType: 'article',
        targetId: id,
        targetRef: art.title,
        details: `Deleted article "${art.title}"`,
        createdAt: new Date().toISOString(),
      });
      this.persist();
    }
  }

  // --- Automation Rules Engine ---
  public getAutomationRules(): AutomationRule[] {
    return [...this.state.rules];
  }

  public updateRule(id: string, updates: Partial<AutomationRule>, actor?: User) {
    const rule = this.state.rules.find((r) => r.id === id);
    if (rule) {
      Object.assign(rule, updates);
      if (actor) {
        this.logAuditEvent({
          id: 'audit_' + Date.now(),
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: 'Updated Automation Rule',
          targetType: 'rule',
          targetId: rule.id,
          targetRef: rule.name,
          details: `Modified rule configuration for "${rule.name}"`,
          createdAt: new Date().toISOString(),
        });
      }
      this.persist();
    }
  }

  public createRule(data: Omit<AutomationRule, 'id' | 'executionCount'>, actor?: User): AutomationRule {
    const newRule: AutomationRule = {
      ...data,
      id: 'rule_' + Date.now(),
      executionCount: 0,
    };
    this.state.rules.push(newRule);
    if (actor) {
      this.logAuditEvent({
        id: 'audit_' + Date.now(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'Created Automation Rule',
        targetType: 'rule',
        targetId: newRule.id,
        targetRef: newRule.name,
        details: `Created automation rule "${newRule.name}"`,
        createdAt: new Date().toISOString(),
      });
    }
    this.persist();
    return newRule;
  }

  public deleteRule(id: string, actor?: User) {
    const idx = this.state.rules.findIndex((r) => r.id === id);
    if (idx !== -1) {
      const rule = this.state.rules[idx];
      this.state.rules.splice(idx, 1);
      if (actor) {
        this.logAuditEvent({
          id: 'audit_' + Date.now(),
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: 'Deleted Automation Rule',
          targetType: 'rule',
          targetId: id,
          targetRef: rule.name,
          details: `Removed rule "${rule.name}"`,
          createdAt: new Date().toISOString(),
        });
      }
      this.persist();
    }
  }

  public evaluateAutomationRules(ticket: Ticket, trigger: AutomationTrigger) {
    if (this.isEvaluatingRule) return; // Prevent loops
    this.isEvaluatingRule = true;

    try {
      const activeRules = this.state.rules.filter((r) => r.enabled && r.trigger === trigger);

      for (const rule of activeRules) {
        let conditionMet = false;

        if (rule.conditionField === 'category') {
          conditionMet = ticket.category === rule.conditionValue;
        } else if (rule.conditionField === 'priority') {
          conditionMet = ticket.priority === rule.conditionValue;
        } else if (rule.conditionField === 'status') {
          conditionMet = ticket.status === rule.conditionValue;
        } else if (rule.conditionField === 'is_unassigned') {
          conditionMet = !ticket.assignedAgentId;
        }

        if (conditionMet) {
          rule.executionCount += 1;
          rule.lastExecutedAt = new Date().toISOString();

          let actionSuccess = true;
          let actionDesc = '';

          if (rule.actionType === 'set_priority') {
            ticket.priority = rule.actionValue as TicketPriority;
            actionDesc = `Set priority to ${rule.actionValue}`;
          } else if (rule.actionType === 'assign_agent') {
            const agent = this.getUserById(rule.actionValue);
            if (agent) {
              ticket.assignedAgentId = agent.id;
              ticket.assignedAgentName = agent.name;
              actionDesc = `Assigned to ${agent.name}`;
            } else {
              actionSuccess = false;
            }
          } else if (rule.actionType === 'add_tag') {
            if (!ticket.tags.includes(rule.actionValue)) {
              ticket.tags.push(rule.actionValue);
            }
            actionDesc = `Added tag "${rule.actionValue}"`;
          } else if (rule.actionType === 'set_status') {
            ticket.status = rule.actionValue as TicketStatus;
            actionDesc = `Set status to ${rule.actionValue}`;
          }

          if (actionSuccess) {
            this.logAuditEvent({
              id: 'audit_' + Date.now(),
              actorId: 'system_automation',
              actorName: 'Automation Engine',
              actorRole: 'admin',
              action: 'Rule Executed',
              targetType: 'rule',
              targetId: rule.id,
              targetRef: ticket.ticketRef,
              details: `Rule "${rule.name}" triggered on ${ticket.ticketRef}: ${actionDesc}`,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } finally {
      this.isEvaluatingRule = false;
    }
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    return [...this.state.notifications];
  }

  public markNotificationRead(id: string) {
    const n = this.state.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.persist();
    }
  }

  public markAllNotificationsRead() {
    this.state.notifications.forEach((item) => (item.read = true));
    this.persist();
  }

  // --- Audit Events ---
  public getAuditEvents(): AuditEvent[] {
    return [...this.state.auditEvents];
  }

  public logAuditEvent(event: AuditEvent) {
    this.state.auditEvents.unshift(event);
    if (this.state.auditEvents.length > 500) {
      this.state.auditEvents.pop();
    }
    // Note: Don't call persist here directly if called inside a method that already persists.
  }
}

export const storageService = new StorageService();
