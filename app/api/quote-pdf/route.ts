import { NextRequest } from 'next/server'

// Simple PDF generation using HTML-to-text approach
// For production: use @react-pdf/renderer or puppeteer
function buildQuotePDF(data: {
  quoteId: string; clientName: string; clientEmail: string
  from: string; to: string; date: string; pax: number
  aircraft: string; category: string; operator: string
  price: number; commission: number; deposit: number; validUntil: string
  extras?: string[]
}): string {
  const fmt = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })

  // Generate minimal HTML that browsers can print as PDF
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Preventivo ${data.quoteId} - Aerojet Private</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Cormorant Garamond', Georgia, serif; background: #fff; color: #1a1a2e; padding: 60px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 1px solid #C9A84C; }
  .logo { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1a1a2e; }
  .logo-sub { font-size: 10px; letter-spacing: 4px; color: #C9A84C; font-family: 'Helvetica Neue', sans-serif; }
  .quote-id { text-align: right; font-size: 12px; font-family: 'Helvetica Neue', sans-serif; color: #666; }
  .quote-num { font-size: 22px; color: #C9A84C; font-family: Georgia, serif; margin-top: 4px; }
  h1 { font-size: 36px; font-weight: 300; margin-bottom: 8px; }
  .date { font-size: 13px; color: #666; font-family: 'Helvetica Neue', sans-serif; margin-bottom: 40px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 10px; letter-spacing: 3px; color: #C9A84C; font-family: 'Helvetica Neue', sans-serif; margin-bottom: 16px; text-transform: uppercase; }
  .box { border: 1px solid #e8d5a0; padding: 24px; margin-bottom: 16px; background: #fdfbf4; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 0; border-bottom: 1px solid #f0ead0; font-size: 15px; vertical-align: top; }
  td:first-child { color: #666; font-family: 'Helvetica Neue', sans-serif; font-size: 12px; letter-spacing: 1px; width: 40%; padding-top: 12px; }
  td:last-child { font-weight: 400; }
  .price-row td { font-size: 20px; color: #C9A84C; border-bottom: none; padding-top: 16px; }
  .price-row td:first-child { font-size: 12px; color: #666; }
  .total-box { background: #1a1a2e; color: #fff; padding: 24px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
  .total-label { font-size: 12px; letter-spacing: 2px; font-family: 'Helvetica Neue', sans-serif; opacity: 0.6; }
  .total-amount { font-size: 32px; color: #C9A84C; font-weight: 300; }
  .deposit-box { border: 1px solid #C9A84C; padding: 16px 24px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; }
  .footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e0d5b0; font-size: 12px; color: #999; font-family: 'Helvetica Neue', sans-serif; line-height: 1.8; }
  .gold { color: #C9A84C; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">✦ AEROJET</div>
      <div class="logo-sub">PRIVATE</div>
    </div>
    <div class="quote-id">
      <div>PREVENTIVO</div>
      <div class="quote-num">${data.quoteId}</div>
      <div style="margin-top:8px;font-size:11px;">Emesso il ${today}</div>
    </div>
  </div>

  <h1>Preventivo Volo Privato</h1>
  <p class="date">${data.from} → ${data.to} · ${data.date} · ${data.pax} ${data.pax === 1 ? 'passeggero' : 'passeggeri'}</p>

  <div class="section">
    <div class="section-title">Destinatario</div>
    <div class="box">
      <table>
        <tr><td>NOME</td><td>${data.clientName}</td></tr>
        <tr><td>EMAIL</td><td>${data.clientEmail}</td></tr>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dettagli del Volo</div>
    <div class="box">
      <table>
        <tr><td>PARTENZA</td><td>${data.from}</td></tr>
        <tr><td>DESTINAZIONE</td><td>${data.to}</td></tr>
        <tr><td>DATA</td><td>${data.date}</td></tr>
        <tr><td>PASSEGGERI</td><td>${data.pax}</td></tr>
        <tr><td>VELIVOLO</td><td>${data.aircraft}</td></tr>
        <tr><td>CATEGORIA</td><td>${data.category}</td></tr>
        <tr><td>OPERATORE</td><td>${data.operator}</td></tr>
        ${data.extras && data.extras.length > 0 ? `<tr><td>SERVIZI EXTRA</td><td>${data.extras.join(', ')}</td></tr>` : ''}
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Riepilogo Economico</div>
    <div class="total-box">
      <div>
        <div class="total-label">TOTALE CHARTER</div>
        <div class="total-amount">${fmt(data.price)}</div>
      </div>
      <div style="text-align:right">
        <div class="total-label">IVA</div>
        <div style="font-size:14px;color:#999;">Inclusa dove applicabile</div>
      </div>
    </div>
    <div class="deposit-box">
      <div>
        <div style="font-size:10px;letter-spacing:2px;font-family:'Helvetica Neue',sans-serif;color:#666;">DEPOSITO RICHIESTO (30%)</div>
        <div style="font-size:22px;color:#C9A84C;margin-top:4px;">${fmt(data.deposit)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;letter-spacing:2px;font-family:'Helvetica Neue',sans-serif;color:#666;">SALDO RESIDUO</div>
        <div style="font-size:18px;margin-top:4px;">${fmt(data.price - data.deposit)}</div>
        <div style="font-size:11px;color:#999;font-family:'Helvetica Neue',sans-serif;">dovuto 72h prima del volo</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Validità preventivo:</strong> ${data.validUntil}</p>
    <p><strong>Aerojet Private</strong> · concierge@aerojet.private · +39 02 1234 5678</p>
    <p>P.IVA IT12345678901 · Broker certificato · EASA/FAA Verified Partners</p>
    <p style="margin-top:12px;color:#bbb;">Il presente preventivo è stato preparato da un nostro consulente e ha validità fino alla data indicata. I prezzi si intendono per l'intero aeromobile. Tutti i diritti riservati © 2026 Aerojet Private S.r.l.</p>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const html = buildQuotePDF(data)

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="preventivo-${data.quoteId}.html"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return Response.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
