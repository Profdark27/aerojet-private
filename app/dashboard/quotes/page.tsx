'use client'
import { useState } from 'react'
import { formatCurrency, calcCommission } from '@/lib/utils'

const sentQuotes = [
  { id: 'QT-001', client: 'Sofia Ricci', route: 'Roma → Dubai', jet: 'Falcon 7X', price: 48500, commission: 5820, status: 'PENDING', validUntil: '25 Apr 2026', sentAt: '18 Apr 2026' },
  { id: 'QT-002', client: 'Azienda SpA', route: 'Torino → Parigi', jet: 'Citation XLS+', price: 8200, commission: 984, status: 'ACCEPTED', validUntil: '22 Apr 2026', sentAt: '16 Apr 2026' },
  { id: 'QT-003', client: 'Marco Rossi', route: 'Milano → Londra', jet: 'Phenom 300E', price: 9800, commission: 1176, status: 'EXPIRED', validUntil: '15 Apr 2026', sentAt: '12 Apr 2026' },
  { id: 'QT-004', client: 'Giulia Ferrari', route: 'Roma → NYC', jet: 'Global 7500', price: 98000, commission: 11760, status: 'PENDING', validUntil: '28 Apr 2026', sentAt: '19 Apr 2026' },
]

const jets = [
  { model: 'Pilatus PC-12', category: 'Turboprop', basePrice: 3200 },
  { model: 'Phenom 300E', category: 'Light Jet', basePrice: 4800 },
  { model: 'Citation XLS+', category: 'Midsize', basePrice: 6500 },
  { model: 'Challenger 350', category: 'Super Midsize', basePrice: 8200 },
  { model: 'Falcon 7X', category: 'Heavy', basePrice: 12000 },
  { model: 'Global 7500', category: 'Ultra-Long', basePrice: 18000 },
]

const qStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'In attesa', color: '#C9A84C' },
  ACCEPTED: { label: 'Accettato', color: '#4ade80' },
  REJECTED: { label: 'Rifiutato', color: '#f87171' },
  EXPIRED: { label: 'Scaduto', color: 'rgba(240,237,230,0.3)' },
}

export default function QuotesPage() {
  const [showBuilder, setShowBuilder] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [client, setClient] = useState('')
  const [jet, setJet] = useState(jets[0])
  const [hours, setHours] = useState(2)
  const [commRate, setCommRate] = useState(12)

  const totalPrice = Math.round(jet.basePrice * hours)
  const commission = calcCommission(totalPrice, commRate / 100)

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
          <h1 style={{ fontSize: 32, fontWeight: 300 }}>Preventivi</h1>
        </div>
        <button onClick={() => setShowBuilder(!showBuilder)} className="btn-gold" style={{ padding: '14px 28px' }}>
          {showBuilder ? 'CHIUDI' : '+ NUOVO PREVENTIVO'}
        </button>
      </div>

      {/* Quote Builder */}
      {showBuilder && (
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 36, marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 28 }}>CREA PREVENTIVO</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
            {[
              { label: 'CLIENTE', value: client, set: setClient, placeholder: 'Nome cliente' },
              { label: 'PARTENZA', value: from, set: setFrom, placeholder: 'Città di partenza' },
              { label: 'DESTINAZIONE', value: to, set: setTo, placeholder: 'Città di arrivo' },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>{label}</div>
                <input className="luxury-input" placeholder={placeholder} value={value} onChange={e => set(e.target.value)} />
              </div>
            ))}

            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>VELIVOLO</div>
              <select className="luxury-input" value={jet.model} onChange={e => setJet(jets.find(j => j.model === e.target.value) || jets[0])}>
                {jets.map(j => <option key={j.model} value={j.model}>{j.model} ({j.category})</option>)}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>ORE DI VOLO: {hours}h</div>
              <input type="range" min={0.5} max={15} step={0.5} value={hours} onChange={e => setHours(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#C9A84C', marginTop: 8 }} />
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>COMMISSIONE: {commRate}%</div>
              <input type="range" min={8} max={18} step={1} value={commRate} onChange={e => setCommRate(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#C9A84C', marginTop: 8 }} />
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.15)', padding: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>RIEPILOGO PREVENTIVO</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
              <div><div style={{ fontSize: 10, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1, marginBottom: 6 }}>ROTTA</div><div style={{ fontSize: 16 }}>{from || '—'} → {to || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1, marginBottom: 6 }}>VELIVOLO</div><div style={{ fontSize: 16 }}>{jet.model}</div></div>
              <div><div style={{ fontSize: 10, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1, marginBottom: 6 }}>PREZZO CHARTER</div><div style={{ fontSize: 20, color: '#C9A84C' }}>{formatCurrency(totalPrice)}</div></div>
              <div><div style={{ fontSize: 10, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1, marginBottom: 6 }}>TUA COMMISSIONE</div><div style={{ fontSize: 20, color: '#4ade80' }}>{formatCurrency(commission)}</div></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-gold" style={{ padding: '13px 28px' }} onClick={async () => {
              if (!client || !from || !to) return
              const data = { quoteId: `QT-${Date.now().toString(36).toUpperCase()}`, clientName: client, clientEmail: ``, from, to, date: new Date().toLocaleDateString('it-IT'), pax: 2, aircraft: jet.model, category: jet.category, operator: 'Aerojet Network', price: totalPrice, commission, deposit: Math.round(totalPrice * 0.3), validUntil: new Date(Date.now() + 5 * 86400000).toLocaleDateString('it-IT') }
              const res = await fetch('/api/quote-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
              const html = await res.text()
              const win = window.open('', '_blank')
              if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500) }
            }}>GENERA PDF</button>
            <button className="btn-outline-gold" style={{ padding: '13px 28px' }} onClick={() => { setShowBuilder(false) }}>INVIA EMAIL</button>
          </div>
        </div>
      )}

      {/* Sent quotes list */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>PREVENTIVI INVIATI</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)', background: '#050810' }}>
              {['ID', 'Cliente', 'Rotta', 'Velivolo', 'Prezzo', 'Commissione', 'Scadenza', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sentQuotes.map((q) => {
              const s = qStatusConfig[q.status]
              return (
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px', fontSize: 12, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>{q.id}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14 }}>{q.client}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif' }}>{q.route}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif' }}>{q.jet}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#C9A84C' }}>{formatCurrency(q.price)}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: '#4ade80' }}>{formatCurrency(q.commission)}</td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>{q.validUntil}</td>
                  <td style={{ padding: '16px 20px' }}><span style={{ color: s.color, fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif' }}>{s.label}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
