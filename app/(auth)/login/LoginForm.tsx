'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

function LoginFormInner({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenziali non valide. Verifichi email e password.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('Errore di connessione. Riprovi tra poco.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-darker flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('/images/bg-terminal-night.png')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-darker via-transparent to-darker" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 relative border-gold/10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20 shadow-[0_0_20px_rgba(201,168,76,0.1)]">
              <Sparkles className="text-gold" size={24} />
            </div>
            <h1 className="text-2xl font-serif tracking-[0.3em] text-white uppercase font-bold">AEROJET</h1>
            <p className="text-[10px] tracking-[0.4em] text-gold uppercase mt-2 font-bold">Private Elite Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Account Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-gold/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="la-sua@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Password</label>
                <Link href="#" className="text-[9px] uppercase tracking-widest text-gold/40 hover:text-gold transition-colors">Dimenticata?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-gold/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-[11px] text-center bg-red-400/5 py-3 rounded-lg border border-red-400/10 uppercase tracking-wider"
              >
                {error}
              </motion.div>
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
                  ACCEDI ALL'AREA ELITE
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white/10 text-[9px] uppercase tracking-widest">
              <div className="h-[1px] w-8 bg-white/10" />
              <span>Sistemi Alternativi</span>
              <div className="h-[1px] w-8 bg-white/10" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => signIn('google', { callbackUrl })}
                className="py-3 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest font-bold"
              >
                Google
              </button>
              <button 
                onClick={() => {/* Magic link flow if needed */}}
                className="py-3 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest font-bold"
              >
                Magic Link
              </button>
            </div>

            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-6">
              Primo accesso? <Link href="/register" className="text-gold hover:underline font-bold ml-1">Richieda le credenziali</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 text-white/10">
          <ShieldCheck size={14} />
          <span className="text-[9px] uppercase tracking-[0.4em] font-medium">Connessione Crittografata · AEROJET OS</span>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-darker" />}>
      <LoginFormInner googleEnabled={googleEnabled} />
    </Suspense>
  )
}
