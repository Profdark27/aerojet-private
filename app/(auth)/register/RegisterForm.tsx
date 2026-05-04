'use client'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

function RegisterFormInner({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  
  const [step, setStep] = useState<'details' | 'success'>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Errore durante la creazione dell\'account.')
      } else {
        setStep('success')
        setTimeout(() => router.push('/login'), 2500)
      }
    } catch (err) {
      setError('Servizio temporaneamente non disponibile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/bg-sunset-clouds.png')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-darker via-transparent to-darker/50" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 relative border-gold/10">
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center mb-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-gold/5 flex items-center justify-center mb-4 border border-gold/10">
                    <Sparkles className="text-gold" size={24} />
                  </div>
                  <h1 className="text-2xl font-serif tracking-[0.3em] text-white uppercase font-bold">REGISTRAZIONE</h1>
                  <p className="text-[10px] tracking-[0.4em] text-gold uppercase mt-2 font-bold">Diventi un membro Aerojet</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30" size={18} />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-gold/50 focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="Il Suo Nome"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Email Privata</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30" size={18} />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-gold/50 focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="email@esclusiva.it"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Crea Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30" size={18} />
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-gold/50 focus:outline-none transition-all placeholder:text-white/10"
                        placeholder="Minimo 8 caratteri"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-[10px] text-center bg-red-400/5 py-3 rounded-lg border border-red-400/10 uppercase tracking-widest">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gold-premium py-4 rounded-xl flex items-center justify-center gap-3 group disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-darker/30 border-t-darker rounded-full animate-spin" />
                    ) : (
                      <>
                        CONFERMA ISCRIZIONE
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                    Già registrato? <Link href="/login" className="text-gold hover:underline font-bold ml-1">Acceda al Portale</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/20">
                  <CheckCircle2 className="text-gold" size={40} />
                </div>
                <h2 className="text-2xl font-serif text-white uppercase tracking-widest mb-4">Benvenuto</h2>
                <p className="text-white/40 text-xs tracking-[0.2em] leading-relaxed">
                  Il Suo account Aerojet Private è stato creato.<br />
                  La stiamo trasferendo alla pagina di accesso.
                </p>
                <div className="mt-10 flex justify-center">
                  <div className="w-12 h-[1px] bg-gold/30 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 text-white/10">
          <ShieldCheck size={14} />
          <span className="text-[9px] uppercase tracking-[0.4em] font-medium">Standard di Sicurezza Militare · AEROJET</span>
        </div>
      </motion.div>
    </div>
  )
}

export default function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-darker" />}>
      <RegisterFormInner googleEnabled={googleEnabled} />
    </Suspense>
  )
}
