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
} from '../types';

export const initialOrganization: Organization = {
  id: 'org_resolveai_demo',
  name: 'Acme Cloud Technologies',
  type: 'SaaS & Enterprise Services',
  timezone: 'America/Los_Angeles (PST)',
  defaultPriority: 'Normal',
  supportCategories: [
    'Billing',
    'Order and Delivery',
    'Returns and Refunds',
    'Technical Support',
    'Account Access',
    'Product Inquiry',
    'General Inquiry',
    'Other',
  ],
  aiToneDefault: 'Professional',
  aiFeaturesEnabled: {
    triageAnalysis: true,
    replyGenerator: true,
    groundedKB: true,
    summarization: true,
  },
};

export const initialUsers: User[] = [
  {
    id: 'user_sarah_admin',
    name: 'Sarah Lin',
    email: 'sarah.lin@resolveai.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    department: 'Customer Operations',
    assignedTicketsCount: 4,
  },
  {
    id: 'user_alex_mgr',
    name: 'Alex Rivera',
    email: 'alex.rivera@resolveai.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'manager',
    status: 'active',
    department: 'Support Escalations',
    assignedTicketsCount: 5,
  },
  {
    id: 'user_david_agent',
    name: 'David Chen',
    email: 'david.chen@resolveai.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    department: 'Technical Support',
    assignedTicketsCount: 6,
  },
  {
    id: 'user_maya_agent',
    name: 'Maya Patel',
    email: 'maya.patel@resolveai.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    status: 'active',
    department: 'Billing & Accounts',
    assignedTicketsCount: 4,
  },
  {
    id: 'user_elena_cust',
    name: 'Elena Rostova',
    email: 'elena@novatech.co',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    status: 'active',
    department: 'Client (NovaTech)',
    assignedTicketsCount: 0,
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust_01',
    name: 'Elena Rostova',
    email: 'elena@novatech.co',
    phone: '+1 (415) 890-1244',
    company: 'NovaTech Solutions',
    customerSince: '2025-03-12',
    totalTickets: 6,
    openTickets: 2,
    lastInteraction: '2 hours ago',
    notes: 'Key Enterprise Tier customer. Multi-region license renewal coming up next quarter.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_02',
    name: 'Marcus Vance',
    email: 'marcus@aerologistics.com',
    phone: '+1 (206) 441-9821',
    company: 'AeroLogistics Global',
    customerSince: '2025-06-20',
    totalTickets: 4,
    openTickets: 1,
    lastInteraction: '5 hours ago',
    notes: 'High shipping volume client. Sensitive to transit latency tracking.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_03',
    name: 'Sophia Martinez',
    email: 'sophia.m@brightlearn.edu',
    phone: '+1 (617) 552-3001',
    company: 'BrightLearn Academy',
    customerSince: '2025-01-15',
    totalTickets: 5,
    openTickets: 1,
    lastInteraction: '1 day ago',
    notes: 'Higher education institution. Enforces SAML 2.0 strict requirements for faculty and students.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_04',
    name: 'James Thornton',
    email: 'j.thornton@apexretail.io',
    phone: '+1 (312) 709-8822',
    company: 'Apex Retail Brands',
    customerSince: '2025-08-04',
    totalTickets: 3,
    openTickets: 1,
    lastInteraction: 'Yesterday',
    notes: 'E-commerce merchant with automated webhook sync.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_05',
    name: 'Chloe Dubois',
    email: 'chloe@atelierluxe.fr',
    phone: '+33 1 42 68 55 00',
    company: 'Atelier Luxe Paris',
    customerSince: '2025-09-18',
    totalTickets: 4,
    openTickets: 1,
    lastInteraction: '3 days ago',
    notes: 'European Union customer. Requires strict GDPR compliant data export protocols.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_06',
    name: 'Tariq Al-Mansoor',
    email: 'tariq@gulfmedia.ae',
    phone: '+971 4 390 1122',
    company: 'Gulf Media Partners',
    customerSince: '2025-11-02',
    totalTickets: 2,
    openTickets: 1,
    lastInteraction: '2 days ago',
    notes: 'Publishing network. Uses custom API ingestion webhooks.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_07',
    name: 'Hannah Abbott',
    email: 'hannah@summithardware.com',
    phone: '+1 (503) 222-6710',
    company: 'Summit Hardware Supply',
    customerSince: '2026-01-10',
    totalTickets: 3,
    openTickets: 0,
    lastInteraction: '4 days ago',
    notes: 'Wholesale B2B accounts. Regular bulk purchase cycles.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'cust_08',
    name: 'Liam O’Connor',
    email: 'liam@dublindigital.ie',
    phone: '+353 1 496 0019',
    company: 'Dublin Digital Labs',
    customerSince: '2026-02-14',
    totalTickets: 2,
    openTickets: 1,
    lastInteraction: '6 hours ago',
    notes: 'Developer agency integrating with ResolveAI webhooks.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export const initialKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'kb_01',
    title: 'Refund & Return Policy Guidelines',
    summary: 'Standard 30-day return window, eligible product conditions, refund timeline, and return shipping fee policies.',
    category: 'Returns and Refunds',
    tags: ['refund', 'return', 'policy', 'sla', 'money back'],
    status: 'Published',
    authorId: 'user_sarah_admin',
    authorName: 'Sarah Lin',
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2026-01-15T14:30:00Z',
    views: 1240,
    helpfulCount: 382,
    content: `# Refund & Return Policy Guidelines

### 1. Eligibility Window
Customers may initiate a return or exchange within **30 calendar days** from the verified delivery date. 

### 2. Product Condition
Items must be returned in their original packaging, unopened or in like-new condition, with all manuals and included accessories. Custom orders or digital goods once downloaded are non-refundable unless defective.

### 3. Refund Processing Timelines
- Once received at our fulfillment center, items undergo inspection within **2 to 3 business days**.
- Approved refunds are credited to the original payment method within **5 to 7 business days** depending on the customer's financial institution.
- If paid via bank ACH or wire, processing may take up to 10 business days.

### 4. Return Shipping
- If the return is due to damaged merchandise or fulfillment error, ResolveAI will issue a complimentary pre-paid shipping label.
- For buyer remorse or elective returns, the return label fee ($8.50 standard) is deducted from the final refund amount.`,
  },
  {
    id: 'kb_02',
    title: 'Expedited Shipping & Carrier Delay Procedures',
    summary: 'Carrier escalation steps, lost package investigations, and transit delay dispute handling.',
    category: 'Order and Delivery',
    tags: ['shipping', 'fedex', 'ups', 'delay', 'tracking', 'lost package'],
    status: 'Published',
    authorId: 'user_alex_mgr',
    authorName: 'Alex Rivera',
    createdAt: '2025-10-12T10:15:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
    views: 890,
    helpfulCount: 215,
    content: `# Expedited Shipping & Carrier Delay Procedures

### Overview
We partner with FedEx, UPS, and DHL Express. When shipments exceed estimated delivery windows, agents must execute the following protocol.

### Escalation Steps
1. **Verification**: Check tracking status in carrier portal. Confirm if an exception scan exists (e.g., Weather Delay, Address Clarification Needed, Customs Inspection).
2. **Grace Period**: If tracking has not updated for under 48 hours, reassure the customer that carriers batch scans during transit hubs.
3. **Lost Package Tracer**: If a domestic shipment has no scan updates for **more than 4 consecutive business days**, open an official carrier tracer.
4. **Replacement Authorization**: If the carrier confirms loss or no resolution within 5 business days, dispatch an expedited replacement order with 1-Day Air priority at no extra cost to the customer.`,
  },
  {
    id: 'kb_03',
    title: 'API Authentication & Rate Limit Best Practices',
    summary: 'Bearer token configuration, rate limit thresholds (120 req/min), exponential backoff, and 401 error resolution.',
    category: 'Technical Support',
    tags: ['api', 'authentication', 'rate limit', 'token', '401 error', '429'],
    status: 'Published',
    authorId: 'user_david_agent',
    authorName: 'David Chen',
    createdAt: '2025-11-05T14:20:00Z',
    updatedAt: '2026-02-28T16:45:00Z',
    views: 1540,
    helpfulCount: 412,
    content: `# API Authentication & Rate Limit Best Practices

### Authentication Standard
All API calls must include the authorized API Key formatted in the HTTP \`Authorization\` header:
\`\`\`http
Authorization: Bearer res_live_xxxxxxxxxxxxxxxx
\`\`\`

### Common Error Codes
- **401 Unauthorized**: Key is revoked, malformed, or missing the 'Bearer ' prefix. Verify in Settings > Developer Keys.
- **403 Forbidden**: Token lacks the required workspace scope (e.g. attempting to mutate tickets with a read-only token).
- **429 Too Many Requests**: You have exceeded the active workspace quota.

### Rate Limits
- **Standard Tier**: 120 requests per minute per IP address.
- **Enterprise Tier**: 1,200 requests per minute with burst capability.
- Clients should implement an **Exponential Backoff** with jitter algorithm when encountering HTTP 429.`,
  },
  {
    id: 'kb_04',
    title: 'SSO SAML 2.0 Configuration for Okta, Azure AD, & Google',
    summary: 'Step-by-step setup guide for Single Sign-On, Entity ID, ACS URL, and certificate rotation.',
    category: 'Account Access',
    tags: ['sso', 'saml', 'okta', 'azure ad', 'security', 'login'],
    status: 'Published',
    authorId: 'user_sarah_admin',
    authorName: 'Sarah Lin',
    createdAt: '2025-12-01T08:30:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
    views: 670,
    helpfulCount: 184,
    content: `# SSO SAML 2.0 Configuration Guide

### Requirements
- Administrator access to your Identity Provider (IdP) such as Okta, Microsoft Entra ID (Azure AD), or Google Workspace.
- Enterprise subscription on ResolveAI.

### Service Provider (SP) Metadata
- **Entity ID**: \`https://app.resolveai.io/auth/saml/metadata\`
- **Assertion Consumer Service (ACS) URL**: \`https://app.resolveai.io/auth/saml/callback\`
- **NameID Format**: \`urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress\`

### Attribute Mapping
Map the following mandatory claims in your IdP:
- \`email\` -> user.email
- \`firstName\` -> user.firstName
- \`lastName\` -> user.lastName
- \`role\` -> user.resolveai_role (Optional: admin, manager, agent)`,
  },
  {
    id: 'kb_05',
    title: 'Subscription Billing, Proration, & Invoice FAQ',
    summary: 'Explanation of seat-based billing, mid-cycle upgrades, proration calculations, and sales tax compliance.',
    category: 'Billing',
    tags: ['billing', 'invoice', 'seat', 'proration', 'payment', 'upgrade'],
    status: 'Published',
    authorId: 'user_maya_agent',
    authorName: 'Maya Patel',
    createdAt: '2026-01-05T11:45:00Z',
    updatedAt: '2026-03-01T09:15:00Z',
    views: 920,
    helpfulCount: 290,
    content: `# Subscription Billing & Proration Guide

### Billing Model
ResolveAI charges per active agent seat per monthly or annual billing period. Customers can invite unlimited viewer or customer portal accounts at zero extra charge.

### Mid-Cycle Upgrades & Prorations
- When you add a new seat mid-billing cycle, you are charged a prorated amount for the exact remaining days until the next renewal.
- When removing a seat, changes take effect at the end of the current billing cycle to avoid service interruptions.

### Invoices & Payment Receipts
All PDF invoices are automatically generated on the 1st of each calendar month and can be downloaded from **Settings > Billing & Invoices**. Payment failures automatically trigger 3 retry attempts over 7 days before account suspension.`,
  },
  {
    id: 'kb_06',
    title: 'GDPR Data Portability & Customer Export Procedures',
    summary: 'How to process Article 20 data export requests, ticket archive downloads, and privacy deletion requests.',
    category: 'General Inquiry',
    tags: ['gdpr', 'data export', 'privacy', 'compliance', 'security'],
    status: 'Published',
    authorId: 'user_sarah_admin',
    authorName: 'Sarah Lin',
    createdAt: '2026-01-18T13:00:00Z',
    updatedAt: '2026-02-14T15:20:00Z',
    views: 430,
    helpfulCount: 110,
    content: `# GDPR Data Portability & Customer Export Procedures

### Overview
ResolveAI complies with EU GDPR and California CCPA/CPRA regulations. Account owners or authorized representatives may request a machine-readable archive of all ticket messages, customer notes, and audit history.

### Exporting Customer Data
1. Navigate to **Settings > Data Management**.
2. Select **Export Customer Archive** or target a specific Customer ID.
3. The platform compiles a encrypted ZIP file containing \`tickets.json\`, \`messages.json\`, and attachments.
4. Export links expire after 72 hours for security.

### Right to Erasure (Deletion)
Upon verified request, administrators can permanently redact personally identifiable information (PII) while preserving anonymized aggregate analytics.`,
  },
  {
    id: 'kb_07',
    title: 'Webhook Verification & Signature Troubleshooting',
    summary: 'Validating HMAC-SHA256 signatures, retry backoff policies, and debugging dropped payloads.',
    category: 'Technical Support',
    tags: ['webhook', 'hmac', 'signature', 'payload', 'troubleshooting'],
    status: 'Published',
    authorId: 'user_david_agent',
    authorName: 'David Chen',
    createdAt: '2026-02-01T15:30:00Z',
    updatedAt: '2026-02-25T17:10:00Z',
    views: 780,
    helpfulCount: 195,
    content: `# Webhook Verification & Signature Troubleshooting

### Signature Header
Each webhook event dispatch includes the \`X-ResolveAI-Signature\` header. You must compute an HMAC with SHA-256 using your workspace webhook secret key:
\`\`\`js
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
\`\`\`

### Common Pitfalls
1. **Body Parsing**: Ensure your server calculates the hash against the *raw unparsed body string*, not after parsing JSON.
2. **Timeout SLA**: Endpoint must respond with a 2xx HTTP status within 5.0 seconds. Otherwise, ResolveAI marks the delivery as failed.
3. **Retry Policy**: Failed attempts are retried up to 5 times at 1m, 5m, 30m, 2h, and 6h intervals.`,
  },
  {
    id: 'kb_08',
    title: 'Return Merchandise Authorization (RMA) Workflow Draft',
    summary: 'Internal guidelines for issuing RMA numbers for hardware replacements and warehouse quarantine tracking.',
    category: 'Returns and Refunds',
    tags: ['rma', 'hardware', 'internal', 'warehouse'],
    status: 'Draft',
    authorId: 'user_alex_mgr',
    authorName: 'Alex Rivera',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-02T11:20:00Z',
    views: 65,
    helpfulCount: 12,
    content: `# Return Merchandise Authorization (RMA) Workflow (DRAFT)

*Note: This internal guide is currently in draft status and awaiting legal review.*

### Qualification
- Applied only to physical hardware devices or physical tokens.
- Item must have an active manufacturer serial number linked to the tenant's purchase order.

### Issuing RMA
1. Generate unique reference: \`RMA-[YEAR]-[TICKET_ID]\`.
2. Attach quarantine checklist to warehouse distribution center.
3. Await bench diagnostic report before authorizing hardware credit.`,
  },
];

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'rule_01',
    name: 'Auto-Escalate Billing Disputes to Urgent',
    description: 'When a ticket is created in Billing category with priority Normal, escalate to High priority automatically.',
    trigger: 'ticket_created',
    conditionField: 'category',
    conditionOperator: 'equals',
    conditionValue: 'Billing',
    actionType: 'set_priority',
    actionValue: 'High',
    enabled: true,
    executionCount: 14,
    lastExecutedAt: '2026-03-03T10:14:00Z',
  },
  {
    id: 'rule_02',
    name: 'Route Technical Issues to David Chen',
    description: 'When a technical support ticket is created, auto-assign to senior tech specialist David Chen.',
    trigger: 'ticket_created',
    conditionField: 'category',
    conditionOperator: 'equals',
    conditionValue: 'Technical Support',
    actionType: 'assign_agent',
    actionValue: 'user_david_agent',
    enabled: true,
    executionCount: 22,
    lastExecutedAt: '2026-03-03T11:45:00Z',
  },
  {
    id: 'rule_03',
    name: 'Tag Urgent Customer Tickets with Critical SLA',
    description: 'When ticket priority changes to Urgent, apply internal audit tag "critical-sla".',
    trigger: 'priority_changed',
    conditionField: 'priority',
    conditionOperator: 'equals',
    conditionValue: 'Urgent',
    actionType: 'add_tag',
    actionValue: 'critical-sla',
    enabled: true,
    executionCount: 9,
    lastExecutedAt: '2026-03-02T16:20:00Z',
  },
  {
    id: 'rule_04',
    name: 'Auto-Assign Unassigned Refunds to Maya Patel',
    description: 'Ensure Returns & Refunds tickets are assigned to Maya for rapid inspection tracking.',
    trigger: 'ticket_created',
    conditionField: 'category',
    conditionOperator: 'equals',
    conditionValue: 'Returns and Refunds',
    actionType: 'assign_agent',
    actionValue: 'user_maya_agent',
    enabled: true,
    executionCount: 11,
    lastExecutedAt: '2026-03-01T14:10:00Z',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Urgent Ticket Created',
    description: 'RES-1042: Production API 500 error on checkout webhook needs urgent attention.',
    link: '/tickets/RES-1042',
    type: 'urgent',
    read: false,
    createdAt: '15 minutes ago',
  },
  {
    id: 'notif_02',
    title: 'Ticket Assigned to You',
    description: 'Alex Rivera assigned RES-1039 (SAML SSO Certificate Expired) to your queue.',
    link: '/tickets/RES-1039',
    type: 'assigned',
    read: false,
    createdAt: '1 hour ago',
  },
  {
    id: 'notif_03',
    title: 'Customer Replied',
    description: 'Elena Rostova replied on RES-1035: "We provided the updated log trace."',
    link: '/tickets/RES-1035',
    type: 'customer_reply',
    read: true,
    createdAt: '3 hours ago',
  },
  {
    id: 'notif_04',
    title: 'Automation Rule Executed',
    description: 'Rule "Route Technical Issues to David Chen" executed successfully on RES-1040.',
    link: '/automation',
    type: 'system',
    read: true,
    createdAt: '5 hours ago',
  },
];

