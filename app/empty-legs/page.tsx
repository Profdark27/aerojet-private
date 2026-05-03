'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plane, ArrowRight, Bell, Sparkles, MapPin, Clock } from 'lucide-react'
import Navbar from '@/components/luxury/Navbar'
import Footer from '@/components/luxury/Footer'

interface EmptyLeg {
  id: string
  fromCity: string
  toCity: string
  date: string
  aircraft: string
  price: number
  pax: number
}

export default function EmptyLegsPage() {
  const [emptyLegs, setEmptyLegs] = useState<EmptyLeg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulazione fetch API Avinode/Internal
    setTimeout(() => {
      setEmptyLegs([
        { id: '1', fromCity: 'Milano', toCity: 'Parigi', date: 'Domani, 10:00', aircraft: 'Citation Mustang', price: 2400, pax: 4 },
        { id: '2', fromCity: 'Roma', toCity: 'Nizza', date: '3 Maggio', aircraft: 'Phenom 300', price: 3100, pax: 7 },
        { id: '3', fromCity: 'Londra', toCity: 'Milano', date: '5 Maggio', aircraft: 'Challenger 350', price: 4800, pax: 9 },
        { id: '4', fromCity: 'Ibiza', toCity: 'Roma', date: '6 Maggio', aircraft: 'Falcon 2000', price: 5500, pax: 10 },
      ])
      setLoading(false)
    }, 1200)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0C14] text-[#F0EDE6]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 border-b border-[#C9A84C]/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[11px] tracking-[0.5em] text-[#C9A84C] uppercase mb-4 font-bold">Opportunità Esclusive</div>
            <h1 className="text-5xl md:text-7xl font-light mb-8 tracking-tight">Empty Legs Hub</h1>
            <p className="max-w-2xl mx-auto text-lg text-white/50 font-light leading-relaxed mb-12">
              Acceda a voli privati di posizionamento con tariffe agevolate fino al -75%. L'efficienza del business aviation incontra l'opportunità immediata.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C9A84C]/5 via-transparent to-transparent" />
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-bold mb-8 flex items-center gap-2">
              <Plane size={14} /> Tratte Disponibili
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white/5 animate-pulse rounded-sm" />
                ))}
              </div>
            ) : (
              emptyLegs.map((leg) => (
                <motion.div
                  key={leg.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="group bg-[#0F1220] border border-white/5 p-8 rounded-sm hover:border-[#C9A84C]/30 transition-all flex flex-col md:flex-row justify-between items-center gap-8"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-2xl font-light tracking-tight">{leg.fromCity}</div>
                      <ArrowRight className="text-[#C9A84C]" size={20} />
                      <div className="text-2xl font-light tracking-tight">{leg.toCity}</div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] text-white/40 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={12} /> {leg.date}</span>
                      <span className="flex items-center gap-1"><Plane size={12} /> {leg.aircraft}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {leg.pax} Pax</span>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-[9px] text-[#C9A84C] uppercase tracking-[0.2em] mb-1">Prezzo da</div>
                    <div className="text-3xl font-light text-[#F0EDE6] mb-4">€{leg.price.toLocaleString('it-IT')}</div>
                    <button className="px-6 py-2 bg-transparent border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] tracking-widest uppercase hover:bg-[#C9A84C] hover:text-[#0A0C14] transition-all">
                      Richiedi Ora
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar / Lead Capture */}
          <div className="space-y-8">
            <div className="bg-[#C9A84C]/5 border border-[#C9A84C]/20 p-8 rounded-sm sticky top-32">
              <Sparkles className="text-[#C9A84C] mb-6" size={24} />
              <h3 className="text-xl font-light mb-4">Non ha trovato la sua tratta?</h3>
              <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
                Si iscriva al nostro servizio di alert prioritario. La avviseremo via WhatsApp o Email non appena un volo di posizionamento sarà disponibile per le sue destinazioni preferite.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-widest text-white/30 uppercase block mb-2">Destinazione d'Interesse</label>
                  <input 
                    type="text" 
                    placeholder="Es. Parigi, Londra, Dubai..." 
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm outline-none focus:border-[#C9A84C]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest text-white/30 uppercase block mb-2">La Sua Email</label>
                  <input 
                    type="email" 
                    placeholder="email@dominio.com" 
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm outline-none focus:border-[#C9A84C]/50 transition-all"
                  />
                </div>
                <button className="w-full bg-[#C9A84C] text-[#0A0C14] py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#F0EDE6] transition-all flex items-center justify-center gap-2">
                  <Bell size={14} /> Attiva Alert
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-6 text-center italic">Privilegio esclusivo riservato ai membri registrati.</p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}
