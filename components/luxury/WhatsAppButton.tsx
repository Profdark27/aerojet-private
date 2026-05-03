'use client'

/**
 * WhatsApp Concierge Button — Aerojet Private
 * Floating button + panel con messaggi precompilati per tipo di richiesta.
 * Solo visible se NEXT_PUBLIC_WHATSAPP_NUMBER è configurato.
 */

import { useState, useEffect } from 'react'
import { buildWhatsAppUrl, isWhatsAppConfigured, type WhatsAppTemplate } from '@/lib/whatsapp'
import { track } from '@/lib/tracking'

interface WhatsAppOption {
  id: WhatsAppTemplate
  label: string
  description: string
  icon: string
}

const OPTIONS: (WhatsAppOption | { id: 'marco', label: string, description: string, icon: string })[] = [
  {
    id: 'marco',
    label: 'Marco (AI Advisor)',
    description: 'Assistente AI per quotazioni rapide',
    icon: '✦',
  },
  {
    id: 'volo',
    label: 'Richiedi preventivo volo',
    description: 'Quotazione personalizzata per la tua tratta',
    icon: '✈',
  },
  {
    id: 'empty_leg',
    label: 'Verifica empty leg',
    description: 'Disponibilità tratte last-minute',
    icon: '◈',
  },
  {
    id: 'membership',
    label: 'Accesso membership',
    description: 'Programmi accesso riservato',
    icon: '◆',
  },
  {
    id: 'urgenza',
    label: 'Richiesta urgente',
    description: 'Decollo entro 24h, contatto immediato',
    icon: '⚡',
  },
]

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    setConfigured(isWhatsAppConfigured())
  }, [])

  if (!configured) return null

  const handleClick = (id: string) => {
    if (id === 'marco') {
      window.dispatchEvent(new CustomEvent('toggle-concierge'))
      setOpen(false)
      return
    }
    track('click_whatsapp', { template: id })
    const url = buildWhatsAppUrl(id as WhatsAppTemplate)
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const toggleOpen = () => {
    if (!open) track('click_whatsapp', { action: 'open_panel' })
    setOpen(v => !v)
  }

  return (
    <>
      {/* Panel opzioni */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 104,
            right: 28,
            zIndex: 198,
            width: 300,
            maxWidth: 'calc(100vw - 40px)',
            background: '#0A0C14',
            border: '1px solid rgba(37,211,102,0.25)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            animation: 'slideUp 0.25s ease',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(37,211,102,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#25D366',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              💬
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Parla con il Concierge</div>
              <div style={{
                fontSize: 11, color: 'rgba(240,237,230,0.4)',
                fontFamily: 'Helvetica Neue, sans-serif',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />
                Risposta rapida via WhatsApp
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{ padding: '8px 0' }}>
            {OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleClick(opt.id)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 18, color: '#25D366', width: 24, textAlign: 'center', flexShrink: 0 }}>
                  {opt.icon}
                </span>
                <div>
                  <div style={{ fontSize: 13, color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {opt.description}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'rgba(240,237,230,0.2)', fontSize: 12 }}>→</span>
              </button>
            ))}
          </div>

          {/* Footer legale */}
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(37,211,102,0.08)',
          }}>
            <p style={{
              fontSize: 10, color: 'rgba(240,237,230,0.25)',
              fontFamily: 'Helvetica Neue, sans-serif',
              lineHeight: 1.5, margin: 0,
            }}>
              Aerojet Private opera come broker indipendente. Quotazioni soggette a verifica operatore.
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleOpen}
        aria-label="Contatta concierge via WhatsApp"
        style={{
          position: 'fixed',
          bottom: 100,
          right: 28,
          zIndex: 199,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? '#1da851' : '#25D366',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          boxShadow: '0 6px 24px rgba(37,211,102,0.35)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
