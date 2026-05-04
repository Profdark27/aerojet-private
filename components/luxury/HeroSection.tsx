'use client';
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { loadSplineScene } from '@/lib/spline'
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Lazy load Spline
    const timer = setTimeout(() => {
      loadSplineScene('#spline-jet', '/splines/jet-scene.json');
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    }
  }, []);

  const handleSearch = () => {
    trackEvent('hero_search_click', { from, to, pax, date })
    const params = new URLSearchParams({ from, to, date, pax, fromICAO, toICAO })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 bg-darker">
      
      {/* 1. Futuristic Grid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-darker opacity-100" />
      </div>

      {/* 2. Neon Orbs (Background) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 3. 3D Spline Jet */}
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: mousePos.x * 1.5, 
              y: mousePos.y * 1.5 + Math.sin(Date.now() / 2000) * 15,
            }}
            transition={{ type: 'spring', stiffness: 20, damping: 35 }}
            className="absolute top-1/4 right-[5%] w-[45vw] aspect-square pointer-events-none z-10 hidden lg:block"
          >
            <div id="spline-jet" className="w-full h-full opacity-60 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-r from-darker via-transparent to-transparent z-20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Content Area */}
      <div className="relative z-20 text-center max-w-7xl w-full">
        
        {/* Floating Batch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-2 rounded-full mb-10 border border-white/10 neon-glow-gold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
          <span className="text-[9px] uppercase tracking-[0.5em] text-white/80 font-bold">The Gold Standard of Aviation</span>
        </motion.div>

        {/* Hero Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="luxury-heading text-[clamp(40px,8vw,110px)] mb-8"
        >
          <span className="block text-white">Domina il Cielo.</span>
          <span className="bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent italic font-light tracking-tighter">
            Senza Compromessi.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          className="text-lg md:text-xl text-white/50 font-light max-w-3xl mx-auto mb-16 leading-relaxed tracking-widest"
        >
          Benvenuti nell'era dell'aviazione privata intelligente. <br/>
          Pianifica, prenota e decolla in meno di 2 ore verso qualsiasi destinazione globale.
        </motion.p>

        {/* Futuristic Search Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto w-full group"
        >
          {/* External Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-white/5 to-gold/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative glass-card bg-black/40 backdrop-blur-[80px] rounded-3xl overflow-hidden shadow-2xl">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
              {[
                { id: 'oneway', label: 'Solo Andata' },
                { id: 'roundtrip', label: 'Andata e Ritorno' },
                { id: 'multistop', label: 'Multi-Leg' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 min-w-[140px] py-6 text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-500 relative ${
                    tab === t.id ? 'text-white' : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  {t.label}
                  {tab === t.id && (
                    <motion.div 
                      layoutId="tabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-4 group/field">
                  <CityAutocomplete 
                    label="Origine" 
                    value={from} 
                    onChange={(city, icao) => { setFrom(city); setFromICAO(icao) }} 
                  />
                  <div className="h-[1px] w-0 group-hover/field:w-full bg-gold/50 transition-all duration-700" />
                </div>
                <div className="md:col-span-1 flex items-center justify-center pb-4">
                  <motion.div 
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer text-gold hover:border-gold transition-all"
                  >
                    ⇄
                  </motion.div>
                </div>
                <div className="md:col-span-4 group/field">
                  <CityAutocomplete 
                    label="Destinazione" 
                    value={to} 
                    onChange={(city, icao) => { setTo(city); setToICAO(icao) }} 
                  />
                  <div className="h-[1px] w-0 group-hover/field:w-full bg-gold/50 transition-all duration-700" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gold/60 mb-3 block">Partenza</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-gold/60 mb-3 block">Pax</label>
                  <select 
                    value={pax} 
                    onChange={e => setPax(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-gold/50 transition-colors appearance-none"
                  >
                    {[1,2,4,8,12,16].map(n => <option key={n} value={n} className="bg-darker">{n}</option>)}
                  </select>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">
                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-gold transition-colors">
                      <div className="w-2 h-2 bg-gold scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                    <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-[0.2em]">Catering VIP</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-gold transition-colors">
                      <div className="w-2 h-2 bg-gold scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                    <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-[0.2em]">Concierge Limousine</span>
                  </label>
                </div>

                <button 
                  onClick={handleSearch}
                  className="btn-gold-premium w-full md:w-auto px-16 py-6 text-xs"
                >
                  RICHIEDI QUOTAZIONE SMART ✦
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-darker to-transparent z-20 pointer-events-none" />
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold/50 to-transparent" />
      </motion.div>
    </section>
  )
}

