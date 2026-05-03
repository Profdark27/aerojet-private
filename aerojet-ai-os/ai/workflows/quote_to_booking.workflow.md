# Workflow: Quote → Booking

## Trigger

Cliente clicca "CONFERMA E BLOCCA IL JET" su `/accept-quote/[id]`

## Steps

```
1. POST /api/checkout/quote
   Input: { quoteId }
   → Stripe: crea Checkout Session
   → Return: { url: stripe_checkout_url }

2. Cliente paga su Stripe

3. Stripe POST /api/webhooks/stripe
   Event: checkout.session.completed
   Metadata: { quoteId, inquiryId, type: "deposit" }

4. Webhook esegue:
   a. prisma.quote.update → depositPaid: true, stripeSessionId
   b. prisma.inquiry.update → status: "CONFIRMED"
   c. prisma.booking.create → tutti i dati del booking
   d. prisma.operationalTask.createMany → 8 task standard
   e. sendConfirmationEmail → cliente

5. Redirect cliente → /booking/success?ref=[quoteId]&from=...&to=...

6. Dashboard /dashboard/operations mostra nuovo booking
```

## Dati che fluiscono

```typescript
// Da Inquiry
{ from, to, departureDate, passengerCount, clientName, clientEmail }

// Da Quote
{ totalPrice, depositAmount, aircraftType, currency, stripeSessionId }

// Generato in Booking
{ confirmationCode: "AJ-" + quoteId.slice(-6).toUpperCase() }
{ status: "CONFIRMED" }
{ tasks: DEFAULT_TASKS (8 task) }
```

## Error handling

| Scenario | Comportamento |
|---|---|
| Quote non trovata | 404 + log |
| Booking già esistente | Skip creazione (idempotente) |
| Task già esistenti | createMany + check count |
| Email fallisce | Log + non blocca il flusso |
| DB error | 500 + log dettagliato |

## Idempotenza

Il webhook può essere ricevuto più volte da Stripe.
Il sistema è idempotente:
- `booking.findUnique({ where: { quoteId } })` prima di creare
- Se esiste già → skip senza errore
