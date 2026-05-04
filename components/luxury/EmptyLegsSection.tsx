'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EmptyLeg } from '@/lib/avinode'

export default function EmptyLegsSection() {
  const [legs, setLegs] = useState<EmptyLeg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/avinode/empty-legs')
      .then(r => r.json())
      .then(d => { setLegs(d.legs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="emptylegs" className="section-padding bg-[#050810] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,168,76,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
            >
              OPPORTUNITÀ ESCLUSIVE
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white mb-6"
            >
              Empty Legs<br /><span className="text-gold italic">Vola a Metà Prezzo</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-cream/40 max-w-sm text-lg font-light leading-relaxed tracking-wide italic"
          >
            "L'essenza del lusso è cogliere l'opportunità perfetta nel momento ideale."
          </motion.p>
        </div>

        {/* Live indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
          </div>
          <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase font-medium">Live Terminal: Disponibilità Real-Time</span>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 glass-card animate-pulse bg-white/[0.02]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {legs.map((leg, i) => (
                <motion.div 
                  key={leg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 group relative overflow-hidden"
                >
                  {/* Discount badge */}
                  <div className="absolute top-0 right-0 bg-gold px-4 py-2 text-darker text-[10px] font-bold tracking-tighter">
                    -{leg.discountPct}%
                  </div>

                  {/* Route - Flight Board Style */}
                  <div className="flex justify-between items-center mb-10 pt-4">
                    <div className="text-center">
                      <div className="text-3xl font-light text-white mb-1">{leg.fromICAO}</div>
                      <div className="text-[9px] text-gold tracking-widest uppercase opacity-60">{leg.fromCity}</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center px-4">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent relative">
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          className="absolute top-[-2px] left-0 w-2 h-2 rounded-full bg-gold blur-[2px]"
                        />
                      </div>
                      <span className="text-[10px] mt-2 text-gold opacity-40">✦</span>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-light text-white mb-1">{leg.toICAO}</div>
                      <div className="text-[9px] text-gold tracking-widest uppercase opacity-60">{leg.toCity}</div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div>
                      <div className="text-[8px] text-cream/30 uppercase tracking-[0.2em] mb-1">Data Partenza</div>
                      <div className="text-xs text-cream/70 font-medium">
                        {new Date(leg.departureDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-cream/30 uppercase tracking-[0.2em] mb-1">Velivolo</div>
                      <div className="text-xs text-cream/70 font-medium truncate">{leg.aircraft}</div>
                    </div>
                  </div>

                  {/* Pricing & Call to Action */}
                  <div className="flex items-end justify-between pt-6 border-t border-white/5">
                    <div>
                      <div className="text-[9px] text-cream/20 line-through mb-1">€{leg.originalPrice.toLocaleString('it-IT')}</div>
                      <div className="text-2xl text-gold font-light">€{leg.discountedPrice.toLocaleString('it-IT')}</div>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/search?from=${encodeURIComponent(leg.fromCity)}&fromICAO=${leg.fromICAO}&to=${encodeURIComponent(leg.toCity)}&toICAO=${leg.toICAO}&date=${leg.departureDate}&pax=${leg.pax}`}
                      className="btn-outline-premium px-6 py-3 text-[9px] border-gold/20"
                    >
                      PRENOTA ✦
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-cream/30 text-[11px] tracking-widest mb-10">
            Le disponibilità si aggiornano ogni 15 minuti. <br className="hidden md:block" />
            Iscriviti per ricevere alert in tempo reale sulla flotta.
          </p>
          <button 
            onClick={() => {
              const email = window.prompt('Inserisca la sua email per ricevere alert sugli empty legs:')
              if (!email) return
              // Simulating API call
              alert('✦ Richiesta inoltrata. Riceverà una notifica non appena il terminal sarà aggiornato.')
            }}
            className="btn-gold-premium px-12 py-5 text-[10px] tracking-[0.4em]"
          >
            ATTIVA ALERT TERMINAL ✦
          </button>
        </motion.div>
      </div>
    </section>
  )
}
