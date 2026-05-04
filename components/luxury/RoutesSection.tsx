'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { POPULAR_ROUTES } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'
import { ROUTE_IMAGES } from '@/lib/imageAssets'

export default function RoutesSection() {
  return (
    <section className="section-padding bg-darker overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.5em] text-gold uppercase mb-4 block font-semibold"
          >
            ROTTE POPOLARI
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="luxury-heading text-[clamp(40px,6vw,72px)] font-light text-white mb-6"
          >
            Destinazioni <span className="text-gold italic">Più Richieste</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POPULAR_ROUTES.map((route, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card group overflow-hidden"
            >
              <div className="relative h-40 overflow-hidden">
                <ImageWithFallback
                  src={ROUTE_IMAGES[route.from] ?? ROUTE_IMAGES[route.to]}
                  alt={`Vista di ${route.from}`}
                  fill
                  sizes="400px"
                  className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                  fallback={
                    <div className="w-full h-full bg-gradient-to-br from-gold/10 to-darker flex items-center justify-center">
                      <span className="text-[10px] tracking-[0.5em] text-gold/30 uppercase">{route.from}</span>
                    </div>
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <div className="text-[10px] text-gold tracking-widest uppercase font-bold">Standard rate</div>
                  <div className="text-2xl text-white font-light">{route.price}</div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex-1">
                    <div className="text-xl font-light text-white group-hover:text-gold transition-colors">{route.from}</div>
                    <div className="w-8 h-[1px] bg-gold/30 my-2" />
                    <div className="text-xl font-light text-white group-hover:text-gold transition-colors">{route.to}</div>
                  </div>
                  <div className="text-gold opacity-20 text-4xl font-serif">✦</div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4 text-[10px] text-white/60 tracking-widest uppercase font-medium">
                    <span>⏱ {route.time}</span>
                    <span className="text-gold/40">•</span>
                    <span>{route.category}</span>
                  </div>
                  <Link 
                    href={`/search?from=${route.from}&to=${route.to}&fromICAO=${route.fromICAO}&toICAO=${route.toICAO}`}
                    className="text-[9px] tracking-[0.2em] text-gold hover:text-white transition-colors font-bold no-underline"
                  >
                    PRENOTA ORA →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
