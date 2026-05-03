// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
/**
 * Email transazionali Aerojet Private — Resend
 * Docs: https://resend.com/docs
 * Setup: RESEND_API_KEY + RESEND_FROM_EMAIL in .env.local
 *
 * Senza chiave Resend → log in console (dev mode)
 */

const FROM = process.env.RESEND_FROM_EMAIL || 'concierge@aerojet.app'
const RESEND_KEY = process.env.RESEND_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aerojet.app'

export async function send(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.log('\n📧 EMAIL (dev — no RESEND_API_KEY):')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log('  (set RESEND_API_KEY to send real emails)\n')
    return { success: true, dev: true }
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(RESEND_KEY)
    const result = await resend.emails.send({ from: FROM, to, subject, html })
    return { success: true, id: result.data?.id }
  } catch (err) {
    console.error('Email send failed:', err)
    return { success: false, error: err }
  }
}

// ─── Layout base ──────────────────────────────────────────
function base(content: string) {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Aerojet Private</title></head>
<body style="margin:0;padding:0;background:#0A0C14;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;background:#0A0C14;border:1px solid rgba(201,168,76,0.15);">
  <!-- Header -->
  <div style="padding:36px 48px;border-bottom:1px solid rgba(201,168,76,0.12);">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="color:#C9A84C;font-size:18px;">✦</span>
      <span style="color:#F0EDE6;font-size:20px;font-weight:700;letter-spacing:6px;">AEROJET</span>
      <span style="color:#C9A84C;font-size:10px;letter-spacing:4px;font-family:Helvetica Neue,sans-serif;">PRIVATE</span>
    </div>
  </div>
  <!-- Content -->
  <div style="padding:48px;">
    ${content}
  </div>
  <!-- Footer -->
  <div style="padding:28px 48px;border-top:1px solid rgba(201,168,76,0.08);">
    <p style="color:rgba(240,237,230,0.2);font-size:11px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0;">
      © 2026 Aerojet Private · Il lusso del tempo. La libertà del cielo.<br>
      Per assistenza: <a href="mailto:concierge@aerojet.app" style="color:#C9A84C;">concierge@aerojet.app</a>
    </p>
  </div>
</div>
</body></html>`
}

function goldBtn(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background:#C9A84C;color:#0A0C14;padding:16px 40px;text-decoration:none;font-family:Helvetica Neue,sans-serif;font-size:12px;letter-spacing:2px;font-weight:600;">${label}</a>`
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid rgba(201,168,76,0.06);color:rgba(240,237,230,0.4);font-size:12px;font-family:Helvetica Neue,sans-serif;letter-spacing:1px;width:40%;">${label}</td>
    <td style="padding:12px 0;border-bottom:1px solid rgba(201,168,76,0.06);color:#F0EDE6;font-size:14px;font-family:Helvetica Neue,sans-serif;">${value}</td>
  </tr>`
}

// ─── 1. Conferma Prenotazione ──────────────────────────────
export async function sendBookingConfirmation({
  to, name, aircraft, from, dest, date, pax, deposit, total, confirmCode, bookingId,
}: {
  to: string; name: string; aircraft: string
  from: string; dest: string; date: string; pax: number
  deposit: number; total: number; confirmCode: string; bookingId?: string
}) {
  const tripUrl = bookingId ? `${BASE_URL}/trip/${bookingId}` : `${BASE_URL}/dashboard`
  
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:30px;font-weight:300;margin:0 0 8px;">Prenotazione Confermata</h2>
    <p style="color:#C9A84C;font-size:12px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">CODICE: ${confirmCode}</p>
    
    <p style="color:rgba(240,237,230,0.65);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Gentile ${name}, la sua prenotazione è stata confermata con successo. Il suo itinerario completo e lo stato dei servizi sono ora disponibili nel suo portale dedicato.
    </p>

    <div style="text-align:center;margin-bottom:40px;">
      ${goldBtn(tripUrl, 'APRI TRIP PORTAL')}
    </div>

    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:28px;margin-bottom:36px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Velivolo', aircraft)}
        ${row('Rotta', `${from} → ${dest}`)}
        ${row('Data', date)}
        ${row('Passeggeri', `${pax} persone`)}
        ${row('Deposito pagato', `€${deposit.toLocaleString('it-IT')}`)}
        ${row('Totale charter', `€${total.toLocaleString('it-IT')}`)}
      </table>
    </div>

    <div style="background:rgba(201,168,76,0.05);border-left:3px solid #C9A84C;padding:24px;margin-bottom:32px;">
      <div style="font-size:10px;letter-spacing:2px;color:#C9A84C;font-family:Helvetica Neue,sans-serif;margin-bottom:8px;">CONCIERGE DEDICATO</div>
      <p style="color:rgba(240,237,230,0.7);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0 0 16px;">
        Il nostro team la contatterà a breve per coordinare catering e transfer. Può contattarci subito via WhatsApp per ogni esigenza.
      </p>
      <a href="https://wa.me/393471234567" style="color:#C9A84C;font-family:Helvetica Neue,sans-serif;font-size:13px;text-decoration:none;font-weight:600;">➔ CHATTA CON IL CONCIERGE</a>
    </div>

    <p style="color:rgba(240,237,230,0.35);font-size:13px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0;">
      Il saldo residuo sarà addebitato 72 ore prima della partenza.<br>
      Tutte le informazioni operative saranno aggiornate in tempo reale sul Trip Portal.
    </p>
  `)
  return send(to, `✦ Prenotazione confermata — ${from} → ${dest}`, html)
}

