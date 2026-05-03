# AeroJet Private — Business Context

## Chi siamo

AeroJet Private è una piattaforma di broker per voli privati in modalità **concierge-first**.
Non operiamo direttamente gli aeromobili: intermediamo tra clienti VIP e operatori certificati (VistaJet, NetJets, operatori indipendenti).

## Modello di business

```
Cliente → Richiesta preventivo (Inquiry)
  → Broker crea Quote personalizzato
    → Cliente accetta e paga deposito 30% online
      → AeroJet coordina operazioni reali
        → Volo eseguito → Pagamento saldo
```

## Database models (Prisma)

- **Inquiry** — Richiesta iniziale del cliente (from/to, date, pax, budget)
- **Quote** — Preventivo elaborato dal broker (prezzo, aeromobile, operatore)
- **Booking** — Prenotazione confermata post-deposito (creata dal webhook Stripe)
- **OperationalTask** — Task operativi assegnati al team post-booking

## Route chiave

| Route | Funzione |
|---|---|
| `/` | Homepage luxury |
| `/accept-quote/[id]` | Pagina preventivo per il cliente |
| `/api/checkout/quote` | Crea Stripe Checkout Session |
| `/api/webhooks/stripe` | Riceve pagamento → crea Booking + Task |
| `/booking/success` | Pagina conferma post-pagamento |
| `/dashboard` | Area broker/admin |
| `/dashboard/operations` | Dashboard task operativi |
| `/api/bookings` | Lista/dettaglio booking |
| `/api/tasks/[id]` | Aggiornamento task |

## Tech stack

- **Next.js 14+** (App Router)
- **Prisma** + PostgreSQL (Neon o Supabase)
- **Stripe** (Checkout + Webhooks)
- **Resend** (email transazionale)
- **NextAuth** (auth Magic Link + Google)
- **Vercel** (deploy + edge)

## Fuso orario operativo

Operazioni principalmente in orario europeo (CET/CEST).
Clienti internazionali da tutto il mondo.

## Standard qualitativo

- Risposta al cliente: entro 2 ore dalla conferma deposito
- Tono: luxury, preciso, professionale, mai generico
- Lingua: italiano per UI/email, inglese per operazioni interne
