# ResolveAI — AI-Assisted Customer Support & Issue Management Platform

ResolveAI is a production-quality, responsive B2B SaaS application designed to help support organizations triage urgent customer issues, draft accurate policy-grounded replies, automate routing, and track SLA resolution metrics.

---

## 🚀 Key Features

### 1. Intelligent Ticket Management
- **Automated Reference Generation**: Human-readable sequential reference numbers (`RES-1042`).
- **Comprehensive Lifecycle States**: `New` ➔ `Open` ➔ `In Progress` ➔ `Waiting for Customer` ➔ `Resolved` ➔ `Closed`.
- **Status Workflow Protection**: Reopening closed tickets is an explicit, audited action.
- **Privacy Partitioning**: Internal notes (marked with a lock and amber styling) are strictly separated from customer-facing messages and are never exposed in public communications.
- **Bulk Actions**: Multi-select bulk reassignment and status progression with feedback toasts.
- **Advanced Filtering & Search**: Filter presets ("My Assigned Queue", "Urgent & Critical", "Unassigned", "Waiting for Customer", "Resolved Archive"), category, priority, and debounced text search.

### 2. Google Gemini 3.8 Flash AI Assistant
- **Feature A: Automatic Ticket Triage & Intent Analysis**:
  - Classifies category, sentiment, recommended priority, executive summary, customer intent, suggested next action, confidence score, and urgency signals via structured JSON schema.
- **Feature B: Adaptive Reply Generator**:
  - Four distinct tones: *Professional*, *Friendly*, *Concise*, *Empathetic*.
  - Grounded in authorized knowledge-base articles. Allows previewing, editing, copying, and saving drafts without ever sending automatically.
- **Feature C: Grounded Knowledge Base Assistant**:
  - Conversational Q&A interface strictly grounded in published organization policies.
  - Cites specific article sources and declares when information is absent, recommending human escalation rather than fabricating answers.
- **Feature D: Conversation Thread Summarizer**:
  - Synthesizes long multi-turn ticket threads into structured summaries (core issue, attempted steps, important facts, outstanding questions, and recommended next action).
- **Feature E: Similar Ticket Detection**:
  - Identifies relevant historical tickets and shared patterns.

### 3. Authoritative Knowledge Base
- Complete article lifecycle (`Draft`, `Published`, `Archived`).
- Markdown body editor with live rendering.
- 8 comprehensive seed articles covering refund policies, carrier transit tracers, API 401 rate limits, SSO SAML 2.0, subscription prorations, GDPR export, webhooks, and RMA workflows.

### 4. Event-Driven Automation Rules Engine
- Centralized rule evaluator executing on state transitions:
  - **Triggers**: `ticket_created`, `priority_changed`, `status_changed`, `ticket_assigned`.
  - **Conditions**: Category match, Priority match, Status match, Is Unassigned.
  - **Actions**: Set priority, Assign eligible agent, Add internal tag, Set status.
  - **Loop Prevention**: Centralized recursion lock preventing event storms.

### 5. Service Quality Analytics & Reporting
- 6 Key Performance Indicator cards: Total open tickets, new today, urgent backlog, average first response time, average resolution time, and customer satisfaction (CSAT).
- Interactive Recharts visualizations with 7-day, 30-day, and 90-day filters:
  - Incident Creation vs. Resolution Volume Area Charts
  - Priority Severity Donut Chart
  - Category Volume Distribution Bar Chart
  - Agent Resolution Velocity and Workload Indicators
- CSV export for tickets, customers, and analytics data.

### 6. Role-Based Access Control (RBAC)
- **Administrator** (`Sarah Lin`): Full tenant settings, role management, automation rules, and audit history.
- **Support Manager** (`Alex Rivera`): Team workload management, ticket triage, and operational insights.
- **Support Agent** (`David Chen` / `Maya Patel`): Queue processing, private notes, public replies, and AI drafting.
- **Customer** (`Elena Rostova`): Submitting personal tickets and viewing only authorized public messages.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Recharts data visualization.
- **Backend**: Express API server mounted via `server.ts` with Vite middlewares in development.
- **AI Integration**: Google GenAI TypeScript SDK (`@google/genai`) using `gemini-3.8-flash`. All AI calls route through secure server-side `/api/gemini/*` endpoints without exposing credentials to the browser.
- **Persistence Adapter**: Tenant-isolated repository with local storage persistence and instantaneous state reset capability.
- **Automated Testing**: Vitest test suite validating ticket transitions, automation rule evaluation, and internal note privacy.

---

## 🛠️ Local Development & Scripts

```bash
# Run fullstack development server (Express + Vite)
npm run dev

# Run TypeScript typecheck / lint
npm run lint

# Run Vitest business logic test suite
npm run test

# Production build
npm run build
```

---

## 🔒 Security & Privacy Practices

1. **Server-Side API Proxying**: The Gemini API key is accessed exclusively via server environment variables (`process.env.GEMINI_API_KEY`).
2. **Transparent Fallback**: When no API key is detected, ResolveAI executes transparent deterministic fallback triage with explicit indicator badges.
3. **Internal Note Isolation**: Notes are stored with strict classification (`type: 'note'`) and filtered out before presenting customer portals.
4. **Append-Only Audit Logging**: All mutations, status transitions, role updates, and rule executions write immutable audit events.
