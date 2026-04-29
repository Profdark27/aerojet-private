'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  data: Record<string, unknown>
  read: boolean
  ts?: number
}

interface Toast {
  id: string
  type: string
  data: Record<string, unknown>
}

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  new_request:      { label: 'Nuova richiesta',        color: '#C9A84C', icon: '✉' },
  booking_confirmed:{ label: 'Prenotazione confermata', color: '#4ade80', icon: '✓' },
  payment_received: { label: 'Pagamento ricevuto',      color: '#4ade80', icon: '€' },
  deposit_received: { label: 'Deposito ricevuto',       color: '#4ade80', icon: '€' },
  empty_leg_match:  { label: 'Match Empty Leg',         color: '#60a5fa', icon: '✦' },
  connected:        { label: 'Connesso',                color: '#4ade80', icon: '●' },
}

// ── Toast item ───────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const cfg = typeConfig[toast.type] || { label: toast.type, color: '#4ade80', icon: '✦' }
  const depositAmount = toast.data.depositAmount != null
    ? `€${Number(toast.data.depositAmount).toLocaleString('it-IT')}`
    : null

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 6000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <div style={{
      background: '#0F1220',
      border: `1px solid ${cfg.color}40`,
      borderLeft: `3px solid ${cfg.color}`,
      padding: '14px 16px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'fadeInRight 0.25s ease',
      minWidth: 300,
      maxWidth: 360,
    }}>
      <span style={{ color: cfg.color, fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: cfg.color, fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>
          {cfg.label.toUpperCase()}
        </div>
        {toast.data.clientName != null && (
          <div style={{ fontSize: 13, color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 2 }}>
            {String(toast.data.clientName)}
          </div>
        )}
        {toast.data.route != null && (
          <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif' }}>
            {String(toast.data.route)}
          </div>
        )}
        {depositAmount && (
          <div style={{ fontSize: 14, color: cfg.color, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 600, marginTop: 4 }}>
            {depositAmount}
          </div>
        )}
        {toast.type === 'deposit_received' && (
          <Link
            href={toast.data.inquiryId ? `/dashboard/requests?inquiryId=${toast.data.inquiryId}` : '/dashboard/requests'}
            onClick={() => onDismiss(toast.id)}
            style={{ display: 'inline-block', marginTop: 10, fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', color: '#0A0C14', background: cfg.color, padding: '6px 14px', textDecoration: 'none', fontWeight: 600 }}
          >
            APRI PRATICA →
          </Link>
        )}
      </div>
      <button onClick={() => onDismiss(toast.id)}
        style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 0 }}>
        ✕
      </button>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [open, setOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const es = new EventSource('/api/notifications')
    esRef.current = es

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'connected') { setConnected(true); return }

        const notif: Notification = {
          id: event.id || Date.now().toString(),
          type: event.type,
          data: event.data || {},
          read: false,
          ts: Date.now(),
        }

        setNotifications(prev => [notif, ...prev].slice(0, 20))

        // Show toast for actionable events
        if (['deposit_received', 'payment_received', 'booking_confirmed', 'new_request'].includes(event.type)) {
          setToasts(prev => [...prev, { id: notif.id, type: event.type, data: event.data || {} }])
        }
      } catch { /* ignore parse errors */ }
    }

    return () => { es.close(); setConnected(false) }
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const unread = notifications.filter(n => !n.read).length
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <>
      {/* Toast stack — fixed top-right */}
      {toasts.length > 0 && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
          <style>{`@keyframes fadeInRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }`}</style>
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem toast={t} onDismiss={dismissToast} />
            </div>
          ))}
        </div>
      )}

      {/* Bell */}
      <div style={{ position: 'relative' }} ref={panelRef}>
        <button onClick={() => { setOpen(o => !o); if (!open) markAllRead() }}
          style={{ position: 'relative', background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.6)', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.color = '#C9A84C' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.6)' }}>
          🔔
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#C9A84C', color: '#0A0C14', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Helvetica Neue, sans-serif' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Panel */}
        {open && (
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 300, maxHeight: 480, display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>NOTIFICHE</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#4ade80' : '#f87171', display: 'inline-block' }} />
              </div>
              {notifications.length > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.35)', fontSize: 11, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
                  SEGNA LETTE
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>
                  Nessuna notifica
                </div>
              ) : notifications.map(n => {
                const cfg = typeConfig[n.type] || { label: n.type, color: '#C9A84C', icon: '✦' }
                const ago = n.ts ? Math.floor((Date.now() - n.ts) / 60000) : 0
                const depositAmount = n.type === 'deposit_received' && n.data.depositAmount != null
                  ? `€${Number(n.data.depositAmount).toLocaleString('it-IT')}`
                  : null

                return (
                  <div key={n.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.06)', display: 'flex', gap: 12, background: n.read ? 'transparent' : 'rgba(201,168,76,0.03)', transition: 'background 0.2s' }}>
                    <span style={{ color: cfg.color, fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{cfg.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', color: '#F0EDE6', marginBottom: 4 }}>{cfg.label}</div>
                      {n.data.clientName != null && (
                        <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                          {String(n.data.clientName)}
                        </div>
                      )}
                      {n.data.route != null && (
                        <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                          {String(n.data.route)}
                        </div>
                      )}
                      {depositAmount && (
                        <div style={{ fontSize: 13, color: cfg.color, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 600, marginTop: 2 }}>
                          {depositAmount}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>
                        {ago === 0 ? 'Ora' : `${ago}m fa`}
                      </div>
                    </div>
                    {!n.read && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
