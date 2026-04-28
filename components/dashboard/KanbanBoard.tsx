'use client'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

const COLUMNS = [
  { id: 'NEW', label: 'Nuove', color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
  { id: 'CONTACT', label: 'Contattate', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  { id: 'QUOTED', label: 'Preventivo Inviato', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  { id: 'NEGOTIATION', label: 'In Trattativa', color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
  { id: 'CONFIRMED', label: 'Confermate', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
]

interface Card {
  id: string; client: string; route: string; budget: number
  pax: number; date: string; status: string; priority: 'HIGH' | 'MED' | 'LOW'
  lastContact?: string; notes?: string
}

const initialCards: Card[] = [
  { id: 'RQ-001', client: 'Marco Ferretti', route: 'Milano → Londra', budget: 12000, pax: 3, date: '25 Apr', status: 'NEW', priority: 'HIGH' },
  { id: 'RQ-002', client: 'Sofia Ricci', route: 'Roma → Dubai', budget: 55000, pax: 6, date: '28 Apr', status: 'NEW', priority: 'HIGH' },
  { id: 'RQ-003', client: 'Azienda SpA', route: 'Torino → Parigi', budget: 8000, pax: 8, date: '02 Mag', status: 'CONTACT', priority: 'MED', lastContact: '1 ora fa' },
  { id: 'RQ-004', client: 'Luca Bianchi', route: 'Milano → NYC', budget: 95000, pax: 2, date: '05 Mag', status: 'QUOTED', priority: 'HIGH', lastContact: 'ieri' },
  { id: 'RQ-005', client: 'Elena Conti', route: 'Venezia → Ibiza', budget: 18000, pax: 4, date: '10 Mag', status: 'NEGOTIATION', priority: 'MED', notes: 'Chiede sconto 5%' },
  { id: 'RQ-006', client: 'Roberto Marini', route: 'Ginevra → Monaco', budget: 32000, pax: 5, date: '12 Mag', status: 'CONFIRMED', priority: 'LOW', lastContact: '3 giorni fa' },
  { id: 'RQ-007', client: 'Laura Esposito', route: 'Roma → Mykonos', budget: 22000, pax: 6, date: '15 Mag', status: 'NEW', priority: 'MED' },
]

const priorityStyle = { HIGH: { color: '#f87171', label: '🔴' }, MED: { color: '#fb923c', label: '🟡' }, LOW: { color: '#4ade80', label: '🟢' } }

export default function KanbanBoard() {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [selected, setSelected] = useState<Card | null>(null)

  const move = (cardId: string, newStatus: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: newStatus } : c))
  }

  const totalValue = cards.filter(c => c.status === 'CONFIRMED').reduce((s, c) => s + c.budget, 0)
  const pipelineValue = cards.filter(c => c.status !== 'CONFIRMED').reduce((s, c) => s + c.budget, 0)

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 6 }}>PIPELINE</div>
          <h1 style={{ fontSize: 28, fontWeight: 300 }}>Kanban Richieste</h1>
        </div>
        <div style={{ display: 'flex', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
          <div style={{ background: '#0A0C14', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, color: '#C9A84C' }}>{formatCurrency(pipelineValue)}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>PIPELINE</div>
          </div>
          <div style={{ background: '#0A0C14', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, color: '#4ade80' }}>{formatCurrency(totalValue)}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>CHIUSE</div>
          </div>
          <div style={{ background: '#0A0C14', padding: '14px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, color: '#C9A84C' }}>{formatCurrency(Math.round((totalValue + pipelineValue * 0.4) * 0.12))}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4 }}>COMM. EST.</div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {COLUMNS.map(col => {
          const colCards = cards.filter(c => c.status === col.id)
          const isDragTarget = dragOver === col.id
          return (
            <div key={col.id}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => { e.preventDefault(); if (dragging) move(dragging, col.id); setDragging(null); setDragOver(null) }}
              style={{ minWidth: 220, flex: 1, background: isDragTarget ? col.bg : '#0A0C14', border: `1px solid ${isDragTarget ? col.color : 'rgba(201,168,76,0.1)'}`, transition: 'all 0.15s', borderRadius: 0 }}>

              {/* Column header */}
              <div style={{ padding: '12px 14px', borderBottom: `2px solid ${col.color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: col.color, fontFamily: 'Helvetica Neue, sans-serif' }}>{col.label.toUpperCase()}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${col.color}20`, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'Helvetica Neue, sans-serif' }}>
                  {colCards.length}
                </div>
              </div>

              {/* Cards */}
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 400 }}>
                {colCards.map(card => (
                  <div key={card.id}
                    draggable
                    onDragStart={() => setDragging(card.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setSelected(card)}
                    style={{ background: dragging === card.id ? 'rgba(201,168,76,0.1)' : '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: '12px 14px', cursor: 'grab', transition: 'all 0.15s', opacity: dragging === card.id ? 0.5 : 1 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.35)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.12)'}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{card.id}</span>
                      <span title={card.priority}>{priorityStyle[card.priority].label}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{card.client}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>{card.route}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#C9A84C' }}>{formatCurrency(card.budget)}</span>
                      <span style={{ fontSize: 10, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>{card.date}</span>
                    </div>
                    {card.notes && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#fb923c', fontFamily: 'Helvetica Neue, sans-serif', background: 'rgba(251,146,60,0.08)', padding: '4px 8px', borderLeft: '2px solid #fb923c' }}>
                        {card.notes}
                      </div>
                    )}
                  </div>
                ))}

                {/* Drop zone */}
                {colCards.length === 0 && (
                  <div style={{ border: '1px dashed rgba(201,168,76,0.15)', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'rgba(240,237,230,0.2)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>TRASCINA QUI</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Card detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(5,8,16,0.8)' }} onClick={() => setSelected(null)}>
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', padding: 32, maxWidth: 440, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontSize: 11, color: '#C9A84C', letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif' }}>{selected.id}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>{selected.client}</h2>
            {[['Rotta', selected.route], ['Data', selected.date], ['Passeggeri', `${selected.pax} pax`], ['Budget', formatCurrency(selected.budget)], ['Commissione est.', formatCurrency(Math.round(selected.budget * 0.12))]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{l}</span>
                <span style={{ fontSize: 14, color: l.includes('Commissione') ? '#4ade80' : '#F0EDE6' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>SPOSTA IN</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {COLUMNS.filter(c => c.id !== selected.status).map(c => (
                  <button key={c.id} onClick={() => { move(selected.id, c.id); setSelected(null) }}
                    style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${c.color}`, color: c.color, fontSize: 10, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
