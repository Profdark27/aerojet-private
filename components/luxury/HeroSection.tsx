'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import CityAutocomplete from './CityAutocomplete'
import ImageWithFallback from '@/components/ImageWithFallback'
import { HERO_BG } from '@/lib/imageAssets'
import { trackEvent } from '@/lib/tracking'

export default function HeroSection() {
  const router = useRouter()
  const [tab, setTab] = useState<'oneway'|'roundtrip'|'multistop'>('oneway')
  const [from, setFrom] = useState('')
  const [fromICAO, setFromICAO] = useState('')
  const [to, setTo] = useState('')
  const [toICAO, setToICAO] = useState('')
  const [date, setDate] = useState('')
  const [pax, setPax] = useState('2')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const stars = useMemo(() => Array.from({ length: 40 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 3,
  })), [])

  const handleSearch = () => {
    trackEvent('hero_search_click', { from, to, pax, date })
    const params = new URLSearchParams({ from, to, date, pax, fromICAO, toICAO })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[105vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={HERO_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105"
          style={{ filter: 'brightness(0.6) contrast(1.1)' }}
          fallback={<div className="absolute inset-0 bg-[#050810]" />}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-darker opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-darker via-transparent to-darker opacity-40" />
      </div>

      {/* Decorative Elements */}
      <div className="bg-noise" />
      
      {mounted && stars.map((s, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          className="absolute rounded-full bg-gold pointer-events-none"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
        />
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-6xl w-full">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-3 glass-panel px-6 py-2 rounded-full mb-10 border border-gold/20"
        >
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse-soft" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-medium">Precision in Private Aviation</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-[clamp(48px,10vw,120px)] leading-[0.95] font-light mb-8 tracking-tight"
        >
          <span className="block opacity-90">Il lusso del tempo.</span>
          <span className="text-gold-gradient italic font-medium">La libertà del cielo.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg md:text-xl text-cream-dim font-light max-w-2xl mx-auto mb-16 leading-relaxed tracking-wide"
        >
          Esplora la flotta globale AeroJet. Voli privati su misura,<br className="hidden md:block" />
          gestiti con la perfezione dell'intelligenza artificiale.
        </motion.p>

        {/* Search Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="glass-panel max-w-5xl mx-auto rounded-sm overflow-hidden shadow-2xl shadow-black/50 border border-white/5"
        >
          {/* Widget Tabs */}
          <div className="flex border-b border-white/5">
            {[
              { id: 'oneway', label: 'Solo Andata' },
              { id: 'roundtrip', label: 'Andata e Ritorno' },
              { id: 'multistop', label: 'Multi-destinazione' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex-1 py-5 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 relative ${
                  tab === t.id ? 'text-gold' : 'text-cream/30 hover:text-cream/60'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-end gap-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 w-full">
              <div className="md:col-span-4">
                <CityAutocomplete 
                  label="PARTENZA" 
                  value={from} 
                  onChange={(city, icao) => { setFrom(city); setFromICAO(icao) }} 
                />
              </div>
              <div className="md:col-span-1 flex items-center justify-center pt-8">
                <div className="w-10 h-[1px] bg-white/10 hidden md:block" />
                <span className="text-gold md:hidden">↓</span>
              </div>
              <div className="md:col-span-4">
                <CityAutocomplete 
                  label="DESTINAZIONE" 
                  value={to} 
                  onChange={(city, icao) => { setTo(city); setToICAO(icao) }} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] uppercase tracking-[0.2em] text-gold mb-3 block opacity-70">Data Partenza</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  className="luxury-input w-full"
                />
              </div>
              <div className="md:col-span-1">
                <label className="text-[9px] uppercase tracking-[0.2em] text-gold mb-3 block opacity-70">Pax</label>
                <select 
                  value={pax} 
                  onChange={e => setPax(e.target.value)}
                  className="luxury-input w-full"
                >
                  {[1,2,4,6,8,12,16].map(n => (
                    <option key={n} value={n} className="bg-darker">{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="btn-gold-premium w-full md:w-auto"
            >
              Cerca Volo ✦
            </button>
          </div>
        </motion.div>

        {/* Verification Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex flex-wrap justify-center gap-10"
        >
          {['EASA CERTIFIED', 'FAA COMPLIANT', 'AOC VERIFIED', 'FULLY INSURED'].map((text) => (
            <div key={text} className="flex items-center gap-3 group cursor-default">
              <div className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
              <span className="text-[10px] tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors uppercase">
                {text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Cinematic Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-darker to-transparent z-10" />

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity"
      >
        <span className="text-[9px] tracking-[0.4em] uppercase font-light">Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  )
}
