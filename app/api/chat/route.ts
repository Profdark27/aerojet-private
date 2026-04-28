import Anthropic from '@anthropic-ai/sdk'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calculateLeadScore } from '@/lib/leadScoring'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder' })

interface ChatContext {
  from?: string
  to?: string
  budget?: string
  userName?: string
  userEmail?: string
  userPhone?: string
}

function buildSystemPrompt(context: ChatContext): string {
  // Dynamic context block — injected silently, Marco non lo cita esplicitamente
  const ctxLines: string[] = []
  if (context.userName) ctxLines.push(`- Cliente identificato: ${context.userName}`)
  if (context.userEmail) ctxLines.push(`- Email disponibile: ${context.userEmail}`)
  if (context.userPhone) ctxLines.push(`- Telefono disponibile: ${context.userPhone}`)
  if (context.from) ctxLines.push(`- Partenza già indicata: ${context.from}`)
  if (context.to) ctxLines.push(`- Destinazione già indicata: ${context.to}`)
  if (context.budget) ctxLines.push(`- Budget indicato dal cliente: ${context.budget}`)

  const ctxBlock = ctxLines.length > 0
    ? `\n[CONTESTO SESSIONE — usa queste info ma non citarle esplicitamente]\n${ctxLines.join('\n')}\n`
    : ''

  return `Sei Marco, il concierge virtuale d'élite di Aerojet Private.
${ctxBlock}
IDENTITÀ: Formale ed elegante. Usi "Lei". Italiano (inglese se il cliente scrive in inglese). Max 3-4 frasi per risposta. Non inventare mai prezzi precisi — indica sempre fasce. Aerojet è broker, non operatore diretto.

FLOTTA (fasce indicative):
- Turboprop (PC-12, King Air 350): <1.500km · 6-9 pax · €2.500-4.000/h
- Light Jet (Phenom 300, CJ4): <3.000km · 4-8 pax · €3.800-5.500/h
- Midsize (Challenger 350, Citation XLS): <5.500km · 7-9 pax · €5.500-8.000/h
- Super Midsize (Citation Latitude, Falcon 2000): <7.000km · 8-10 pax · €7.000-10.000/h
- Heavy (Falcon 7X, Global 6000): <10.000km · 10-16 pax · €9.500-14.000/h
- Ultra-Long Range (Global 7500, G700): 13.000+km · 12-19 pax · €14.000+/h

PROTOCOLLO RACCOLTA DATI:
1. Raccogli: partenza, destinazione, data, pax, budget (facoltativo)
2. Proponi 2-3 categorie jet con fascia oraria e stima totale
3. Chiedi: "Desidera che proceda con la richiesta formale?"
4. Prima di emettere il blocco dati, assicurati di avere nome e email del cliente. Se mancano, chiedili con eleganza.
5. Sul deposito: se chiesto, informare che si richiede il 30% per confermare la prenotazione.

QUANDO IL CLIENTE CONFERMA E HAI NOME + EMAIL — emetti OBBLIGATORIAMENTE:
---INQUIRY_DATA---
FROM:[città di partenza]
TO:[città di destinazione]
DATE:[data del volo]
PAX:[numero passeggeri]
BUDGET:[budget dichiarato o N/D]
NAME:[nome e cognome cliente]
EMAIL:[email cliente]
PHONE:[telefono o N/D]
MSG:[riepilogo della richiesta in una frase]
---END_INQUIRY---

Poi aggiungi un messaggio di conferma e comunica che il team la contatterà entro 2 ore.

OPERATORI PARTNER: VistaJet, NetJets, Air Charter Service, Luxaviation, TAG Aviation.`
}

// Regex robusta al whitespace variabile
const INQUIRY_RE = /---INQUIRY_DATA---\s*FROM:\s*([\s\S]*?)\s*TO:\s*([\s\S]*?)\s*DATE:\s*([\s\S]*?)\s*PAX:\s*([\s\S]*?)\s*BUDGET:\s*([\s\S]*?)\s*NAME:\s*([\s\S]*?)\s*EMAIL:\s*([\s\S]*?)\s*PHONE:\s*([\s\S]*?)\s*MSG:\s*([\s\S]*?)\s*---END_INQUIRY---/

