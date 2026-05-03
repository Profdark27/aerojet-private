# Workflow: Booking to Operations — Technical Protocol

## Trigger
- **Source**: Stripe Webhook `checkout.session.completed`.
- **Pre-condition**: `Inquiry.stripeSessionId` matches `session.id`.

## Phase 1: Financial & Data Integrity (Booking Agent)
1. **Verification**: 
   - Check `Booking.depositPaid == true`.
   - Ensure `Booking.confirmationCode` is not null.
2. **Audit**:
   - Compare `Booking.totalPrice` with the accepted `Quote.price`.
   - Flag if discrepancy > 0.01 EUR in `Booking.notes`.

## Phase 2: Autonomous Task Orchestration (Operations Agent)
1. **Generation**:
   - Create `OperationalTask` entries linked via `bookingId`.
   - **Category: OPERATOR** | Title: "Confirm Aircraft Slots & Crew" | Priority: `HIGH`.
   - **Category: DOCUMENTS** | Title: "PAX Passport Verification" | Priority: `HIGH`.
2. **Context Enrichment**:
   - Read `Inquiry.message` for special requirements (e.g., "birthday", "pet").
   - If found, create **Category: CATERING** | Title: "Special Service Request: [Requirement]" | Priority: `NORMAL`.

## Phase 3: Client Onboarding (Concierge Agent)
1. **Communication**:
   - Trigger `sendBookingConfirmation` email via `lib/email.ts`.
   - Update `Booking.notes`: "Confirmation email sent to [Email] at [Timestamp]".
2. **Personalization**:
   - Prepare travel brief based on `fromCity` and `toCity` FBO details.

## Phase 4: Monitoring (AI System)
1. **Dashboard Sync**: 
   - Ensure `/dashboard/operations` reflects the new `Booking` and all associated `OperationalTask` entries.
2. **Escalation**:
   - If `departureDate` < 24h AND `OPERATOR` task status != `COMPLETED`: 
     - **Action**: Alert Broker Team via P0 notification.

## DB State Transitions
- `Inquiry.pipelineStatus`: `QUOTED` -> `WON`
- `Booking.status`: `PENDING` -> `CONFIRMED`
- `OperationalTask.status`: `PENDING` (initial state)
