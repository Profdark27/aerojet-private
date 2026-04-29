'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#030508', padding: '72px 48px 32px', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 48, marginBottom: 64 }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ color: '#C9A84C', fontSize: 18 }}>✦</span>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6 }}>AEROJET</span>
              <span style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', alignSelf: 'flex-end', marginBottom: 2 }}>PRIVATE</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.8, fontWeight: 300 }}>
              Il lusso del tempo.<br />La libertà del cielo.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
              {['in', 'tw', 'ig'].map(s => (
                <div key={s} style={{ width: 36, height: 36, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif' }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>SERVIZI</div>
            {['Charter Privato', 'Jet Card', 'Empty Legs', 'Membership', 'Elicottero', 'Cargo Aereo'].map(l => (
              <div key={l} style={{ marginBottom: 12 }}>
                <Link href="#" style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.5)')}>
                  {l}
                </Link>
              </div>
            ))}
          </div>

          {/* Operators */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>OPERATORI</div>
            {[['VistaJet', 'https://www.vistajet.com'], ['NetJets', 'https://www.netjets.com'], ['Air Charter Service', 'https://www.aircharterservice.com'], ['Wheels Up', 'https://www.wheelsup.com'], ['Luxaviation', 'https://www.luxaviation.com'], ['TAG Aviation', 'https://www.tagaviation.com']].map(([name, href]) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,230,0.5)')}>
                  {name}
                </a>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 24 }}>CONTATTI</div>
            <div style={{ fontSize: 14, color: 'rgba(240,237,230,0.5)', fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, lineHeight: 2 }}>
              <div>concierge@aerojet.app</div>
              <div>+39 02 1234 5678</div>
              <div style={{ marginTop: 16, fontSize: 12, color: '#C9A84C' }}>Disponibili 24/7</div>
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>CERTIFICAZIONI</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['EASA', 'FAA', 'IATA', 'AOC'].map(c => (
                  <span key={c} style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '3px 8px', fontFamily: 'Helvetica Neue, sans-serif' }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(201,168,76,0.1)', margin: '0 0 28px' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(240,237,230,0.25)', fontFamily: 'Helvetica Neue, sans-serif' }}>
            © 2026 Aerojet Private. Tutti i diritti riservati. P.IVA IT12345678901
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Termini di Servizio', 'Cookie Policy', 'Broker Area'].map(l => (
              <Link key={l} href="#" style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', textDecoration: 'none', fontFamily: 'Helvetica Neue, sans-serif' }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
