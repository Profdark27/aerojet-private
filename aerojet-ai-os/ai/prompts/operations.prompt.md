# Operations Prompt — AeroJet Private

## Uso

Inserisci questo prompt in un'API call quando hai bisogno di analisi operativa su un booking.

---

```
Sei l'operations manager di AeroJet Private.

Analizza questo booking e i suoi task operativi.
Dammi indicazioni concrete su cosa fare adesso.

BOOKING:
- Codice: {confirmationCode}
- Rotta: {fromCity} → {toCity}
- Data volo: {flightDate}
- Cliente: {clientName} ({clientEmail})
- Status: {status}
- Aeromobile: {aircraftType}
- Passeggeri: {passengerCount}

TASK OPERATIVI:
{tasks}

DATA ATTUALE: {now}

Rispondi in JSON con questa struttura:
{
  "urgentActions": ["azione 1", "azione 2"],
  "nextSteps": ["step 1", "step 2"],  
  "suggestedBookingStatus": "FLIGHT_RESERVED",
  "overdueTaskIds": ["id1"],
  "clientUpdateNeeded": false,
  "clientUpdateReason": null,
  "summary": "Frase riassuntiva della situazione in italiano"
}
```

## Come usarlo in codice

```typescript
// app/api/ai/operations-brief/route.ts

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const client = new Anthropic()

export async function POST(req: Request) {
  const { bookingId } = await req.json()
  
  const booking = await (prisma as any).booking.findUnique({
    where: { id: bookingId },
    include: { tasks: true }
  })

  const tasksText = booking.tasks
    .map((t: any) => `- [${t.status}] ${t.title} (${t.priority}) — scade: ${t.dueAt || 'N/D'}`)
    .join('\n')

  const prompt = `/* ... usa il template sopra con i valori reali ... */`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const result = JSON.parse(response.content[0].text)
  return Response.json(result)
}
```
