// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { track } from '@/lib/tracking'
import QuoteBuilder from '@/components/dashboard/QuoteBuilder'

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  fromCity?: string
  toCity?: string
  flightDate?: string
  pax?: number
  budget?: string
  message: string
  pipelineStatus: string
  leadTier: string
  leadScore: number
  nextAction: string
  urgencyFlag: boolean
  sameDay: boolean
  urgency: boolean
  marginEstimate: number
  marginPercent: number
  clientQuoteEstimate: number
  optimizedQuote: number
  optimizedMargin: number
  suggestedAction: string
  internalNotes?: string
  createdAt: string
  depositPaid?: boolean
  depositAmount?: number
  stripeSessionId?: string
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  NEW: { label: 'Nuova', bg: 'rgba(201,168,76,0.15)', color: '#C9A84C' },
  CONTACTED: { label: 'Contattato', bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
  QUOTING: { label: 'In quotazione', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  QUOTED: { label: 'Preventivata', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  WON: { label: 'Vinta ✓', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  LOST: { label: 'Persa', bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
}

const tierConfig: Record<string, { label: string; color: string }> = {
  VIP: { label: '🔥 VIP', color: '#C9A84C' },
  HIGH: { label: '💎 HIGH', color: '#60a5fa' },
  MEDIUM: { label: '◆ MEDIUM', color: '#c084fc' },
  LOW: { label: '○ LOW', color: 'rgba(240,237,230,0.4)' },
  UNQUALIFIED: { label: '– UNQUALIFIED', color: 'rgba(240,237,230,0.2)' },
}

const nextActionConfig: Record<string, { label: string; color: string }> = {
  CALL_NOW: { label: '📞 CHIAMA ORA', color: '#f87171' },
  WHATSAPP_NOW: { label: '💬 WA ORA', color: '#25D366' },
  EMAIL_ONLY: { label: '✉ EMAIL', color: '#60a5fa' },
  LOW_PRIORITY: { label: '○ BASSA PRIORITÀ', color: 'rgba(240,237,230,0.25)' },
}

export default function RequestsPage() {
  const searchParams = useSearchParams()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selected, setSelected] = useState<string | null>(() => searchParams.get('inquiryId'))
  const [patchingStatus, setPatchingStatus] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [depositLink, setDepositLink] = useState<string | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)

  const fetchInquiries = useCallback(() => {
    setLoading(true)
    fetch('/api/inquiries?limit=100&orderBy=score')
      .then(r => r.json())
      .then(d => setInquiries(d.inquiries ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const selectedReq = inquiries.find(r => r.id === selected)

  useEffect(() => {
    if (selectedReq) setNotes(selectedReq.internalNotes ?? '')
    setDepositLink(null)
  }, [selected, selectedReq])

  const changeStatus = async (id: string, pipelineStatus: string) => {
    setPatchingStatus(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pipelineStatus }),
      })
      if (res.ok) {
        setInquiries(prev => prev.map(r => r.id === id ? { ...r, pipelineStatus } : r))
      }
    } finally {
      setPatchingStatus(false)
    }
  }

  const generateDepositLink = async () => {
    if (!selected) return
    setGeneratingLink(true)
    setDepositLink(null)
    try {
      const res = await fetch('/api/checkout/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: selected }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setDepositLink(data.url)
        await navigator.clipboard.writeText(data.url).catch(() => null)
      } else {
        alert(data.error || 'Errore generazione link')
      }
    } finally {
      setGeneratingLink(false)
    }
  }

  const saveNotes = async () => {
    if (!selected) return
    setNotesSaving(true)
    try {
      await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected, internalNotes: notes }),
      })
      setInquiries(prev => prev.map(r => r.id === selected ? { ...r, internalNotes: notes } : r))
    } finally {
      setNotesSaving(false)
    }
  }

  const filtered = filterStatus === 'ALL'
    ? inquiries
    : inquiries.filter(r => r.pipelineStatus === filterStatus)

  const fmt = (n: number) => n > 0 ? `€${Math.round(n).toLocaleString('it-IT')}` : '—'
  const fmtDate = (s: string) => {
    try { return new Date(s).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return s }
  }

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h1 style={{ fontSize: 32, fontWeight: 300, margin: 0 }}>Richieste Clienti</h1>
          <button onClick={fetchInquiries} style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.4)', padding: '8px 16px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer' }}>
            ↻ AGGIORNA
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {(['ALL', 'NEW', 'CONTACTED', 'QUOTING', 'QUOTED', 'WON', 'LOST'] as const).map(f => {
          const s = f === 'ALL' ? null : statusConfig[f]
          const count = f === 'ALL' ? inquiries.length : inquiries.filter(r => r.pipelineStatus === f).length
          return (
            <button key={f} onClick={() => setFilterStatus(f)}
              style={{ padding: '7px 16px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: filterStatus === f ? '#C9A84C' : 'transparent', color: filterStatus === f ? '#0A0C14' : (s ? s.color : 'rgba(240,237,230,0.5)'), border: `1px solid ${filterStatus === f ? '#C9A84C' : (s ? s.color + '60' : 'rgba(240,237,230,0.15)')}`, transition: 'all 0.2s' }}>
              {f === 'ALL' ? 'Tutte' : s!.label} <span style={{ opacity: 0.6 }}>({count})</span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24 }}>
        {/* Table */}
        <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>Nessuna richiesta.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.12)', background: '#050810' }}>
                    {['Cliente', 'Rotta', 'Budget', 'Score / Tier', 'Azione', 'Status', 'Data'].map(h => (
                      <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const s = statusConfig[req.pipelineStatus] ?? statusConfig['NEW']
                    const tier = tierConfig[req.leadTier]
                    const action = nextActionConfig[req.nextAction]
                    const isSelected = selected === req.id
                    return (
                      <tr key={req.id} onClick={() => setSelected(isSelected ? null : req.id)}
                        style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', cursor: 'pointer', background: isSelected ? 'rgba(201,168,76,0.06)' : 'transparent', transition: 'background 0.15s', borderLeft: isSelected ? '3px solid #C9A84C' : '3px solid transparent' }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.03)' }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>

                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: 14, marginBottom: 2 }}>{req.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{req.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>
                          {req.fromCity && req.toCity ? `${req.fromCity} → ${req.toCity}` : '—'}
                          {req.flightDate && <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', marginTop: 2 }}>{req.flightDate}</div>}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#C9A84C', whiteSpace: 'nowrap' }}>{req.budget || '—'}</td>
                        <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${req.leadScore >= 70 ? '#C9A84C' : req.leadScore >= 40 ? '#60a5fa' : 'rgba(240,237,230,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: req.leadScore >= 70 ? '#C9A84C' : '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', flexShrink: 0 }}>
                              {req.leadScore}
                            </div>
                            {tier && <span style={{ fontSize: 11, color: tier.color, fontFamily: 'Helvetica Neue, sans-serif' }}>{tier.label}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                          {action
                            ? <span style={{ fontSize: 10, padding: '3px 8px', color: action.color, background: `${action.color}18`, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 0.5 }}>{action.label}</span>
                            : <span style={{ color: 'rgba(240,237,230,0.2)', fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ background: s.bg, color: s.color, fontSize: 10, padding: '3px 9px', letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>{fmtDate(req.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedReq && (
          <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.2)', padding: 28, alignSelf: 'flex-start', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>PRATICA</div>
                <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{selectedReq.id}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{selectedReq.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20 }}>
              {selectedReq.email}{selectedReq.phone ? ` · ${selectedReq.phone}` : ''}
            </div>

            {/* Scoring block */}
            <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>LEAD INTELLIGENCE</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Score', value: String(selectedReq.leadScore), color: selectedReq.leadScore >= 70 ? '#C9A84C' : '#F0EDE6' },
                  { label: 'Tier', value: tierConfig[selectedReq.leadTier]?.label ?? selectedReq.leadTier, color: tierConfig[selectedReq.leadTier]?.color ?? '#F0EDE6' },
                  { label: 'Quota ott.', value: fmt(selectedReq.optimizedQuote || selectedReq.clientQuoteEstimate), color: '#4ade80' },
                  { label: 'Margine est.', value: fmt(selectedReq.marginEstimate), color: '#4ade80' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, letterSpacing: 1, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 15, color, fontFamily: 'Helvetica Neue, sans-serif' }}>{value}</div>
                  </div>
                ))}
              </div>
              {selectedReq.nextAction && nextActionConfig[selectedReq.nextAction] && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: 1, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>AZIONE</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', color: nextActionConfig[selectedReq.nextAction].color, background: `${nextActionConfig[selectedReq.nextAction].color}18`, fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {nextActionConfig[selectedReq.nextAction].label}
                  </span>
                  {selectedReq.urgencyFlag && <span style={{ fontSize: 10, color: '#fb923c', fontFamily: 'Helvetica Neue, sans-serif' }}>⚡ URGENTE</span>}
                </div>
              )}
              {selectedReq.suggestedAction && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', fontStyle: 'italic' }}>
                  {selectedReq.suggestedAction}
                </div>
              )}
            </div>

            {/* Flight details */}
            {[
              ['Rotta', selectedReq.fromCity && selectedReq.toCity ? `${selectedReq.fromCity} → ${selectedReq.toCity}` : '—'],
              ['Data volo', selectedReq.flightDate || '—'],
              ['Passeggeri', selectedReq.pax ? `${selectedReq.pax} pax` : '—'],
              ['Budget dichiarato', selectedReq.budget || '—'],
              ['Ricevuta il', fmtDate(selectedReq.createdAt)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.07)' }}>
                <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{label}</span>
                <span style={{ fontSize: 13 }}>{value}</span>
              </div>
            ))}

            {/* Messaggio */}
            {selectedReq.message && (
              <div style={{ marginTop: 16, padding: 14, background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.08)' }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>MESSAGGIO CLIENTE</div>
                <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, margin: 0 }}>{selectedReq.message}</p>
              </div>
            )}

            {/* Note interne */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>NOTE BROKER</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Note interne (non visibili al cliente)..."
                style={{ width: '100%', minHeight: 72, background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0EDE6', padding: '10px 12px', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
              />
              <button onClick={saveNotes} disabled={notesSaving || notes === (selectedReq.internalNotes ?? '')}
                style={{ marginTop: 6, padding: '6px 14px', fontSize: 10, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: 'pointer', background: 'transparent', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', opacity: notesSaving || notes === (selectedReq.internalNotes ?? '') ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                {notesSaving ? 'SALVO...' : 'SALVA NOTE'}
              </button>
            </div>

            {/* Status change */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>PIPELINE STATUS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(['NEW', 'CONTACTED', 'QUOTING', 'QUOTED', 'WON', 'LOST'] as const).map(st => {
                  const s = statusConfig[st]
                  const isActive = selectedReq.pipelineStatus === st
                  return (
                    <button key={st} onClick={() => changeStatus(selectedReq.id, st)} disabled={patchingStatus}
                      style={{ padding: '6px 12px', fontSize: 10, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', cursor: patchingStatus ? 'not-allowed' : 'pointer', background: isActive ? s.bg : 'transparent', color: s.color, border: `1px solid ${s.color}`, opacity: isActive ? 1 : 0.55, transition: 'all 0.2s' }}>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Deposit */}
            <div style={{ marginTop: 20, padding: '16px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>DEPOSITO 30%</div>

              {selectedReq.depositPaid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  ✓ Pagato — €{(selectedReq.depositAmount ?? 0).toLocaleString('it-IT')}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>
                    Importo: <span style={{ color: '#4ade80' }}>
                      €{Math.round((selectedReq.optimizedQuote || selectedReq.clientQuoteEstimate) * 0.3).toLocaleString('it-IT')}
                    </span>
                    {' '}(30% di €{(selectedReq.optimizedQuote || selectedReq.clientQuoteEstimate).toLocaleString('it-IT')})
                  </div>
                  <button
                    onClick={() => { setDepositLink(null); generateDepositLink() }}
                    disabled={generatingLink || (selectedReq.optimizedQuote || selectedReq.clientQuoteEstimate) <= 0}
                    style={{ width: '100%', padding: '9px', fontSize: 11, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif', cursor: generatingLink ? 'wait' : 'pointer', background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', transition: 'all 0.2s', opacity: generatingLink ? 0.6 : 1 }}>
                    {generatingLink ? 'GENERAZIONE...' : '↗ GENERA LINK DEPOSITO'}
                  </button>
                  {depositLink && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 10, color: '#4ade80', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4, letterSpacing: 1 }}>LINK COPIATO — invia al cliente:</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.5)', fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '8px', lineHeight: 1.5 }}>
                        {depositLink}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Checklist Operativa */}
            {selectedReq.depositPaid && (
              <div style={{ marginTop: 20, padding: '20px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>CHECKLIST OPERATIVA</div>
                  <div style={{ fontSize: 10, padding: '2px 6px', background: '#C9A84C', color: '#0A0C14', fontWeight: 600, letterSpacing: 1 }}>IN CORSO</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Cliente contattato entro 2h',
                    'Operatore e Jet confermati',
                    'Slot / FBO confermati',
                    'Catering definito',
                    'Transfer organizzato (se rich.)',
                    'Briefing finale inviato',
                  ].map(step => (
                    <label key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: '#C9A84C', width: 14, height: 14 }} />
                      <span style={{ fontSize: 13, color: 'rgba(240,237,230,0.7)', fontFamily: 'Helvetica Neue, sans-serif' }}>{step}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', fontStyle: 'italic' }}>
                  Nota: questa è una checklist visuale. Usa lo status della pipeline per marcare come "Vinta".
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setShowBuilder(true)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#C9A84C', color: '#0A0C14', textDecoration: 'none', padding: '11px', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid #C9A84C', cursor: 'pointer', fontWeight: 600 }}>
                + CREA PREVENTIVO
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <a
                href={buildWhatsAppUrl(selectedReq.leadTier === 'VIP' ? 'vip' : 'volo', { from: selectedReq.fromCity, to: selectedReq.toCity, budget: selectedReq.budget, pax: selectedReq.pax })}
                target="_blank" rel="noopener noreferrer"
                onClick={() => track('click_whatsapp', { source: 'requests_panel', leadId: selectedReq.id })}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(37,211,102,0.15)', color: '#25D366', textDecoration: 'none', padding: '11px', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(37,211,102,0.3)' }}>
                💬 WHATSAPP
              </a>
              <a href={`mailto:${selectedReq.email}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: '#60a5fa', textDecoration: 'none', padding: '11px', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(96,165,250,0.3)' }}>
                ✉ EMAIL
              </a>
            </div>
          </div>
        )}
      </div>

      {showBuilder && selectedReq && (
        <QuoteBuilder
          inquiry={selectedReq}
          onClose={() => setShowBuilder(false)}
          onSave={async (quote) => {
            setShowBuilder(false)
            fetchInquiries() // Ricarica la lista per mostrare lo status QUOTED
          }}
        />
      )}
    </div>
  )
}
