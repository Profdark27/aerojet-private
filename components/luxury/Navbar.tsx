'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, Search as SearchIcon } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 ${
          scrolled 
            ? 'py-4' 
            : 'py-8'
        }`}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-700 relative ${
          scrolled 
            ? 'glass-card bg-darker/60 rounded-full px-8 py-2' 
            : 'px-4'
        }`}>
          {/* Neon Top Line (Scrolled) */}
          {scrolled && (
            <motion.div 
              layoutId="navLine"
              className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"
            />
          )}

          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3 no-underline">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-gold/50">
                  <Sparkles size={18} className="text-gold" />
                </div>
                <div className="absolute -inset-1 bg-gold/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif tracking-[0.4em] text-white font-bold leading-none">AEROJET</span>
                <span className="text-[8px] tracking-[0.4em] text-gold uppercase mt-1.5 font-bold">Private Elite</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {[
                ['Charter', '/search'], 
                ['Flotta', '/#fleet'], 
                ['Destinazioni', '/#routes'], 
                ['Empty Legs', '/empty-legs'], 
                ['Concierge', '/#concierge']
              ].map(([label, href]) => (
                <Link 
                  key={label} 
                  href={href} 
                  className="group relative text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all no-underline font-bold"
                >
                  {label}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-gold transition-all duration-500 group-hover:w-full shadow-[0_0_10px_#C9A84C]" />
                </Link>
              ))}
            </div>

            {/* CTA & Actions */}
            <div className="hidden lg:flex items-center gap-8">
              <button className="text-white/30 hover:text-white transition-colors">
                <SearchIcon size={18} strokeWidth={1.5} />
              </button>
              <Link 
                href="/search" 
                className="bg-white text-darker px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all duration-500 neon-glow-gold"
              >
                PRENOTA ✦
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <button 
              className="lg:hidden text-gold p-2"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={24} strokeWidth={1} />
            </button>
          </div>
        </div>
      </nav>

      {/* Futuristic Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-darker/95 backdrop-blur-2xl flex flex-col p-12"
          >
            <div className="absolute top-0 right-0 p-12">
              <button onClick={() => setMenuOpen(false)} className="text-gold hover:rotate-90 transition-transform">
                <X size={40} strokeWidth={0.5} />
              </button>
            </div>

            <div className="flex flex-col gap-10 mt-20">
              {[
                ['Esplora Flotta', '/#fleet'], 
                ['Voli Empty Leg', '/empty-legs'], 
                ['Servizi VIP', '/#concierge'], 
                ['Broker Portal', '/dashboard']
              ].map(([label, href], idx) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={href} 
                    onClick={() => setMenuOpen(false)}
                    className="text-4xl font-serif font-light text-white hover:text-gold no-underline transition-colors tracking-tight"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              <div className="h-[1px] w-full bg-white/5" />
              <div className="flex justify-between items-center text-[10px] text-white/30 uppercase tracking-[0.4em]">
                <span>AeroJet Private Elite</span>
                <span>© 2026</span>
              </div>
              <Link 
                href="/search" 
                onClick={() => setMenuOpen(false)}
                className="btn-gold-premium w-full text-[12px] py-6 rounded-full"
              >
                PRENOTA IL TUO VOLO ✦
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
