# AeroJet Operational Workflow

Questo documento descrive il ciclo di vita end-to-end di una prenotazione in AeroJet AI OS.

## 1. Lead Capture & Qualificazione
- **Source**: Il cliente compila il form di richiesta sul sito.
- **AI Action**: Il Sales Agent assegna uno score (VIP, High, Med, Low).
- **Notifica**: Il team Broker riceve email e notifica in dashboard.
- **Next Step**: Il broker prepara le opzioni di preventivo.

## 2. Quoting & Selezione
- **Broker Action**: Prepara 3 opzioni di velivoli via dashboard.
- **AI Action**: Il Booking Agent verifica la coerenza dei margini.
- **Client Action**: Riceve email con link al preventivo, sceglie un'opzione.
- **Status**: L'inquiry passa a `WON` una volta selezionata l'opzione.

## 3. Deposito & Conferma
- **Client Action**: Paga il deposito (30%) via Stripe Checkout.
- **Webhook Action**: Trigger di `checkout.session.completed`.
- **System Action**: 
  - Creazione record `Booking` con `status: "CONFIRMED"`.
  - Salvataggio `stripeSessionId` per idempotenza.
  - Generazione automatica della lista `OperationalTask`.
- **Notifica**: Il cliente riceve l'email di conferma con codice prenotazione.

## 4. Flight Operations (Post-Booking)
- **AI Action**: L'Operations Agent stabilisce le priorità in base alla data di partenza.
- **Task Management**: Il team gestisce i task in `/dashboard/operations`:
  - **OPERATOR**: Conferma tail number, crew e slot.
  - **DOCUMENTS**: Raccolta passaporti e visti.
  - **CATERING**: Coordinamento menu e richieste speciali.
  - **TRANSFER**: Organizzazione transfer di lusso a terra.
- **Status**: I task passano da `PENDING` a `COMPLETED`.

## 5. Esecuzione & Completamento
- **Pre-Flight**: Briefing finale inviato al cliente 24h prima.
- **Flight Day**: Decollo e arrivo a destinazione.
- **Post-Flight**: Follow-up per feedback e richieste future.
- **Status**: Il Booking passa a `COMPLETED`.

---

### 🛡️ Sicurezza & Integrità Operativa
- **Accesso**: Protetto da middleware. Solo utenti in `BROKER_EMAILS` (ruolo `BROKER`) accedono a `/dashboard/operations`.
- **Validazione**: Ogni input operativo (task, status, docs) è validato via **Zod schemas** (`lib/validations/operations.ts`) prima di essere processato.
- **Audit Trail**: Ogni modifica a task o prenotazioni genera un record in `AuditLog` che include:
  - Timestamp e Autore (Broker ID).
  - Valori precedenti e nuovi (diff).
  - Metadati tecnici (IP, Browser).
- **API**: Tutte le rotte `/api/operations/*` verificano sessione, ruolo e integrità dei dati.

### ⚙️ Generazione Task
I task operativi vengono generati automaticamente dal webhook Stripe (`/api/webhooks/stripe`) al momento del pagamento del deposito.

---
*AeroJet: Precision in Private Aviation.*

**Risorse Aggiuntive:**
- [OPERATIONS_GUIDE.md](./docs/OPERATIONS_GUIDE.md) — Checklist e protocolli per voli reali.
