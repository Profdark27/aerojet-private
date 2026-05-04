'use client'
import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/luxury/Navbar'
import { formatCurrency } from '@/lib/utils'
import { Check, Shield, Info, ArrowRight, User, Settings, CreditCard, ChevronLeft, Plane, Zap } from 'lucide-react'

const steps = [
  { id: 'details', label: 'Mission', icon: Plane },
  { id: 'services', label: 'Elite Services', icon: Zap },
  { id: 'customer', label: 'Passenger', icon: User },
  { id: 'payment', label: 'Secure Pay', icon: CreditCard },
]

const extras = [
  { id: 'catering', label: 'Michelin Dining', desc: 'Curated menu by private chefs, served with vintage pairing.', price: 350, icon: '🍾' },
  { id: 'transfer', label: 'Limousine Vector', desc: 'Chauffeur-driven Mercedes-Maybach to your doorstep.', price: 180, icon: '🚗' },
  { id: 'flowers', label: 'Floral Design', desc: 'Bespoke floral arrangements by artisan florists.', price: 220, icon: '🌸' },
  { id: 'wifi', label: 'Starlink Elite', desc: 'Ultra-low latency global connectivity.', price: 0, icon: '📡' },
  { id: 'concierge', label: 'On-Ground Butler', desc: 'Dedicated assistant for seamless ground operations.', price: 280, icon: '✦' },
]

