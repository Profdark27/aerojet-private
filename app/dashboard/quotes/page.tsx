'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import QuoteBuilder from '@/components/dashboard/QuoteBuilder'

const DEPOSIT_RATE = 0.30

const qStatusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:  { label: 'In attesa',  color: '#C9A84C',               dot: '#C9A84C' },
  ACCEPTED: { label: 'Accettato',  color: '#4ade80',               dot: '#4ade80' },
  REJECTED: { label: 'Rifiutato',  color: '#f87171',               dot: '#f87171' },
  EXPIRED:  { label: 'Scaduto',    color: 'rgba(240,237,230,0.3)', dot: 'rgba(240,237,230,0.2)' },
}

const tierColor: Record<string, string> = {
  VIP: '#C9A84C', HIGH: '#60a5fa', MEDIUM: '#c084fc',
  LOW: 'rgba(240,237,230,0.4)', UNQUALIFIED: 'rgba(240,237,230,0.2)',
}

interface QuoteRow {
  id: string
  client: string
  clientEmail: string
  fromCity: string
  toCity: string
  flightDate: string
  pax: number
  aircraft: string
  operator: string
  price: number
  currency: string
  commission: number
  validUntil: string
  createdAt: string
  status: string
  inquiryId: string | null
}

interface InquiryOption {
  id: string
  name: string
  email: string
  fromCity?: string
  toCity?: string
  flightDate?: string
  budget?: string
  pipelineStatus: string
  leadTier: string
  leadScore: number
  depositPaid?: boolean
  _count?: { quotes: number }
  quotes?: { status: string; validUntil: string }[]
}

