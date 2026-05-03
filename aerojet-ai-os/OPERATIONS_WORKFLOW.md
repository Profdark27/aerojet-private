# AeroJet Private — Operations Workflow

## Flusso completo post-booking

```
Cliente paga deposito (Stripe)
  └─ Webhook /api/webhooks/stripe
       ├─ Quote.depositPaid = true
       ├─ Inquiry.status = "CONFIRMED"
       ├─ Booking creato (status: CONFIRMED)
       ├─ 8 OperationalTask creati automaticamente
       └─ Email conferma → cliente

Team vede nuovo booking in /dashboard/operations
  └─ Task 1: Confirm flight availability (URGENT)
  └─ Task 2: Reserve aircraft (HIGH)
  └─ Task 3: Send client confirmation (HIGH)
  └─ Task 4: Assign Aviation Advisor (HIGH)
  └─ Task 5: Collect passenger documents (HIGH)
  └─ Task 6: Arrange transfer (MEDIUM)
  └─ Task 7: Arrange catering (MEDIUM)
  └─ Task 8: Final pre-flight check (URGENT, D-24h)

Team aggiorna task in dashboard
  └─ PATCH /api/tasks/:id { status: "DONE" }
  └─ PATCH /api/bookings/:id { status: "FLIGHT_RESERVED" }

Booking avanza: CONFIRMED → OPS_IN_PROGRESS → FLIGHT_RESERVED
  → SERVICES_CONFIRMED → READY_TO_FLY → COMPLETED
```

## API reference operativa

### Lista booking
```
GET /api/bookings
Response: { bookings: [{ ...booking, taskSummary: { total, done, urgent } }] }
```

### Dettaglio booking
```
GET /api/bookings/:id
Response: { booking: { ...dati, tasks: [...], quote: { inquiry: {...} } } }
```

### Task del booking
```
GET /api/bookings/:id/tasks
Response: { tasks: [...OperationalTask] }
```

### Aggiorna task
```
PATCH /api/tasks/:id
Body: { status, notes, assignedTo, priority }
```

### Aggiorna booking
```
PATCH /api/bookings/:id
Body: { status, assignedTo, internalNotes, transferRequired, cateringRequired }
```

## Dashboard

URL: `/dashboard/operations`

Features:
- Stats bar (totale / attivi / urgenti) con filtri
- Lista booking con progress bar task
- Pannello dettaglio split-view
- Task con status dropdown real-time
- Note interne per ogni task
- Alert booking con task urgenti aperti
- Auto-refresh ogni 30s

## Test manuale completo

1. Vai su `/accept-quote/[id-reale]`
2. Clicca "Conferma e Blocca il Jet"
3. Completa checkout Stripe (test card: 4242 4242 4242 4242)
4. Verifica redirect su `/booking/success`
5. Vai su `/dashboard/operations`
6. Verifica che il booking appaia con 8 task
7. Aggiorna qualche task → verifica refresh
8. Cambia status booking → verifica aggiornamento

## Stripe webhook test locale

```bash
# Terminal 1 — dev server
npm run dev

# Terminal 2 — stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3 — trigger evento
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.quoteId=ID_REALE \
  --add checkout_session:metadata.type=deposit
```
