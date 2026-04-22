'use client'
import { useState, useEffect } from 'react'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '390212345678'

const QUICK_MESSAGES = [
  { label: 'Preventivo volo', text: 'Salve, vorrei un preventivo per un volo privato.' },
  { label: 'Empty leg disponibili', text: 'Salve, mi interessano gli empty leg disponibili.' },
  { label: 'Informazioni membership', text: 'Salve, vorrei informazioni sulla membership Aerojet Private.' },
  { label: 'Parla con un broker', text: 'Salve, desidero parlare con un broker per una consulenza.' },
]

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Auto-show after 45 seconds on page
    const t = setTimeout(() => setOpen(true), 45000)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) return null

  const openChat = (msg: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 198 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Quick message panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 199,
          background: '#0F1220', border: '1px solid rgba(37,211,102,0.3)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          width: 300, maxWidth: 'calc(100vw - 40px)',
          animation: 'slideUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{ background: '#25D366', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              ✦
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', fontFamily: 'Helvetica Neue, sans-serif' }}>
                Concierge Aerojet
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                ● Online ora · risposta entro 5 min
              </div>
            </div>
          </div>

          {/* Message bubble */}
          <div style={{ padding: '20px 16px 12px' }}>
            <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.15)', padding: '12px 14px', marginBottom: 16, borderRadius: '4px 12px 12px 4px' }}>
              <p style={{ fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.8)', lineHeight: 1.6, margin: 0 }}>
                Benvenuto su Aerojet Private.<br />
                Come posso aiutarla oggi?
              </p>
            </div>

            {/* Quick replies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_MESSAGES.map((msg) => (
                <button key={msg.label} onClick={() => openChat(msg.text)}
                  style={{ background: 'transparent', border: '1px solid rgba(37,211,102,0.35)', color: '#25D366', padding: '9px 14px', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', letterSpacing: 0.5 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  {msg.label} →
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '8px 16px 16px' }}>
            <button onClick={() => openChat('Salve, vorrei informazioni sui voli privati Aerojet.')}
              style={{ width: '100%', background: '#25D366', border: 'none', color: '#fff', padding: '12px', fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              CHATTA SU WHATSAPP
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 96, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: '#25D366', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        {open ? (
          <span style={{ color: '#fff', fontSize: 20 }}>✕</span>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        )}
      </button>

      {/* Pulse indicator */}
      {!open && (
        <div style={{ position: 'fixed', bottom: 28, right: 96, zIndex: 199, width: 56, height: 56, borderRadius: '50%', background: 'rgba(37,211,102,0.3)', animation: 'pulse-gold 2s infinite', pointerEvents: 'none' }} />
      )}
    </>
  )
}
