/**
 * Email drip sequences per lead non convertiti
 * 
 * Sequenza standard dopo inquiry:
 * - Giorno 0: Conferma ricezione (già implementata)
 * - Giorno 1: Follow-up "Come stai procedendo?"
 * - Giorno 3: Empty leg correlato alla rotta richiesta
 * - Giorno 7: Case study + urgency
 * - Giorno 14: Last call + sconto
 * 
 * Usa con: cron job su Vercel, o servizio cron esterno
 */

import { send } from './email'

function base(content: string): string {
  return `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0C14;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;background:#0A0C14;border:1px solid rgba(201,168,76,0.15);">
  <div style="padding:32px 48px;border-bottom:1px solid rgba(201,168,76,0.12);">
    <div style="color:#C9A84C;font-size:18px;font-weight:700;letter-spacing:6px;">✦ AEROJET</div>
    <div style="color:#C9A84C;font-size:10px;letter-spacing:4px;font-family:Helvetica Neue,sans-serif;margin-top:2px;">PRIVATE</div>
  </div>
  <div style="padding:40px 48px;">${content}</div>
  <div style="padding:24px 48px;border-top:1px solid rgba(201,168,76,0.08);">
    <p style="color:rgba(240,237,230,0.2);font-size:11px;font-family:Helvetica Neue,sans-serif;line-height:1.7;margin:0;">
      © 2026 Aerojet Private · <a href="#" style="color:#C9A84C;">Cancella iscrizione</a>
    </p>
  </div>
</div></body></html>`
}

function btn(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:#C9A84C;color:#0A0C14;padding:14px 36px;text-decoration:none;font-family:Helvetica Neue,sans-serif;font-size:11px;letter-spacing:2px;font-weight:600;">${label}</a>`
}