export const initialAuditEvents: AuditEvent[] = [
  {
    id: 'audit_01',
    actorId: 'user_alex_mgr',
    actorName: 'Alex Rivera',
    actorRole: 'manager',
    action: 'Status Changed',
    targetType: 'ticket',
    targetId: 'RES-1038',
    targetRef: 'RES-1038',
    details: 'Changed status from In Progress to Resolved after carrier tracer completed.',
    createdAt: '2026-03-03T09:30:00Z',
  },
  {
    id: 'audit_02',
    actorId: 'user_sarah_admin',
    actorName: 'Sarah Lin',
    actorRole: 'admin',
    action: 'Article Published',
    targetType: 'article',
    targetId: 'kb_07',
    targetRef: 'kb_07',
    details: 'Published new knowledge base guide: Webhook Verification & Signature Troubleshooting.',
    createdAt: '2026-03-02T14:15:00Z',
  },
  {
    id: 'audit_03',
    actorId: 'system_automation',
    actorName: 'Automation Engine',
    actorRole: 'admin',
    action: 'Rule Executed',
    targetType: 'rule',
    targetId: 'rule_01',
    targetRef: 'RES-1041',
    details: 'Evaluated rule "Auto-Escalate Billing Disputes" on ticket creation. Priority raised to High.',
    createdAt: '2026-03-02T11:00:00Z',
  },
  {
    id: 'audit_04',
    actorId: 'user_david_agent',
    actorName: 'David Chen',
    actorRole: 'agent',
    action: 'Internal Note Added',
    targetType: 'ticket',
    targetId: 'RES-1035',
    targetRef: 'RES-1035',
    details: 'Documented engineering ticket JIRA-4412 for database connection pooling investigation.',
    createdAt: '2026-03-01T16:40:00Z',
  },
  {
    id: 'audit_05',
    actorId: 'user_sarah_admin',
    actorName: 'Sarah Lin',
    actorRole: 'admin',
    action: 'Settings Updated',
    targetType: 'organization',
    targetId: 'org_resolveai_demo',
    targetRef: 'Acme Cloud Technologies',
    details: 'Updated default AI response tone preference to "Professional".',
    createdAt: '2026-03-01T08:20:00Z',
  },
];

