'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, Plane, ShieldCheck, Mail, ArrowRight, ExternalLink } from 'lucide-react'
import { trackEvent } from '@/lib/tracking'
import { trackMarketingEvent, EVENTS } from '@/lib/analytics'
import { formatCurrency } from '@/lib/utils'

interface BookingDetails {
  id: string
  confirmationCode: string
  fromCity?: string
  toCity?: string
  depositAmount?: number
  totalPrice?: number
  status?: string
}

function SuccessContent() {
  const params = useSearchParams()
  const isMock = params.get('mock') === 'true'
  const sessionId = params.get('session_id')
  const fromParam = params.get('from') || ''
  const toParam = params.get('to') || ''
  const depositParam = params.get('deposit')

  const [details, setDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(!!sessionId)

  useEffect(() => {
    if (!sessionId) return
    trackEvent('booking_success', { sessionId, from: fromParam, to: toParam })
    trackMarketingEvent(EVENTS.BOOKING_SUCCESS, { from: fromParam, to: toParam })
    
    fetch(`/api/booking/by-session?sessionId=${encodeURIComponent(sessionId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setDetails(data) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [sessionId, fromParam, toParam])

  const confirmationCode = details?.confirmationCode ?? (
    isMock ? `AJ-MOCK-${(fromParam + toParam + (depositParam||'')).length % 1000}` : 
    sessionId ? `AJ-${sessionId.slice(-6).toUpperCase()}` : null
  )

  const fromCity = details?.fromCity || fromParam || ''
  const toCity = details?.toCity || toParam || ''
  const depositAmount = details?.depositAmount ?? (depositParam ? parseInt(depositParam) : 0)

  return (
    <div className="min-h-screen bg-darker flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl text-center"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-8 shadow-[0_0_40px_rgba(201,168,76,0.2)]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.5 }}
            >
              <Check size={40} strokeWidth={3} />
            </motion.div>
          </div>
          <h1 className="luxury-heading text-[clamp(40px,6vw,64px)] text-white font-light mb-4">
            Missione <span className="text-gold italic">Confermata</span>
          </h1>
          <p className="text-white/60 text-lg font-light tracking-wide max-w-md mx-auto">
            Il suo volo {fromCity && toCity ? `${fromCity} → ${toCity}` : 'è stato prenotato'} è ora in fase operativa.
          </p>
        </div>

        <div className="glass-panel p-10 rounded-2xl mb-12 text-left space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10" />
          
          <div className="text-center pb-8 border-b border-white/5">
            <span className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold block mb-4">Codice di Conferma</span>
            <div className="text-3xl md:text-4xl text-white font-light tracking-[0.2em]">
              {loading ? <span className="opacity-20 animate-pulse">AJ-XXXXXX</span> : confirmationCode}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              {[
                { label: 'Tratta', value: `${fromCity} → ${toCity}`, icon: Plane },
                { label: 'Deposito', value: formatCurrency(depositAmount), icon: ShieldCheck },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <item.icon size={18} className="text-gold/40 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-1 font-bold">{item.label}</span>
                    <span className="text-sm text-white font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[
                { label: 'Status', value: 'Operativo in corso', icon: Sparkles, active: true },
                { label: 'Assistenza', value: 'Concierge dedicato 24/7', icon: Mail },
              ].map(item => (
                <div key={item.label} className="flex gap-4">
                  <item.icon size={18} className={`flex-shrink-0 ${item.active ? 'text-emerald-400' : 'text-gold/40'}`} />
                  <div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-1 font-bold">{item.label}</span>
                    <span className={`text-sm font-medium ${item.active ? 'text-emerald-400' : 'text-white'}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-white/30 italic leading-relaxed pt-8 border-t border-white/5">
            Riceverà a breve un'email dettagliata con le informazioni sul FBO, i contatti dell'equipaggio e il contratto finale. Il nostro concierge La contatterà entro 60 minuti per finalizzare i dettagli a bordo.
          </p>
        </div>

        {isMock && (
          <div className="bg-gold/10 border border-gold/20 p-3 mb-10 rounded text-[10px] text-gold uppercase tracking-[0.2em] font-bold">
            Development Mode — Simulazione di transazione
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {details?.id && (
            <Link href={`/trip/${details.id}`} className="btn-gold-premium px-12 py-5 text-[10px]">
              APRI TRIP PORTAL <ExternalLink size={14} className="ml-2" />
            </Link>
          )}
          <Link href="/" className="btn-outline-premium px-12 py-5 text-[10px]">
            TORNA ALLA HOME <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>

        <p className="mt-16 text-[10px] text-white/20 tracking-[0.2em] uppercase font-bold">
          AeroJet Private · L'eccellenza nel volo privato
        </p>
      </motion.div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-darker flex items-center justify-center text-gold text-4xl animate-pulse">✦</div>}>
      <SuccessContent />
    </Suspense>
  )
}