// ─── Day 1: Soft follow-up ────────────────────────────────────────────────────
export async function sendDay1Followup({ to, name, from: fromCity, to: toCity, requestId }: {
  to: string; name: string; from: string; to: string; requestId: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:26px;font-weight:300;margin:0 0 20px;">Abbiamo ricevuto la sua richiesta</h2>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 24px;">
      Gentile ${name}, volevamo assicurarci che la sua richiesta per il volo 
      <strong style="color:#F0EDE6;">${fromCity} → ${toCity}</strong> sia in buone mani.
    </p>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Il nostro team sta verificando la disponibilità degli aeromobili più adatti. 
      Le invieremo un preventivo personalizzato entro poche ore.
    </p>
    <p style="color:rgba(240,237,230,0.6);font-size:14px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Nel frattempo, ha considerato gli <strong style="color:#C9A84C;">empty legs</strong> su questa rotta? 
      Spesso disponibili con sconti fino al 60%.
    </p>
    ${btn('https://aerojet.private/#emptylegs', 'VERIFICA EMPTY LEGS')}
  `)
  return send(to, `La sua richiesta ${requestId} — aggiornamento`, html)
}

// ─── Day 3: Empty leg match ───────────────────────────────────────────────────
export async function sendDay3EmptyLeg({ to, name, from: fromCity, to: toCity, legFrom, legTo, legDate, legPrice, legDiscount }: {
  to: string; name: string; from: string; to: string
  legFrom: string; legTo: string; legDate: string; legPrice: number; legDiscount: number
}) {
  const fmt = (n: number) => `€${n.toLocaleString('it-IT')}`
  const html = base(`
    <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);padding:12px 20px;margin-bottom:28px;display:inline-block;">
      <span style="color:#C9A84C;font-size:10px;letter-spacing:3px;font-family:Helvetica Neue,sans-serif;">⚡ EMPTY LEG — OFFERTA LIMITATA</span>
    </div>
    <h2 style="color:#F0EDE6;font-size:28px;font-weight:300;margin:0 0 8px;">${legFrom} → ${legTo}</h2>
    <p style="color:#C9A84C;font-size:12px;letter-spacing:2px;font-family:Helvetica Neue,sans-serif;margin:0 0 28px;">${legDate}</p>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 28px;">
      Gentile ${name}, abbiamo trovato un empty leg correlato alla sua rotta. 
      Risparmio del <strong style="color:#C9A84C;">${legDiscount}%</strong> sul prezzo normale.
    </p>
    <div style="background:#0F1220;border:1px solid rgba(201,168,76,0.15);padding:24px;margin-bottom:28px;">
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(201,168,76,0.08);">
        <span style="color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;font-size:12px;">Prezzo normale</span>
        <span style="color:rgba(240,237,230,0.3);text-decoration:line-through;font-size:14px;">${fmt(Math.round(legPrice / (1 - legDiscount / 100)))}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;">
        <span style="color:rgba(240,237,230,0.4);font-family:Helvetica Neue,sans-serif;font-size:12px;">Empty leg price</span>
        <span style="color:#C9A84C;font-size:24px;font-weight:300;">${fmt(legPrice)}</span>
      </div>
    </div>
    <p style="color:rgba(240,237,230,0.4);font-size:12px;font-family:Helvetica Neue,sans-serif;margin:0 0 28px;">
      ⚠️ Disponibilità limitata — gli empty legs si esauriscono rapidamente.
    </p>
    ${btn('https://aerojet.private/#emptylegs', 'PRENOTA EMPTY LEG')}
  `)
  return send(to, `⚡ Empty Leg ${legFrom} → ${legTo} — -${legDiscount}% | Aerojet Private`, html)
}

// ─── Day 7: Case study + urgency ─────────────────────────────────────────────
export async function sendDay7CaseStudy({ to, name, from: fromCity, to: toCity, requestId }: {
  to: string; name: string; from: string; to: string; requestId: string
}) {
  const html = base(`
    <h2 style="color:#F0EDE6;font-size:26px;font-weight:300;margin:0 0 28px;">Come un nostro cliente ha chiuso un deal da €1.8M</h2>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 20px;">
      Gentile ${name}, lasci che le racconti una storia reale (nomi modificati per privacy).
    </p>
    <div style="background:#0F1220;border-left:3px solid #C9A84C;padding:24px;margin-bottom:28px;">
      <p style="color:#F0EDE6;font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 16px;font-style:italic;">
        "L'accordo si stava chiudendo a Monaco. Il volo commerciale era stato cancellato. 
        Ho chiamato Aerojet alle 18:30. Alle 21:00 ero sull'aereo. L'indomani mattina ho firmato."
      </p>
      <p style="color:#C9A84C;font-size:12px;font-family:Helvetica Neue,sans-serif;letter-spacing:1px;">— CEO, settore private equity, Milano</p>
    </div>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 28px;">
      La sua richiesta <strong style="color:#F0EDE6;">${requestId}</strong> per ${fromCity} → ${toCity} è ancora disponibile.
      Possiamo inviare un preventivo aggiornato in meno di 2 ore.
    </p>
    ${btn(`https://aerojet.private/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`, 'RIPRENDI LA RICERCA')}
  `)
  return send(to, `La sua richiesta è ancora disponibile — Aerojet Private`, html)
}

// ─── Day 14: Last call ────────────────────────────────────────────────────────
export async function sendDay14LastCall({ to, name, from: fromCity, to: toCity }: {
  to: string; name: string; from: string; to: string
}) {
  const html = base(`
    <div style="border:1px solid rgba(201,168,76,0.3);padding:20px;margin-bottom:28px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;color:#C9A84C;font-family:Helvetica Neue,sans-serif;">ULTIMO MESSAGGIO</div>
    </div>
    <h2 style="color:#F0EDE6;font-size:24px;font-weight:300;margin:0 0 20px;">Ultima opportunità</h2>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 24px;">
      Gentile ${name}, non vogliamo disturbarla ulteriormente. Questa è la nostra ultima comunicazione 
      riguardo alla sua richiesta per ${fromCity} → ${toCity}.
    </p>
    <p style="color:rgba(240,237,230,0.6);font-size:15px;font-family:Helvetica Neue,sans-serif;line-height:1.8;margin:0 0 32px;">
      Se i tempi non erano giusti, lo capiamo. Sa dove trovarci quando sarà pronto.
    </p>
    <div style="display:flex;gap:12px;">
      ${btn('https://aerojet.private/#contact', 'RICHIEDI PREVENTIVO')}
    </div>
    <p style="color:rgba(240,237,230,0.25);font-size:12px;font-family:Helvetica Neue,sans-serif;margin-top:28px;">
      Non riceverà altri messaggi da noi su questa richiesta.
    </p>
  `)
  return send(to, `L'ultimo messaggio da Aerojet Private`, html)
}

// ─── Drip orchestrator ────────────────────────────────────────────────────────
export type DripStep = 'day1' | 'day3' | 'day7' | 'day14'

export async function runDripStep(step: DripStep, inquiry: {
  email: string; name: string; fromCity: string; toCity: string; id: string
}) {
  const { email, name, fromCity, toCity, id } = inquiry

  switch (step) {
    case 'day1':
      return sendDay1Followup({ to: email, name, from: fromCity, to: toCity, requestId: id })
    case 'day3':
      return sendDay3EmptyLeg({
        to: email, name, from: fromCity, to: toCity,
        legFrom: fromCity, legTo: toCity,
        legDate: 'Prossimi 7 giorni',
        legPrice: 4800, legDiscount: 58,
      })
    case 'day7':
      return sendDay7CaseStudy({ to: email, name, from: fromCity, to: toCity, requestId: id })
    case 'day14':
      return sendDay14LastCall({ to: email, name, from: fromCity, to: toCity })
  }
}
