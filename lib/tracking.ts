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

    // Fire and forget
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      // Silenzioso in caso di errore (adblocker, network error)
    });
  } catch (err) {
    // Evitiamo che bug del tracking rompano l'UX
  }
}

// Alias per compatibilità con altre view (dashboard, contact)
export const track = trackEvent;

