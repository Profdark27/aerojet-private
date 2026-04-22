'use client'
import { useState } from 'react'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', fromCity: '', toCity: '', flightDate: '', pax: '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reqId, setReqId] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pax: form.pax ? parseInt(form.pax) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReqId(data.id)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const label = (text: string, required = false) => (
    <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>
      {text} {required && <span style={{ color: '#f87171' }}>*</span>}
    </div>
  )

  if (status === 'success') return (
    <section id="contact" style={{ padding: '100px 24px', background: '#050810' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56, color: '#C9A84C', marginBottom: 28 }}>✦</div>
        <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', display: 'block', marginBottom: 16 }}>RICHIESTA INVIATA</span>
        <h2 style={{ fontSize: 36, fontWeight: 300, marginBottom: 20 }}>La Contatteremo Presto</h2>
        <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 16 }}>
          Abbiamo ricevuto la sua richiesta e Le invieremo un preventivo personalizzato entro 2 ore lavorative.
        </p>
        <div style={{ display: 'inline-block', background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: '16px 32px', marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>NUMERO PRATICA</div>
          <div style={{ fontSize: 22, letterSpacing: 4, color: '#C9A84C' }}>{reqId}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', fromCity: '', toCity: '', flightDate: '', pax: '', budget: '', message: '' }) }}
            className="btn-outline-gold" style={{ padding: '12px 28px' }}>
            NUOVA RICHIESTA
          </button>
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
                { icon: '✉', label: 'concierge@aerojet.private' },
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
              {status === 'loading' ? 'INVIO...' : 'RICHIEDI PREVENTIVO ✦'}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center', marginTop: 16, lineHeight: 1.7 }}>
              Nessun impegno. Risposta entro 2 ore lavorative.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
