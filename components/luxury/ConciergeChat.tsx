// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface ChatContext {
  from?: string
  to?: string
  budget?: string
  userName?: string
  userEmail?: string
  userPhone?: string
}

interface InquiryCard {
  id: string
  leadScore: number
  leadTier: string
  estimatedQuote: number
  depositEstimate: number
  from: string
  to: string
  date: string
}

interface Message {
  role: 'user' | 'assistant' | 'card'
  content: string
  card?: InquiryCard
}

interface ConciergeChatProps {
  context?: ChatContext
}

const TIER_COLOR: Record<string, string> = {
  VIP: '#C9A84C',
  HIGH: '#60a5fa',
  MEDIUM: '#c084fc',
  LOW: 'rgba(240,237,230,0.4)',
  UNQUALIFIED: 'rgba(240,237,230,0.2)',
}

const STORAGE_KEY = 'marco-chat-v2'
const STORAGE_TTL = 60 * 60 * 1000 // 1h

function loadPersistedMessages(): Message[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { messages, ts } = JSON.parse(raw)
    if (Date.now() - ts > STORAGE_TTL) { sessionStorage.removeItem(STORAGE_KEY); return null }
    return messages
  } catch { return null }
}

function persistMessages(messages: Message[]) {
  try {
    // Don't persist card messages — they'll be re-created via API on next conversation
    const toSave = messages.filter(m => m.role !== 'card')
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: toSave, ts: Date.now() }))
  } catch { /* storage quota exceeded or private mode */ }
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Benvenuto a bordo. Sono Marco, il suo concierge personale per voli privati.\n\nCome posso assisterla oggi? Posso aiutarla con preventivi personalizzati, disponibilità di aeromobili, empty legs o qualsiasi informazione sui nostri servizi.',
}

