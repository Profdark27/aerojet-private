'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'

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
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-8 md:px-16 ${
          scrolled 
            ? 'py-4 glass-panel border-b border-white/5 bg-dark-glass' 
            : 'py-8 bg-transparent'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 no-underline">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-500 ${scrolled ? 'bg-gold/10 text-gold' : 'text-white'}`}>
              <Sparkles size={20} className={scrolled ? 'animate-pulse-soft' : ''} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif tracking-[0.4em] text-white font-bold leading-none">AEROJET</span>
              <span className="text-[9px] tracking-[0.2em] text-gold uppercase mt-1 font-medium">Private</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            {[
              ['Charter', '/search'], 
              ['Flotta', '/#fleet'], 
              ['Operatori', '/#operators'], 
              ['Empty Legs', '/empty-legs'], 
              ['Membership', '/#membership']
            ].map(([label, href]) => (
              <Link 
                key={label} 
                href={href} 
                className="text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-gold transition-colors no-underline font-medium"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white no-underline font-bold transition-colors"
            >
              Broker Area
            </Link>
            <Link 
              href="/search" 
              className="btn-gold-premium px-8 py-3.5"
            >
              Prenota ✦
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden text-gold p-2"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-darker flex flex-col p-10"
          >
            <div className="flex justify-between items-center mb-20">
              <div className="flex flex-col">
                <span className="text-xl font-serif tracking-[0.4em] text-white font-bold">AEROJET</span>
                <span className="text-[9px] tracking-[0.2em] text-gold uppercase mt-1">Private</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-gold p-2">
                <X size={32} strokeWidth={1} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {[
                ['Charter', '/search'], 
                ['Flotta', '/#fleet'], 
                ['Operatori', '/#operators'], 
                ['Empty Legs', '/empty-legs'], 
                ['Membership', '/#membership'],
                ['Broker Dashboard', '/dashboard']
              ].map(([label, href], idx) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={href} 
                    onClick={() => setMenuOpen(false)}
                    className="text-3xl font-serif font-light text-white/80 hover:text-gold no-underline transition-colors tracking-wide"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto">
              <Link 
                href="/search" 
                onClick={() => setMenuOpen(false)}
                className="btn-gold-premium w-full text-[13px] py-6"
              >
                PRENOTA ORA ✦
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
