'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, MapPin, Clock, Users, 
  MessageSquare, ChevronLeft, ShieldCheck, 
  Car, Coffee, FileText, Sparkles,
  ArrowRight, Download, Upload, Info
} from 'lucide-react'
import Link from 'next/link'

interface TripData {
  id: string
  confirmationCode: string
  fromCity: string
  toCity: string
  departureDate: string
  pax: number
  status: string
  flightStatus: string
  tailNumber?: string
  handlingAgentFrom?: string
  handlingAgentTo?: string
  depositPaid: boolean
  operationalTasks: any[]
  clientName: string
}

export default function TripPortal({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<TripData | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 })

  useEffect(() => {
    Promise.all([
      fetch(`/api/trip/${params.id}`).then(r => r.ok ? r.json() : Promise.reject('Accesso negato')),
      fetch(`/api/trip/${params.id}/documents`).then(r => r.ok ? r.json() : [])
    ])
    .then(([tripData, docsData]) => {
      setTrip(tripData)
      setDocuments(docsData)
      
      // Calculate countdown
      const diff = new Date(tripData.departureDate).getTime() - Date.now()
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60)
        })
      }
    })
    .catch(err => setError(err))
    .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold animate-pulse">Sincronizzazione Volo...</span>
      </div>
    </div>
  )

  if (error || !trip) return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center p-8 text-center">
      <ShieldCheck size={48} className="text-red-500/20 mb-8" />
      <h1 className="luxury-heading text-3xl text-white mb-4">Accesso Riservato</h1>
      <p className="text-white/40 text-sm max-w-sm mx-auto mb-12 leading-relaxed">
        Non è stato possibile validare le credenziali per questo volo. Verifichi il link sicuro ricevuto via email.
      </p>
      <Link href="/" className="btn-gold-premium px-12">TORNA ALLA HOME</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      {/* Background Cinematic */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#C9A84C_0%,transparent_50%)]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 py-4 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center text-darker font-bold">A</div>
            <span className="text-white font-serif tracking-widest hidden md:block text-sm">AEROJET</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] text-gold uppercase tracking-widest font-bold">Codice Missione</span>
              <span className="text-sm font-medium">{trip.confirmationCode}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <button className="btn-gold-premium py-2 px-6 text-[9px]">CONCIERGE LIVE</button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Mission Overview */}
          <div className="lg:col-span-7 space-y-12">
            
            <section>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end justify-between mb-8"
              >
                <div>
                  <span className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold mb-4 block">Piano di Volo</span>
                  <div className="flex items-center gap-6">
                    <h2 className="text-4xl md:text-6xl font-light">{trip.fromCity}</h2>
                    <ArrowRight className="text-gold opacity-40 mt-2" size={32} />
                    <h2 className="text-4xl md:text-6xl font-light">{trip.toCity}</h2>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-4xl text-emerald-400 font-light mb-1">{trip.flightStatus}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">Status Attuale</div>
                </div>
              </motion.div>

              {/* Countdown / Progress */}
              <div className="glass-panel p-10 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Plane size={120} className="-rotate-12" />
                </div>
                <div className="grid grid-cols-3 gap-8 text-center relative z-10">
                  <div className="flex flex-col">
                    <span className="text-4xl text-white font-light mb-2">{timeLeft.days}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Giorni</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl text-white font-light mb-2">{timeLeft.hours}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Ore</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl text-white font-light mb-2">{timeLeft.mins}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Minuti</span>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gold" />
                    <span className="text-xs text-white/60">Decollo stimato: {new Date(trip.departureDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} local time</span>
                  </div>
                  <div className="text-xs text-gold/60 font-medium">Pre-flight checklist 80% completata</div>
                </div>
              </div>
            </section>

            {/* Logistics & Ground Services */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold mb-8 flex items-center gap-3">
                  <Plane size={16} /> Velivolo & Equipaggio
                </h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[11px] text-white/30 uppercase tracking-widest">Tail Number</span>
                    <span className="text-sm font-medium">{trip.tailNumber || 'In assegnazione'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[11px] text-white/30 uppercase tracking-widest">FBO Partenza</span>
                    <span className="text-sm font-medium">{trip.handlingAgentFrom || 'General Aviation Terminal'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-white/30 uppercase tracking-widest">Servizio Catering</span>
                    <span className="text-sm font-medium text-emerald-400">Confermato ✓</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-2xl border border-gold/10">
                <h3 className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold mb-8 flex items-center gap-3">
                  <Sparkles size={16} /> Servizi Concierge
                </h3>
                <div className="space-y-6">
                  {trip.operationalTasks.map((task: any, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform flex-shrink-0">
                        {task.category === 'TRANSFER' ? <Car size={14} /> : <Coffee size={14} />}
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-white mb-1">{task.title}</div>
                        <div className="text-[10px] text-white/40 leading-relaxed">{task.description}</div>
                      </div>
                    </div>
                  ))}
                  {trip.operationalTasks.length === 0 && (
                    <p className="text-[11px] text-white/20 italic">Nessun servizio a terra richiesto al momento.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Documents & Support */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Documents */}
            <div className="glass-panel p-8 rounded-2xl bg-white/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold flex items-center gap-3">
                  <FileText size={16} /> Documentazione
                </h3>
                <span className="text-[9px] text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded">Secure Cloud</span>
              </div>
              
              <div className="space-y-4">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-darker flex items-center justify-center text-white/20 group-hover:text-gold transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-white">{doc.type}</div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest">{doc.passengerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[9px] uppercase tracking-widest font-bold mb-2 ${
                        doc.status === 'VERIFIED' ? 'text-emerald-400' : 'text-gold'
                      }`}>
                        {doc.status}
                      </div>
                      {doc.status === 'REQUESTED' ? (
                        <div className="flex items-center gap-2 text-gold">
                          <Upload size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Carica</span>
                        </div>
                      ) : (
                        <Download size={14} className="text-white/20" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support / Contact */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-gold/5 to-transparent">
              <h3 className="text-[14px] font-medium text-white mb-2">Supporto Operativo 24/7</h3>
              <p className="text-white/40 text-[12px] mb-8 leading-relaxed">
                Il suo Flight Manager dedicato sta monitorando la missione in tempo reale. Per qualsiasi variazione last-minute, ci contatti immediatamente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-[#25D366] hover:text-white transition-all">
                  <MessageSquare size={16} /> WhatsApp
                </button>
                <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-darker transition-all">
                   Chiamata
                </button>
              </div>
            </div>

            {/* Safety Badges */}
            <div className="flex items-center justify-center gap-8 opacity-20 grayscale">
              <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Argus Platinum</span>
              <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Wyvern Reg</span>
              <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Easa Certified</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
