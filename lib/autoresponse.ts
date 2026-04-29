/**
 * AEROJET PRIVATE — Auto-Response Engine
 *
 * Gestisce risposte automatiche da:
 * - Corrado (broker principale, voce personale)
 * - Staff Aerojet (tono formale)
 * - Marco AI (concierge virtuale)
 *
 * Categorizza le richieste e propone/invia risposte
 * in base a: canale (email/WA/chat), urgenza, tipo cliente
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

export type Sender = 'CORRADO' | 'STAFF' | 'MARCO_AI'
export type Channel = 'EMAIL' | 'WHATSAPP' | 'CHAT' | 'SMS'
export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type InquiryCategory =
  | 'QUOTE_REQUEST'     // richiesta preventivo
  | 'BOOKING_CHANGE'    // modifica prenotazione
  | 'FLIGHT_STATUS'     // stato volo
  | 'COMPLAINT'         // reclamo
  | 'PAYMENT'           // pagamento/fattura
  | 'GENERAL_INFO'      // info generali
  | 'EMPTY_LEG'         // empty leg
  | 'MEMBERSHIP'        // membership
  | 'EMERGENCY'         // emergenza operativa

export interface IncomingMessage {
  id: string
  from: string           // nome mittente
  email?: string
  phone?: string
  channel: Channel
  subject?: string
  body: string
  receivedAt: string
  read: boolean
  replied: boolean
  category?: InquiryCategory
  urgency?: Urgency
  suggestedReply?: string
  sentReply?: string
  sentAt?: string
  sentBy?: Sender
}

export interface AutoReplyTemplate {
  id: string
  name: string
  category: InquiryCategory
  sender: Sender
  channel: Channel
  subject?: string
  body: string
  variables: string[]   // {nome}, {rotta}, {data}, etc.
}

// ── Signatures ────────────────────────────────────────────────────────────────
const SIGNATURES: Record<Sender, string> = {
  CORRADO: `
Cordialmente,

Corrado
Broker Privato · Aerojet Private
📱 +39 331 882 4030
✉ corrado@aerojet.app`,

  STAFF: `
Cordiali saluti,

Team Aerojet Private
✉ concierge@aerojet.app
📱 +39 02 1234 5678
🌐 aerojet.app`,

  MARCO_AI: `
Con stima,

Marco · Concierge Virtuale Aerojet Private
🤖 Disponibile 24/7
🌐 aerojet.app`,
}

// ── Template library ──────────────────────────────────────────────────────────
export const TEMPLATES: AutoReplyTemplate[] = [
  {
    id: 'T001', name: 'Conferma ricezione preventivo', category: 'QUOTE_REQUEST',
    sender: 'CORRADO', channel: 'EMAIL',
    subject: 'Re: Richiesta preventivo volo privato — Aerojet Private',
    body: `Gentile {nome},

Ho ricevuto la sua richiesta per il volo {rotta} del {data}.

Sto già verificando la disponibilità degli aeromobili più adatti per {pax} passeggeri. Le invio il preventivo personalizzato entro 2 ore.

Nel frattempo, se ha necessità urgenti o domande, mi contatti direttamente su WhatsApp al +39 331 882 4030.`,
    variables: ['nome', 'rotta', 'data', 'pax'],
  },
  {
    id: 'T002', name: 'Preventivo formale', category: 'QUOTE_REQUEST',
    sender: 'CORRADO', channel: 'EMAIL',
    subject: 'Preventivo Volo Privato {rotta} — Aerojet Private',
    body: `Gentile {nome},

In riferimento alla sua richiesta, ho il piacere di inviarle la nostra migliore proposta:

✈ ROTTA: {rotta}
📅 DATA: {data}
👥 PASSEGGERI: {pax}
🛩 VELIVOLO: {aircraft}
💶 PREZZO TOTALE: {prezzo}
💳 DEPOSITO (30%): {deposito}

Il preventivo è valido fino al {scadenza}.

Per accettare, clicchi qui → {link_accettazione}

Resto a sua disposizione per qualsiasi chiarimento.`,
    variables: ['nome', 'rotta', 'data', 'pax', 'aircraft', 'prezzo', 'deposito', 'scadenza', 'link_accettazione'],
  },
  {
    id: 'T003', name: 'Risposta vuota aggiornamento volo', category: 'FLIGHT_STATUS',
    sender: 'CORRADO', channel: 'WHATSAPP',
    body: `Buongiorno {nome} ✦

Il suo volo {registrazione} è attualmente {status}.

📍 Posizione: {posizione}
⏱ ETA: {eta}
🌤 Meteo arrivo: {meteo_arrivo}

Transfer prenotato. A presto.`,
    variables: ['nome', 'registrazione', 'status', 'posizione', 'eta', 'meteo_arrivo'],
  },
  {
    id: 'T004', name: 'Gestione reclamo — empatica', category: 'COMPLAINT',
    sender: 'CORRADO', channel: 'EMAIL',
    subject: 'Re: {subject} — Risposta personale',
    body: `Gentile {nome},

La ringrazio per avermi contattato direttamente. Prendo molto sul serio quanto mi segnala e mi scuso sinceramente per il disagio causato.

Ho già avviato un'indagine interna per comprendere esattamente cosa sia accaduto e garantire che non si ripeta.

Nei prossimi 24 ore la ricontatterò personalmente per fornirle un resoconto completo e, se del caso, proporre un rimedio adeguato.

Mi tenga informato di qualsiasi altro elemento che possa essermi utile.`,
    variables: ['nome', 'subject'],
  },
  {
    id: 'T005', name: 'Alert empty leg', category: 'EMPTY_LEG',
    sender: 'STAFF', channel: 'EMAIL',
    subject: '⚡ Empty Leg Alert: {rotta} — -{sconto}% | Aerojet Private',
    body: `Gentile {nome},

Come da sua preferenza, la informiamo di un empty leg correlato ai suoi interessi:

🛩 VELIVOLO: {aircraft}
✈ ROTTA: {rotta}
📅 DATA: {data}
💶 PREZZO: {prezzo} (sconto {sconto}% sul prezzo normale)
⏰ DISPONIBILITÀ: limitata

Per prenotare o ricevere maggiori informazioni, risponda a questa email o clicchi qui.

L'offerta è riservata ai nostri clienti registrati.`,
    variables: ['nome', 'aircraft', 'rotta', 'data', 'prezzo', 'sconto'],
  },
  {
    id: 'T006', name: 'Benvenuto nuovo membro', category: 'MEMBERSHIP',
    sender: 'CORRADO', channel: 'EMAIL',
    subject: '✦ Benvenuto in Aerojet Private — {tier} Member',
    body: `Caro {nome},

È un piacere darle personalmente il benvenuto come membro {tier} di Aerojet Private.

I suoi vantaggi esclusivi includono:
{benefici}

Il mio numero personale è +39 331 882 4030 — non esiti a contattarmi direttamente per qualsiasi necessità, 24 ore su 24.

Con stima,`,
    variables: ['nome', 'tier', 'benefici'],
  },
]

// ── Mock incoming messages ────────────────────────────────────────────────────
export const INBOX: IncomingMessage[] = [
  {
    id: 'MSG-001', from: 'Marco Ferretti', email: 'marco@empresa.it', channel: 'EMAIL',
    subject: 'Aggiornamento volo questo pomeriggio',
    body: 'Buongiorno, volevo sapere se ci sono aggiornamenti sul mio volo Milano-Londra di oggi pomeriggio. Grazie.',
    receivedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false, replied: false, category: 'FLIGHT_STATUS', urgency: 'HIGH',
    suggestedReply: `Buongiorno Marco,\n\nIl suo volo OE-FGS è partito alle ${new Date(Date.now() - 40 * 60000).toLocaleTimeString('it-IT', {hour:'2-digit',minute:'2-digit'})} ed è attualmente in crociera a FL410 sopra la Francia. ETA Farnborough: ${new Date(Date.now() + 80 * 60000).toLocaleTimeString('it-IT', {hour:'2-digit',minute:'2-digit'})}.\n\nAttenzione: leggera turbolenza prevista sul Canale della Manica. L'equipaggio è informato e gestirà la situazione. Transfer Mercedes EQS la attende all'arrivo.\n\nA presto.`,
  },
  {
    id: 'MSG-002', from: 'Elena Conti', phone: '+39 338 4567890', channel: 'WHATSAPP',
    body: 'Ciao, vorrei cambiare la data del volo Venezia-Ibiza dal 10 al 15 maggio. È possibile?',
    receivedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    read: true, replied: false, category: 'BOOKING_CHANGE', urgency: 'MEDIUM',
    suggestedReply: 'Buongiorno Elena ✦\n\nVerificherò subito la disponibilità dell\'aeromobile per il 15 maggio e le rispondo entro 30 minuti. Il cambio data potrebbe comportare una piccola variazione di prezzo in base alla disponibilità. Resto in contatto.',
  },
  {
    id: 'MSG-003', from: 'Roberto Marini', email: 'r.marini@mariniholding.it', channel: 'EMAIL',
    subject: 'Fattura BK-006 — richiesta nota credito',
    body: 'Gentili Signori, in riferimento alla prenotazione BK-006, richiedo l\'emissione di nota credito per €1,200 relativa al servizio catering non erogato come concordato. In attesa di riscontro.',
    receivedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    read: true, replied: false, category: 'COMPLAINT', urgency: 'HIGH',
    suggestedReply: `Gentile Roberto,\n\nHo ricevuto la sua richiesta e me ne scuso sinceramente. Ho già verificato con l\'operatore e confermo che il servizio catering non è stato erogato secondo le specifiche concordate.\n\nProcederò immediatamente all\'emissione della nota credito di €1,200. La riceverà via email entro le prossime 24 ore.\n\nCome gesto di scuse, le riserverò un upgrade gratuito sulla sua prossima prenotazione.`,
  },
  {
    id: 'MSG-004', from: 'Chiara Lombardi', phone: '+39 347 9988776', channel: 'WHATSAPP',
    body: 'Buonasera, mi interessano le soluzioni membership. Voliamo circa 20 volte all\'anno per lavoro. Cosa mi propone?',
    receivedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: false, replied: false, category: 'MEMBERSHIP', urgency: 'HIGH',
    suggestedReply: 'Buonasera Chiara ✦\n\n20 voli/anno è esattamente il profilo per cui la nostra Membership Platinum è ideale. Le garantisce:\n\n✦ Priorità assoluta sulla disponibilità\n✦ Tariffa fissa concordata annualmente\n✦ Accesso empty legs esclusivi\n✦ Commissione 0% sulle prime 5 prenotazioni\n✦ Concierge dedicato H24\n\nLa chiamo domani mattina per illustrarle i dettagli. Va bene alle 9:30?',
  },
  {
    id: 'MSG-005', from: 'Pietro Gallo', email: 'p.gallo@industriesgallo.com', channel: 'EMAIL',
    subject: 'Preventivo urgente — decollo domani mattina',
    body: 'Buonasera, ho necessità urgente di un volo privato da Roma a Ginevra domani mattina entro le 9:00 per 2 persone. Budget fino a €12,000. Può aiutarmi?',
    receivedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    read: false, replied: false, category: 'QUOTE_REQUEST', urgency: 'CRITICAL',
    suggestedReply: `Buonasera Pietro,\n\nHo ricevuto la sua richiesta. Sto verificando in questo momento la disponibilità per Roma-Ginevra di domani mattina.\n\nPrima disponibilità individuata:\n🛩 Phenom 300E — OE-FVX — decollo 06:30 → arrivo 08:15\n💶 Prezzo: €8,400 (nel suo budget)\n\nMi chiami ora al +39 331 882 4030 per confermare in 5 minuti. Per voli last-minute confermo sempre telefonicamente.`,
  },
]

// ── Categorize incoming message ───────────────────────────────────────────────
export function categorize(body: string, subject?: string): { category: InquiryCategory; urgency: Urgency } {
  const text = `${subject || ''} ${body}`.toLowerCase()

  if (/emergenza|sos|incidente|immediat|adesso|subito/.test(text)) return { category: 'EMERGENCY', urgency: 'CRITICAL' }
  if (/reclamo|rimbors|non.*funzion|problema|lament|nota credito/.test(text)) return { category: 'COMPLAINT', urgency: 'HIGH' }
  if (/urgent|domani|stasera|oggi|last.?minute|subito|entro/.test(text)) return { category: 'QUOTE_REQUEST', urgency: 'CRITICAL' }
  if (/preventivo|prezzo|costo|quanto|charter/.test(text)) return { category: 'QUOTE_REQUEST', urgency: 'HIGH' }
  if (/volo|status|dove|aggiornamento|eta|atterr/.test(text)) return { category: 'FLIGHT_STATUS', urgency: 'HIGH' }
  if (/camb|modifi|spost|annull|cancel/.test(text)) return { category: 'BOOKING_CHANGE', urgency: 'MEDIUM' }
  if (/empty.?leg|empty leg/.test(text)) return { category: 'EMPTY_LEG', urgency: 'MEDIUM' }
  if (/membership|abbonamento|piano|tier|vantaggi/.test(text)) return { category: 'MEMBERSHIP', urgency: 'HIGH' }
  if (/fattura|pagamento|invoice|nota/.test(text)) return { category: 'PAYMENT', urgency: 'MEDIUM' }
  return { category: 'GENERAL_INFO', urgency: 'LOW' }
}

// ── AI reply generation ───────────────────────────────────────────────────────
export async function generateReply(
  message: IncomingMessage,
  sender: Sender,
  context?: string
): Promise<string> {
  const systemPrompt = sender === 'CORRADO'
    ? `Sei Corrado, broker privato di lusso di Aerojet Private. Risponde in prima persona con tono diretto, caldo ma professionale. 
       Il tuo numero WhatsApp: +39 331 882 4030. 
       Sei esperto di aviation e conosci i tuoi clienti personalmente.
       Rispondi in italiano, max 200 parole, conciso e d'impatto.
       Firma sempre con "Corrado" non con firma lunga.`
    : sender === 'STAFF'
    ? `Sei un membro dello staff di Aerojet Private. Tono formale ed efficiente.
       Rispondi in italiano, max 150 parole.`
    : `Sei Marco, il concierge virtuale di Aerojet Private. Elegante, formale, usa "Lei".
       Rispondi in italiano, max 150 parole.`

  const userPrompt = `Genera una risposta professionale a questo messaggio:
Da: ${message.from}
Canale: ${message.channel}
${message.subject ? `Oggetto: ${message.subject}` : ''}
Messaggio: ${message.body}
${context ? `Contesto aggiuntivo: ${context}` : ''}

Categoria: ${message.category}
Urgenza: ${message.urgency}

La risposta deve:
- Essere immediata e risolutiva
- Non usare formule di cortesia vuote
- Includere azioni concrete
- Essere adatta al canale (${message.channel === 'WHATSAPP' ? 'breve, mobile-friendly, usa emoji con parsimonia' : 'email professionale'})`

  if (!process.env.ANTHROPIC_API_KEY) {
    // Dev mode: return template-based reply
    return message.suggestedReply || `Gentile ${message.from},\n\nGrazie per il messaggio. La contatterò a breve.\n\nCorrado`
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return `${text}${SIGNATURES[sender]}`
}

// ── Mark replied ──────────────────────────────────────────────────────────────
export function markReplied(id: string, reply: string, sender: Sender): boolean {
  const msg = INBOX.find(m => m.id === id)
  if (!msg) return false
  msg.replied = true
  msg.sentReply = reply
  msg.sentAt = new Date().toISOString()
  msg.sentBy = sender
  msg.read = true
  return true
}

export function markRead(id: string): boolean {
  const msg = INBOX.find(m => m.id === id)
  if (!msg) return false
  msg.read = true
  return true
}

export function getUnreadCount(): number {
  return INBOX.filter(m => !m.read).length
}

export function getPendingReplies(): IncomingMessage[] {
  return INBOX.filter(m => !m.replied).sort((a, b) => {
    const priority = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return (priority[a.urgency || 'LOW'] - priority[b.urgency || 'LOW']) ||
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  })
}
