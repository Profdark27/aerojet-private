'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Linkedin, Twitter, Instagram, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-darker pt-24 pb-12 px-8 md:px-16 border-t border-white/5 overflow-hidden relative">
      <div className="bg-noise opacity-[0.02]" />
      
      <div className="max-w-screen-2xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 no-underline mb-8">
              <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center text-gold">
                <Sparkles size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif tracking-[0.4em] text-white font-bold leading-none">AEROJET</span>
                <span className="text-[10px] tracking-[0.2em] text-gold uppercase mt-1">Private Aviation</span>
              </div>
            </Link>
            <p className="text-cream-dim text-lg font-serif font-light leading-relaxed max-w-sm mb-10 italic">
              "Definiamo nuovi standard nell'aviazione privata, dove l'eccellenza operativa incontra l'intelligenza artificiale."
            </p>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' }
              ].map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href}
                  className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/30 hover:border-gold hover:text-gold transition-all duration-300"
                >
                  <social.icon size={18} strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-10">Servizi</h4>
            <ul className="space-y-4">
              {['Charter Privato', 'Empty Legs', 'Membership VIP', 'Gestione Flotta', 'Heli-Transfer'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-white/40 hover:text-white no-underline transition-colors font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Network */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-10">Global Network</h4>
            <ul className="space-y-4">
              {['VistaJet Partner', 'NetJets Solutions', 'Wheels Up Global', 'AOC Certified', 'EASA Standards'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-[13px] text-white/40 hover:text-white no-underline transition-colors font-light">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-10">Contatti</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-gold/60 mt-1" />
                <span className="text-[13px] text-white/40 font-light">concierge@aerojet.app</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-gold/60 mt-1" />
                <span className="text-[13px] text-white/40 font-light">+39 02 1234 5678</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold/60 mt-1" />
                <span className="text-[13px] text-white/40 font-light">Private Terminal, Linate<br />Milano, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-[11px] text-white/20 font-light">
            <span>© 2026 Aerojet Private Solutions.</span>
            <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full" />
            <span className="uppercase tracking-widest">Part of AeroJet Group</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {['Privacy', 'Terms', 'Cookie', 'Broker Login'].map(l => (
              <Link 
                key={l} 
                href={l === 'Broker Login' ? '/dashboard' : '#'} 
                className="text-[11px] text-white/30 hover:text-gold no-underline transition-colors uppercase tracking-widest font-medium"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
