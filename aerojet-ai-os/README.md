# ✦ AeroJet Private

Piattaforma di broker per voli privati in modalità concierge.
Online su Vercel con dominio acquistato.

## Stack

| Tool | Uso |
|---|---|
| Next.js 14+ App Router | Frontend + API |
| Prisma + PostgreSQL | Database |
| Stripe | Pagamenti + Webhook |
| Resend | Email transazionale |
| NextAuth | Auth (Magic Link + Google) |
| Vercel | Deploy |

## Flusso principale

```
Inquiry → Quote → accept-quote/[id] → Stripe → Booking → Task → Dashboard
```

## Avvio locale

```bash
npm install
cp .env.example .env.local
# Compilare .env.local con le variabili
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Struttura progetto

```
/app
  /accept-quote/[id]         ← pagina preventivo cliente
  /booking/success           ← conferma post-pagamento
  /dashboard/operations      ← dashboard task operativi
  /api/webhooks/stripe       ← evento Stripe → Booking + Task
  /api/bookings              ← CRUD booking
  /api/tasks/[id]            ← aggiornamento task
  /api/checkout/quote        ← crea Stripe session

/ai                          ← AeroJet AI OS
  /agents                    ← Concierge, Operations, Booking, Sales
  /workflows                 ← Quote→Booking, Booking→Completion
  /context                   ← Business, Tone, Operations
  /prompts                   ← System prompt, Operations prompt

/prisma
  schema.prisma              ← modelli DB
```

## Env vars (Vercel)

Vedi `.env.example` per la lista completa.

Critiche per produzione:
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` ← da Stripe Dashboard → Webhooks
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` ← dominio produzione (es. https://aerojet.app)
- `RESEND_API_KEY`

## Stripe Webhook (produzione)

URL da registrare su Stripe Dashboard:
```
https://TUO-DOMINIO.com/api/webhooks/stripe
```

Evento: `checkout.session.completed`

## Migrazione Prisma (se Booking non esiste)

```bash
# Aggiungi i modelli Booking + OperationalTask allo schema
# (vedi prisma/schema_additions.prisma)
npx prisma migrate dev --name add_booking_and_tasks
npx prisma generate
```

## Test locale webhook Stripe

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# In altro terminale:
stripe trigger checkout.session.completed
```

## AI OS

Documentazione sistema AI in `/ai/`.
Leggi `ai/prompts/system.prompt.md` prima di modificare il progetto.
