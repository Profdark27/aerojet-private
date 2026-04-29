import { useState, useEffect } from 'react'
import { formatCurrency, calcCommission } from '@/lib/utils'

interface QuoteBuilderProps {
  inquiry: {
    id: string
    name: string
    email: string
    fromCity?: string
    toCity?: string
    budget?: string
    depositPaid?: boolean
  }
  onClose: () => void
  onSave: (quoteData: any) => void
}

const jets = [
  { model: 'Pilatus PC-12', category: 'Turboprop', basePrice: 3200 },
  { model: 'Phenom 300E', category: 'Light Jet', basePrice: 4800 },
  { model: 'Citation XLS+', category: 'Midsize', basePrice: 6500 },
  { model: 'Challenger 350', category: 'Super Midsize', basePrice: 8200 },
  { model: 'Falcon 7X', category: 'Heavy', basePrice: 12000 },
  { model: 'Global 7500', category: 'Ultra-Long', basePrice: 18000 },
]

export default function QuoteBuilder({ inquiry, onClose, onSave }: QuoteBuilderProps) {
  const [from, setFrom] = useState(inquiry.fromCity || '')
  const [to, setTo] = useState(inquiry.toCity || '')
  const [client, setClient] = useState(inquiry.name)
  const [jet, setJet] = useState(jets[1]) // Default to Light Jet
  const [hours, setHours] = useState(2)
  const [commRate, setCommRate] = useState(12)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const totalPrice = Math.round(jet.basePrice * hours)
  const commission = calcCommission(totalPrice, commRate / 100)

  const handleSave = async () => {
    if (!client || !from || !to) {
      setErrorMsg('Compila tutti i campi obbligatori (Cliente, Partenza, Destinazione).')
      return
    }

    setIsSaving(true)
    setErrorMsg('')

    try {
      const payload = {
        inquiryId: inquiry.id,
        client,
        from,
        to,
        jet,
        hours,
        commRate,
        totalPrice,
        commission
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore sconosciuto durante il salvataggio.')
      }

      // Pass success back to parent to refresh the UI
      onSave(data.quote)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 8, 16, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.3)', width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 36, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>✕</button>

        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 28 }}>CREA PREVENTIVO</div>

        {inquiry.depositPaid && (
          <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.35)', padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fb923c', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1, marginBottom: 4 }}>DEPOSITO GIÀ RICEVUTO</div>
              <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.6 }}>
                Questa richiesta ha già un deposito pagato. Creare un nuovo preventivo può generare duplicazioni operative o confusione con il cliente. Procedi solo se necessario (es. modifica rotta, upgrade velivolo).
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: 12, marginBottom: 24, fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>CLIENTE</div>
            <input className="luxury-input" placeholder="Nome cliente" value={client} onChange={e => setClient(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>PARTENZA</div>
            <input className="luxury-input" placeholder="Città di partenza" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>DESTINAZIONE</div>
            <input className="luxury-input" placeholder="Città di arrivo" value={to} onChange={e => setTo(e.target.value)} />
          </div>

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
          <button className="btn-gold" style={{ padding: '13px 28px', opacity: isSaving ? 0.6 : 1 }} disabled={isSaving} onClick={handleSave}>
            {isSaving ? 'SALVATAGGIO...' : 'SALVA & PROCEDI'}
          </button>
          <button className="btn-outline-gold" style={{ padding: '13px 28px' }} onClick={onClose} disabled={isSaving}>ANNULLA</button>
        </div>
      </div>
    </div>
  )
}
