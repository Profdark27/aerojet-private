import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,168,76,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', justifyContent: 'center', marginBottom: 64 }}>
          <span style={{ color: '#C9A84C', fontSize: 20 }}>✦</span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
          <span style={{ fontSize: 10, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end', marginBottom: 2 }}>PRIVATE</span>
        </Link>

        <div style={{ fontSize: 'clamp(80px,15vw,160px)', fontWeight: 300, color: 'rgba(201,168,76,0.12)', lineHeight: 1, letterSpacing: 8, marginBottom: 0 }}>
          404
        </div>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 20, marginTop: -8 }}>
          PAGINA NON TROVATA
        </div>

        <h1 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 300, margin: '0 0 16px', letterSpacing: 1 }}>
          Questa rotta non esiste
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, marginBottom: 48, maxWidth: 400, margin: '0 auto 48px' }}>
          La pagina che sta cercando non esiste o è stata spostata. Utilizzi la navigazione principale.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-gold" style={{ padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }}>
            HOME ✦
          </Link>
          <Link href="/search" className="btn-outline-gold" style={{ padding: '14px 36px', textDecoration: 'none', display: 'inline-block' }}>
            CERCA VOLI
          </Link>
        </div>
      </div>
    </div>
  )
}