// At least 20 realistic support tickets with diverse categories, statuses, priorities, customers, and rich dialog
export const initialTickets: Ticket[] = [
  {
    id: 'RES-1042',
    ticketRef: 'RES-1042',
    subject: 'Production API returning 500 on checkout webhook verification',
    description:
      'Starting today at 08:30 UTC, our checkout webhook receiver began failing signature checks and throwing 500 errors. We are losing sales notifications. We rechecked our secret key and the raw payload hash does not match the X-ResolveAI-Signature header.',
    customerId: 'cust_04',
    customerName: 'James Thornton',
    customerEmail: 'j.thornton@apexretail.io',
    customerCompany: 'Apex Retail Brands',
    category: 'Technical Support',
    priority: 'Urgent',
    status: 'In Progress',
    channel: 'web',
    assignedAgentId: 'user_david_agent',
    assignedAgentName: 'David Chen',
    orderId: 'ORD-98441',
    createdAt: '2026-03-03T08:45:00Z',
    updatedAt: '2026-03-03T10:15:00Z',
    tags: ['api', 'webhook', 'critical-sla'],
    aiAnalysis: {
      category: 'Technical Support',
      sentiment: 'Highly Frustrated',
      recommendedPriority: 'Urgent',
      shortSummary: 'Customer reports critical checkout webhook delivery failures and signature mismatch causing missed revenue transactions.',
      customerIntent: 'Immediate technical fix for HMAC-SHA256 signature verification in webhook service.',
      suggestedNextAction: 'Review HMAC raw body encoding and recent webhook service deployment logs. Recommend testing using Article kb_07.',
      confidenceIndicator: 0.96,
      potentialUrgencySignals: ['Loss of sales notifications', 'Production 500 errors', 'Checkout impacted'],
      isLiveGemini: false,
      analyzedAt: '2026-03-03T08:46:00Z',
    },
  },
  {
    id: 'RES-1041',
    ticketRef: 'RES-1041',
    subject: 'Double charge on March annual subscription renewal invoice',
    description:
      'We noticed two identical charges of $2,400 on our corporate Visa statement on March 1st. Please investigate and refund the duplicate transaction immediately as our finance team flagged this.',
    customerId: 'cust_01',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@novatech.co',
    customerCompany: 'NovaTech Solutions',
    category: 'Billing',
    priority: 'High',
    status: 'Open',
    channel: 'email',
    assignedAgentId: 'user_maya_agent',
    assignedAgentName: 'Maya Patel',
    orderId: 'INV-2026-03-01',
    createdAt: '2026-03-02T16:10:00Z',
    updatedAt: '2026-03-03T09:00:00Z',
    tags: ['billing', 'duplicate-charge', 'finance'],
    aiAnalysis: {
      category: 'Billing',
      sentiment: 'Frustrated',
      recommendedPriority: 'High',
      shortSummary: 'Duplicate transaction charged on customer corporate credit card for annual subscription.',
      customerIntent: 'Requesting refund for duplicate invoice charge of $2,400.',
      suggestedNextAction: 'Audit Stripe charge records, confirm duplicate authorization, and initiate instant refund with confirmation receipt.',
      confidenceIndicator: 0.94,
      potentialUrgencySignals: ['Duplicate $2,400 charge', 'Corporate finance flag'],
      isLiveGemini: false,
      analyzedAt: '2026-03-02T16:11:00Z',
    },
  },
  {
    id: 'RES-1040',
    ticketRef: 'RES-1040',
    subject: 'Carrier tracking stuck in transit for 5 days without scan',
    description:
      'Shipment #EXP-44019 sent via FedEx 2-Day Air has been showing "In Transit - Memphis Hub" since February 26. The estimated delivery date was February 28. Our logistics team urgently needs the actual delivery status.',
    customerId: 'cust_02',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@aerologistics.com',
    customerCompany: 'AeroLogistics Global',
    category: 'Order and Delivery',
    priority: 'High',
    status: 'In Progress',
    channel: 'email',
    assignedAgentId: 'user_alex_mgr',
    assignedAgentName: 'Alex Rivera',
    orderId: 'EXP-44019',
    createdAt: '2026-03-02T11:20:00Z',
    updatedAt: '2026-03-03T08:30:00Z',
    tags: ['shipping', 'carrier-delay', 'tracer'],
  },
  {
    id: 'RES-1039',
    ticketRef: 'RES-1039',
    subject: 'SSO SAML certificate expiration causing faculty login lockouts',
    description:
      'Our Okta administrator noticed our SP signing certificate is expiring in 48 hours. When trying to rotate the x509 cert in ResolveAI settings, the upload interface rejected the PEM format.',
    customerId: 'cust_03',
    customerName: 'Sophia Martinez',
    customerEmail: 'sophia.m@brightlearn.edu',
    customerCompany: 'BrightLearn Academy',
    category: 'Account Access',
    priority: 'Urgent',
    status: 'Open',
    channel: 'chat',
    assignedAgentId: 'user_sarah_admin',
    assignedAgentName: 'Sarah Lin',
    createdAt: '2026-03-02T09:15:00Z',
    updatedAt: '2026-03-02T14:40:00Z',
    tags: ['sso', 'security', 'okta'],
  },
  {
    id: 'RES-1038',
    ticketRef: 'RES-1038',
    subject: 'RMA request for 3 defective warehouse barcode scanner terminals',
    description:
      'Three optical scanning units from our latest bulk fulfillment kit fail to hold charge past 20 minutes. We have verified against standard test cables. We need an RMA number to return these for warranty replacement.',
    customerId: 'cust_07',
    customerName: 'Hannah Abbott',
    customerEmail: 'hannah@summithardware.com',
    customerCompany: 'Summit Hardware Supply',
    category: 'Returns and Refunds',
    priority: 'Normal',
    status: 'Resolved',
    channel: 'web',
    assignedAgentId: 'user_maya_agent',
    assignedAgentName: 'Maya Patel',
    orderId: 'RMA-2026-092',
    createdAt: '2026-02-27T10:00:00Z',
    updatedAt: '2026-03-01T15:00:00Z',
    resolvedAt: '2026-03-01T15:00:00Z',
    firstResponseAt: '2026-02-27T10:45:00Z',
    tags: ['rma', 'hardware', 'warranty'],
  },
  {
    id: 'RES-1037',
    ticketRef: 'RES-1037',
    subject: 'GDPR Article 20 Full Data Portability Export Request',
    description:
      'Under GDPR Article 20, our legal privacy compliance department requests a complete machine-readable JSON archive of all tickets, conversations, and interaction history associated with the Atelier Luxe tenant domain.',
    customerId: 'cust_05',
    customerName: 'Chloe Dubois',
    customerEmail: 'chloe@atelierluxe.fr',
    customerCompany: 'Atelier Luxe Paris',
    category: 'General Inquiry',
    priority: 'Normal',
    status: 'Waiting for Customer',
    channel: 'email',
    assignedAgentId: 'user_sarah_admin',
    assignedAgentName: 'Sarah Lin',
    createdAt: '2026-02-26T14:30:00Z',
    updatedAt: '2026-03-01T10:10:00Z',
    firstResponseAt: '2026-02-26T16:00:00Z',
    tags: ['gdpr', 'compliance', 'privacy'],
  },
  {
    id: 'RES-1036',
    ticketRef: 'RES-1036',
    subject: 'Inquiry regarding GraphQL Subscriptions support for real-time ticket stream',
    description:
      'We are building an internal mission-control wallboard for our command center. Does the ResolveAI REST API support WebSocket or GraphQL subscriptions for instantaneous ticket status changes?',
    customerId: 'cust_08',
    customerName: 'Liam O’Connor',
    customerEmail: 'liam@dublindigital.ie',
    customerCompany: 'Dublin Digital Labs',
    category: 'Product Inquiry',
    priority: 'Low',
    status: 'Closed',
    channel: 'chat',
    assignedAgentId: 'user_david_agent',
    assignedAgentName: 'David Chen',
    createdAt: '2026-02-24T11:00:00Z',
    updatedAt: '2026-02-25T14:30:00Z',
    resolvedAt: '2026-02-25T14:30:00Z',
    firstResponseAt: '2026-02-24T11:20:00Z',
    tags: ['api', 'feature-request', 'graphql'],
  },
  {
    id: 'RES-1035',
    ticketRef: 'RES-1035',
    subject: 'Database connection pool timeout during automated batch import',
    description:
      'When our automated ETL pipeline uploads more than 500 records simultaneously via the bulk ticket ingestion endpoint, we receive intermittent 504 Gateway Timeouts from the proxy.',
    customerId: 'cust_01',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@novatech.co',
    customerCompany: 'NovaTech Solutions',
    category: 'Technical Support',
    priority: 'High',
    status: 'In Progress',
    channel: 'web',
    assignedAgentId: 'user_david_agent',
    assignedAgentName: 'David Chen',
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-03-02T17:15:00Z',
    firstResponseAt: '2026-02-25T08:40:00Z',
    tags: ['technical', 'database', 'performance'],
  },
  {
    id: 'RES-1034',
    ticketRef: 'RES-1034',
    subject: 'Need tax exemption certificate applied to upcoming billing statement',
    description:
      'BrightLearn Academy is a 501(c)(3) accredited educational institution. Attached is our official state sales tax exemption certification form. Please update our billing account before the April 1 billing run.',
    customerId: 'cust_03',
    customerName: 'Sophia Martinez',
    customerEmail: 'sophia.m@brightlearn.edu',
    customerCompany: 'BrightLearn Academy',
    category: 'Billing',
    priority: 'Normal',
    status: 'Waiting for Customer',
    channel: 'email',
    assignedAgentId: 'user_maya_agent',
    assignedAgentName: 'Maya Patel',
    createdAt: '2026-02-23T15:20:00Z',
    updatedAt: '2026-02-27T11:00:00Z',
    firstResponseAt: '2026-02-23T16:15:00Z',
    tags: ['billing', 'tax', 'non-profit'],
  },
  {
    id: 'RES-1033',
    ticketRef: 'RES-1033',
    subject: 'Wrong item received in order #EXP-39120',
    description:
      'We ordered 10 Enterprise Hardware Security Keys but received 10 standard USB-A authenticator dongles. We cannot deploy these to our compliance team.',
    customerId: 'cust_06',
    customerName: 'Tariq Al-Mansoor',
    customerEmail: 'tariq@gulfmedia.ae',
    customerCompany: 'Gulf Media Partners',
    category: 'Order and Delivery',
    priority: 'High',
    status: 'Open',
    channel: 'web',
    assignedAgentId: 'user_alex_mgr',
    assignedAgentName: 'Alex Rivera',
    orderId: 'EXP-39120',
    createdAt: '2026-03-01T09:40:00Z',
    updatedAt: '2026-03-02T13:20:00Z',
    tags: ['fulfillment', 'wrong-item'],
  },
  {
    id: 'RES-1032',
    ticketRef: 'RES-1032',
    subject: 'User invitation emails not being received on corporate domain',
    description:
      'When our manager invites new support agents using our @aerologistics.com email addresses, none of the invitation links arrive in inboxes or spam folders. Can you check mail delivery logs?',
    customerId: 'cust_02',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@aerologistics.com',
    customerCompany: 'AeroLogistics Global',
    category: 'Account Access',
    priority: 'Normal',
    status: 'In Progress',
    channel: 'email',
    assignedAgentId: 'user_sarah_admin',
    assignedAgentName: 'Sarah Lin',
    createdAt: '2026-02-28T14:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
    tags: ['email-deliverability', 'onboarding'],
  },
  {
    id: 'RES-1031',
    ticketRef: 'RES-1031',
    subject: 'Request for custom enterprise SLA addendum and dedicated Slack channel',
    description:
      'We are finalizing our enterprise upgrade and our legal counsel requires an explicit 15-minute response time SLA for critical P1 incidents, plus a shared Slack Connect channel.',
    customerId: 'cust_04',
    customerName: 'James Thornton',
    customerEmail: 'j.thornton@apexretail.io',
    customerCompany: 'Apex Retail Brands',
    category: 'General Inquiry',
    priority: 'Normal',
    status: 'Open',
    channel: 'phone',
    assignedAgentId: 'user_alex_mgr',
    assignedAgentName: 'Alex Rivera',
    createdAt: '2026-03-02T12:00:00Z',
    updatedAt: '2026-03-02T16:30:00Z',
    tags: ['enterprise', 'sla', 'contract'],
  },
  {
    id: 'RES-1030',
    ticketRef: 'RES-1030',
    subject: 'Refund request for damaged transit carton box',
    description:
      'The package arrived severely damaged by moisture. The packaging seals were broken and the retail box is unsellable. Requesting full refund or credit.',
    customerId: 'cust_05',
    customerName: 'Chloe Dubois',
    customerEmail: 'chloe@atelierluxe.fr',
    customerCompany: 'Atelier Luxe Paris',
    category: 'Returns and Refunds',
    priority: 'Normal',
    status: 'Resolved',
    channel: 'web',
    assignedAgentId: 'user_maya_agent',
    assignedAgentName: 'Maya Patel',
    orderId: 'ORD-88129',
    createdAt: '2026-02-20T10:15:00Z',
    updatedAt: '2026-02-22T14:00:00Z',
    resolvedAt: '2026-02-22T14:00:00Z',
    firstResponseAt: '2026-02-20T11:00:00Z',
    tags: ['refund', 'damaged-goods'],
  },
  {
    id: 'RES-1029',
    ticketRef: 'RES-1029',
    subject: 'How to configure custom webhook retry policy in workspace settings',
    description:
      'We want to adjust our endpoint retry timing from the default exponential backoff to a linear 10-minute retry cadence. Is this configurable through the UI or API?',
    customerId: 'cust_08',
    customerName: 'Liam O’Connor',
    customerEmail: 'liam@dublindigital.ie',
    customerCompany: 'Dublin Digital Labs',
    category: 'Technical Support',
    priority: 'Low',
    status: 'Closed',
    channel: 'web',
    assignedAgentId: 'user_david_agent',
    assignedAgentName: 'David Chen',
    createdAt: '2026-02-18T09:30:00Z',
    updatedAt: '2026-02-19T13:45:00Z',
    resolvedAt: '2026-02-19T13:45:00Z',
    firstResponseAt: '2026-02-18T10:15:00Z',
    tags: ['webhook', 'configuration'],
  },
  {
    id: 'RES-1028',
    ticketRef: 'RES-1028',
    subject: 'Two-Factor Authentication device lost, backup codes not working',
    description:
      'Our lead finance operator lost their authenticator smartphone during travel. The printed backup codes return "Invalid Code". We need emergency identity recovery to approve payroll batch.',
    customerId: 'cust_07',
    customerName: 'Hannah Abbott',
    customerEmail: 'hannah@summithardware.com',
    customerCompany: 'Summit Hardware Supply',
    category: 'Account Access',
    priority: 'Urgent',
    status: 'In Progress',
    channel: 'phone',
    assignedAgentId: 'user_sarah_admin',
    assignedAgentName: 'Sarah Lin',
    createdAt: '2026-03-01T15:00:00Z',
    updatedAt: '2026-03-02T11:30:00Z',
    tags: ['2fa', 'security', 'urgent-lockout'],
  },
  {
    id: 'RES-1027',
    ticketRef: 'RES-1027',
    subject: 'Can we pay via annual Wire/ACH instead of credit card?',
    description:
      'Our procurement guidelines require net-30 vendor invoices paid via SWIFT / ACH direct wire. How can we switch our billing profile from recurring credit card to bank transfer?',
    customerId: 'cust_06',
    customerName: 'Tariq Al-Mansoor',
    customerEmail: 'tariq@gulfmedia.ae',
    customerCompany: 'Gulf Media Partners',
    category: 'Billing',
    priority: 'Low',
    status: 'Resolved',
    channel: 'email',
    assignedAgentId: 'user_maya_agent',
    assignedAgentName: 'Maya Patel',
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-02-16T14:20:00Z',
    resolvedAt: '2026-02-16T14:20:00Z',
    firstResponseAt: '2026-02-15T12:00:00Z',
    tags: ['billing', 'ach', 'wire'],
  },
  {
    id: 'RES-1026',
    ticketRef: 'RES-1026',
    subject: 'Package marked delivered but missing from front reception desk',
    description:
      'Tracking for order #EXP-38910 claims delivered at 14:22 yesterday with signature "FRONT DESK", but our security camera shows no courier arrived. Please initiate a delivery dispute.',
    customerId: 'cust_02',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus@aerologistics.com',
    customerCompany: 'AeroLogistics Global',
    category: 'Order and Delivery',
    priority: 'High',
    status: 'Waiting for Customer',
    channel: 'web',
    assignedAgentId: 'user_alex_mgr',
    assignedAgentName: 'Alex Rivera',
    orderId: 'EXP-38910',
    createdAt: '2026-02-25T16:00:00Z',
    updatedAt: '2026-02-28T09:30:00Z',
    tags: ['shipping', 'dispute', 'misdelivery'],
  },
  {
    id: 'RES-1025',
    ticketRef: 'RES-1025',
    subject: 'Security inquiry regarding SOC2 Type II report and penetration test summary',
    description:
      'Our annual vendor risk assessment committee requires ResolveAI latest SOC2 Type II audit report and third-party penetration test executive summary before contract signing.',
    customerId: 'cust_03',
    customerName: 'Sophia Martinez',
    customerEmail: 'sophia.m@brightlearn.edu',
    customerCompany: 'BrightLearn Academy',
    category: 'General Inquiry',
    priority: 'Normal',
    status: 'Resolved',
    channel: 'email',
    assignedAgentId: 'user_sarah_admin',
    assignedAgentName: 'Sarah Lin',
    createdAt: '2026-02-10T14:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
    resolvedAt: '2026-02-12T10:00:00Z',
    firstResponseAt: '2026-02-10T14:45:00Z',
    tags: ['security', 'compliance', 'soc2'],
  },
  {
    id: 'RES-1024',
    ticketRef: 'RES-1024',
    subject: 'Bulk CSV user upload failing on non-ASCII foreign characters in names',
    description:
      'When uploading a roster containing French and German accents (e.g. Noël, Müller), the CSV validator throws a "Malformed character encoding" error.',
    customerId: 'cust_05',
    customerName: 'Chloe Dubois',
    customerEmail: 'chloe@atelierluxe.fr',
    customerCompany: 'Atelier Luxe Paris',
    category: 'Technical Support',
    priority: 'Normal',
    status: 'New',
    channel: 'web',
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-03T11:00:00Z',
    tags: ['csv', 'encoding', 'utf8'],
  },
  {
    id: 'RES-1023',
    ticketRef: 'RES-1023',
    subject: 'Question on adding seasonal seat licenses for upcoming Black Friday',
    description:
      'We anticipate a 300% surge in support requests during November and want to temporarily add 25 temporary seats for 60 days without being locked into a 12-month contract.',
    customerId: 'cust_04',
    customerName: 'James Thornton',
    customerEmail: 'j.thornton@apexretail.io',
    customerCompany: 'Apex Retail Brands',
    category: 'Product Inquiry',
    priority: 'Low',
    status: 'New',
    channel: 'email',
    createdAt: '2026-03-03T11:30:00Z',
    updatedAt: '2026-03-03T11:30:00Z',
    tags: ['sales', 'licensing', 'seasonal'],
  },
  {
    id: 'RES-1022',
    ticketRef: 'RES-1022',
    subject: 'Incorrect currency symbol displayed on Euro statements',
    description:
      'Our monthly statement shows € amount numbers but the summary table header displays USD $. This is causing confusion with our European accounting audits.',
    customerId: 'cust_05',
    customerName: 'Chloe Dubois',
    customerEmail: 'chloe@atelierluxe.fr',
    customerCompany: 'Atelier Luxe Paris',
    category: 'Billing',
    priority: 'Low',
    status: 'Closed',
    channel: 'web',
    assignedAgentId: 'user_maya_agent',
    assignedAgentName: 'Maya Patel',
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-06T15:00:00Z',
    resolvedAt: '2026-02-06T15:00:00Z',
    firstResponseAt: '2026-02-05T10:30:00Z',
    tags: ['billing', 'currency', 'ui'],
  },
];

