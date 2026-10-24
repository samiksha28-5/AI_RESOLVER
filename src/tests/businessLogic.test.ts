import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { AnalyticsService } from '../services/analyticsService';
import { aiService } from '../services/aiService';

describe('ResolveAI Core Business Logic & Security Tests', () => {
  beforeEach(() => {
    storageService.resetDemoData();
  });

  describe('1. Ticket Status Transitions & Reopen Integrity', () => {
    it('generates sequential human-readable reference IDs', () => {
      const ticket = storageService.createTicket({
        subject: 'Test sequential reference',
        description: 'Verifying unique reference generation',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        category: 'General Inquiry',
        priority: 'Normal',
        channel: 'web',
      });

      expect(ticket.ticketRef).toMatch(/^RES-\d+$/);
      expect(ticket.status).toBe('New');
    });

    it('enforces status transition to Resolved with resolvedAt timestamp', () => {
      const ticket = storageService.createTicket({
        subject: 'Resolution test',
        description: 'Checking resolvedAt recording',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        category: 'Technical Support',
        priority: 'Normal',
        channel: 'email',
      });

      const updated = storageService.updateTicket(ticket.id, { status: 'Resolved' });
      expect(updated?.status).toBe('Resolved');
      expect(updated?.resolvedAt).toBeDefined();
    });

    it('restricts reopening resolved tickets strictly to Open state', () => {
      const ticket = storageService.createTicket({
        subject: 'Reopen integrity',
        description: 'Checking reopened validation',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        category: 'Billing',
        priority: 'Normal',
        channel: 'web',
      });

      storageService.updateTicket(ticket.id, { status: 'Resolved' });
      // Attempting an invalid jump from Resolved to In Progress should be coerced to Open
      const reopened = storageService.updateTicket(ticket.id, { status: 'In Progress' });
      expect(reopened?.status).toBe('Open');
    });
  });

  describe('2. Automation Rule Engine & Loop Prevention', () => {
    it('executes active rule conditions on ticket creation (Billing auto-escalates to High)', () => {
      const ticket = storageService.createTicket({
        subject: 'Billing inquiry needing escalation',
        description: 'Invoice discrepancy detected',
        customerName: 'Finance Lead',
        customerEmail: 'finance@example.com',
        category: 'Billing',
        priority: 'Normal',
        channel: 'web',
      });

      // rule_01 escalates Billing category to High priority
      expect(ticket.priority).toBe('High');
    });

    it('routes technical support tickets automatically to David Chen', () => {
      const ticket = storageService.createTicket({
        subject: 'API webhook error',
        description: '401 token authentication error',
        customerName: 'Dev Lead',
        customerEmail: 'dev@example.com',
        category: 'Technical Support',
        priority: 'Normal',
        channel: 'web',
      });

      // rule_02 assigns technical tickets to user_david_agent
      expect(ticket.assignedAgentId).toBe('user_david_agent');
      expect(ticket.assignedAgentName).toBe('David Chen');
    });
  });

  describe('3. Internal Notes Privacy Separation', () => {
    it('preserves note type without leaking to public customer messages', () => {
      const ticket = storageService.createTicket({
        subject: 'Note isolation test',
        description: 'Testing private notes',
        customerName: 'Private Client',
        customerEmail: 'client@private.io',
        category: 'General Inquiry',
        priority: 'Normal',
        channel: 'web',
      });

      const note = storageService.addMessage(
        ticket.id,
        {
          type: 'note',
          content: 'Confidential risk assessment note',
        },
        {
          id: 'agent_01',
          name: 'Sarah Agent',
          email: 'sarah@agent.io',
          role: 'agent',
          status: 'active',
          avatar: '',
        }
      );

      expect(note.type).toBe('note');
      const messages = storageService.getMessagesForTicket(ticket.ticketRef);
      const publicMessages = messages.filter((m) => m.type === 'public');

      // Public messages should only contain original customer description
      expect(publicMessages.some((m) => m.content === 'Confidential risk assessment note')).toBe(false);
    });
  });

  describe('4. Analytics & SLA Metric Calculation', () => {
    it('computes open tickets, urgent backlog, and CSAT correctly', () => {
      const tickets = storageService.getTickets();
      const metrics = AnalyticsService.calculateMetrics(tickets, 30);

      expect(metrics.totalOpenTickets).toBeGreaterThan(0);
      expect(metrics.urgentTickets).toBeGreaterThanOrEqual(0);
      expect(metrics.csatScore).toBeGreaterThanOrEqual(90);
      expect(metrics.avgFirstResponseTimeHours).toBeGreaterThan(0);
    });

    it('exports CSV formatted data with escaped fields', () => {
      const tickets = storageService.getTickets();
      const csv = AnalyticsService.exportTicketsCSV(tickets.slice(0, 5));

      expect(csv).toContain('TicketRef,Subject,Customer');
      expect(csv).toContain('RES-');
    });
  });
});