// ─── 2. Preventivo Inviato (al cliente) ───────────────────
export async function sendQuoteToClient({
  to, name, aircraft, from, dest, date, pax, price, validUntil, brokerName, quoteId,
}: {
  to: string; name: string; aircraft: string
  from: string; dest: string; date: string; pax: number
  price: number; validUntil: string; brokerName: string; quoteId: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:30px;font-weight:300;margin:0 0 32px;">Il suo Preventivo</h2>
    <p style="color:rgba(240,237,230,0.65);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Gentile ${name}, in allegato trova il preventivo personalizzato preparato da ${brokerName} per il volo richiesto.
    </p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.2);padding:32px;margin-bottom:32px;">
      <div style="font-size:11px;letter-spacing:3px;color:#C9A84C;font-family:Helvetica Neue,sans-serif;margin-bottom:24px;">DETTAGLI VOLO</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Velivolo', aircraft)}
        ${row('Rotta', `${from} → ${dest}`)}
        ${row('Data', date)}
        ${row('Passeggeri', `${pax} persone`)}
        ${row('Prezzo totale', `<strong style="color:#C9A84C;font-size:22px;">€${price.toLocaleString('it-IT')}</strong>`)}
        ${row('Valido fino al', validUntil)}
      </table>
    </div>
    <p style="color:rgba(240,237,230,0.4);font-size:13px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">
      Il prezzo include tutti i costi operativi, tasse aeroportuali e handling. Catering e servizi aggiuntivi sono quotabili su richiesta.
    </p>
    ${goldBtn(`${BASE_URL}/accept-quote/${quoteId}`, 'ACCETTA E PAGA DEPOSITO')}
  `)
  return send(to, `Preventivo volo privato ${from} → ${dest} — Aerojet Private`, html)
}

// ─── 3. Nuova Richiesta (al broker) ───────────────────────
export async function notifyBrokerNewRequest({
  brokerEmail, clientName, clientEmail, from, to, date, pax, budget, message, requestId,
}: {
  brokerEmail: string; clientName: string; clientEmail: string
  from: string; to: string; date: string; pax: number
  budget: string; message: string; requestId: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 8px;">Nuova Richiesta</h2>
    <p style="color:#C9A84C;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">${requestId}</p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:28px;margin-bottom:28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Cliente', `${clientName} — ${clientEmail}`)}
        ${row('Rotta', `${from} → ${to}`)}
        ${row('Data volo', date)}
        ${row('Passeggeri', `${pax}`)}
        ${row('Budget', budget)}
      </table>
    </div>
    <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.1);padding:20px;margin-bottom:32px;">
      <div style="font-size:10px;letter-spacing:2px;color:#C9A84C;font-family:Helvetica Neue,sans-serif;margin-bottom:8px;">MESSAGGIO</div>
      <p style="color:rgba(240,237,230,0.7);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0;">${message}</p>
    </div>
    ${goldBtn(`${BASE_URL}/dashboard/requests`, 'APRI DASHBOARD →')}
  `)
  return send(brokerEmail, `🔔 Nuova richiesta ${requestId} — ${from} → ${to}`, html)
}

