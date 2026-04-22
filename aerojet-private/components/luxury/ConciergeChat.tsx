'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ConciergeChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Benvenuto a bordo. Sono Marco, il suo concierge personale per voli privati.\n\nCome posso assisterla oggi? Posso aiutarla con preventivi personalizzati, disponibilità di aeromobili, empty legs o qualsiasi informazione sui nostri servizi.' }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setStreaming(true)

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) throw new Error('API error')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.replace('data: ', '')
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.delta?.text || ''
            full += delta
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: full }
              return updated
            })
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Mi scuso, si è verificato un problema tecnico. La prego di riprovare tra un momento.' }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen(!open)}
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, width: 60, height: 60, borderRadius: '50%', background: '#C9A84C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 32px rgba(201,168,76,0.35)', animation: 'pulse-gold 3s infinite', transition: 'transform 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        {open ? '✕' : '✦'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{ position: 'fixed', bottom: 104, right: 28, zIndex: 199, width: 380, maxWidth: 'calc(100vw - 40px)', background: '#0A0C14', border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease', maxHeight: '70vh' }}>

          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#0A0C14', fontFamily: 'Cormorant Garamond, serif' }}>M</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Marco</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Concierge Privato · Disponibile 24/7
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0A0C14', flexShrink: 0, marginTop: 2 }}>M</div>
                )}
                <div className={msg.role === 'user' ? 'chat-user' : 'chat-marco'}
                  style={{ maxWidth: '78%', padding: '12px 16px', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.6, color: msg.role === 'user' ? '#F0EDE6' : 'rgba(240,237,230,0.85)', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                  {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span style={{ display: 'inline-block', width: 2, height: 14, background: '#C9A84C', marginLeft: 2, animation: 'pulse-gold 1s infinite', verticalAlign: 'middle' }} />
                  )}
                </div>
              </div>
            ))}
            {streaming && messages[messages.length - 1]?.content === '' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0A0C14', flexShrink: 0 }}>M</div>
                <div style={{ display: 'flex', gap: 4, padding: '14px 16px', background: '#0F1220', borderRadius: '16px 16px 16px 4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', display: 'block', animation: `pulse-gold 1s ${j * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div style={{ padding: '8px 16px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0, borderTop: '1px solid rgba(201,168,76,0.08)' }}>
            {['Preventivo volo', 'Empty legs oggi', 'Flotta disponibile', 'Come funziona'].map(s => (
              <button key={s} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 0) }}
                style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.55)', padding: '5px 12px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Helvetica Neue, sans-serif', flexShrink: 0, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.color = '#C9A84C' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.55)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(201,168,76,0.15)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Scriva qui la sua richiesta..."
              style={{ flex: 1, background: '#0F1220', border: '1px solid rgba(201,168,76,0.15)', color: '#F0EDE6', padding: '10px 14px', fontSize: 14, outline: 'none', fontFamily: 'Helvetica Neue, sans-serif' }} />
            <button onClick={send} disabled={streaming}
              style={{ background: streaming ? 'rgba(201,168,76,0.4)' : '#C9A84C', border: 'none', color: '#0A0C14', padding: '10px 16px', cursor: streaming ? 'not-allowed' : 'pointer', fontSize: 16, transition: 'background 0.2s', flexShrink: 0 }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
