'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, RotateCcw, X, MessageSquare, ShieldCheck, Zap } from 'lucide-react'
import { trackEvent } from '@/lib/tracking'

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
    const toSave = messages.filter(m => m.role !== 'card')
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: toSave, ts: Date.now() }))
  } catch { }
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Benvenuto. Sono Marco, il suo Aviation Advisor dedicato.\n\nCome posso assisterla oggi? Sono a disposizione per verificare disponibilità, opzionare aeromobili o fornirle quotazioni in tempo reale.',
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-darker border border-gold/30 p-5 rounded-sm my-4 shadow-xl shadow-black/40"
    >
      <div className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-gold font-bold mb-4 uppercase">
        <ShieldCheck size={12} /> Richiesta Confermata
      </div>

      <div className="space-y-3 mb-6">
        {[
          ['Rotta', `${card.from} → ${card.to}`],
          ['Data', card.date || 'Da definire'],
          ['Preventivo est.', card.estimatedQuote > 0 ? `€${card.estimatedQuote.toLocaleString('it-IT')}` : '—'],
          ['Deposito (30%)', card.depositEstimate > 0 ? `€${card.depositEstimate.toLocaleString('it-IT')}` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-center text-[12px]">
            <span className="text-white/40">{label}</span>
            <span className="text-white font-medium">{value}</span>
          </div>
        ))}
      </div>

      {card.depositEstimate > 0 && (
        <div className="mb-6">
          {depositState === 'noauth' ? (
            <p className="text-[10px] text-white/40 leading-relaxed italic">
              Il team Le invierà il link di pagamento non appena l'operatore confermerà gli slot.
            </p>
          ) : depositState === 'done' && depositUrl ? (
            <a href={depositUrl} target="_blank" rel="noopener noreferrer" className="btn-gold-premium w-full text-[10px] py-3">
              Completa Deposito ↗
            </a>
          ) : (
            <button 
              onClick={requestDeposit} 
              disabled={depositState === 'loading'}
              className="w-full bg-gold/10 border border-gold/30 text-gold py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-gold hover:text-darker transition-all disabled:opacity-50"
            >
              {depositState === 'loading' ? 'ELABORAZIONE...' : `Paga Deposito · €${card.depositEstimate.toLocaleString('it-IT')}`}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[9px] px-2 py-0.5 rounded-sm font-bold tracking-tighter" style={{ color: tierColor, background: `${tierColor}15` }}>
            {card.leadTier}
          </span>
          <span className="text-[9px] text-white/20 uppercase tracking-widest">Score {card.leadScore}</span>
        </div>
        <button onClick={copyId} className="text-[9px] text-white/30 hover:text-gold transition-colors font-mono">
          {copied ? '✓ COPIATO' : `#${card.id.slice(-6).toUpperCase()}`}
        </button>
      </div>
    </motion.div>
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
          const raw = line.slice(6)
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
              trackEvent('inquiry_sent', { id: card.id, from: card.from, to: card.to })
            }

            if (parsed.error) setError(parsed.error)
          } catch { }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (!retrying) {
        await new Promise(r => setTimeout(r, 800))
        return doStream(apiMessages, true)
      }
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Mi scuso, il sistema sta processando troppe richieste. La prego di riprovare.' }
        return updated
      })
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

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-10 right-8 z-[200] group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gold rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-16 h-16 rounded-full bg-gold flex items-center justify-center text-darker shadow-2xl group-active:scale-90 transition-transform">
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                  <X size={24} strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div key="chat" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Sparkles size={24} strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
            {!open && messages.length > 1 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-dark" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-28 right-8 z-[199] w-[420px] max-w-[calc(100vw-40px)] glass-panel overflow-hidden shadow-2xl shadow-black/80 flex flex-col h-[70vh] rounded-sm"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-darker font-serif text-xl font-bold">M</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-dark-card" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Marco</h3>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase flex items-center gap-1.5">
                    {streaming ? (
                      <span className="text-gold animate-pulse">Analisi in corso...</span>
                    ) : (
                      <>Aviation Concierge · <span className="text-emerald-400/80">Online</span></>
                    )}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setMessages([INITIAL_MESSAGE]); persistMessages([INITIAL_MESSAGE]); }}
                className="p-2 text-white/20 hover:text-gold transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-1">M</div>
                  )}
                  {msg.role === 'card' && msg.card ? (
                    <InquiryConfirmCard card={msg.card} />
                  ) : (
                    <div className={`max-w-[85%] px-5 py-4 text-[13.5px] leading-relaxed tracking-wide ${
                      msg.role === 'user' 
                        ? 'bg-gold/10 text-white rounded-2xl rounded-tr-none border border-gold/10' 
                        : 'bg-white/5 text-white/80 rounded-2xl rounded-tl-none border border-white/5'
                    }`}>
                      {msg.content || (streaming && i === messages.length - 1 && <span className="inline-block w-2 h-4 bg-gold/50 animate-pulse" />)}
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {[
                  'Verifica disponibilità per Dubai',
                  'Quali sono i vantaggi VIP?',
                  'Preventivo per Olbia'
                ].map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="flex-shrink-0 px-4 py-2 border border-white/5 rounded-full text-[10px] text-white/40 hover:border-gold/30 hover:text-gold transition-all whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-white/5 border-t border-white/5">
              <div className="relative flex items-center">
                <input 
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Come posso aiutarla oggi?"
                  className="w-full bg-dark/50 border border-white/5 rounded-sm px-5 py-4 text-sm text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-all pr-12"
                  disabled={streaming}
                />
                <button 
                  onClick={send}
                  disabled={streaming || !input.trim()}
                  className="absolute right-3 p-2 text-gold hover:text-gold-light disabled:opacity-30 disabled:hover:text-gold transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-3 text-[9px] text-center text-white/20 uppercase tracking-[0.2em] font-medium">
                <Zap size={8} className="inline mr-1" /> AI Powered Aviation Concierge
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
