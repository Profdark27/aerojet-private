'use client'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

const allRequests = [
  { id: 'RQ-001', name: 'Marco Ferretti', email: 'm.ferretti@email.it', phone: '+39 347 1234567', from: 'Milano', to: 'Londra', date: '25 Apr 2026', pax: 3, budget: 12000, message: 'Necessito di un volo per una riunione di lavoro. Rientro previsto il 26.', status: 'NEW', createdAt: '18 Apr 2026' },
  { id: 'RQ-002', name: 'Sofia Ricci', email: 's.ricci@luxury.com', phone: '+39 328 9876543', from: 'Roma', to: 'Dubai', date: '28 Apr 2026', pax: 6, budget: 55000, message: 'Viaggio privato con famiglia. Preferisco jet heavy con camera da letto.', status: 'QUOTED', createdAt: '17 Apr 2026' },
  { id: 'RQ-003', name: 'Azienda SpA', email: 'hr@aziendaSpa.it', phone: '+39 02 98765432', from: 'Torino', to: 'Parigi', date: '02 Mag 2026', pax: 8, budget: 8000, message: 'Transfer per executive team. Partenza ore 7:00. Rientro il giorno stesso.', status: 'IN_PROGRESS', createdAt: '16 Apr 2026' },
  { id: 'RQ-004', name: 'Luca Bianchi', email: 'luca.b@vc.fund', phone: '+39 333 1112233', from: 'Milano', to: 'New York', date: '05 Mag 2026', pax: 2, budget: 95000, message: 'Volo transatlantico con rientro 8 maggio. Ultra-long range preferito.', status: 'CONFIRMED', createdAt: '15 Apr 2026' },
  { id: 'RQ-005', name: 'Elena Conti', email: 'elena@lifestyle.it', phone: '+39 347 5556677', from: 'Venezia', to: 'Ibiza', date: '10 Mag 2026', pax: 4, budget: 18000, message: 'Weekend di lusso. Parto venerdì sera, rientro domenica.', status: 'NEW', createdAt: '19 Apr 2026' },
  { id: 'RQ-006', name: 'Roberto Marini', email: 'r.marini@holdings.eu', phone: '+39 348 9001234', from: 'Ginevra', to: 'Monaco', date: '12 Mag 2026', pax: 5, budget: 32000, message: 'Volo per evento privato. Fondamentale puntualità assoluta.', status: 'NEW', createdAt: '20 Apr 2026' },
]

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  NEW: { label: 'Nuova', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  QUOTED: { label: 'Preventivata', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  IN_PROGRESS: { label: 'In corso', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  CONFIRMED: { label: 'Confermata', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  CANCELLED: { label: 'Annullata', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
}

export default function RequestsPage() {
  const [requests, setRequests] = useState(allRequests)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = filterStatus === 'ALL' ? requests : requests.filter(r => r.status === filterStatus)
  const selectedReq = requests.find(r => r.id === selected)

  const changeStatus = (id: string, newStatus: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
        <h1 style={{ fontSize: 32, fontWeight: 300 }}>Richieste Clienti</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {['ALL', 'NEW', 'QUOTED', 'IN_PROGRESS', 'CONFIRMED'].map(f => {
          const s = f === 'ALL' ? { label: 'Tutte', bg: 'transparent', color: 'rgba(240,237,230,0.5)' } : statusConfig[f]
          return (
            <button key={f} onClick={() => setFilterStatus(f)}
              style={{ padding: '8px 18px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: filterStatus === f ? '#C9A84C' : 'transparent', color: filterStatus === f ? '#0A0C14' : (f === 'ALL' ? 'rgba(240,237,230,0.5)' : s.color), border: `1px solid ${filterStatus === f ? '#C9A84C' : (f === 'ALL' ? 'rgba(240,237,230,0.15)' : s.color)}`, transition: 'all 0.2s' }}>
              {f === 'ALL' ? 'Tutte' : s.label} {f !== 'ALL' && `(${requests.filter(r => r.status === f).length})`}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24 }}>
        {/* Table */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.12)', background: '#050810' }}>
                {['ID', 'Cliente', 'Rotta', 'Data Volo', 'Budget', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const s = statusConfig[req.status]
                const isSelected = selected === req.id
                return (
                  <tr key={req.id} onClick={() => setSelected(isSelected ? null : req.id)}
                    style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', cursor: 'pointer', background: isSelected ? 'rgba(201,168,76,0.06)' : 'transparent', transition: 'background 0.15s', borderLeft: isSelected ? '3px solid #C9A84C' : '3px solid transparent' }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.03)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <td style={{ padding: '16px 20px', fontSize: 12, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.id}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 14 }}>{req.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'rgba(240,237,230,0.7)', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.from} → {req.to}</td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.date}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: '#C9A84C' }}>{formatCurrency(req.budget)}</td>
                    <td style={{ padding: '16px 20px' }}><span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '4px 10px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>{s.label}</span></td>
                    <td style={{ padding: '16px 20px', color: 'rgba(201,168,76,0.4)' }}>→</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedReq && (
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 28, alignSelf: 'flex-start', position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>{selectedReq.id}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{selectedReq.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>{selectedReq.email} · {selectedReq.phone}</div>

            {[
              ['Rotta', `${selectedReq.from} → ${selectedReq.to}`],
              ['Data volo', selectedReq.date],
              ['Passeggeri', `${selectedReq.pax} persone`],
              ['Budget', formatCurrency(selectedReq.budget)],
              ['Ricevuta il', selectedReq.createdAt],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{label}</span>
                <span style={{ fontSize: 14 }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: 16, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>MESSAGGIO CLIENTE</div>
              <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7 }}>{selectedReq.message}</p>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>CAMBIA STATUS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['NEW', 'IN_PROGRESS', 'QUOTED', 'CONFIRMED', 'CANCELLED'].map(st => {
                  const s = statusConfig[st]
                  return (
                    <button key={st} onClick={() => changeStatus(selectedReq.id, st)}
                      style={{ padding: '6px 12px', fontSize: 10, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: selectedReq.status === st ? s.bg : 'transparent', color: s.color, border: `1px solid ${s.color}`, opacity: selectedReq.status === st ? 1 : 0.6, transition: 'all 0.2s' }}>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button className="btn-gold" style={{ flex: 1, padding: '12px' }}>INVIA PREVENTIVO</button>
              <button className="btn-outline-gold" style={{ flex: 1, padding: '12px' }}>EMAIL CLIENTE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
