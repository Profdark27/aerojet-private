'use client'
import { motion } from 'framer-motion'
import ImageWithFallback from '@/components/ImageWithFallback'
import { OPERATOR_IMAGES, BG_TERMINAL_NIGHT } from '@/lib/imageAssets'

const operators = [
  { name: 'VistaJet', logo: 'VJ', website: 'https://www.vistajet.com', fleet: '120+ aircraft', routes: 'Global', rating: 4.9, color: '#C41E3A', specialty: 'Ultra-long range & heavy jets', cert: 'EASA / FAA / CAAC' },
  { name: 'NetJets', logo: 'NJ', website: 'https://www.netjets.com', fleet: '750+ aircraft', routes: 'USA & Europe', rating: 4.8, color: '#1A1A2E', specialty: 'Fractional ownership programs', cert: 'FAA Part 135 / EASA' },
  { name: 'Air Charter Service', logo: 'AC', website: 'https://www.aircharterservice.com', fleet: '50,000+ partner jets', routes: 'Worldwide', rating: 4.7, color: '#0D3B66', specialty: 'Group charters & cargo', cert: 'IATA / ICAO' },
  { name: 'Wheels Up', logo: 'WU', website: 'https://www.wheelsup.com', fleet: '300+ aircraft', routes: 'North America', rating: 4.6, color: '#003087', specialty: 'Membership & on-demand', cert: 'FAA Part 135' },
  { name: 'Luxaviation', logo: 'LX', website: 'https://www.luxaviation.com', fleet: '260+ aircraft', routes: 'Europe & ME', rating: 4.8, color: '#2C3E50', specialty: 'VIP & VVIP configurations', cert: 'EASA Part-OPS' },
  { name: 'TAG Aviation', logo: 'TG', website: 'https://www.tagaviation.com', fleet: '80+ aircraft', routes: 'Europe & Asia', rating: 4.7, color: '#1B4332', specialty: 'Business jets & helicopters', cert: 'EASA / CAD Hong Kong' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-[10px] ${i <= Math.floor(rating) ? 'text-gold' : 'text-gold/20'}`}>★</span>
      ))}
      <span className="text-[11px] text-gold/80 ml-1 font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function OperatorsSection() {
  return (
    <section id="operators" className="section-padding bg-darker relative overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <ImageWithFallback
          src={BG_TERMINAL_NIGHT}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-darker" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
          >
            PARTNER CERTIFICATI
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white"
          >
            Operatori di <span className="text-gold italic">Eccellenza</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {operators.map((op, i) => (
            <motion.a 
              key={i} 
              href={op.website} 
              target="_blank" 
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group block glass-card p-6 md:p-8 hover:bg-white/[0.03] no-underline"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border border-white/5 shadow-2xl">
                  <ImageWithFallback
                    src={OPERATOR_IMAGES[op.name]}
                    alt={`${op.name} logo`}
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white tracking-widest" style={{ background: op.color }}>
                        {op.logo}
                      </div>
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-2xl font-light text-white group-hover:text-gold transition-colors">{op.name}</h3>
                    <div className="px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                      <span className="text-[8px] text-gold tracking-widest uppercase font-bold">Verified AOC</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-cream/40 uppercase tracking-widest">
                      <span className="text-gold/40">FLOTTA</span> {op.fleet}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-cream/40 uppercase tracking-widest">
                      <span className="text-gold/40">ROTTE</span> {op.routes}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-cream/40 uppercase tracking-widest">
                      <span className="text-gold/40">SAFETY</span> {op.cert}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block w-48 text-right">
                  <div className="text-[9px] text-cream/20 uppercase tracking-[0.2em] mb-2 font-medium">Specializzazione</div>
                  <div className="text-xs text-cream/50 font-light leading-relaxed truncate">{op.specialty}</div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-4 ml-auto">
                  <Stars rating={op.rating} />
                  <div className="text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 text-xl">
                    →
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Global Network Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent">
            <div className="bg-darker px-10 py-6 border border-white/5 glass-panel">
              <p className="text-cream/30 text-[11px] tracking-widest mb-4">
                Accesso alla rete Avinode — oltre 4,500 operatori in 85 paesi
              </p>
              <a 
                href="https://www.avinode.com/become-a-member" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] tracking-[0.3em] text-gold uppercase font-bold hover:text-white transition-colors no-underline"
              >
                ESPLORA TUTTA LA RETE AVINODE ✦
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
