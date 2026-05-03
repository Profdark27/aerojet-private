# ✈️ AEROJET — FIRST 3 BOOKINGS PLAYBOOK
*Guida Operativa per la fase di Go-Live Reale*

L'obiettivo dei primi 3 booking è la **perfezione assoluta dell'esperienza cliente**. Anche se il sistema è automatizzato, il broker deve supervisionare ogni bit di dato.

## 🚨 Regola d'Oro
**Se l'automazione fallisce o è lenta, intervieni manualmente entro 15 minuti.** Il cliente non deve mai percepire un errore tecnico.

---

## 📅 Timeline Operativa

### T-72h (Dopo il Booking)
- [ ] **Verifica DB**: Controlla in `/dashboard/operations` che il booking sia apparso.
- [ ] **WhatsApp Welcome**: Se il messaggio automatico non è partito, invia un messaggio manuale di benvenuto.
- [ ] **Document Request**: Verifica che il task `DOCUMENTS` sia visibile al cliente nel Trip Portal.

### T-48h (Logistica)
- [ ] **Sourcing**: Conferma il Tail Number reale con l'operatore. Inseriscilo manualmente in dashboard.
- [ ] **Transfer**: Contatta il vendor NCC. Appena hai nome e cellulare del driver, inseriscili nel task `TRANSFER` e marca come `isClientVisible`.
- [ ] **Catering**: Conferma il menu. Se il cliente ha richieste speciali, scrivile nel task `CATERING` visibile al cliente.

### T-24h (Ready to Fly)
- [ ] **Check FBO**: Chiama l'Handling Agent (FBO) per confermare che i passeggeri sono in manifest.
- [ ] **Trip Portal Audit**: Apri il Trip Portal del cliente (link in dashboard) e verifica che tutto sia corretto.
- [ ] **WhatsApp Summary**: Invia un riepilogo via WhatsApp con: Orario, FBO, Nome Driver, Foto del Jet.

### Flight Day
- [ ] **Tracking**: Usa FlightAware o la dashboard per monitorare il posizionamento del jet.
- [ ] **Driver Sync**: Verifica che il driver sia in posizione 15 min prima del pickup.
- [ ] **Arrivo FBO**: Monitora l'arrivo dei passeggeri in tempo reale via Handling Agent.

---

## 🛠️ Cosa Fare se... (Failure Playbook)

### 1. Webhook Stripe fallisce
- Se ricevi notifica di pagamento da Stripe ma il booking non appare:
  - Crea manualmente il booking via Prisma Studio o script di emergenza.
  - Invia manualmente l'email di conferma con il link `/trip/[id]`.

### 2. Caricamento Documenti fallisce
- Se il cliente ha problemi con l'upload nel portale:
  - Chiedi i documenti via WhatsApp.
  - Caricali tu manualmente (o chiedi al dev team) o caricali nello storage e incolla il link.

### 3. Flight Status non aggiorna
- Se l'API del vendor è down:
  - Chiama l'operatore/FBO.
  - Aggiorna manualmente il campo `flightStatus` in dashboard (es. "In Volo").

---

## 📊 Monitoring (Prime 24h)
Controlla i log Vercel per:
- `ERROR` in `context: PAYMENT`
- `ERROR` in `context: MESSAGING`
- Qualsiasi `500` sulle rotte `/api/trip/[id]`

---
*AeroJet: Excellence is not an act, it's a habit.*
