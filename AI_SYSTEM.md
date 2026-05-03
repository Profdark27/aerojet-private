# AeroJet AI Operations System (AI OS)

AeroJet is powered by an autonomous AI Operations System that handles post-booking logistics, client communication, and operational oversight.

## Architecture

The system is organized in the `/ai` directory:
- **Agents**: Specialized AI roles (Concierge, Operations, Booking, Sales).
- **Workflows**: Defined operational sequences (e.g., Payment -> Tasks).
- **Context**: Business rules, brand tone, and luxury aviation standards.

## The AI Team

### ✈️ Operations Agent
Automates logistical tasks. When a booking is confirmed, it generates a set of `OperationalTask` entries in the database to ensure nothing is missed (FBO, crew, catering).

### 🥂 Concierge Agent
Manages the "Luxury Experience". It handles client communication, gathering preferences, and ensuring the tone remains premium.

### 💰 Booking Agent
Monitors financial integrity. It verifies Stripe deposits and audits quote-to-booking consistency.

### 📈 Sales Agent
Prioritizes leads and manages the pipeline, helping brokers convert high-intent inquiries.

## Automated Workflows

### Post-Payment Automation
Immediately after a Stripe deposit is verified:
1. **Booking** status moves to `CONFIRMED`.
2. **OperationalTasks** are auto-generated.
3. **Concierge** is alerted to start client onboarding.

### 🧠 AI Insights Engine
The engine continuously monitors the state of all active flights and generates:
- **Critical Alerts**: Missing tail numbers, pending high-priority tasks near departure.
- **Strategic Insights**: Suggestions for catering, document collection, and client communication.
- **Agent Orchestration**: Real-time status tracking of the AI agent pool.

## Technical Integration
- **Database**: Prisma models `Booking` and `OperationalTask`.
- **Webhooks**: Stripe `checkout.session.completed` triggers the flow.
- **API Engine**: `/api/dashboard/operations/insights` runs the heuristics.
- **Dashboard**: `/dashboard/operations` provides a real-time view of all AI-managed tasks and insights.

## Vercel Production Readiness

To ensure the AI OS operates correctly in production, the following environment variables must be configured in Vercel:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying Stripe events. |
| `NEXT_PUBLIC_BASE_URL` | Used for absolute URLs in emails (e.g., `https://aerojet.app`). |
| `RESEND_API_KEY` | For automated client communications. |

### Webhook Configuration
The production webhook URL is:
`https://[your-domain].com/api/webhooks/stripe`

Ensure the following event is enabled in Stripe Dashboard:
- `checkout.session.completed`

### Database Migrations
Always use `npx prisma migrate deploy` in production CI/CD. Never use `db push` to avoid data loss.

---
*AeroJet: Private Aviation, Reimagined by AI.*
