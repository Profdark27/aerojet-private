'use client'

/**
 * Tracking leggero senza librerie esterne.
 * Fire-and-forget verso /api/track.
 * GDPR-safe: nessun dato PII, solo eventi comportamentali aggregabili.
 */

export type TrackEvent =
  | 'page_view'
  | 'scroll_25' | 'scroll_50' | 'scroll_75'
  | 'click_prenota'
  | 'click_whatsapp'
  | 'click_empty_leg'
  | 'click_membership'
  | 'lead_started'
  | 'lead_submitted'
  | 'lead_rejected_low_budget'
  | 'concierge_opened'
  | 'quote_requested'
  | 'search_performed'
  // Conversione pipeline
  | 'lead_contacted'
  | 'whatsapp_opened'
  | 'whatsapp_auto_opened'
  | 'quote_sent'
  | 'deal_won'
  | 'deal_lost'

export interface TrackPayload {
  event: TrackEvent
  path?: string
  metadata?: Record<string, string | number | boolean>
}

// sessionId stabile per la sessione browser (non PII, non persistente tra sessioni)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let sid = sessionStorage.getItem('_aj_sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_aj_sid', sid)
  }
  return sid
}

export function track(event: TrackEvent, metadata?: TrackPayload['metadata']): void {
  if (typeof window === 'undefined') return
  // Rispetta Do Not Track
  if (navigator.doNotTrack === '1') return

  const payload: TrackPayload & { sessionId: string; ts: number } = {
    event,
    path: window.location.pathname,
    sessionId: getSessionId(),
    ts: Date.now(),
    metadata,
  }

  // Fire-and-forget — non blocca mai il thread UI
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => { /* silent fail */ })
}

// Hook scroll depth — monta una sola volta per pagina
export function initScrollTracking(): () => void {
  if (typeof window === 'undefined') return () => {}

  const fired = new Set<string>()
  const thresholds = [
    { pct: 25, event: 'scroll_25' as TrackEvent },
    { pct: 50, event: 'scroll_50' as TrackEvent },
    { pct: 75, event: 'scroll_75' as TrackEvent },
  ]

  const onScroll = () => {
    const scrolled = window.scrollY + window.innerHeight
    const total = document.documentElement.scrollHeight
    const pct = (scrolled / total) * 100

    for (const { pct: threshold, event } of thresholds) {
      if (pct >= threshold && !fired.has(event)) {
        fired.add(event)
        track(event)
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
