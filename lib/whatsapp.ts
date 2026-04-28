/**
 * WhatsApp Business — Aerojet Private
 * Numero centralizzato via env. URL con messaggi precompilati per tipo di richiesta.
 */

export type WhatsAppTemplate =
  | 'volo'
  | 'vip'
  | 'empty_leg'
  | 'membership'
  | 'urgenza'
  | 'generico'

export interface FlightContext {
  from?: string
  to?: string
  date?: string
  pax?: string | number
  budget?: string
  priority?: string
}

function getNumber(): string {
  // Formato atteso: solo cifre, con prefisso internazionale (es. 393xxxxxxxxx)
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '')
}

function encode(text: string): string {
  return encodeURIComponent(text.trim())
}

export function buildWhatsAppUrl(template: WhatsAppTemplate, ctx?: FlightContext): string {
  const number = getNumber()
  if (!number) return '#'

  const messages: Record<WhatsAppTemplate, string> = {
    vip: [
      'Stiamo verificando disponibilità prioritaria per la sua richiesta.',
      ctx?.from ? `Tratta: ${ctx.from}${ctx.to ? ` → ${ctx.to}` : ''}` : '',
      ctx?.date ? `Data richiesta: ${ctx.date}` : '',
      ctx?.pax ? `Passeggeri: ${ctx.pax}` : '',
      '\nRichiedo contatto diretto con il broker assegnato.',
    ].filter(Boolean).join('\n'),

    volo: [
      'Buongiorno, vorrei ricevere una quotazione per un volo privato.',
      ctx?.from ? `Da: ${ctx.from}` : '',
      ctx?.to ? `A: ${ctx.to}` : '',
      ctx?.date ? `Data: ${ctx.date}` : '',
      ctx?.pax ? `Passeggeri: ${ctx.pax}` : '',
      ctx?.budget ? `Budget indicativo: ${ctx.budget}` : '',
      ctx?.priority ? `Priorità: ${ctx.priority}` : '',
      '\nRimango in attesa.',
    ].filter(Boolean).join('\n'),

    empty_leg: [
      'Buongiorno, sono interessato a una tratta empty leg.',
      'Potete verificare disponibilità e condizioni commerciali?',
      ctx?.from ? `Tratta di interesse: ${ctx.from}${ctx.to ? ` → ${ctx.to}` : ''}` : '',
      ctx?.date ? `Data: ${ctx.date}` : '',
    ].filter(Boolean).join('\n'),

    membership: [
      'Buongiorno, vorrei ricevere informazioni sull\'accesso membership Aerojet Private.',
      'Sono interessato ai programmi di accesso riservato e alle condizioni commerciali.',
    ].join('\n'),

    urgenza: [
      'Richiesta urgente — necessito verifica disponibilità per decollo entro 24 ore.',
      ctx?.from ? `Da: ${ctx.from}` : '',
      ctx?.to ? `A: ${ctx.to}` : '',
      ctx?.pax ? `Passeggeri: ${ctx.pax}` : '',
      'Disponibile a chiamata immediata.',
    ].filter(Boolean).join('\n'),

    generico: [
      'Buongiorno, vorrei parlare con un concierge Aerojet Private.',
    ].join('\n'),
  }

  return `https://wa.me/${number}?text=${encode(messages[template])}`
}

// Shortcut per uso client (NEXT_PUBLIC_ prefix necessario)
export function getWhatsAppNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '')
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppNumber().length >= 10
}

/**
 * Seleziona template e timing in base al tier del lead.
 * Usato da ContactSection dopo il submit.
 */
export function buildWhatsAppUrlForTier(
  tier: string,
  ctx?: FlightContext,
): { url: string; delay: number } {
  const number = getWhatsAppNumber()
  if (!number) return { url: '#', delay: 0 }

  switch (tier) {
    case 'VIP':
      return { url: buildWhatsAppUrl('vip', ctx), delay: 0 }    // immediato
    case 'HIGH':
      return { url: buildWhatsAppUrl('volo', ctx), delay: 1000 } // 1s
    case 'MEDIUM':
      return { url: '#', delay: -1 }                             // solo bottone, no auto-open
    default:
      return { url: '#', delay: -1 }
  }
}
