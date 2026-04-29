// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/luxury/Navbar'
import { formatCurrency } from '@/lib/utils'

const steps = ['Dettagli Volo', 'Servizi Aggiuntivi', 'Dati Personali', 'Riepilogo & Pagamento']

const extras = [
  { id: 'catering', label: 'Catering Gourmet', desc: 'Menu preparato da chef stellato, servito a bordo', price: 350, icon: '🍾' },
  { id: 'transfer', label: 'Transfer Limousine', desc: 'Mercedes S-Class o BMW Serie 7 da/per aeroporto', price: 180, icon: '🚗' },
  { id: 'flowers', label: 'Allestimento Floreale', desc: 'Decorazioni fresh flowers per la cabina', price: 220, icon: '🌸' },
  { id: 'wifi', label: 'WiFi Starlink Premium', desc: 'Connessione 100Mbps garantita in volo', price: 0, icon: '📡' },
  { id: 'concierge', label: 'Concierge a Destinazione', desc: 'Assistente dedicato all\'arrivo per hotel, ristoranti, eventi', price: 280, icon: '✦' },
  { id: 'security', label: 'Security Detail', desc: 'Agente di sicurezza privato per tutta la durata del viaggio', price: 800, icon: '🛡' },
]

function BookingWizard() {
  const params = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['wifi'])
  const [notes, setNotes] = useState('')
  const [paying, setPaying] = useState(false)

  // Flight info from URL params (from search page)
  const aircraft = params.get('aircraft') || 'Phenom 300E'
  const operator = params.get('operator') || 'VistaJet'
  const from = params.get('from') || 'Milano'
  const to = params.get('to') || 'Londra'
  const date = params.get('date') || new Date().toISOString().split('T')[0]
  const pax = parseInt(params.get('pax') || '2')
  const price = parseInt(params.get('price') || '9800')
  const flightTime = params.get('flightTime') || '2h 10m'
  const category = params.get('category') || 'Light Jet'

  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', taxCode: '' })

  const extrasTotal = extras.filter(e => selectedExtras.includes(e.id)).reduce((s, e) => s + e.price, 0)
  const total = price + extrasTotal
  const deposit = Math.round(total * 0.30)
  const balance = total - deposit
  const commission = Math.round(total * 0.12)

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aircraft: { model: aircraft, price: total, category, operator, operatorLogo: operator.slice(0, 2).toUpperCase() },
          from, to, date, pax,
          customerEmail: form.email,
        }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setPaying(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>

        {/* Progress bar */}
        <div style={{ background: '#0F1220', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '24px 48px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', cursor: i < step ? 'pointer' : 'default' }}
                  onClick={() => i < step && setStep(i)}>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', top: 14, left: '50%', width: '100%', height: 1, background: i < step ? '#C9A84C' : 'rgba(201,168,76,0.15)', zIndex: 0 }} />
                  )}
                  {/* Circle */}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${i <= step ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`, background: i < step ? '#C9A84C' : i === step ? 'rgba(201,168,76,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: i < step ? '#0A0C14' : i === step ? '#C9A84C' : 'rgba(240,237,230,0.3)', zIndex: 1, position: 'relative', transition: 'all 0.3s', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 600 }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10, letterSpacing: 1, color: i <= step ? '#C9A84C' : 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap', display: 'none' }} className="desktop-only">{s}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>
              Step {step + 1} di {steps.length} — <span style={{ color: '#C9A84C' }}>{steps[step]}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

          {/* Main content */}
          <div>

            {/* STEP 0 — Dettagli volo */}
            {step === 0 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>RIEPILOGO VOLO SELEZIONATO</div>

                <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 32, marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    <div style={{ width: 52, height: 52, background: '#1A1A2E', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>
                      {operator.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{aircraft}</div>
                      <div style={{ fontSize: 12, color: '#C9A84C', letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif' }}>{category.toUpperCase()} · {operator}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {[
                      ['PARTENZA', from], ['ARRIVO', to],
                      ['DATA', new Date(date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                      ['PASSEGGERI', `${pax} persone`],
                      ['DURATA', flightTime], ['PREZZO CHARTER', formatCurrency(price)],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 15, color: l === 'PREZZO CHARTER' ? '#C9A84C' : '#F0EDE6' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>NOTE SPECIALI (facoltativo)</div>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Es. allergie alimentari, animali a bordo, orario preferito di imbarco..."
                    style={{ width: '100%', minHeight: 100, background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: '#F0EDE6', padding: '14px 16px', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
                </div>
              </div>
            )}

            {/* STEP 1 — Servizi aggiuntivi */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>SERVIZI AGGIUNTIVI</div>
                <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 32, lineHeight: 1.7 }}>
                  Personalizza la sua esperienza a bordo. Tutti i servizi sono confermati dal concierge.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
                  {extras.map(extra => {
                    const active = selectedExtras.includes(extra.id)
                    return (
                      <div key={extra.id} onClick={() => toggleExtra(extra.id)}
                        style={{ background: active ? '#141728' : '#0A0C14', padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, borderLeft: active ? '3px solid #C9A84C' : '3px solid transparent', transition: 'all 0.2s' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{extra.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>{extra.label}</div>
                          <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>{extra.desc}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 16, color: extra.price === 0 ? '#4ade80' : '#C9A84C' }}>
                            {extra.price === 0 ? 'Incluso' : `+${formatCurrency(extra.price)}`}
                          </div>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, background: active ? '#C9A84C' : 'transparent', marginLeft: 'auto', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#0A0C14', transition: 'all 0.2s' }}>
                            {active && '✓'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2 — Dati personali */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>DATI PERSONALI</div>
                <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 32, lineHeight: 1.7 }}>
                  Necessari per la prenotazione e la documentazione di volo.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                  {[
                    { key: 'name', label: 'NOME COMPLETO', placeholder: 'Mario Rossi', required: true },
                    { key: 'email', label: 'EMAIL', placeholder: 'mario@email.it', required: true },
                    { key: 'phone', label: 'TELEFONO', placeholder: '+39 347 1234567', required: true },
                    { key: 'company', label: 'AZIENDA (facoltativo)', placeholder: 'Rossi SpA' },
                    { key: 'taxCode', label: 'P.IVA / CF (per fattura)', placeholder: 'IT12345678901', colSpan: 2 },
                  ].map(({ key, label, placeholder, required, colSpan }) => (
                    <div key={key} style={{ gridColumn: colSpan ? 'span 2' : 'span 1' }}>
                      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>
                        {label} {required && <span style={{ color: '#f87171' }}>*</span>}
                      </div>
                      <input className="luxury-input" placeholder={placeholder}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)', fontSize: 13, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7 }}>
                  🔒 I suoi dati sono cifrati e non vengono condivisi con terze parti. Utilizziamo Stripe per i pagamenti — non conserviamo i dati della carta.
                </div>
              </div>
            )}

            {/* STEP 3 — Riepilogo finale */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>RIEPILOGO FINALE</div>

                <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: 28, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>VOLO</div>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{aircraft}</div>
                  <div style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>{from} → {to} · {new Date(date).toLocaleDateString('it-IT')} · {pax} pax</div>
                </div>

                {selectedExtras.filter(id => id !== 'wifi').length > 0 && (
                  <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: 28, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>SERVIZI AGGIUNTIVI</div>
                    {extras.filter(e => selectedExtras.includes(e.id) && e.id !== 'wifi').map(e => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', color: 'rgba(240,237,230,0.7)', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
                        <span>{e.icon} {e.label}</span>
                        <span style={{ color: '#C9A84C' }}>+{formatCurrency(e.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: 28, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>INTESTATARIO</div>
                  <div style={{ fontSize: 15 }}>{form.name || '—'}</div>
                  <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>{form.email} · {form.phone}</div>
                </div>

                <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', padding: 28 }}>
                  {[
                    ['Charter', formatCurrency(price)],
                    ...(extrasTotal > 0 ? [['Servizi aggiuntivi', `+${formatCurrency(extrasTotal)}`]] : []),
                    ['Totale', formatCurrency(total)],
                    ['Deposito ora (30%)', formatCurrency(deposit)],
                    ['Saldo (entro 72h dal volo)', formatCurrency(balance)],
                  ].map(([l, v], i) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(201,168,76,0.08)' : 'none', fontSize: i === 2 ? 18 : 14, fontFamily: 'Helvetica Neue, sans-serif', color: i === 2 ? '#F0EDE6' : i === 3 ? '#C9A84C' : 'rgba(240,237,230,0.65)', fontWeight: i === 2 ? 500 : 300 }}>
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-outline-gold" style={{ padding: '14px 28px' }}>
                  ← INDIETRO
                </button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} className="btn-gold"
                  style={{ padding: '14px 36px', flex: 1, opacity: step === 2 && !form.name ? 0.5 : 1 }}
                  disabled={step === 2 && !form.name}>
                  CONTINUA →
                </button>
              ) : (
                <button onClick={handlePay} disabled={paying} className="btn-gold"
                  style={{ padding: '16px 40px', flex: 1, fontSize: 13, letterSpacing: 2, opacity: paying ? 0.6 : 1 }}>
                  {paying ? 'REINDIRIZZAMENTO...' : `PAGA DEPOSITO ${formatCurrency(deposit)} →`}
                </button>
              )}
            </div>

            {step === 3 && (
              <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 16, textAlign: 'center', lineHeight: 1.7 }}>
                Cliccando "Paga Deposito" accetti i Termini di Servizio.<br />
                Pagamento sicuro via Stripe · PCI DSS Level 1
              </p>
            )}
          </div>

          {/* Sidebar summary */}
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', padding: 24, position: 'sticky', top: 90 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>IL TUO VOLO</div>

            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{from}</div>
            <div style={{ color: '#C9A84C', margin: '4px 0', fontSize: 14 }}>→</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>{to}</div>

            <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: 16 }}>
              {[
                ['Jet', aircraft],
                ['Data', new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })],
                ['Pax', `${pax}`],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <span style={{ color: 'rgba(240,237,230,0.35)' }}>{l}</span>
                  <span style={{ color: 'rgba(240,237,230,0.75)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>
                <span style={{ color: 'rgba(240,237,230,0.35)' }}>Charter</span>
                <span>{formatCurrency(price)}</span>
              </div>
              {extrasTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <span style={{ color: 'rgba(240,237,230,0.35)' }}>Extra</span>
                  <span>+{formatCurrency(extrasTotal)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.1)', fontSize: 14 }}>
                <span style={{ color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif' }}>Deposito</span>
                <span style={{ color: '#C9A84C', fontWeight: 500 }}>{formatCurrency(deposit)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 18 }}>
                <span style={{ color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>Totale</span>
                <span style={{ color: '#C9A84C' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: 36 }}>✦</div>}>
      <BookingWizard />
    </Suspense>
  )
}
