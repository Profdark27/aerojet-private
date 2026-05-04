'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@/lib/tracking'
import { buildWhatsAppUrl, buildWhatsAppUrlForTier } from '@/lib/whatsapp'

const BUDGET_NUMERIC: Record<string, number> = {
  '> €100,000': 150000,
  '€40,000 – €100,000': 70000,
  '€15,000 – €40,000': 27500,
  '€5,000 – €15,000': 10000,
  '< €5,000': 3000,
}

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', fromCity: '', toCity: '', flightDate: '', pax: '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [reqId, setReqId] = useState('')
  const [leadTier, setLeadTier] = useState('')

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    track('lead_submitted', { budgetLabel: form.budget || 'N/D' })
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pax: form.pax ? parseInt(form.pax) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReqId(data.id)
      setLeadTier(data.leadTier || '')
      setStatus('success')

      const tier = data.leadTier || ''
      const ctx = { from: form.fromCity, to: form.toCity, date: form.flightDate, pax: form.pax, budget: form.budget }
      const { url, delay } = buildWhatsAppUrlForTier(tier, ctx)

      if (url !== '#' && delay >= 0) {
        track('whatsapp_auto_opened', { tier, nextAction: data.nextAction || '' })
        if (delay === 0) {
          window.open(url, '_blank', 'noopener,noreferrer')
        } else {
          setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), delay)
        }
      }
    } catch {
      setStatus('error')
    }
  }

  const tierBadge: Record<string, { label: string; color: string; bg: string }> = {
    VIP: { label: '✦ VIP PRIORITY', color: '#C9A84C', bg: 'bg-gold/10' },
    HIGH: { label: '💰 HIGH VALUE', color: '#E8C97A', bg: 'bg-gold/5' },
    MEDIUM: { label: '◆ PREMIUM', color: '#F0EDE6', bg: 'bg-white/5' },
    LOW: { label: '○ STANDARD', color: 'rgba(240,237,230,0.5)', bg: 'bg-white/[0.02]' },
  }
  const badge = tierBadge[leadTier]

  if (status === 'success') return (
    <section id="contact" className="section-padding bg-darker">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-6 text-center"
      >
        <div className="text-6xl text-gold mb-8">✦</div>
        <span className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold">RICHIESTA ACQUISITA</span>
        <h2 className="luxury-heading text-5xl text-white mb-8">Il Suo Viaggio Inizia Ora</h2>

        <div className="inline-flex items-center gap-3 bg-gold/5 border border-gold/20 px-6 py-3 rounded-full mb-12">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] tracking-[0.2em] text-gold uppercase font-bold">Un concierge sta verificando la flotta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
          <div className="glass-card p-6 border-gold/20">
            <div className="text-[8px] tracking-[0.3em] text-cream/30 uppercase mb-2">Codice Pratica</div>
            <div className="text-2xl text-gold font-light tracking-widest">{reqId}</div>
          </div>
          {badge && (
            <div className={`glass-card p-6 border-gold/10 ${badge.bg}`}>
              <div className="text-[8px] tracking-[0.3em] text-cream/30 uppercase mb-2">Livello Servizio</div>
              <div className="text-xs text-white tracking-[0.2em] font-bold uppercase" style={{ color: badge.color }}>{badge.label}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => {
              setStatus('idle')
              setForm({ name: '', email: '', phone: '', fromCity: '', toCity: '', flightDate: '', pax: '', budget: '', message: '' })
              setLeadTier('')
            }}
            className="btn-outline-premium px-10 py-5 text-[10px]"
          >
            NUOVA RICHIESTA ✦
          </button>
          {(leadTier === 'VIP' || leadTier === 'HIGH' || leadTier === 'MEDIUM') && (
            <a
              href={buildWhatsAppUrl(leadTier === 'VIP' ? 'vip' : 'volo', { from: form.fromCity, to: form.toCity, budget: form.budget })}
              target="_blank" rel="noopener noreferrer"
              className="btn-gold-premium px-10 py-5 text-[10px] rounded-sm bg-[#25D366] border-none"
            >
              CHAT CONCIERGE ✦
            </a>
          )}
        </div>
      </motion.div>
    </section>
  )

  return (
    <section id="contact" className="section-padding bg-darker border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          <div className="lg:col-span-5">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
            >
              CONTATTI
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white mb-8"
            >
              Richieda il <br /> <span className="text-gold italic">Suo Preventivo</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-cream/40 text-lg font-light leading-relaxed tracking-wide mb-12"
            >
              Risposta garantita entro 15 minuti. <br />
              Il nostro team globale è operativo 24/7 per assicurarLe la migliore esperienza di volo.
            </motion.p>
            
            <div className="space-y-8">
              {[
                { icon: '✉', label: 'concierge@aerojet.app', sub: 'Assistenza 24/7' },
                { icon: '📞', label: '+39 02 1234 5678', sub: 'Ufficio Milano' },
                { icon: '✦', label: 'Global Network', sub: '8,000+ velivoli certificati' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex gap-6 items-center group"
                >
                  <div className="w-12 h-12 rounded-full border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-darker transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium group-hover:text-gold transition-colors">{item.label}</div>
                    <div className="text-[10px] text-cream/30 uppercase tracking-[0.2em]">{item.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] pointer-events-none" />

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 mb-8 text-xs text-red-400 tracking-widest text-center uppercase">
                  Si è verificato un errore. Per favore, ci contatti telefonicamente.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mb-12">
                <div className="space-y-2">
                  <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Nome Completo *</label>
                  <input className="luxury-input w-full" placeholder="es. Mario Rossi" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Email *</label>
                  <input className="luxury-input w-full" type="email" placeholder="mario@email.it" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Telefono</label>
                  <input className="luxury-input w-full" placeholder="+39 347..." value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Passeggeri</label>
                  <select className="luxury-input w-full" value={form.pax} onChange={e => set('pax', e.target.value)}>
                    <option value="" className="bg-darker">Seleziona</option>
                    {[1,2,4,8,12,16].map(n => <option key={n} value={n} className="bg-darker">{n} pax</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Partenza</label>
                  <input className="luxury-input w-full" placeholder="es. Milano" value={form.fromCity} onChange={e => set('fromCity', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Destinazione</label>
                  <input className="luxury-input w-full" placeholder="es. Londra" value={form.toCity} onChange={e => set('toCity', e.target.value)} />
                </div>
              </div>

              <div className="space-y-4 mb-12">
                <label className="text-[9px] text-gold tracking-[0.3em] uppercase font-bold opacity-60">Messaggio / Note Particolari *</label>
                <textarea 
                  value={form.message} 
                  onChange={e => set('message', e.target.value)}
                  placeholder="Descriva le Sue esigenze (catering, transfer, orari)..."
                  className="w-full bg-transparent border-b border-white/10 text-white p-2 min-h-[100px] outline-none focus:border-gold transition-colors font-light text-sm"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={status === 'loading' || !form.name || !form.email || !form.message}
                className="btn-gold-premium w-full py-6 text-[11px] tracking-[0.4em] relative group overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10">
                  {status === 'loading' ? 'INVIANDO RICHIESTA...' : 'RICHIEDI QUOTAZIONE ✦'}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                <span className="text-[8px] tracking-[0.3em] uppercase font-bold">Privacy Garantita</span>
                <span className="text-gold">✦</span>
                <span className="text-[8px] tracking-[0.3em] uppercase font-bold">Zero Impegno</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
