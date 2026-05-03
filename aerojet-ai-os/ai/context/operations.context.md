# AeroJet Private — Operations Context

## Task operativi standard

Creati automaticamente dal webhook Stripe dopo ogni pagamento deposito.

| # | Task | Tipo | Priorità | Timing |
|---|------|------|----------|--------|
| 1 | Confirm flight availability | FLIGHT | URGENT | Subito |
| 2 | Reserve aircraft / operator | FLIGHT | HIGH | +1 giorno |
| 3 | Send client booking confirmation | CLIENT_CONFIRMATION | HIGH | Subito |
| 4 | Assign Aviation Advisor | BROKER_ACTION | HIGH | Subito |
| 5 | Collect passenger documents | DOCUMENTS | HIGH | +2 giorni |
| 6 | Arrange ground transfer | TRANSFER | MEDIUM | +3 giorni |
| 7 | Arrange catering & onboard services | CATERING | MEDIUM | +3 giorni |
| 8 | Final pre-flight check (D-24h) | FLIGHT | URGENT | Giorno prima |

## Stati booking

```
CONFIRMED → OPERATIONS_IN_PROGRESS → FLIGHT_RESERVED
  → SERVICES_CONFIRMED → READY_TO_FLY → COMPLETED
```

Alternativamente: CANCELLED (in qualsiasi fase)

## Criteri di avanzamento automatico (logica suggerita)

| Condizione | Transizione |
|---|---|
| Deposito pagato | → CONFIRMED |
| Task 1+2 DONE | → FLIGHT_RESERVED |
| Task 5+6+7 DONE | → SERVICES_CONFIRMED |
| Task 8 DONE (D-24h check) | → READY_TO_FLY |
| Volo completato (manuale) | → COMPLETED |

## Scenari speciali

**Volo long-haul (>4h)**
- Aggiungere task: "Arrange FBO handling at destination"
- Aggiungere task: "Verify overflight permits"
- Priority: URGENT su documenti passeggeri

**Cliente VIP (spesa >€50.000)**
- Tag nel booking: `assignedTo` → Senior Aviation Advisor
- Catering: sempre HIGH priority
- Notifica immediata al broker head

**Multi-leg**
- Task separati per ogni tratta
- Coordinamento operatori diversi se necessario

**Transfer richiesto** (`transferRequired: true`)
- Task transfer passa da MEDIUM a HIGH
- Coordinare con almeno 48h anticipo

## SLA operativi

| Azione | Tempo massimo |
|---|---|
| Primo contatto cliente | 2 ore dal pagamento |
| Conferma disponibilità aeromobile | 4 ore |
| Invio conferma scritta | 24 ore |
| Raccolta documenti passeggeri | 72 ore pre-volo |
| Brief pre-volo cliente | 24 ore pre-volo |
