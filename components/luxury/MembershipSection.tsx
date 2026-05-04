'use client'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Silver',
    price: '€2,500',
    period: 'anno',
    color: '#9E9E9E',
    perks: ['Sconto 5% su ogni volo', 'Priorità nelle prenotazioni', 'Concierge email 24/7', 'Newsletter Empty Legs esclusiva', 'Accesso app mobile premium'],
  },
  {
    name: 'Gold',
    price: '€8,500',
    period: 'anno',
    color: '#C9A84C',
    featured: true,
    perks: ['Sconto 10% su ogni volo', 'Jet card 25h inclusa', 'Concierge telefono 24/7', 'Accesso sale VIP aeroporto', 'Transfer limousine incluso', 'Catering premium a bordo'],
  },
  {
    name: 'Obsidian',
    price: 'Su richiesta',
    period: '',
    color: '#E8E8E8',
    dark: true,
    perks: ['Sconto 18% su ogni volo', 'Jet card 100h inclusa', 'Jet manager dedicato', 'Catering Michelin a bordo', 'Elicottero last-mile incluso', 'Priority hangar storage'],
  },
]

import { BG_ENGINE_GOLD } from '@/lib/imageAssets'
import ImageWithFallback from '@/components/ImageWithFallback'

export default function MembershipSection() {
  return (
    <section id="membership" className="section-padding bg-[#050810] relative overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <ImageWithFallback
          src={BG_ENGINE_GOLD}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-transparent to-[#050810]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
          >
            MEMBERSHIP
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white mb-6"
          >
            Accesso <span className="text-gold italic">Privilegiato</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-white/70 max-w-lg mx-auto text-lg font-light leading-relaxed tracking-wide"
          >
            Un piano su misura per chi vola con regolarità. <br className="hidden md:block" />
            Più voli, più risparmi, più eccellenza.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch h-full">
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-10 relative flex flex-col ${
                plan.featured ? 'border-gold/40 bg-white/[0.04] md:scale-105 z-10' : ''
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold px-6 py-1.5 text-darker text-[9px] tracking-[0.4em] font-bold uppercase whitespace-nowrap shadow-[0_0_20px_rgba(201,168,76,0.4)]">
                  Consigliato
                </div>
              )}

              <div className="mb-12">
                <h3 className="luxury-heading text-4xl mb-4" style={{ color: plan.color }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl text-white font-light">{plan.price}</span>
                  {plan.period && <span className="text-[10px] text-cream/30 uppercase tracking-widest">/ {plan.period}</span>}
                </div>
              </div>

              <div className="flex-1 space-y-6 mb-12">
                {plan.perks.map((perk, j) => (
                  <div key={j} className="flex items-center gap-4 group/perk">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/40 group-hover/perk:bg-gold transition-colors duration-500" />
                    <span className="text-sm text-white/90 font-medium tracking-wide">{perk}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-5 text-[10px] tracking-[0.3em] font-bold transition-all duration-500 border rounded-sm ${
                  plan.featured 
                    ? 'bg-gold text-darker border-gold hover:bg-gold-light' 
                    : 'bg-transparent text-gold border-gold/20 hover:border-gold/60 hover:text-white'
                }`}
              >
                RICHIEDI ACCESSO ✦
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 text-white/40 text-[10px] tracking-[0.2em] uppercase font-bold"
        >
          Tutti i piani includono IVA. Assistenza legale e burocratica inclusa.
        </motion.p>
      </div>
    </section>
  )
}