// ─── 4. Conferma Ricezione Richiesta (al cliente) ─────────
export async function sendRequestReceived({
  to, name, from, dest, date, requestId,
}: {
  to: string; name: string; from: string; dest: string; date: string; requestId: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:30px;font-weight:300;margin:0 0 32px;">Richiesta Ricevuta</h2>
    <p style="color:rgba(240,237,230,0.65);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 28px;">
      Gentile ${name}, abbiamo ricevuto la sua richiesta per il volo <strong style="color:#F0EDE6;">${from} → ${dest}</strong> del ${date}.
    </p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:24px;margin-bottom:28px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;color:#C9A84C;font-family:Helvetica Neue,sans-serif;margin-bottom:8px;">NUMERO PRATICA</div>
      <div style="font-size:28px;letter-spacing:6px;color:#C9A84C;font-weight:300;">${requestId}</div>
    </div>
    <p style="color:rgba(240,237,230,0.5);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Il nostro team la contatterà entro <strong style="color:#F0EDE6;">2 ore lavorative</strong> con un preventivo personalizzato.<br>
      Per urgenze è disponibile il servizio concierge H24.
    </p>
    <div style="display:flex;gap:16px;">
      <a href="tel:+390212345678" style="color:#C9A84C;font-family:Helvetica Neue,sans-serif;font-size:13px;text-decoration:none;">📞 +39 02 1234 5678</a>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      <a href="mailto:concierge@aerojet.app" style="color:#C9A84C;font-family:Helvetica Neue,sans-serif;font-size:13px;text-decoration:none;">✉ concierge@aerojet.app</a>
    </div>
  `)
  return send(to, `Richiesta ${requestId} ricevuta — Aerojet Private`, html)
}

// ─── 5b. Notifica Broker — Lead VIP/Scoring ────────────────
export async function notifyBrokerScoredLead({
  brokerEmail, clientName, clientEmail, phone, from, to, date, pax, budget,
  message, requestId, leadTier, leadScore, suggestedAction, marginEstimate, suggestedQuote,
}: {
  brokerEmail: string; clientName: string; clientEmail: string; phone?: string
  from: string; to: string; date: string; pax: number
  budget: string; message: string; requestId: string
  leadTier: string; leadScore: number; suggestedAction: string
  marginEstimate: number; suggestedQuote: number
}) {
  const tierColors: Record<string, string> = {
    VIP: '#C9A84C', HIGH: '#60a5fa', MEDIUM: '#c084fc', LOW: 'rgba(240,237,230,0.4)', UNQUALIFIED: '#6b7280',
  }
  const tierColor = tierColors[leadTier] || '#C9A84C'
  const isHot = leadTier === 'VIP' || leadTier === 'HIGH'

  const html = base(`
    ${isHot ? `<div style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);padding:12px 20px;margin-bottom:28px;display:inline-block;">
      <span style="color:#C9A84C;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">${leadTier === 'VIP' ? '🔥 LEAD VIP — CONTATTA ORA' : '💰 LEAD HIGH VALUE'}</span>
    </div>` : ''}
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 8px;">Nuova Richiesta</h2>
    <p style="color:#C9A84C;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;margin:0 0 28px;">${requestId}</p>

    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:28px;margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:2px;color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;margin-bottom:16px;">CLIENTE</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Nome', clientName)}
        ${row('Email', clientEmail)}
        ${phone ? row('Telefono', `<strong style="color:#C9A84C;">${phone}</strong>`) : ''}
        ${row('Rotta', `${from} → ${to}`)}
        ${row('Data', date || 'Da definire')}
        ${row('Passeggeri', `${pax}`)}
        ${row('Budget dichiarato', budget)}
      </table>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#0A0C14;border:1px solid rgba(201,168,76,0.1);padding:16px;text-align:center;">
        <div style="font-size:10px;letter-spacing:2px;color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;margin-bottom:6px;">TIER</div>
        <div style="font-size:20px;font-weight:600;color:${tierColor};">${leadTier}</div>
      </div>
      <div style="background:#0A0C14;border:1px solid rgba(201,168,76,0.1);padding:16px;text-align:center;">
        <div style="font-size:10px;letter-spacing:2px;color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;margin-bottom:6px;">SCORE</div>
        <div style="font-size:20px;font-weight:600;color:#C9A84C;">${leadScore}/100</div>
      </div>
      <div style="background:#0A0C14;border:1px solid rgba(201,168,76,0.1);padding:16px;text-align:center;">
        <div style="font-size:10px;letter-spacing:2px;color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;margin-bottom:6px;">MARGINE EST.</div>
        <div style="font-size:20px;font-weight:600;color:#4ade80;">€${marginEstimate.toLocaleString('it-IT')}</div>
      </div>
    </div>

    ${suggestedQuote > 0 ? `<div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);padding:16px 20px;margin-bottom:20px;">
      <div style="font-size:10px;letter-spacing:2px;color:#4ade80;font-family:Helvetica Neue,sans-serif;margin-bottom:6px;">QUOTAZIONE SUGGERITA</div>
      <div style="font-size:24px;color:#4ade80;font-weight:300;">€${suggestedQuote.toLocaleString('it-IT')}</div>
    </div>` : ''}

    <div style="background:rgba(201,168,76,0.05);border-left:3px solid #C9A84C;padding:16px 20px;margin-bottom:28px;">
      <div style="font-size:10px;letter-spacing:2px;color:#C9A84C;font-family:Helvetica Neue,sans-serif;margin-bottom:6px;">AZIONE SUGGERITA</div>
      <div style="font-size:14px;color:#F0EDE6;font-family:Helvetica Neue,sans-serif;">${suggestedAction}</div>
    </div>

    <div style="background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.08);padding:16px 20px;margin-bottom:32px;">
      <div style="font-size:10px;letter-spacing:2px;color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;margin-bottom:8px;">MESSAGGIO</div>
      <p style="color:rgba(240,237,230,0.65);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0;">${message}</p>
    </div>

    ${goldBtn(`${BASE_URL}/dashboard/requests`, 'APRI DASHBOARD →')}
  `)

  const prefix = leadTier === 'VIP' ? '🔥 VIP' : leadTier === 'HIGH' ? '💰 HIGH' : '🔔'
  return send(brokerEmail, `${prefix} Richiesta ${requestId} — ${from} → ${to} — Score ${leadScore}/100`, html)
}

// ─── 6. Follow-up cliente non contattato ──────────────────
export async function sendFollowUpNotContacted({
  to, name, from, dest, requestId,
}: {
  to: string; name: string; from: string; dest: string; requestId: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 28px;">Disponibilità ancora aperta</h2>
    <p style="color:rgba(240,237,230,0.65);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.85;margin:0 0 28px;">
      Gentile ${name}, il nostro team sta ancora verificando le disponibilità operative per il suo volo <strong style="color:#F0EDE6;">${from} → ${dest}</strong>.
    </p>
    <p style="color:rgba(240,237,230,0.55);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.85;margin:0 0 32px;">
      La contatteremo a breve con opzioni personalizzate. Nel frattempo, il nostro concierge è disponibile per qualsiasi esigenza.
    </p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.12);padding:20px 28px;margin-bottom:32px;text-align:center;">
      <div style="font-size:10px;letter-spacing:3px;color:rgba(240,237,230,0.3);font-family:Helvetica Neue,sans-serif;margin-bottom:6px;">PRATICA</div>
      <div style="font-size:20px;letter-spacing:4px;color:#C9A84C;">${requestId}</div>
    </div>
    <p style="color:rgba(240,237,230,0.35);font-size:13px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0 0 28px;">
      Se ha già trovato alternative o desidera aggiornare la richiesta, può rispondere direttamente a questa email o contattarci.
    </p>
    ${goldBtn('mailto:concierge@aerojet.app?subject=Richiesta%20' + requestId, 'RISPONDI AL CONCIERGE')}
  `)
  return send(to, `Pratica ${requestId} — Disponibilità ancora in verifica`, html)
}