// ── Inline copy-link button ──────────────────────────────────
function CopyLinkButton({ quoteId }: { quoteId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/accept-quote/${quoteId}`
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      title="Copia link preventivo"
      style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.25)', color: copied ? '#4ade80' : '#C9A84C', padding: '5px 10px', cursor: 'pointer', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
    >
      {copied ? '✓ COPIATO' : 'COPIA LINK'}
    </button>
  )
}

// ── Modal per scegliere una Inquiry ─────────────────────────
function InquiryPicker({
  onSelect,
  onClose,
}: {
  onSelect: (inq: InquiryOption) => void
  onClose: () => void
}) {
  const [inquiries, setInquiries] = useState<InquiryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/inquiries?limit=200&orderBy=score')
      .then(r => r.json())
      .then(d => setInquiries(d.inquiries ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = inquiries.filter(inq => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.fromCity ?? '').toLowerCase().includes(q) ||
      (inq.toCity ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.3)', width: '100%', maxWidth: 720, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>NUOVO PREVENTIVO</div>
            <div style={{ fontSize: 18, fontWeight: 300 }}>Seleziona una richiesta cliente</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(201,168,76,0.07)', flexShrink: 0 }}>
          <input
            autoFocus
            placeholder="Cerca per nome, email, rotta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="luxury-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>Nessuna richiesta trovata.</div>
          ) : (
            filtered.map(inq => {
              const tc = tierColor[inq.leadTier] ?? 'rgba(240,237,230,0.4)'
              const route = inq.fromCity && inq.toCity ? `${inq.fromCity} → ${inq.toCity}` : '—'
              const quoteCount = inq._count?.quotes ?? 0
              const latestQuote = inq.quotes?.[0]
              const now = new Date()

              // Calcola badge stato ultimo preventivo
              let latestStatus: 'ACCEPTED' | 'EXPIRED' | 'PENDING' | null = null
              if (latestQuote) {
                if (inq.depositPaid) latestStatus = 'ACCEPTED'
                else if (new Date(latestQuote.validUntil) < now) latestStatus = 'EXPIRED'
                else latestStatus = 'PENDING'
              }

              const quoteBadgeColor = quoteCount === 0
                ? 'rgba(240,237,230,0.2)'
                : latestStatus === 'ACCEPTED' ? '#4ade80'
                : latestStatus === 'EXPIRED'  ? '#f87171'
                : '#C9A84C'

              const quoteBadgeLabel = quoteCount === 0
                ? '0 prev.'
                : `${quoteCount} prev.`

              const latestStatusLabel =
                latestStatus === 'ACCEPTED' ? '✓ PAGATO'
                : latestStatus === 'EXPIRED'  ? 'SCADUTO'
                : latestStatus === 'PENDING'  ? 'IN ATTESA'
                : null

              return (
                <div
                  key={inq.id}
                  onClick={() => onSelect(inq)}
                  style={{ padding: '16px 28px', borderBottom: '1px solid rgba(201,168,76,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inq.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                      {route}{inq.flightDate ? ` · ${inq.flightDate}` : ''}{inq.budget ? ` · Budget: ${inq.budget}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, marginLeft: 16 }}>
                    {/* Badge conteggio preventivi */}
                    <span style={{
                      fontSize: 10, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif',
                      color: quoteBadgeColor,
                      border: `1px solid ${quoteBadgeColor}`,
                      padding: '2px 7px',
                      opacity: quoteCount === 0 ? 0.5 : 1,
                    }}>
                      {quoteBadgeLabel}
                    </span>
                    {/* Stato ultimo preventivo */}
                    {latestStatusLabel && (
                      <span style={{ fontSize: 10, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', color: quoteBadgeColor }}>
                        {latestStatusLabel}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: tc, fontFamily: 'Helvetica Neue, sans-serif' }}>{inq.leadTier}</span>
                    <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>{inq.leadScore}/100</span>
                    <span style={{ fontSize: 12, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>→</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)

  const [showPicker, setShowPicker] = useState(false)
  const [builderInquiry, setBuilderInquiry] = useState<InquiryOption | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/quotes')
      if (res.ok) {
        const data = await res.json()
        setQuotes(data.quotes ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  const total = quotes.length
  const pending = quotes.filter(q => q.status === 'PENDING').length
  const accepted = quotes.filter(q => q.status === 'ACCEPTED').length
  const totalValue = quotes.reduce((s, q) => s + q.price, 0)

  return (
    <div style={{ padding: '40px 48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
          <h1 style={{ fontSize: 32, fontWeight: 300 }}>Preventivi</h1>
        </div>
        <button onClick={() => setShowPicker(true)} className="btn-gold" style={{ padding: '14px 28px' }}>
          + NUOVO PREVENTIVO
        </button>
      </div>

      {/* KPI strip */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'TOTALE',          value: String(total),             color: '#F0EDE6' },
            { label: 'IN ATTESA',       value: String(pending),           color: '#C9A84C' },
            { label: 'ACCETTATI',       value: String(accepted),          color: '#4ade80' },
            { label: 'VALORE PIPELINE', value: formatCurrency(totalValue), color: '#C9A84C' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.1)', padding: '20px 24px' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 300, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quotes table */}
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>PREVENTIVI INVIATI</div>
          <button onClick={fetchQuotes} style={{ background: 'transparent', border: 'none', color: 'rgba(240,237,230,0.3)', cursor: 'pointer', fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif' }}>↻ aggiorna</button>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13 }}>Caricamento preventivi...</div>
        ) : quotes.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif', fontSize: 13, marginBottom: 20 }}>Nessun preventivo ancora.</div>
            <button onClick={() => setShowPicker(true)} className="btn-gold" style={{ padding: '12px 28px', fontSize: 11 }}>
              + CREA IL PRIMO PREVENTIVO
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.08)', background: '#050810' }}>
                  {['Stato', 'Cliente', 'Rotta', 'Velivolo', 'Prezzo', 'Deposito 30%', 'Validità', 'Azioni'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const s = qStatusConfig[q.status] ?? qStatusConfig.PENDING
                  const deposit = Math.round(q.price * DEPOSIT_RATE)
                  const validDate = new Date(q.validUntil).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

                  return (
                    <tr key={q.id}
                      style={{ borderBottom: '1px solid rgba(201,168,76,0.05)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.03)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ color: s.color, fontSize: 11, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{s.label}</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 14, color: '#F0EDE6' }}>{q.client}</div>
                        {q.clientEmail && <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 2 }}>{q.clientEmail}</div>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>
                        {q.fromCity} → {q.toCity}
                        {q.flightDate && <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.3)', marginTop: 2 }}>{q.flightDate}</div>}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(240,237,230,0.65)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>{q.aircraft}</td>
                      <td style={{ padding: '16px 20px', fontSize: 15, color: '#C9A84C', whiteSpace: 'nowrap' }}>{formatCurrency(q.price)}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>{formatCurrency(deposit)}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: q.status === 'EXPIRED' ? '#f87171' : 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', whiteSpace: 'nowrap' }}>{validDate}</td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <CopyLinkButton quoteId={q.id} />
                          <a
                            href={`/accept-quote/${q.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(240,237,230,0.4)', padding: '5px 10px', textDecoration: 'none', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', display: 'inline-block' }}
                          >
                            APRI ↗
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPicker && (
        <InquiryPicker
          onSelect={inq => {
            setShowPicker(false)
            setBuilderInquiry(inq)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {builderInquiry && (
        <QuoteBuilder
          inquiry={builderInquiry}
          onClose={() => setBuilderInquiry(null)}
          onSave={async () => {
            setBuilderInquiry(null)
            await fetchQuotes()
          }}
        />
      )}
    </div>
  )
}
