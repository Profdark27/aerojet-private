# AeroJet AI Operations System

AeroJet is a state-of-the-art **AI Operations System** for private aviation. It transforms the traditional charter booking process into an autonomous logistical engine, managing everything from initial inquiry to post-flight follow-up.

## ✈️ Key Features
- **AI Operations Hub**: Autonomous task generation and tracking for flight logistics.
- **Concierge Agents**: Personalized, luxury client communication via AI.
- **Smart Pipeline**: Lead scoring and automated follow-ups for brokers.
- **Stripe Integration**: Automated booking creation upon deposit verification.
- **Production Hardening**: Audit logging, Zod schema validation, and health monitoring.

## 🧠 AI Architecture
The system logic is housed in the `/ai` directory, organized into:
- **[/ai/agents](file:///C:/Users/Corrado/Desktop/aerojet-private/ai/agents)**: Specialized AI roles (Concierge, Operations, Booking, Sales) defined as structured prompts.
- **[/ai/workflows](file:///C:/Users/Corrado/Desktop/aerojet-private/ai/workflows)**: Operational event sequences (e.g., Stripe Payment -> Task Generation).
- **[/ai/insights](file:///C:/Users/Corrado/Desktop/aerojet-private/app/api/dashboard/operations/insights)**: Real-time analysis engine for the operations dashboard.

For more details, see [AI_SYSTEM.md](file:///C:/Users/Corrado/Desktop/aerojet-private/AI_SYSTEM.md), [OPERATIONS.md](file:///C:/Users/Corrado/Desktop/aerojet-private/OPERATIONS.md), [DEPLOYMENT.md](./docs/DEPLOYMENT.md), and [OPERATIONS_WORKFLOW.md](./OPERATIONS_WORKFLOW.md).

## ✈️ Operations-Ready System
- **Real-World Logistics**: Tracking for `tailNumber`, `handlingAgents`, and `flightStatus`.
- **Hardened Security**: 
  - **Audit Logging**: Every task update or booking change is logged in the `AuditLog` table.
  - **Data Integrity**: All API inputs are validated via **Zod** schemas.
  - **Health Monitoring**: `/api/health` provides real-time status of all critical services.
- **Vendor Adapter Pattern**: Pluggable architecture in `/lib/vendors` with **Resilient Fetch** (retry logic + backoff) for:
  - **Aviation**: FlightAware AeroAPI for real-time tracking.
  - **Transfer**: Luxury NCC/Chauffeur coordination.
  - **Catering**: Gourmet aviation catering management.
  - **WhatsApp**: Concierge messaging via Twilio/Meta.
- **AI Automation**: Auto-generated tasks for every booking based on aviation protocols.

## 🛠 Getting Started

1. **Environment**: Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` (PostgreSQL)
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
2. **Database**: 
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Run**:
   ```bash
   npm run dev
   ```

## 🚀 Deployment
Deployed on **Vercel** with a custom domain.
Webhook URL: `https://[your-domain].com/api/webhooks/stripe`
Region: `fra1` (Frankfurt)

---
*AeroJet: Private Aviation, Reimagined by AI.*
