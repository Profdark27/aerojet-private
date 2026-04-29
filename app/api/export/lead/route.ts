import { NextRequest } from 'next/server'
import { sendInternalAlert } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, quoteId, inquiryId, route, email, phone, price, clientName } = body
    
    // 1. Export Webhook (Zapier / Make / GSheets)
    const webhookUrl = process.env.LEAD_WEBHOOK_URL
    if (webhookUrl) {
      // Fire-and-forget: non blocchiamo l'esecuzione
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          event,
          quoteId,
          inquiryId,
          route,
          email,
          phone,
          price,
          clientName
        })
      }).catch(err => {
         // Silenzioso, fail-safe
         if (process.env.NODE_ENV === 'development') {
           console.error('[EXPORT] Webhook failed', err)
         }
      })
    }

    // 2. Real-time Alert Operativo
    // Mandiamo l'email solo per eventi di alto valore per non intasare la inbox
    if (event === 'booking_success' || event === 'quote_payment_clicked' || event === 'inquiry_sent') {
       // Fire-and-forget email alert
       sendInternalAlert({
         type: event,
         route: route || 'Rotta non specificata',
         price: price ? Number(price) : undefined,
         clientName: clientName || email || 'Cliente Sconosciuto',
         link: quoteId ? `/accept-quote/${quoteId}` : `/dashboard/requests`
       }).catch(() => {}) // Silenzioso
    }

    return Response.json({ ok: true })
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[EXPORT API] Internal error', err)
    }
    return Response.json({ ok: false }, { status: 400 })
  }
}
