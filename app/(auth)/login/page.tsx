'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'
  const error = params.get('error')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleMagicLink = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      await signIn('resend', { email, callbackUrl, redirect: false })
      setSent(true)
    } catch {
      // handled by error param
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    signIn('google', { callbackUrl })
  }

  // Stars
  const stars = mounted ? Array.from({ length: 50 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  })) : []

  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>

      {/* Stars */}
      {stars.map((s, i) => (
        <div key={i} style={{ position: 'fixed', left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: '50%', background: '#C9A84C', animation: `twinkle ${s.duration}s ${s.delay}s infinite alternate`, pointerEvents: 'none' }} />
      ))}

      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, background: 'rgba(10,12,20,0.92)', border: '1px solid rgba(201,168,76,0.2)', backdropFilter: 'blur(20px)', padding: '52px 40px' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 48, justifyContent: 'center' }}>
          <span style={{ color: '#C9A84C', fontSize: 20 }}>✦</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end', marginBottom: 2 }}>PRIVATE</span>
        </Link>

        {sent ? (
          /* Success state */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, color: '#C9A84C', marginBottom: 24 }}>✉</div>
            <h2 style={{ fontSize: 26, fontWeight: 300, marginBottom: 16 }}>Email inviata</h2>
            <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8 }}>
              Abbiamo inviato un link di accesso a<br />
              <strong style={{ color: '#C9A84C' }}>{email}</strong>
            </p>
            <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 20 }}>
              Controlli anche la cartella spam.<br />Il link scade in 15 minuti.
            </p>
            <button onClick={() => setSent(false)} style={{ marginTop: 32, background: 'none', border: '1px solid rgba(201,168,76,0.3)', color: 'rgba(240,237,230,0.5)', padding: '10px 24px', cursor: 'pointer', fontSize: 12, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif' }}>
              TORNA INDIETRO
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 300, marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>Accesso Riservato</h2>
            <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', textAlign: 'center', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 40, lineHeight: 1.6 }}>
              Area broker e clienti Aerojet Private
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#fca5a5', fontFamily: 'Helvetica Neue, sans-serif', textAlign: 'center' }}>
                {error === 'Configuration' ? 'Configurazione OAuth mancante.' : 'Errore di accesso. Riprova.'}
              </div>
            )}

            {/* Google OAuth */}
            <button onClick={handleGoogle} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(201,168,76,0.25)', color: '#F0EDE6', fontSize: 13, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24, transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)')}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continua con Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.12)' }} />
              <span style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>oppure</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.12)' }} />
            </div>

            {/* Magic link */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>EMAIL</div>
              <input
                className="luxury-input"
                type="email"
                placeholder="la-sua-email@dominio.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                style={{ paddingBottom: 10 }}
              />
            </div>

            <button onClick={handleMagicLink} disabled={loading || !email.trim()} className="btn-gold"
              style={{ width: '100%', padding: '15px', marginTop: 20, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'INVIO IN CORSO...' : 'INVIA LINK DI ACCESSO'}
            </button>

            <p style={{ fontSize: 12, color: 'rgba(240,237,230,0.25)', textAlign: 'center', marginTop: 32, fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7 }}>
              Accedendo accetti i{' '}
              <Link href="/terms" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'none' }}>Termini di Servizio</Link>
              {' '}e la{' '}
              <Link href="/privacy" style={{ color: 'rgba(201,168,76,0.6)', textDecoration: 'none' }}>Privacy Policy</Link>.
            </p>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif' }}>
              Nuovo utente?{' '}
              <Link href="/register" style={{ color: '#C9A84C', textDecoration: 'none' }}>Crea account</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
