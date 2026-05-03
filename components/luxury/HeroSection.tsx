'use client';
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { loadSplineScene } from '@/lib/spline'
import { motion, AnimatePresence } from 'framer-motion'
import CityAutocomplete from './CityAutocomplete'
import ImageWithFallback from '@/components/ImageWithFallback'
import { HERO_BG, HERO_JET_3D } from '@/lib/imageAssets'
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
    // Load the Spline scene when component mounts
    loadSplineScene('#spline-jet', '/splines/jet-scene.json');
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 bg-[#020408]">
      
      {/* Cinematic Background Layer */}
      <motion.div 
        animate={{ scale: 1.05 + Math.abs(mousePos.x / 1000) }}
        transition={{ type: 'spring', stiffness: 20, damping: 30 }}
        className="absolute inset-0 z-0"
      >
        <ImageWithFallback
          src={HERO_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.1)' }}
          fallback={<div className="absolute inset-0 bg-[#050810]" />}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-[#020408] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020408_80%)] opacity-60" />
      </motion.div>

      {/* 3D Floating Jet Element */}
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, x: 200, y: 100, rotate: -5 }}
            animate={{ 
              opacity: 1, 
              x: mousePos.x * 2, 
              y: mousePos.y * 2 + Math.sin(Date.now() / 1000) * 10,
              rotate: mousePos.x / 10 
            }}
            transition={{ type: 'spring', stiffness: 15, damping: 25 }}
            className="absolute top-1/4 right-[10%] w-[40vw] max-w-[600px] pointer-events-none z-10 select-none hidden lg:block"
          >
            {/* Spline 3D Jet Container */}
            <div id="spline-jet" className="w-full h-full pointer-events-none" />
            {/* Engine Glow Effect */}
            <div className="absolute top-[45%] right-[20%] w-20 h-20 bg-gold/20 rounded-full blur-[40px] animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Field Overlay */}
      {mounted && stars.map((s, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          className="absolute rounded-full bg-gold/40 pointer-events-none z-[1]"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-20 text-center max-w-7xl w-full">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2 rounded-full mb-8 border border-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#C5A572]" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-cream/80 font-medium">L'Eccellenza nel Volo Privato</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-[clamp(44px,8vw,110px)] leading-[0.9] font-light mb-10 tracking-tighter"
        >
          <span className="block text-white mb-2">Eleviamo il Suo</span>
          <span className="text-gold-gradient italic font-serif">Viaggio.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl text-cream/60 font-light max-w-2xl mx-auto mb-16 leading-relaxed tracking-wide"
        >
          Acceda alla flotta più esclusiva al mondo. <br className="hidden md:block" />
          Voli privati on-demand, ridefiniti con intelligenza artificiale e discrezione assoluta.
        </motion.p>

        {/* Floating Search Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-transparent to-gold/20 rounded-2xl blur-2xl opacity-20" />
          
          <div className="relative glass-panel bg-black/40 backdrop-blur-[40px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            {/* Tabs */}
            <div className="flex bg-white/5 border-b border-white/5">
              {[
                { id: 'oneway', label: 'Sola Andata' },
                { id: 'roundtrip', label: 'Ritorno' },
                { id: 'multistop', label: 'Multi-Leg' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex-1 py-5 text-[10px] uppercase tracking-[0.3em] font-medium transition-all duration-300 relative ${
                    tab === t.id ? 'text-gold' : 'text-cream/30 hover:text-cream/50'
                  }`}
                >
                  {t.label}
                  {tab === t.id && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold shadow-[0_0_15px_#C5A572]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Main Form */}
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-4">
                  <CityAutocomplete 
                    label="Origine" 
                    value={from} 
                    onChange={(city, icao) => { setFrom(city); setFromICAO(icao) }} 
                  />
                </div>
                <div className="md:col-span-1 flex items-center justify-center pb-4">
                  <motion.div 
                    whileHover={{ rotate: 180 }}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors"
                  >
                    <span className="text-gold text-lg">⇄</span>
                  </motion.div>
                </div>
                <div className="md:col-span-4">
                  <CityAutocomplete 
                    label="Destinazione" 
                    value={to} 
                    onChange={(city, icao) => { setTo(city); setToICAO(icao) }} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-gold mb-3 block opacity-70">Partenza</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="luxury-input w-full bg-white/5 border-white/10 rounded-lg py-3 px-4 text-cream"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[9px] uppercase tracking-[0.2em] text-gold mb-3 block opacity-70">Pax</label>
                  <select 
                    value={pax} 
                    onChange={e => setPax(e.target.value)}
                    className="luxury-input w-full bg-white/5 border-white/10 rounded-lg py-3 px-4 text-cream"
                  >
                    {[1,2,4,6,8,12,16].map(n => (
                      <option key={n} value={n} className="bg-darker">{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="accent-gold w-4 h-4 rounded border-white/10 bg-white/5" />
                    <span className="text-[10px] text-cream/40 group-hover:text-cream/60 transition-colors uppercase tracking-widest">Opzioni Pet-Friendly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="accent-gold w-4 h-4 rounded border-white/10 bg-white/5" />
                    <span className="text-[10px] text-cream/40 group-hover:text-cream/60 transition-colors uppercase tracking-widest">Fumatori Ammessi</span>
                  </label>
                </div>
                <button 
                  onClick={handleSearch}
                  className="btn-gold-premium px-12 py-5 text-xs tracking-[0.3em] font-bold min-w-[240px] relative overflow-hidden group"
                >
                  <span className="relative z-10">RICHIEDI QUOTAZIONE ✦</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          {['ARGUS PLATINUM', 'WYVERN REGISTERED', 'EASA CERTIFIED', 'AOC LICENSED'].map((text) => (
            <span key={text} className="text-[9px] tracking-[0.4em] font-light text-cream/80">{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Decorative Bottom Vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#020408] to-transparent pointer-events-none z-[5]" />

      {/* Scroll Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 hidden md:flex flex-col items-center gap-3"
      >
        <span className="text-[8px] tracking-[0.5em] uppercase text-cream/50">Scopri AeroJet</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-gold/50 to-transparent" />
      </motion.div>
    </section>
  )
}
