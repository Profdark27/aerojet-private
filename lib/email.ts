/**
 * Email transazionali Aerojet Private — Resend
 * Docs: https://resend.com/docs
 * Setup: RESEND_API_KEY + RESEND_FROM_EMAIL in .env.local
 *
 * Senza chiave Resend → log in console (dev mode)
 */

const FROM = process.env.RESEND_FROM_EMAIL || 'concierge@aerojet.private'
const RESEND_KEY = process.env.RESEND_API_KEY

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
      Per assistenza: <a href="mailto:concierge@aerojet.private" style="color:#C9A84C;">concierge@aerojet.private</a>
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
  to, name, aircraft, from, to: dest, date, pax, deposit, total, confirmCode,
}: {
  to: string; name: string; aircraft: string
  from: string; to: string; date: string; pax: number
  deposit: number; total: number; confirmCode: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:30px;font-weight:300;margin:0 0 8px;">Prenotazione Confermata</h2>
    <p style="color:#C9A84C;font-size:12px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;margin:0 0 32px;">CODICE: ${confirmCode}</p>
    <p style="color:rgba(240,237,230,0.65);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Gentile ${name}, la sua prenotazione è stata confermata con successo. Il nostro concierge la contatterà entro 2 ore.
    </p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:28px;margin-bottom:36px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Velivolo', aircraft)}
        ${row('Rotta', `${from} → ${dest}`)}
        ${row('Data', date)}
        ${row('Passeggeri', `${pax} persone`)}
        ${row('Deposito pagato', `€${deposit.toLocaleString('it-IT')}`)}
        ${row('Totale charter', `€${total.toLocaleString('it-IT')}`)}
        ${row('Saldo residuo', `€${(total - deposit).toLocaleString('it-IT')} (entro 72h dal volo)`)}
      </table>
    </div>
    <p style="color:rgba(240,237,230,0.45);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0 0 32px;">
      Il saldo residuo sarà addebitato 72 ore prima della partenza.<br>
      Catering, transfer e servizi aggiuntivi possono essere richiesti al concierge.
    </p>
    ${goldBtn('https://aerojet.private/dashboard', 'AREA PERSONALE')}
  `)
  return send(to, `✦ Prenotazione confermata — ${from} → ${dest}`, html)
}

// ─── 2. Preventivo Inviato (al cliente) ───────────────────
export async function sendQuoteToClient({
  to, name, aircraft, from, to: dest, date, pax, price, validUntil, brokerName,
}: {
  to: string; name: string; aircraft: string
  from: string; to: string; date: string; pax: number
  price: number; validUntil: string; brokerName: string
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
    ${goldBtn('https://aerojet.private/search', 'ACCETTA E PRENOTA')}
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
    ${goldBtn('https://aerojet.private/dashboard/requests', 'APRI DASHBOARD →')}
  `)
  return send(brokerEmail, `🔔 Nuova richiesta ${requestId} — ${from} → ${to}`, html)
}

// ─── 4. Conferma Ricezione Richiesta (al cliente) ─────────
export async function sendRequestReceived({
  to, name, from, to: dest, date, requestId,
}: {
  to: string; name: string; from: string; to: string; date: string; requestId: string
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
      <a href="mailto:concierge@aerojet.private" style="color:#C9A84C;font-family:Helvetica Neue,sans-serif;font-size:13px;text-decoration:none;">✉ concierge@aerojet.private</a>
    </div>
  `)
  return send(to, `Richiesta ${requestId} ricevuta — Aerojet Private`, html)
}

// ─── 5. Empty Leg Alert ────────────────────────────────────
export async function sendEmptyLegAlert({
  to, name, from, to: dest, date, time, aircraft, originalPrice, discountedPrice, discount,
}: {
  to: string; name: string; from: string; to: string
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
    ${goldBtn('https://aerojet.private/#emptylegs', 'PRENOTA SUBITO')}
  `)
  return send(to, `⚡ Empty Leg ${from} → ${dest} — -${discount}% | Aerojet Private`, html)
}