// ─── 7. Follow-up VIP ──────────────────────────────────────
export async function sendFollowUpVIP({
  to, name, from, dest, requestId,
}: {
  to: string; name: string; from: string; dest: string; requestId: string
}) {
  const html = base(`
    <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);padding:12px 20px;margin-bottom:28px;display:inline-block;">
      <span style="color:#C9A84C;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">✦ SERVIZIO PRIORITARIO</span>
    </div>
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 28px;">Verifica operatore in corso</h2>
    <p style="color:rgba(240,237,230,0.65);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.85;margin:0 0 28px;">
      Gentile ${name}, la sua richiesta per il volo <strong style="color:#F0EDE6;">${from} → ${dest}</strong> è stata elevata a <span style="color:#C9A84C;">priorità servizio dedicato</span>.
    </p>
    <p style="color:rgba(240,237,230,0.55);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.85;margin:0 0 32px;">
      Il concierge assegnato sta contattando direttamente gli operatori per verificare disponibilità e configurazioni aeromobile in linea con le sue aspettative. La aggiorneremo con una proposta personalizzata.
    </p>
    ${goldBtn('mailto:concierge@aerojet.app?subject=Richiesta%20prioritaria%20' + requestId, 'CONTATTA CONCIERGE DEDICATO')}
  `)
  return send(to, `Il suo concierge sta verificando disponibilità dedicate — ${requestId}`, html)
}

