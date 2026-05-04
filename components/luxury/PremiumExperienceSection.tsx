'use client'
import { motion } from 'framer-motion'
import ImageWithFallback from '@/components/ImageWithFallback'

export default function PremiumExperienceSection() {
  const experiences = [
    {
      img: '/images/cabin-lounge.webp',
      title: 'COMFORT SENZA COMPROMESSI',
      desc: 'Cabine configurate per massimizzare lo spazio e il relax. Materiali pregiati e design ergonomico.'
    },
    {
      img: '/images/service-catering.webp',
      title: 'CATERING STELLATO',
      desc: 'Menu personalizzati preparati dai migliori chef. Un\'esperienza culinaria d\'alta quota.'
    },
    {
      img: '/images/transfer-black-car.webp',
      title: 'TRANSFER DEDICATO',
      desc: 'Dal vostro domicilio fin sotto bordo, con autisti professionisti e veicoli di lusso.'
    }
  ]

  return (
    <section className="section-padding bg-darker border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
          >
            ESCLUSIVITÀ AEROJET
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white"
          >
            L'Arte del Viaggio <span className="text-gold italic">Privato</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {experiences.map((exp, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-8 border border-white/5">
                <ImageWithFallback
                  src={exp.img}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  fallback={<div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-gold/20 italic">AeroJet Experience</div>}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-darker/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                
                {/* Subtle light sweep on hover */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.2s] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              
              <h3 className="text-xs tracking-[0.3em] text-gold font-bold mb-4">
                {exp.title}
              </h3>
              
              <p className="text-cream/50 text-sm leading-relaxed font-light tracking-wide group-hover:text-cream/70 transition-colors duration-500">
                {exp.desc}
              </p>

              <div className="mt-6 w-8 h-[1px] bg-gold/30 group-hover:w-16 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Decorative quote or motto at bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-32 text-center"
        >
          <div className="inline-block px-10 py-1 border-x border-gold/20">
            <span className="text-[10px] tracking-[0.6em] text-cream/20 uppercase font-light italic">Non è solo un volo. È AeroJet.</span>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