async function persistInquiry(fields: Record<string, string>) {
  const { from, to, date, pax, budget, name, email, phone, msg } = fields
  const data = {
    name: name || 'Cliente via Chat Marco',
    email: email || 'chat@aerojet.private',
    phone: phone !== 'N/D' ? phone : undefined,
    fromCity: from,
    toCity: to,
    flightDate: date,
    pax: parseInt(pax) || 2,
    budget: budget !== 'N/D' ? budget : undefined,
    message: msg || `Richiesta volo ${from} → ${to}`,
    flightType: 'oneway',
  }
  const scoring = calculateLeadScore(data)

  const inquiry = await prisma.inquiry.create({
    data: {
      ...data,
      status: 'NEW',
      pipelineStatus: 'NEW',
      leadScore: scoring.leadScore,
      leadTier: scoring.leadTier,
      budgetNumeric: scoring.budgetNumeric,
      urgency: scoring.urgency,
      sameDay: scoring.sameDay,
      membershipInterest: scoring.membershipInterest,
      suggestedAction: scoring.suggestedAction,
      nextAction: scoring.nextAction,
      urgencyFlag: scoring.urgencyFlag,
      operatorCostEstimate: scoring.operatorCostEstimate,
      clientQuoteEstimate: scoring.clientQuoteEstimate,
      suggestedQuote: scoring.suggestedQuote,
      optimizedQuote: scoring.optimizedQuote,
      optimizedMargin: scoring.optimizedMargin,
      marginEstimate: scoring.marginEstimate,
      marginPercent: scoring.marginPercent,
      revenuePotential: scoring.revenuePotential,
      nextFollowUpAt: new Date(Date.now() + 30 * 60 * 1000),
      followUp2hAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      followUp24hAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  return {
    id: inquiry.id,
    leadScore: inquiry.leadScore,
    leadTier: inquiry.leadTier,
    estimatedQuote: inquiry.optimizedQuote || inquiry.clientQuoteEstimate,
    depositEstimate: Math.round((inquiry.optimizedQuote || inquiry.clientQuoteEstimate) * 0.3),
  }
}

export async function POST(req: Request) {
  const session = await auth()
  const body = await req.json() as { messages: Array<{ role: string; content: string }>; context?: ChatContext }

  // Merge auth session data into context
  const context: ChatContext = {
    userName: session?.user?.name || body.context?.userName,
    userEmail: session?.user?.email || body.context?.userEmail,
    ...body.context,
  }

  const encoder = new TextEncoder()
  const send = (controller: ReadableStreamDefaultController, payload: unknown) =>
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))

  // Dev mode: no API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder') {
    const mockText = 'Mi scuso, il servizio di intelligenza artificiale non è ancora configurato in questo ambiente di sviluppo. La funzionalità sarà disponibile con la chiave API configurata.'
    return new Response(
      `data: ${JSON.stringify({ delta: { text: mockText } })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
      { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
    )
  }

  const stream = new ReadableStream({
    async start(controller) {
      // Keepalive comment to prevent proxy timeouts
      controller.enqueue(encoder.encode(': keepalive\n\n'))

      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: buildSystemPrompt(context),
          messages: body.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          stream: true,
        })

        let fullText = ''
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            send(controller, { delta: { text: event.delta.text } })
          }
        }

        // Strip INQUIRY_DATA block from displayed text (show clean response to user)
        const cleanText = fullText.replace(/---INQUIRY_DATA---[\s\S]*?---END_INQUIRY---/g, '').trim()
        if (cleanText !== fullText) {
          // Notify client to replace last message with clean version
          send(controller, { replaceLastMessage: cleanText })
        }

        // Parse and persist inquiry
        const match = fullText.match(INQUIRY_RE)
        if (match) {
          const [, from, to, date, pax, budget, name, email, phone, msg] = match.map(s => s?.trim() ?? '')
          try {
            const result = await persistInquiry({ from, to, date, pax, budget, name, email, phone, msg })
            send(controller, {
              inquiryCreated: {
                id: result.id,
                leadScore: result.leadScore,
                leadTier: result.leadTier,
                estimatedQuote: result.estimatedQuote,
                depositEstimate: result.depositEstimate,
                from,
                to,
                date,
              },
            })
            // Fire-and-forget email notifications
            void import('@/app/api/notifications/route').then(({ pushNotification }) =>
              pushNotification('new_request', {
                clientName: name,
                route: `${from} → ${to}`,
                requestId: result.id,
                budget: budget !== 'N/D' ? budget : '',
                leadTier: result.leadTier,
                leadScore: result.leadScore,
              })
            ).catch(() => {})
          } catch (err) {
            console.error('Failed to persist inquiry from chat:', err)
          }
        }

        send(controller, { done: true })
        controller.close()
      } catch (err) {
        console.error('[CHAT API ERROR]:', err)
        const message = err instanceof Error ? err.message : 'Errore sconosciuto'
        send(controller, { error: message })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  })
}