// ─── 8. Notifica Broker — Deposito Ricevuto ───────────────
export async function sendBrokerDepositReceived({
  brokerEmail, clientName, clientEmail, from, dest, flightDate,
  depositAmount, totalPrice, confirmationCode, inquiryId,
}: {
  brokerEmail: string; clientName: string; clientEmail: string
  from: string; dest: string; flightDate: string
  depositAmount: number; totalPrice: number
  confirmationCode: string; inquiryId: string
}) {
  const html = base(`
    <div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);padding:12px 20px;margin-bottom:28px;display:inline-block;">
      <span style="color:#4ade80;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">✓ DEPOSITO RICEVUTO</span>
    </div>
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 8px;">${from} → ${dest}</h2>
    <p style="color:rgba(240,237,230,0.45);font-size:14px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">${flightDate}</p>
    <div style="background:#0F1220;border:1px solid rgba(74,222,128,0.15);padding:28px;margin-bottom:28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Cliente', `${clientName} — ${clientEmail}`)}
        ${row('Rotta', `${from} → ${dest}`)}
        ${row('Data volo', flightDate)}
        ${row('Deposito ricevuto', `<strong style="color:#4ade80;font-size:20px;">€${depositAmount.toLocaleString('it-IT')}</strong>`)}
        ${row('Totale charter', `€${totalPrice.toLocaleString('it-IT')}`)}
        ${row('Saldo residuo', `€${(totalPrice - depositAmount).toLocaleString('it-IT')}`)}
        ${row('Codice conferma', `<span style="color:#C9A84C;letter-spacing:3px;">${confirmationCode}</span>`)}
      </table>
    </div>
    <p style="color:rgba(240,237,230,0.4);font-size:13px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0 0 32px;">
      Il cliente ha completato il pagamento del deposito. Aggiorna lo stato della pratica e procedi con la conferma operativa.
    </p>
    ${goldBtn(`${BASE_URL}/dashboard/requests`, 'APRI DASHBOARD →')}
  `)
  return send(brokerEmail, `✓ Deposito ricevuto — ${clientName} · ${from} → ${dest} · €${depositAmount.toLocaleString('it-IT')}`, html)
}

