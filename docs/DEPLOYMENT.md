# AeroJet Private — Guida al Deploy Production

Questa guida contiene i passi critici per il lancio reale del sistema **AeroJet AI OS** su Vercel con database PostgreSQL (Neon).

---

## 0. Dominio & Configurazione Vercel

- **Dominio produzione**: `aerojet-private.com`
- **Vercel project**: `corlatino2001-4887s-projects/aerojet-private`
- **Deploy command**: `vercel --prod --yes`
- **Stripe webhook URL**: `https://aerojet-private.com/api/webhooks/stripe`

### DNS Records da aggiungere al Registrar (UNICA AZIONE MANUALE)

Questi record vanno aggiunti nel pannello DNS del registrar dove hai acquistato `aerojet-private.com`:

| Type  | Host | Value                  | TTL  |
|-------|------|------------------------|------|
| A     | @    | `76.76.21.21`          | 3600 |
| CNAME | www  | `cname.vercel-dns.com` | 3600 |

> Note: `76.76.21.21` e `cname.vercel-dns.com` sono gli IP/CNAME ufficiali di Vercel per domini custom con nameserver di terze parti. Vercel verificherà automaticamente il dominio dopo la propagazione DNS (tipicamente entro 24-48h).

---

## 1. Database (PostgreSQL / Neon)

Poiché il progetto è passato da SQLite a PostgreSQL, la cronologia delle migrazioni deve essere reinizializzata.

### Primo Deploy (Baseline)
1. Assicurati che `DATABASE_URL` punti a Neon.
2. Elimina la cartella `prisma/migrations` locale (se contiene migrazioni SQLite).
3. Esegui:
   ```bash
   npx prisma db push
   ```
   *Questo sincronizza lo schema senza creare file di migrazione storici.*

### Deploy Successivi
Ogni volta che lo schema cambia:
1. `npx prisma migrate dev` (in locale)
2. `npx prisma migrate deploy` (su Vercel/CI)
3. `npx prisma generate` (sempre necessario per aggiornare il client)

---

## 1.1 Health Monitoring
Verifica lo stato del sistema post-deploy visitando:
`https://aerojet-private.com/api/health`

Questo endpoint verifica:
- Connessione al database.
- Configurazione chiavi API (Stripe, Anthropic, Resend).
- Integrità del sistema di tracking voli (FlightAware).
- White-list degli amministratori (Broker Auth).

---

## 2. Configurazione Vercel

Imposta le seguenti Environment Variables su Vercel:

### Core & Auth
*   `DATABASE_URL`: URL PostgreSQL di Neon.
*   `NEXT_PUBLIC_BASE_URL`: `https://aerojet-private.com`
*   `NEXTAUTH_URL`: `https://aerojet-private.com`
*   `AUTH_URL`: `https://aerojet-private.com`
*   `AUTH_SECRET`: Genera con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
*   `AUTH_TRUST_HOST`: `true`
*   `NEXTAUTH_SECRET`: (legacy, mantieni allineato ad AUTH_SECRET)

### Stripe (Live)
*   `STRIPE_SECRET_KEY`: `sk_live_...`
*   `STRIPE_WEBHOOK_SECRET`: `whsec_...` (Ottenuta dopo aver creato il webhook su Stripe)
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`

### Email (Resend)
*   `RESEND_API_KEY`: `re_...`
*   `RESEND_FROM_EMAIL`: `concierge@aerojet-private.com` (Deve essere un dominio verificato su Resend)

### Broker Config
*   `BROKER_EMAIL`: `admin@aerojet-private.com` (Per notifiche lead)
*   `BROKER_EMAILS`: `admin@aerojet-private.com,broker@aerojet-private.com` (Email con accesso alla dashboard)

---

## 3. Stripe Webhook

1. Vai nella Dashboard Stripe -> Developers -> Webhooks.
2. Aggiungi endpoint: `https://aerojet-private.com/api/webhooks/stripe`.
3. Seleziona evento: `checkout.session.completed`.
4. Copia il `Signing Secret` e incollalo in `STRIPE_WEBHOOK_SECRET` su Vercel.

---

## 4. Sicurezza Dashboard

La dashboard è protetta da un **Middleware** (`middleware.ts`). Solo le email presenti in `BROKER_EMAILS` avranno il ruolo `BROKER` e potranno accedere a:
*   `/dashboard/*`
*   `/api/operations/*`
*   `/api/dashboard/*`

Se un utente non autorizzato prova ad accedere, verrà reindirizzato al login.

---

## 5. Verifica Post-Deploy (E2E)

Dopo il deploy, esegui questi test sul dominio reale:

1.  **Form Lead**: Invia una richiesta dalla home. Verifica di ricevere l'email "Richiesta Ricevuta".
2.  **Login Broker**: Accedi con una delle email in `BROKER_EMAILS`. Verifica di ricevere il Magic Link via email.
3.  **Generazione Preventivo**: Crea un preventivo e invialo. Il link nell'email deve puntare al dominio reale.
4.  **Pagamento**: Esegui un pagamento di test (o reale con 1€). Verifica che il webhook crei il `Booking` e i task in `Operations`.

---

## ⚠️ Rischi Comuni

*   **Trailing Slash**: Assicurati che `NEXT_PUBLIC_BASE_URL` NON abbia lo slash finale.
*   **Stripe Metadata**: Non modificare la struttura del metadata nel codice, è essenziale per il webhook.
*   **Provider Switch**: Se `db push` fallisce, potrebbe essere necessario svuotare le tabelle esistenti in Neon.
