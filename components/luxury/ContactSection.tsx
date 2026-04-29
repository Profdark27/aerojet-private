'use client'
import { useState } from 'react'
import { track } from '@/lib/tracking'
import { buildWhatsAppUrl, buildWhatsAppUrlForTier } from '@/lib/whatsapp'

// Soglie auto-WhatsApp (deve corrispondere alla parseBudgetNumeric di leadScoring)
const BUDGET_NUMERIC: Record<string, number> = {
  '> €100,000': 150000,
  '€40,000 – €100,000': 70000,
  '€15,000 – €40,000': 27500,
  '€5,000 – €15,000': 10000,
  '< €5,000': 3000,
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', fromCity: '', toCity: '', flightDate: '', pax: '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reqId, setReqId] = useState('')
  const [leadTier, setLeadTier] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    track('lead_submitted', { budgetLabel: form.budget || 'N/D' })
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pax: form.pax ? parseInt(form.pax) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReqId(data.id)
      setLeadTier(data.leadTier || '')
      setStatus('success')

      // WhatsApp auto-open basato sul tier del lead (risposta server)
      const tier = data.leadTier || ''
      const ctx = { from: form.fromCity, to: form.toCity, date: form.flightDate, pax: form.pax, budget: form.budget }
      const { url, delay } = buildWhatsAppUrlForTier(tier, ctx)

      if (url !== '#' && delay >= 0) {
        track('whatsapp_auto_opened', { tier, nextAction: data.nextAction || '' })
        if (delay === 0) {
          window.open(url, '_blank', 'noopener,noreferrer')
        } else {
          setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), delay)
        }
      }
    } catch {
      setStatus('error')
    }
  }

  const label = (text: string, required = false) => (
    <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>
      {text} {required && <span style={{ color: '#f87171' }}>*</span>}
    </div>
  )

  const tierBadge: Record<string, { label: string; color: string; bg: string }> = {
    VIP: { label: '🔥 VIP', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
    HIGH: { label: '💰 HIGH VALUE', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    MEDIUM: { label: '◆ MEDIUM', color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
    LOW: { label: '○ STANDARD', color: 'rgba(240,237,230,0.5)', bg: 'rgba(240,237,230,0.06)' },
  }
  const badge = tierBadge[leadTier]
  const budgetVal = BUDGET_NUMERIC[form.budget] || 0

  if (status === 'success') return (
    <section id="contact" style={{ padding: '100px 24px', background: '#050810' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 52, color: '#C9A84C', marginBottom: 24 }}>✦</div>
        <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>RICHIESTA INVIATA</span>
        <h2 style={{ fontSize: 34, fontWeight: 300, marginBottom: 16 }}>La Contatteremo Presto</h2>

        {/* Micro-conversion: stato concierge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)', padding: '10px 20px', marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-gold 1.5s infinite' }} />
          <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
            Un concierge sta verificando disponibilità
          </span>
        </div>

        <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 28 }}>
          Riceverà una quotazione personalizzata. Risposta attesa entro 15–30 minuti.
        </p>

        {/* Pratica + tier */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: '14px 28px' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 6 }}>PRATICA</div>
            <div style={{ fontSize: 20, letterSpacing: 4, color: '#C9A84C' }}>{reqId}</div>
          </div>
          {badge && (
            <div style={{ background: badge.bg, border: `1px solid ${badge.color}30`, padding: '14px 28px' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 6 }}>PRIORITÀ</div>
              <div style={{ fontSize: 14, color: badge.color, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{badge.label}</div>
            </div>
          )}
        </div>

        {/* CTA WhatsApp — mostra per tier >= MEDIUM */}
        {(leadTier === 'VIP' || leadTier === 'HIGH' || leadTier === 'MEDIUM') && (
          <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>
            {leadTier === 'VIP'
              ? 'Il suo concierge dedicato è disponibile immediatamente.'
              : 'Per risposta immediata il concierge è disponibile su WhatsApp.'}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setStatus('idle')
              setForm({ name: '', email: '', phone: '', fromCity: '', toCity: '', flightDate: '', pax: '', budget: '', message: '' })
              setLeadTier('')
            }}
            className="btn-outline-gold" style={{ padding: '12px 24px' }}>
            NUOVA RICHIESTA
          </button>
          {(leadTier === 'VIP' || leadTier === 'HIGH' || leadTier === 'MEDIUM') && (
            <a
              href={buildWhatsAppUrl(leadTier === 'VIP' ? 'vip' : 'volo', { from: form.fromCity, to: form.toCity, budget: form.budget })}
              target="_blank" rel="noopener noreferrer"
              onClick={() => track('click_whatsapp', { source: 'success_screen', tier: leadTier })}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '12px 24px', fontSize: 12, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 500 }}>
              💬 {leadTier === 'VIP' ? 'CONCIERGE DEDICATO' : 'PARLA CON CONCIERGE'}
            </a>
          )}
        </div>
      </div>
    </section>
  )

  return (
    <section id="contact" style={{ padding: '100px 24px', background: '#050810' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginBottom: 64, alignItems: 'start' }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>CONTATTI</span>
            <h2 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 300, lineHeight: 1.1, margin: '0 0 20px' }}>
              Richiedete il<br />
              <span style={{ color: '#C9A84C', fontStyle: 'italic' }}>Vostro Preventivo</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8 }}>
              Risposta garantita entro 2 ore lavorative.<br />Servizio concierge disponibile 24/7.
            </p>
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '✉', label: 'concierge@aerojet.app' },
                { icon: '📞', label: '+39 02 1234 5678' },
                { icon: '⏱', label: 'Risposta entro 2 ore' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.55)' }}>
                  <span style={{ color: '#C9A84C', width: 20 }}>{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.15)', padding: 36 }}>
            {status === 'error' && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#fca5a5', fontFamily: 'Helvetica Neue, sans-serif' }}>
                Errore nell&apos;invio. Riprova o contattaci direttamente.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                {label('NOME', true)}
                <input className="luxury-input" placeholder="Mario Rossi" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                {label('EMAIL', true)}
                <input className="luxury-input" type="email" placeholder="mario@email.it" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                {label('TELEFONO')}
                <input className="luxury-input" placeholder="+39 347..." value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                {label('PASSEGGERI')}
                <select className="luxury-input" value={form.pax} onChange={e => set('pax', e.target.value)}>
                  <option value="">Seleziona</option>
                  {[1,2,3,4,5,6,7,8,10,12,14,16,18].map(n => <option key={n} value={n}>{n} pax</option>)}
                </select>
              </div>
              <div>
                {label('PARTENZA')}
                <input className="luxury-input" placeholder="es. Milano" value={form.fromCity} onChange={e => set('fromCity', e.target.value)} />
              </div>
              <div>
                {label('DESTINAZIONE')}
                <input className="luxury-input" placeholder="es. Londra" value={form.toCity} onChange={e => set('toCity', e.target.value)} />
              </div>
              <div>
                {label('DATA VOLO')}
                <input className="luxury-input" type="date" value={form.flightDate} onChange={e => set('flightDate', e.target.value)} />
              </div>
              <div>
                {label('BUDGET INDICATIVO')}
                <select className="luxury-input" value={form.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="">Seleziona</option>
                  {['< €5,000', '€5,000 – €15,000', '€15,000 – €40,000', '€40,000 – €100,000', '> €100,000'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              {label('MESSAGGIO', true)}
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Descriva il suo viaggio ideale, esigenze particolari, catering richiesto..."
                style={{ width: '100%', minHeight: 80, background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#F0EDE6', padding: '12px 14px', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
            </div>

            <button onClick={handleSubmit}
              disabled={status === 'loading' || !form.name || !form.email || !form.message}
              className="btn-gold"
              style={{ width: '100%', padding: '15px', fontSize: 13, letterSpacing: 2, opacity: status === 'loading' || !form.name || !form.email || !form.message ? 0.6 : 1, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
              {status === 'loading'
                ? '◌  Un concierge sta verificando disponibilità...'
                : 'RICHIEDI PREVENTIVO ✦'}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
              Nessun impegno · Risposta entro 15–30 min · Concierge dedicato
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