// ─── 5. Empty Leg Alert ────────────────────────────────────
export async function sendEmptyLegAlert({
  to, name, from, dest, date, time, aircraft, originalPrice, discountedPrice, discount,
}: {
  to: string; name: string; from: string; dest: string
  date: string; time: string; aircraft: string
  originalPrice: number; discountedPrice: number; discount: number
}) {
  const html = base(`
    <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);padding:16px 24px;margin-bottom:32px;display:inline-block;">
      <span style="color:#C9A84C;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">⚡ EMPTY LEG DISPONIBILE — OFFERTA LIMITATA</span>
    </div>
    <h2 style="color:#F0EDE6;font-size:32px;font-weight:300;margin:0 0 8px;">${from} → ${dest}</h2>
    <p style="color:rgba(240,237,230,0.45);font-size:14px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">${date} · ore ${time}</p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.2);padding:32px;margin-bottom:32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Velivolo', aircraft)}
        ${row('Prezzo pieno', `<span style="text-decoration:line-through;color:rgba(240,237,230,0.3);">€${originalPrice.toLocaleString('it-IT')}</span>`)}
        ${row('Prezzo empty leg', `<strong style="color:#C9A84C;font-size:24px;">€${discountedPrice.toLocaleString('it-IT')}</strong>`)}
        ${row('Risparmio', `<span style="color:#4ade80;font-size:16px;">-${discount}% (€${(originalPrice - discountedPrice).toLocaleString('it-IT')})</span>`)}
      </table>
    </div>
    <p style="color:rgba(240,237,230,0.4);font-size:13px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">
      ⚠️ Disponibilità limitata. Queste offerte si esauriscono rapidamente.
    </p>
    ${goldBtn(`${BASE_URL}/#emptylegs`, 'PRENOTA SUBITO')}
  `)
  return send(to, `⚡ Empty Leg ${from} → ${dest} — -${discount}% | Aerojet Private`, html)
}

// ─── 9. Alert Operativo Interno ──────────────────────────────
export async function sendInternalAlert({
  type, route, price, clientName, link
}: {
  type: string; route: string; price?: number; clientName: string; link: string
}) {
  
  let emoji = '🔥'
  let label = 'NUOVO LEAD / EVENTO'
  
  if (type === 'booking_success') { emoji = '✅'; label = 'NUOVO BOOKING' }
  else if (type === 'quote_payment_clicked') { emoji = '💰'; label = 'INTENZIONE PAGAMENTO' }
  else if (type === 'inquiry_sent') { emoji = '⚡'; label = 'NUOVA RICHIESTA' }

  const html = base(`
    <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);padding:12px 20px;margin-bottom:28px;display:inline-block;">
      <span style="color:#C9A84C;font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">${emoji} ${label}</span>
    </div>
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 8px;">${route}</h2>
    ${price ? `<p style="color:#4ade80;font-size:24px;font-family:Helvetica Neue,sans-serif;margin:0 0 24px;">€${price.toLocaleString('it-IT')}</p>` : ''}
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:24px;margin-bottom:32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Cliente', clientName)}
        ${row('Evento', type)}
      </table>
    </div>
    ${goldBtn(`${BASE_URL}${link}`, 'APRI PRATICA →')}
  `)
  
  // Manda sempre al concierge centrale (oppure potremmo mandarlo ai vari broker nel DB)
  return send('concierge@aerojet.app', `${emoji} ALERT OPERATIVO: ${label} — ${route}`, html)
}
// ─── 10. Allerta Task Operativo (al team Ops) ──────────────────
export async function sendOpsTeamTaskAlert({
  to, bookingId, taskTitle, priority, category, dueDate
}: {
  to: string; bookingId: string; taskTitle: string; priority: string; category: string; dueDate?: string
}) {
  const priorityColor = priority === 'URGENT' ? '#f87171' : priority === 'HIGH' ? '#fb923c' : '#C9A84C'
  
  const html = base(`
    <div style="background:rgba(201,168,76,0.08);border:1px solid ${priorityColor};padding:12px 20px;margin-bottom:28px;display:inline-block;">
      <span style="color:${priorityColor};font-size:11px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">⚠️ TASK OPERATIVO ${priority}</span>
    </div>
    <h2 style="color:#F0EDE6;font-size:24px;font-weight:300;margin:0 0 16px;">${taskTitle}</h2>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:24px;margin-bottom:32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Booking ID', bookingId)}
        ${row('Categoria', category)}
        ${row('Priorità', `<span style="color:${priorityColor};">${priority}</span>`)}
        ${dueDate ? row('Scadenza', dueDate) : ''}
      </table>
    </div>
    ${goldBtn(`${BASE_URL}/dashboard/operations`, 'GESTISCI OPERATIONS →')}
  `)
  
  return send(to, `⚠️ [OPS] ${priority}: ${taskTitle} — Booking ${bookingId}`, html)
}
