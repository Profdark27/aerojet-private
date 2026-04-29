'use client'

export function trackEvent(eventName: string, metadata?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  
  // Minimal fallback per non crashare
  try {
    const payload = {
      event: eventName,
      path: window.location.pathname,
      sessionId: 'sess_' + Math.random().toString(36).substring(2, 9),
      ts: Date.now(),
      metadata
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[TRACKING] ${eventName}`, payload);
    }

    // Fire and forget: internal memory tracking
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});

    // Export lead e alert in parallelo per eventi critici
    if (['inquiry_sent', 'quote_viewed', 'booking_success', 'quote_payment_clicked'].includes(eventName)) {
      const exportPayload = {
         event: eventName,
         quoteId: metadata?.quoteId,
         inquiryId: metadata?.inquiryId,
         route: metadata?.route || (metadata?.from && metadata?.dest ? `${metadata.from} → ${metadata.dest}` : undefined),
         email: metadata?.email || metadata?.clientEmail,
         phone: metadata?.phone,
         price: metadata?.price || metadata?.amount || metadata?.total,
         clientName: metadata?.name || metadata?.clientName || metadata?.client
      }
      fetch('/api/export/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportPayload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (err) {
    // Evitiamo che bug del tracking rompano l'UX
  }
}

// Alias per compatibilità con altre view (dashboard, contact)
export const track = trackEvent;

