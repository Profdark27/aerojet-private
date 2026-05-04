'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/luxury/Navbar'
import type { Aircraft } from '@/lib/avinode'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plane, Users, Clock, Star, ArrowRight, ChevronRight, MapPin, Gauge, Shield } from 'lucide-react'
import ImageWithFallback from '@/components/ImageWithFallback'
import { FLEET_IMAGES } from '@/lib/imageAssets'

function SearchResults() {
  const params = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const date = params.get('date') || ''
  const pax = params.get('pax') || '2'

  useEffect(() => {
    const query = new URLSearchParams({ 
      from, to, date, pax, 
      fromICAO: params.get('fromICAO') || 'LIML', 
      toICAO: params.get('toICAO') || 'EGLL' 
    })
    setLoading(true)
    fetch(`/api/avinode/search?${query}`)
      .then(r => r.json())
      .then(d => { setResults(d.aircraft || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [from, to, date, pax])

  const initiateCheckout = (aircraft: Aircraft) => {
    const query = new URLSearchParams({
      aircraft: aircraft.model, 
      operator: aircraft.operator, 
      from, to, date, pax,
      price: String(aircraft.price), 
      flightTime: aircraft.flightTime, 
      category: aircraft.category,
    })
    router.push(`/booking?${query.toString()}`)
  }

  return (
    <div className="min-h-screen bg-darker pt-32 pb-20">
      <Navbar />

      {/* 1. Futuristic Sticky Header */}
      <div className="sticky top-24 z-40 px-6 mb-16">
        <div className="max-w-7xl mx-auto glass-card bg-darker/40 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-10">
            <div className="space-y-1">
              <span className="text-[8px] uppercase tracking-[0.4em] text-gold/60 font-bold">Origin</span>
              <div className="text-xl text-white font-medium tracking-tight uppercase">{from}</div>
            </div>
            <div className="relative h-12 w-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-gold/5 rounded-full animate-pulse" />
              <ArrowRight size={20} className="text-gold" />
            </div>
            <div className="space-y-1">
              <span className="text-[8px] uppercase tracking-[0.4em] text-gold/60 font-bold">Destination</span>
              <div className="text-xl text-white font-medium tracking-tight uppercase">{to}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-12 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gold/40" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-white/30">Schedule</span>
                <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
                  {date ? new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'Flexible'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={16} className="text-gold/40" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-white/30">Passengers</span>
                <span className="text-[11px] text-white/80 font-bold uppercase tracking-wider">{pax} Guests</span>
              </div>
            </div>
            <button onClick={() => router.push('/')} className="bg-white/5 hover:bg-white/10 text-[9px] text-white/50 hover:text-white uppercase tracking-[0.3em] font-bold px-6 py-3 rounded-full border border-white/10 transition-all">
              Edit Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="space-y-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 glass-card animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-48">
            <div className="w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-gold/10">
              <Shield size={40} className="text-gold/40" />
            </div>
            <h2 className="luxury-heading text-4xl text-white mb-6">No Fleet Available</h2>
            <p className="text-white/40 mb-12 max-w-md mx-auto leading-relaxed">
              Our AI concierge is searching global off-market options for this route. Contact us for a custom solution.
            </p>
            <Link href="/" className="btn-gold-premium">Back to Base</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {results.map((ac, i) => (
              <motion.div
                key={ac.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group relative"
              >
                {/* Glow Background (Hover) */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-transparent to-gold/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative glass-card bg-black/40 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col lg:flex-row min-h-[400px]">
                  
                  {/* Left: Cinematic Image */}
                  <div className="lg:w-[40%] relative aspect-video lg:aspect-auto overflow-hidden">
                    <ImageWithFallback
                      src={FLEET_IMAGES[ac.category.toLowerCase().replace(' ', '') as any] || FLEET_IMAGES.light}
                      alt={ac.model}
                      fill
                      className="object-cover transition-transform duration-[4s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darker/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/20" />
                    
                    <div className="absolute top-6 left-6">
                      <div className="bg-darker/60 backdrop-blur-xl border border-white/10 text-gold text-[8px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.4em] shadow-xl">
                        {ac.category} Elite
                      </div>
                    </div>
                  </div>

                  {/* Right: Premium Intelligence */}
                  <div className="flex-1 p-10 lg:p-14 flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-3xl font-serif text-white tracking-tight">{ac.model}</h3>
                          <div className="h-px w-8 bg-gold/30" />
                          <span className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-bold">{ac.operator}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= ac.rating ? 'text-gold fill-gold' : 'text-white/10'} />)}
                            <span className="text-[10px] text-white/40 ml-2 font-bold tracking-widest uppercase">{ac.rating} Rating</span>
                          </div>
                          <span className="w-1 h-1 bg-white/10 rounded-full" />
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Built {ac.yearBuilt}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-gold/60 tracking-[0.4em] uppercase mb-2 font-bold">Instant Quote</div>
                        <div className="text-4xl text-white font-light tracking-tighter">{formatCurrency(ac.price)}</div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-10 border-y border-white/5 mb-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] tracking-[0.3em]">
                          <Clock size={12} /> Flight Time
                        </div>
                        <div className="text-white text-lg font-medium">{ac.flightTime}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] tracking-[0.3em]">
                          <Users size={12} /> Cabin Capacity
                        </div>
                        <div className="text-white text-lg font-medium">{ac.pax} Seats</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] tracking-[0.3em]">
                          <Gauge size={12} /> Cruise Speed
                        </div>
                        <div className="text-white text-lg font-medium">{ac.speed} km/h</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] tracking-[0.3em]">
                          <Plane size={12} /> Max Range
                        </div>
                        <div className="text-white text-lg font-medium">{ac.range.toLocaleString('it-IT')} km</div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex flex-wrap gap-3">
                        {ac.amenities.slice(0, 4).map(am => (
                          <div key={am} className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] text-white/40 uppercase tracking-widest font-bold">
                            {am}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => initiateCheckout(ac)}
                        className="btn-gold-premium w-full md:w-auto px-16 py-6 group/btn"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          SELECT AIRCRAFT <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-darker flex items-center justify-center text-gold text-4xl">✦</div>}>
      <SearchResults />
    </Suspense>
  )
}
