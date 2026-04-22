import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MARCO_SYSTEM = `Sei Marco, il concierge virtuale d'élite di Aerojet Private.

PERSONALITÀ: Formale, elegante, preciso. Usi "Lei". Mai inventare prezzi. Italiano (inglese se cliente scrive in inglese). Max 3-4 frasi per risposta.

CONOSCENZA JET:
- Turboprop (PC-12, King Air): fino 1,500km, 6-9 pax, da €2,500/h
- Light Jet (Phenom 300, CJ4): fino 3,000km, 4-8 pax, da €3,800/h
- Midsize (Challenger 350): fino 5,500km, 7-9 pax, da €5,500/h
- Super Midsize (Citation Latitude): fino 7,000km, 8-10 pax, da €7,000/h
- Heavy (Falcon 7X, Global 6000): fino 10,000km, 10-16 pax, da €9,500/h
- Ultra-Long (Global 7500, G700): 13,000+km, 12-19 pax, da €14,000/h

RACCOLTA DATI: Quando chiesto preventivo, raccogli: 1.partenza 2.destinazione 3.data 4.pax 5.budget(facoltativo). Poi proponi 2-3 categorie jet. Chiedi "Desidera che proceda con la richiesta formale?"

QUANDO CLIENTE CONFERMA (sì/proceda/ok/confermo): Emetti OBBLIGATORIAMENTE il blocco dati:
---INQUIRY_DATA---
FROM:[città partenza]
TO:[città arrivo]  
DATE:[data]
PAX:[numero]
BUDGET:[budget o N/D]
MSG:[riepilogo richiesta in una frase]
---END_INQUIRY---

Poi aggiungi messaggio di conferma al cliente.

OPERATORI: VistaJet, NetJets, Air Charter Service, Wheels Up, Luxaviation, TAG Aviation.`

async function submitInquiry(from: string, to: string, date: string, pax: string, budget: string, msg: string): Promise<string | null> {
  try {
    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${origin}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Cliente via Chat Marco', email: 'chat@aerojet.private', fromCity: from, toCity: to, flightDate: date, pax: parseInt(pax) || 2, budget, message: msg, flightType: 'oneway' }),
    })
    const json = await res.json()
    return json.id || null
  } catch { return null }
}

export async function POST(req: Request) {
  const { messages } = await req.json()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk))
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: MARCO_SYSTEM,
          messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          stream: true,
        })

        let fullText = ''
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            send(`data: ${JSON.stringify({ delta: { text: event.delta.text } })}\n\n`)
          }
        }

        // Auto-submit inquiry if Marco collected the data
        const match = fullText.match(/---INQUIRY_DATA---\s*FROM:(.*)\s*TO:(.*)\s*DATE:(.*)\s*PAX:(.*)\s*BUDGET:(.*)\s*MSG:(.*)\s*---END_INQUIRY---/s)
        if (match) {
          const [, from, to, date, pax, budget, msg] = match.map(s => s?.trim() || '')
          const id = await submitInquiry(from, to, date, pax, budget, msg)
          if (id) {
            send(`data: ${JSON.stringify({ inquiryCreated: id })}\n\n`)
            console.log(`✅ Marco auto-created inquiry ${id}: ${from} → ${to}`)
          }
        }

        send('data: [DONE]\n\n')
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Errore'
        send(`data: ${JSON.stringify({ error: msg })}\n\n`)
        controller.close()
      }
    },
  })

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } })
}
