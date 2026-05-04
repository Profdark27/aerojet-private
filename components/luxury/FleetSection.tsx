'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FLEET_CATEGORIES } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'
import { FLEET_IMAGES, FLEET_ALT, BG_SUNSET_CLOUDS } from '@/lib/imageAssets'

export default function FleetSection() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <section id="fleet" className="section-padding bg-darker relative overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <ImageWithFallback
          src={BG_SUNSET_CLOUDS}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-darker" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
          >
            LA FLOTTA
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white mb-6"
          >
            Scegli il Tuo <span className="text-gold italic">Velivolo</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-white/70 max-w-xl mx-auto text-lg font-light leading-relaxed tracking-wide"
          >
            Dalla tratta regionale al volo intercontinentale non-stop, <br className="hidden md:block" />
            ogni categoria è pensata per un'esperienza d'eccellenza.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FLEET_CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              layout
              onClick={() => setSelected(selected === i ? null : i)}
              className={`glass-card p-8 cursor-pointer relative group ${
                selected === i ? 'ring-1 ring-gold/40 bg-white/[0.03]' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-transform duration-500 group-hover:scale-110">
                  {cat.icon}
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gold tracking-widest uppercase mb-1 opacity-70">A partire da</div>
                  <div className="text-lg font-medium text-white">{cat.priceHint}</div>
                </div>
              </div>

              <h3 className="luxury-heading text-3xl text-white mb-2 group-hover:text-gold transition-colors">
                {cat.label}
              </h3>
              
              <div className="flex gap-4 text-[10px] tracking-[0.2em] text-white/60 uppercase font-bold mb-8">
                <span>{cat.range}</span>
                <span className="text-gold/40">•</span>
                <span>{cat.pax}</span>
              </div>

              <AnimatePresence mode="wait">
                {selected === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t border-white/10 space-y-6">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-white/5">
                        <ImageWithFallback
                          src={FLEET_IMAGES[cat.value]}
                          alt={FLEET_ALT[cat.value] ?? `${cat.label} in volo`}
                          fill
                          sizes="400px"
                          className="object-cover transition-transform duration-1000 hover:scale-110"
                          fallback={
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <span className="text-white/10 text-6xl">{cat.icon}</span>
                            </div>
                          }
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      </div>

                      <p className="text-sm text-cream/60 leading-relaxed font-light">
                        {cat.value === 'turboprop' && 'Ideale per tratte brevi, isole e aeroporti minori. Eccellente comfort per trasferimenti regionali.'}
                        {cat.value === 'light' && 'La scelta perfetta per viaggi business in Europa. Cabina moderna, velocità e puntualità.'}
                        {cat.value === 'midsize' && 'Cabina stand-up, ideale per 7-9 passeggeri. Copre la maggior parte delle rotte europee senza scalo.'}
                        {cat.value === 'supermid' && 'Non-stop Europa–East Coast USA. Cabina premium con letto flat-bed su richiesta.'}
                        {cat.value === 'heavy' && 'Intercontinentale con comfort massimo. Camera da letto, bagno completo, cucina di bordo.'}
                        {cat.value === 'ultralong' && 'Qualsiasi coppia di città sul pianeta senza scalo. L\'esperienza più esclusiva del trasporto privato.'}
                      </p>

                      <Link 
                        href={`/search?category=${cat.value}`}
                        className="btn-gold-premium w-full py-4 rounded-sm text-[10px] tracking-[0.3em]"
                      >
                        RICHIEDI PREVENTIVO ✦
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
