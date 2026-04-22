'use client'
import { useState, useEffect } from 'react'

const steps = [
  {
    id: 'welcome',
    title: 'Benvenuto in Aerojet Private',
    body: 'Il tuo pannello broker per gestire prenotazioni di voli privati. Ti guidiamo in 4 passi.',
    target: null,
    icon: '✦',
  },
  {
    id: 'requests',
    title: 'Richieste Clienti',
    body: 'Qui arrivano le richieste di preventivo dai clienti. Risposta entro 2 ore = più conversioni.',
    target: '/dashboard/requests',
    icon: '✉',
    cta: 'Vedi Richieste',
  },
  {
    id: 'quotes',
    title: 'Builder Preventivi',
    body: 'Crea preventivi PDF in 30 secondi. Il calcolo commissione è automatico.',
    target: '/dashboard/quotes',
    icon: '◆',
    cta: 'Prova il Builder',
  },
  {
    id: 'analytics',
    title: 'Analytics & Export',
    body: 'Traccia revenue, commissioni e performance. Esporta CSV per la contabilità.',
    target: '/dashboard/analytics',
    icon: '▲',
    cta: 'Apri Analytics',
  },
]

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(4px)' }} onClick={onComplete} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, background: '#0F1220', border: '1px solid rgba(201,168,76,0.3)', padding: '44px 48px', maxWidth: 480, width: '100%', animation: 'fadeInUp 0.4s ease' }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 6, height: 6, borderRadius: 3, background: i <= step ? '#C9A84C' : 'rgba(201,168,76,0.2)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 40, color: '#C9A84C', textAlign: 'center', marginBottom: 20 }}>{current.icon}</div>

        {/* Content */}
        <h2 style={{ fontSize: 26, fontWeight: 300, textAlign: 'center', marginBottom: 12, letterSpacing: 1 }}>{current.title}</h2>
        <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.6)', textAlign: 'center', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 36 }}>{current.body}</p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          {step < steps.length - 1 ? (
            <>
              <button onClick={onComplete} className="btn-outline-gold" style={{ flex: 1, padding: '12px' }}>Salta tour</button>
              <button onClick={() => setStep(s => s + 1)} className="btn-gold" style={{ flex: 2, padding: '12px', fontSize: 12, letterSpacing: 2 }}>
                {current.cta || 'CONTINUA →'}
              </button>
            </>
          ) : (
            <button onClick={onComplete} className="btn-gold" style={{ width: '100%', padding: '14px', fontSize: 13, letterSpacing: 2 }}>
              INIZIA AD USARE LA PIATTAFORMA ✦
            </button>
          )}
        </div>

        {/* Step counter */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 2 }}>
          {step + 1} / {steps.length}
        </div>
      </div>
    </div>
  )
}
