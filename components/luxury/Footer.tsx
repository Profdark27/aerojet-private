'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Linkedin, Twitter, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-darker pt-32 pb-16 px-6 md:px-12 border-t border-white/5 overflow-hidden relative">
      
      {/* 1. Large Brand Background Overlay (Futuristic) */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <h2 className="text-[25vw] font-serif font-bold text-white/[0.02] tracking-[0.2em] leading-none whitespace-nowrap">
          AEROJET
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
          
          {/* Column 1: Identity */}
          <div className="space-y-10">
            <Link href="/" className="flex flex-col gap-2 no-underline">
              <span className="text-2xl font-serif tracking-[0.5em] text-white font-bold leading-none">AEROJET</span>
              <span className="text-[9px] tracking-[0.4em] text-gold uppercase font-bold">Private Aviation Elite</span>
            </Link>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
              Ridefiniamo i confini del possibile nel viaggio aereo privato, unendo eccellenza svizzera e intelligenza predittiva.
            </p>
            <div className="flex gap-4">
              {[Linkedin, Twitter, Instagram].map((Icon, idx) => (
                <Link 
                  key={idx} 
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:border-gold hover:text-gold transition-all duration-500"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Experience */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.5em] text-gold/80 font-bold mb-10">Esperienza</h4>
            <ul className="space-y-5">
              {['Voli On-Demand', 'Empty Leg Club', 'Global Concierge', 'Flotta Private Jet'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-xs text-white/40 hover:text-white no-underline transition-colors font-medium flex items-center gap-2 group">
                    {item} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Corporate */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.5em] text-gold/80 font-bold mb-10">Corporate</h4>
            <ul className="space-y-5">
              {['About Us', 'Safety First', 'Career Elite', 'Broker Dashboard'].map(item => (
                <li key={item}>
                  <Link href={item === 'Broker Dashboard' ? '/dashboard' : '#'} className="text-xs text-white/40 hover:text-white no-underline transition-colors font-medium flex items-center gap-2 group">
                    {item} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Reach Us */}
          <div className="space-y-10">
            <div>
              <h4 className="text-[9px] uppercase tracking-[0.5em] text-gold/80 font-bold mb-8">Reach Us</h4>
              <div className="space-y-6">
                <a href="mailto:concierge@aerojet.app" className="flex items-center gap-4 text-xs text-white/40 hover:text-white transition-colors no-underline">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Mail size={12} /></div>
                  concierge@aerojet.app
                </a>
                <a href="tel:+390212345678" className="flex items-center gap-4 text-xs text-white/40 hover:text-white transition-colors no-underline">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Phone size={12} /></div>
                  +39 02 1234 5678
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-medium">
            © 2026 Aerojet Private · Luxury Mobility Group
          </div>
          <div className="flex gap-10">
            {['Privacy', 'Legal', 'Security'].map(item => (
              <Link key={item} href="#" className="text-[10px] text-white/20 hover:text-white no-underline transition-colors uppercase tracking-[0.4em]">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
