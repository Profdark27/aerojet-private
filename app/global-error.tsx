'use client'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, background: '#0A0C14', color: '#F0EDE6', fontFamily: 'Georgia, serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 48, color: '#C9A84C', marginBottom: 32 }}>✦</div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>ERRORE DI SISTEMA</div>
            <h1 style={{ fontSize: 36, fontWeight: 300, margin: '0 0 16px' }}>Qualcosa è andato storto</h1>
            <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 40, lineHeight: 1.8 }}>
              Si è verificato un errore imprevisto. Il team tecnico è stato notificato.
              {error.digest && <><br /><code style={{ fontSize: 11, color: 'rgba(240,237,230,0.25)' }}>#{error.digest}</code></>}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ background: '#C9A84C', border: 'none', color: '#0A0C14', padding: '13px 32px', fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                RIPROVA
              </button>
              <a href="/" style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C', padding: '13px 32px', fontSize: 12, letterSpacing: 2, textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif' }}>
                HOME
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