function BookingWizard() {
  const params = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['wifi'])
  const [notes, setNotes] = useState('')
  const [paying, setPaying] = useState(false)

  const aircraft = params.get('aircraft') || 'Phenom 300E'
  const operator = params.get('operator') || 'VistaJet'
  const from = params.get('from') || 'Milano'
  const to = params.get('to') || 'Londra'
  const date = params.get('date') || new Date().toISOString().split('T')[0]
  const pax = parseInt(params.get('pax') || '2')
  const price = parseInt(params.get('price') || '9800')
  const flightTime = params.get('flightTime') || '2h 10m'
  const category = params.get('category') || 'Light Jet'

  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', taxCode: '' })

  const extrasTotal = extras.filter(e => selectedExtras.includes(e.id)).reduce((s, e) => s + e.price, 0)
  const total = price + extrasTotal
  const deposit = Math.round(total * 0.30)
  const balance = total - deposit

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aircraft: { model: aircraft, price: total, category, operator, operatorLogo: operator.slice(0, 2).toUpperCase() },
          from, to, date, pax,
          customerEmail: form.email,
        }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setPaying(false)
    }
  }

  const isFormValid = form.name && form.email && form.phone

  return (
    <div className="min-h-screen bg-darker pt-32 pb-20 px-6 bg-[radial-gradient(ellipse_at_top_left,rgba(201,168,76,0.03),transparent_50%)]">
      <Navbar />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left: Main Interaction Hub */}
        <div className="lg:col-span-8">
          
          {/* Futuristic Step Indicator */}
          <div className="flex justify-between mb-24 relative px-4">
             <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -z-10" />
             {steps.map((s, i) => (
               <div key={s.id} className="flex flex-col items-center group relative">
                 <motion.div 
                    animate={{ scale: i === step ? 1.1 : 1 }}
                    className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-700 relative ${
                      i < step ? 'bg-gold border-gold text-darker' : 
                      i === step ? 'bg-white/5 border-gold text-gold shadow-[0_0_25px_rgba(201,168,76,0.2)]' : 
                      'bg-darker border-white/5 text-white/10'
                    }`}
                 >
                   {i < step ? <Check size={20} strokeWidth={3} /> : <s.icon size={20} strokeWidth={1.5} />}
                   {i === step && <div className="absolute inset-0 rounded-full animate-ping bg-gold/10 -z-10" />}
                 </motion.div>
                 <div className="absolute -bottom-10 whitespace-nowrap text-center">
                    <span className={`text-[8px] uppercase tracking-[0.4em] font-bold transition-colors ${
                      i <= step ? 'text-gold' : 'text-white/10'
                    }`}>
                      {s.label}
                    </span>
                 </div>
               </div>
             ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-12 lg:p-16 rounded-[3rem] relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

              {step === 0 && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-px w-8 bg-gold/50" />
                       <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Step 01</span>
                    </div>
                    <h2 className="text-4xl font-serif text-white tracking-tight italic">Mission Intelligence</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                    <div className="space-y-10">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Selected Aircraft</span>
                        <span className="text-2xl text-white font-serif">{aircraft}</span>
                        <div className="flex items-center gap-3 text-[10px] text-gold uppercase tracking-widest font-bold">
                           <Shield size={12} /> {category} · {operator}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Flight Date</span>
                        <span className="text-2xl text-white font-serif">{new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="space-y-10">
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Route Vector</span>
                        <div className="flex items-center gap-4 text-2xl text-white font-serif uppercase tracking-tight">
                           {from} <ArrowRight size={20} className="text-gold/50" /> {to}
                        </div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">ESTIMATED DURATION: {flightTime}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Configuration</span>
                        <span className="text-2xl text-white font-serif">{pax} Elite Guests</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-white/5 group">
                    <label className="text-[9px] text-gold uppercase tracking-[0.4em] font-bold mb-6 block">Additional Mission Directives</label>
                    <textarea 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Specify catering preferences, pets on board, or ground logistics..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-white text-sm outline-none focus:border-gold/30 transition-all duration-700 h-40 shadow-inner"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-px w-8 bg-gold/50" />
                       <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Step 02</span>
                    </div>
                    <h2 className="text-4xl font-serif text-white tracking-tight italic">Elite Customization</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    {extras.map((e, idx) => (
                      <motion.div 
                        key={e.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => toggleExtra(e.id)}
                        className={`p-10 rounded-[2rem] border transition-all duration-700 cursor-pointer group relative overflow-hidden ${
                          selectedExtras.includes(e.id) ? 'bg-gold/5 border-gold/40 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                        {selectedExtras.includes(e.id) && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl rounded-full" />
                        )}
                        <div className="flex justify-between items-start mb-8">
                          <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-125">{e.icon}</span>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            selectedExtras.includes(e.id) ? 'bg-gold border-gold text-darker' : 'border-white/10'
                          }`}>
                            {selectedExtras.includes(e.id) && <Check size={14} strokeWidth={4} />}
                          </div>
                        </div>
                        <h4 className="text-lg font-serif text-white mb-2">{e.label}</h4>
                        <p className="text-[11px] text-white/30 mb-6 h-10 leading-relaxed">{e.desc}</p>
                        <div className="text-[10px] text-gold uppercase tracking-[0.3em] font-black">
                          {e.price === 0 ? 'COMPLIMENTARY' : `+ ${formatCurrency(e.price)}`}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-px w-8 bg-gold/50" />
                       <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Step 03</span>
                    </div>
                    <h2 className="text-4xl font-serif text-white tracking-tight italic">Passenger Registry</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                    <div className="space-y-10">
                      <div className="flex flex-col gap-4">
                        <label className="text-[9px] text-gold uppercase tracking-[0.4em] font-bold">Legal Name *</label>
                        <input 
                          type="text" 
                          value={form.name} 
                          onChange={e => setForm({...form, name: e.target.value})}
                          placeholder="Mario Rossi"
                          className="bg-white/[0.03] border-b border-white/10 py-4 text-lg text-white focus:border-gold outline-none transition-colors" 
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <label className="text-[9px] text-gold uppercase tracking-[0.4em] font-bold">Encrypted Phone *</label>
                        <input 
                          type="tel" 
                          value={form.phone} 
                          onChange={e => setForm({...form, phone: e.target.value})}
                          placeholder="+39 347 1234567"
                          className="bg-white/[0.03] border-b border-white/10 py-4 text-lg text-white focus:border-gold outline-none transition-colors" 
                        />
                      </div>
                    </div>
                    <div className="space-y-10">
                      <div className="flex flex-col gap-4">
                        <label className="text-[9px] text-gold uppercase tracking-[0.4em] font-bold">Email Address *</label>
                        <input 
                          type="email" 
                          value={form.email} 
                          onChange={e => setForm({...form, email: e.target.value})}
                          placeholder="mario.rossi@exclusive.com"
                          className="bg-white/[0.03] border-b border-white/10 py-4 text-lg text-white focus:border-gold outline-none transition-colors" 
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <label className="text-[9px] text-gold uppercase tracking-[0.4em] font-bold">Organization (Optional)</label>
                        <input 
                          type="text" 
                          value={form.company} 
                          onChange={e => setForm({...form, company: e.target.value})}
                          placeholder="Rossi Global Solutions"
                          className="bg-white/[0.03] border-b border-white/10 py-4 text-lg text-white focus:border-gold outline-none transition-colors" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-px w-8 bg-gold/50" />
                       <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Final Step</span>
                    </div>
                    <h2 className="text-4xl font-serif text-white tracking-tight italic">Financial Authorization</h2>
                  </div>

                  <div className="space-y-8 pt-6">
                    <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[2rem] space-y-6 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-gold/20" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/30 uppercase tracking-widest">Base Charter Logistics</span>
                        <span className="text-xl text-white font-light">{formatCurrency(price)}</span>
                      </div>
                      {extrasTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/30 uppercase tracking-widest">Elite Add-ons</span>
                          <span className="text-xl text-white font-light">+ {formatCurrency(extrasTotal)}</span>
                        </div>
                      )}
                      <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-2xl text-white font-serif italic">Total Mission Value</span>
                        <span className="text-4xl text-white font-light tracking-tighter">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <div className="bg-gold/10 border border-gold/30 p-12 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative">
                      <div className="absolute top-0 right-10 w-20 h-20 bg-white/5 blur-3xl rounded-full" />
                      <div>
                        <div className="text-[9px] text-gold uppercase tracking-[0.5em] font-bold mb-3">Immediate Deposit Authorization (30%)</div>
                        <div className="text-5xl text-gold font-light tracking-tighter">{formatCurrency(deposit)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-white/30 uppercase tracking-[0.4em] mb-2 font-bold">Deferred Balance</div>
                        <div className="text-2xl text-white/60 font-light tracking-tighter">{formatCurrency(balance)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold pt-8">
                    <Shield size={18} className="text-gold/40" />
                    <span>Encrypted Payment Processing · Powered by Stripe Elite</span>
                  </div>
                </div>
              )}

              {/* Mission Navigation */}
              <div className="mt-20 flex items-center justify-between gap-10">
                <button 
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                  className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black transition-all ${
                    step === 0 ? 'opacity-0' : 'text-white/30 hover:text-white'
                  }`}
                >
                  <ChevronLeft size={18} /> Mission Control
                </button>
                
                {step < 3 ? (
                  <button 
                    onClick={() => setStep(step + 1)}
                    disabled={step === 2 && !isFormValid}
                    className="btn-gold-premium px-16 py-6 disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                  >
                    NEXT PROTOCOL <ArrowRight size={16} className="ml-3 inline-block group-hover:translate-x-2 transition-transform" />
                  </button>
                ) : (
                  <button 
                    onClick={handlePay}
                    disabled={paying}
                    className="btn-gold-premium px-20 py-7 text-xs shadow-[0_20px_50px_rgba(201,168,76,0.4)]"
                  >
                    {paying ? 'AUTHORIZING SESSION...' : `AUTHORIZE DEPOSIT ${formatCurrency(deposit)} ✦`}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Mission Intelligence Sidebar */}
        <div className="lg:col-span-4">
          <div className="glass-card p-10 sticky top-32 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 blur-[80px] rounded-full group-hover:bg-gold/10 transition-all duration-1000" />
            
            <div className="flex items-center gap-3 mb-10">
               <div className="h-px w-6 bg-gold/50" />
               <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Mission Summary</span>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-2">
                <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Vector Path</span>
                <div className="text-base text-white font-serif flex items-center gap-2 uppercase tracking-tighter">
                   {from} <ArrowRight size={12} className="text-gold/30" /> {to}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Assigned Aircraft</span>
                <span className="text-base text-white font-serif block tracking-tighter">{aircraft}</span>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Elite Manifest</span>
                <span className="text-base text-white font-serif block tracking-tighter">{pax} Registered Guests</span>
              </div>
              
              <div className="pt-10 border-t border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">Active Deposit</span>
                  <span className="text-2xl text-gold font-light tracking-tighter">{formatCurrency(deposit)}</span>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-white/30 italic leading-relaxed">
                    Balance of {formatCurrency(balance)} is scheduled for authorization 72 hours prior to mission start.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-darker flex items-center justify-center text-gold text-4xl">✦</div>}>
      <BookingWizard />
    </Suspense>
  )
}