function InquiryConfirmCard({ card }: { card: InquiryCard }) {
  const [copied, setCopied] = useState(false)
  const [depositState, setDepositState] = useState<'idle' | 'loading' | 'done' | 'noauth'>('idle')
  const [depositUrl, setDepositUrl] = useState<string | null>(null)
  const tierColor = TIER_COLOR[card.leadTier] ?? '#C9A84C'

  const copyId = () => {
    navigator.clipboard.writeText(card.id).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => null)
  }

  const requestDeposit = async () => {
    setDepositState('loading')
    try {
      const res = await fetch('/api/checkout/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: card.id }),
      })
      if (res.status === 401) { setDepositState('noauth'); return }
      const data = await res.json()
      if (res.ok && data.url) {
        setDepositUrl(data.url)
        setDepositState('done')
        window.open(data.url, '_blank', 'noopener')
      } else {
        setDepositState('idle')
      }
    } catch {
      setDepositState('idle')
    }
  }

  return (
    <div style={{ background: '#0A0C14', border: '1px solid rgba(201,168,76,0.25)', padding: '16px', marginTop: 4, maxWidth: '78%' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>RICHIESTA REGISTRATA ✓</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {[
          ['Rotta', `${card.from} → ${card.to}`],
          ['Data', card.date || 'Da definire'],
          ['Preventivo est.', card.estimatedQuote > 0 ? `€${card.estimatedQuote.toLocaleString('it-IT')}` : '—'],
          ['Deposito (30%)', card.depositEstimate > 0 ? `€${card.depositEstimate.toLocaleString('it-IT')}` : '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12, fontFamily: 'Helvetica Neue, sans-serif' }}>
            <span style={{ color: 'rgba(240,237,230,0.4)' }}>{label}</span>
            <span style={{ color: '#F0EDE6', textAlign: 'right' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Deposit CTA */}
      {card.depositEstimate > 0 && (
        <div style={{ marginBottom: 12 }}>
          {depositState === 'noauth' ? (
            <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.5 }}>
              Il team Le invierà il link di pagamento entro 2 ore.
            </div>
          ) : depositState === 'done' && depositUrl ? (
            <a href={depositUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', fontSize: 11, letterSpacing: 1, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.35)', padding: '8px 12px', textAlign: 'center' }}>
              ↗ APRI PAGAMENTO
            </a>
          ) : (
            <button onClick={requestDeposit} disabled={depositState === 'loading'}
              style={{ width: '100%', padding: '8px', fontSize: 11, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif', cursor: depositState === 'loading' ? 'wait' : 'pointer', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', transition: 'all 0.2s', opacity: depositState === 'loading' ? 0.6 : 1 }}>
              {depositState === 'loading' ? 'PREPARAZIONE...' : `PAGA DEPOSITO — €${card.depositEstimate.toLocaleString('it-IT')}`}
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, padding: '2px 8px', color: tierColor, background: `${tierColor}18`, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 0.5 }}>
            {card.leadTier}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>score {card.leadScore}</span>
        </div>
        <button onClick={copyId} style={{ background: 'none', border: 'none', fontSize: 10, color: copied ? '#4ade80' : 'rgba(240,237,230,0.3)', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
          {copied ? '✓ COPIATO' : `#${card.id.slice(-6).toUpperCase()}`}
        </button>
      </div>
    </div>
  )
}

export default function ConciergeChat({ context }: ConciergeChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => loadPersistedMessages() ?? [INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streaming])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300) }, [open])
  useEffect(() => { persistMessages(messages) }, [messages])

  const doStream = useCallback(async (apiMessages: Message[], retrying = false) => {
    abortRef.current = new AbortController()
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content })),
          context,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullPartial = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const raw = line.slice(6) // strip 'data: '
          try {
            const parsed = JSON.parse(raw)

            if (parsed.delta?.text) {
              fullPartial += parsed.delta.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullPartial }
                return updated
              })
            }

            if (parsed.replaceLastMessage) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: parsed.replaceLastMessage }
                return updated
              })
            }

            if (parsed.inquiryCreated) {
              const card: InquiryCard = parsed.inquiryCreated
              setMessages(prev => [...prev, { role: 'card', content: '', card }])
            }

            if (parsed.error) {
              setError(parsed.error)
            }
          } catch { /* partial JSON chunk — ignore */ }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return

      // Retry once on network error
      if (!retrying) {
        await new Promise(r => setTimeout(r, 800))
        return doStream(apiMessages, true)
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Mi scuso, si è verificato un problema tecnico. La prego di riprovare tra un momento.',
        }
        return updated
      })
      setError('Connessione interrotta')
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [context])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const updated: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(updated)
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    await doStream(updated)
  }

  const reset = () => {
    abortRef.current?.abort()
    sessionStorage.removeItem(STORAGE_KEY)
    setMessages([INITIAL_MESSAGE])
    setError(null)
    setStreaming(false)
  }

  const hasNewMessages = messages.length > 1

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Parla con Marco"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, width: 60, height: 60, borderRadius: '50%', background: '#C9A84C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 32px rgba(201,168,76,0.35)', transition: 'transform 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>
        {open ? '✕' : '✦'}
        {/* Unread dot */}
        {!open && hasNewMessages && (
          <span style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #0A0C14' }} />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{ position: 'fixed', bottom: 104, right: 28, zIndex: 199, width: 400, maxWidth: 'calc(100vw - 40px)', background: '#0A0C14', border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', maxHeight: '72vh', animation: 'slideUp 0.25s ease' }}>

          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0A0C14', fontFamily: 'Cormorant Garamond, serif', flexShrink: 0 }}>M</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Marco</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: streaming ? '#C9A84C' : '#22c55e', display: 'inline-block', transition: 'background 0.3s' }} />
                {streaming ? 'Sta scrivendo...' : 'Concierge Privato · 24/7'}
              </div>
            </div>
            {hasNewMessages && (
              <button onClick={reset} title="Nuova conversazione" style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.25)', cursor: 'pointer', fontSize: 18, padding: '4px', flexShrink: 0, lineHeight: 1 }}>↺</button>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', fontSize: 12, color: '#f87171', fontFamily: 'Helvetica Neue, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => {
              if (msg.role === 'card' && msg.card) {
                return <InquiryConfirmCard key={i} card={msg.card} />
              }
              return (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0A0C14', flexShrink: 0, marginTop: 3 }}>M</div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '11px 14px',
                    fontSize: 13,
                    fontFamily: 'Helvetica Neue, sans-serif',
                    lineHeight: 1.65,
                    color: msg.role === 'user' ? '#F0EDE6' : 'rgba(240,237,230,0.85)',
                    background: msg.role === 'user' ? 'rgba(201,168,76,0.12)' : '#0F1220',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {msg.content}
                    {/* Cursor during streaming */}
                    {streaming && i === messages.length - 1 && msg.role === 'assistant' && msg.content.length > 0 && (
                      <span style={{ display: 'inline-block', width: 2, height: 13, background: '#C9A84C', marginLeft: 2, verticalAlign: 'middle', animation: 'pulse-gold 1s infinite' }} />
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {streaming && messages[messages.length - 1]?.content === '' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0A0C14', flexShrink: 0 }}>M</div>
                <div>
                  <div style={{ display: 'flex', gap: 4, padding: '12px 14px', background: '#0F1220', borderRadius: '16px 16px 16px 4px', alignItems: 'center', width: 'fit-content' }}>
                    {[0, 150, 300].map(delay => (
                      <span key={delay} style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9A84C', display: 'block', animation: `pulse-gold 1.2s ${delay}ms infinite` }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.5)', fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic', marginTop: 6, marginLeft: 2 }}>
                    Il tuo Aviation Advisor sta valutando la rotta...
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions — only when chat is fresh */}
          {messages.length <= 1 && (
            <div style={{ padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, borderTop: '1px solid rgba(201,168,76,0.08)' }}>
              {[
                context?.from && context?.to ? `Volo ${context.from} → ${context.to}` : 'Preventivo volo',
                'Empty legs disponibili',
                'Flotta e categorie',
                'Come funziona il deposito',
              ].map(s => (
                <button key={s}
                  onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 0) }}
                  style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.18)', color: 'rgba(240,237,230,0.5)', padding: '4px 10px', fontSize: 10, letterSpacing: 0.8, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Helvetica Neue, sans-serif', flexShrink: 0, transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#C9A84C'; el.style.color = '#C9A84C' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(201,168,76,0.18)'; el.style.color = 'rgba(240,237,230,0.5)' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(201,168,76,0.15)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Scriva qui la sua richiesta..."
              disabled={streaming}
              style={{ flex: 1, background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', color: '#F0EDE6', padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'Helvetica Neue, sans-serif', opacity: streaming ? 0.6 : 1 }}
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              style={{ background: streaming || !input.trim() ? 'rgba(201,168,76,0.3)' : '#C9A84C', border: 'none', color: '#0A0C14', padding: '9px 14px', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', fontSize: 15, transition: 'background 0.2s', flexShrink: 0, fontWeight: 700 }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
