# ✈️ AeroJet Real-World Operations Guide

Questa guida trasforma il software in uno strumento operativo per gestire voli privati reali.

## 1. Gestione di un Volo Reale: Checklist

### A. Immediatamente dopo il Deposito (Auto-generato)
- [ ] **Sourcing Operatore (FLIGHT)**: Verificare la disponibilità del tail number specifico.
- [ ] **Slot & PPR (FLIGHT)**: Verificare slot aeroportuali in aeroporti coordinati.
- [ ] **KYC Documenti (DOCUMENTS)**: Inviare richiesta passaporti via dashboard.

### B. T-72h (Fase Critica)
- [ ] **Pax Manifest (DOCUMENTS)**: Inviare manifest finale all'operatore e all'handling agent.
- [ ] **Catering Selection (CATERING)**: Confermare menu e restrizioni alimentari.
- [ ] **Transfer Assignment (TRANSFER)**: Assegnare fornitore NCC e driver. Inserire contatti in `OperationalTask`.

### C. T-24h (Ready to Fly)
- [ ] **Briefing Viaggio (CLIENT)**: Inviare PDF di riepilogo al cliente (Tail, Crew, Contatti Driver).
- [ ] **FBO Final Check (FLIGHT)**: Verificare che l'FBO abbia ricevuto il manifest e i servizi richiesti.

---

## ⚙️ Cosa è Automatico vs Manuale

| Processo | Stato | Note |
| :--- | :--- | :--- |
| **Generazione Task** | 🤖 Automatico | Creati al pagamento via Stripe (Categorie: FLIGHT, TRANSFER, CATERING, DOCUMENTS, CLIENT, INTERNAL). |
| **Assegnazione Priorità** | 🤖 Automatico | L'AI scala a URGENT se < 48h dalla partenza. |
| **Prenotazione Transfer** | 👤 Manuale | Il broker seleziona il vendor e popola i campi `vendorName` e `vendorContact`. |
| **Tracking Volo** | 🤖 Automatico | Supporto per tracking ADS-B (placeholder in `aviation.ts`). |
| **Notifiche Team** | 🤖 Automatico | Email Ops Team via `sendOpsTeamTaskAlert` per task critici. |

---

## 🛡️ Checklist Concierge

1. **Benvenuto**: Chiamata di benvenuto entro 2 ore dal booking.
2. **Preferenze**: Annotare in `Booking.notes` preferenze su testate giornalistiche, fiori o bevande specifiche.
3. **Tracking**: Monitorare il transfer NCC per assicurarsi che il driver sia in posizione 15 minuti prima del pickup.

---

## 🚁 Checklist Pre-Flight (Ops Team)

1. **Tail Number**: Verificato e inserito in dashboard.
2. **Crew**: Nomi e numeri di cellulare del comandante ricevuti.
3. **Slot**: Confermati per l'orario di decollo richiesto.
4. **Catering**: Confermata consegna a bordo.
5. **Pax Docs**: Tutti i passaporti ricevuti e validi.

## 🤖 WhatsApp Automation (Event-Driven)
Il sistema invia notifiche WhatsApp automatiche quando i task cambiano stato (se `isClientVisible` è attivo):
- **Driver Assegnato**: Triggerato quando un task `TRANSFER` viene popolato con nome/telefono del driver.
- **Volo Pronto**: Notifica automatica quando il task `FLIGHT` è completato.
- **Documenti Mancanti**: Sollecito quando viene creato un task di categoria `DOCUMENTS`.

## 📄 Gestione Documenti & Trip Portal
Il sistema gestisce ora l'intero ciclo di vita dei documenti passeggero (Passaporti, Visti):

1. **Richiesta**: Crea un `PassengerDocument` dalla dashboard (stato: `REQUESTED`).
2. **Upload Cliente**: Il passeggero carica i file nel proprio **Trip Portal** (`/trip/[bookingId]`).
3. **Verifica**: Il broker riceve il documento in dashboard, lo visiona e lo marca come `VERIFIED` o `REJECTED`.
4. **Sync**: Il Trip Portal riflette lo stato istantaneamente. Note interne del broker NON sono visibili al cliente.

---

## 🔌 Vendor Adapter Pattern
Per cambiare fornitore o passare da mock a reale:
1. Impostare `[PROVIDER]_PROVIDER` in `.env` (es. `FLIGHT_TRACKING_PROVIDER=flightaware`).
2. Inserire la chiave API corrispondente (`FLIGHTAWARE_API_KEY`).
3. Il sistema caricherà l'adapter corretto senza modifiche al codice.

---
*AeroJet: Precision in Private Aviation.*