export const initialMessages: Record<string, TicketMessage[]> = {
  'RES-1042': [
    {
      id: 'msg_1042_01',
      ticketId: 'RES-1042',
      senderId: 'cust_04',
      senderName: 'James Thornton',
      senderRole: 'customer',
      senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      type: 'public',
      content:
        'Starting today at 08:30 UTC, our checkout webhook receiver began failing signature checks and throwing 500 errors. We are losing sales notifications. We rechecked our secret key and the raw payload hash does not match the X-ResolveAI-Signature header.',
      createdAt: '2026-03-03T08:45:00Z',
    },
    {
      id: 'msg_1042_02',
      ticketId: 'RES-1042',
      senderId: 'user_david_agent',
      senderName: 'David Chen',
      senderRole: 'agent',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      type: 'note',
      content:
        'INTERNAL NOTE: Checked ingress logs. Apex Retail payload parser seems to be doing automatic URL-decoding before HMAC evaluation, which mutates plus signs into spaces. Reviewing Article kb_07 to formulate response.',
      createdAt: '2026-03-03T09:10:00Z',
    },
    {
      id: 'msg_1042_03',
      ticketId: 'RES-1042',
      senderId: 'user_david_agent',
      senderName: 'David Chen',
      senderRole: 'agent',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      type: 'public',
      content:
        'Hi James, thank you for alerting us immediately. I am reviewing the webhook transmission logs for Apex Retail. Could you verify if your receiver middleware parses JSON before or after calculating the HMAC SHA-256? Per our documentation, calculating against parsed objects can alter key order or whitespace. We are also running replay tests right now.',
      createdAt: '2026-03-03T09:35:00Z',
    },
  ],
  'RES-1041': [
    {
      id: 'msg_1041_01',
      ticketId: 'RES-1041',
      senderId: 'cust_01',
      senderName: 'Elena Rostova',
      senderRole: 'customer',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      type: 'public',
      content:
        'We noticed two identical charges of $2,400 on our corporate Visa statement on March 1st. Please investigate and refund the duplicate transaction immediately as our finance team flagged this.',
      createdAt: '2026-03-02T16:10:00Z',
    },
    {
      id: 'msg_1041_02',
      ticketId: 'RES-1041',
      senderId: 'user_maya_agent',
      senderName: 'Maya Patel',
      senderRole: 'agent',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'note',
      content:
        'INTERNAL NOTE: Confirmed in Stripe gateway that network retry created duplicate intent ch_3Mxx91 and ch_3Mxx92. Need approval from Alex Rivera to process the $2,400 void before end of day.',
      createdAt: '2026-03-02T16:45:00Z',
    },
    {
      id: 'msg_1041_03',
      ticketId: 'RES-1041',
      senderId: 'user_maya_agent',
      senderName: 'Maya Patel',
      senderRole: 'agent',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'public',
      content:
        'Hello Elena, thank you for reaching out to us. I apologize for the concern this caused. Our billing records show that an idempotent network retry triggered a duplicate payment authorization for invoice INV-2026-03-01. I have escalated this to our operations manager to release the pending charge back to your account. I will send your refund receipt shortly.',
      createdAt: '2026-03-03T09:00:00Z',
    },
  ],
};
