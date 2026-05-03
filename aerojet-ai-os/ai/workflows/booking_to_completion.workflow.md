# Workflow: Booking → Operations → Completion

## Fase 1: CONFIRMED (subito dopo pagamento)

**Automatico (webhook):**
- [x] Booking creato
- [x] 8 task operativi creati
- [x] Email conferma al cliente inviata

**Manuale (team entro 2h):**
- [ ] Aviation Advisor assegnato (`booking.assignedTo`)
- [ ] Verifica disponibilità aeromobile con operatore
- [ ] Primo contatto telefonico/email al cliente

## Fase 2: OPERATIONS_IN_PROGRESS

**Task da completare:**
1. Confirm flight availability → DONE
2. Reserve aircraft / operator → DONE
3. Send client booking confirmation → DONE
4. Assign Aviation Advisor → DONE

**Aggiornamento dashboard:**
- Broker aggiorna `booking.status` → `FLIGHT_RESERVED`

## Fase 3: FLIGHT_RESERVED

**Task da completare:**
5. Collect passenger documents → DONE
6. Arrange ground transfer → DONE
7. Arrange catering & onboard services → DONE

**Aggiornamento dashboard:**
- Broker aggiorna `booking.status` → `SERVICES_CONFIRMED`

## Fase 4: SERVICES_CONFIRMED → READY_TO_FLY

**Task D-24h:**
8. Final pre-flight check → DONE

**Comunicazione cliente:**
- Email brief pre-volo con: orario, FBO, transfer info, catering confirmato, contatti operatore

**Aggiornamento dashboard:**
- Broker aggiorna `booking.status` → `READY_TO_FLY`

## Fase 5: COMPLETED

Dopo il volo:
- Broker aggiorna `booking.status` → `COMPLETED`
- (Opzionale) Email follow-up NPS al cliente
- (Opzionale) Invoice finale se saldo restante

## API calls per ogni fase

```typescript
// Aggiorna status booking
PATCH /api/bookings/:id
{ status: "FLIGHT_RESERVED" }

// Aggiorna task
PATCH /api/tasks/:taskId
{ status: "DONE", notes: "Confermato con VistaJet — ref #VJ20240501" }

// Aggiorna note interne
PATCH /api/bookings/:id
{ internalNotes: "Cliente VIP — preferisce cabina molto fredda. No latticini." }
```
