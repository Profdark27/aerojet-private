import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', justifyContent: 'center', marginBottom: 56 }}>
          <span style={{ color: '#C9A84C', fontSize: 20 }}>✦</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>PRIVATE</span>
        </Link>
        <div style={{ fontSize: 48, color: '#C9A84C', marginBottom: 28 }}>✉</div>
        <h2 style={{ fontSize: 30, fontWeight: 300, marginBottom: 16 }}>Controlli la sua email</h2>
        <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 12 }}>
          Abbiamo inviato un link di accesso sicuro al suo indirizzo email.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 40 }}>
          Il link è valido per 15 minuti. Controlli anche la cartella spam.
        </p>
        <Link href="/login" style={{ fontSize: 12, letterSpacing: 2, color: '#C9A84C', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', border: '1px solid rgba(201,168,76,0.3)', padding: '12px 28px', display: 'inline-block' }}>
          ← TORNA AL LOGIN
        </Link>
      </div>
    </div>
  )
}
