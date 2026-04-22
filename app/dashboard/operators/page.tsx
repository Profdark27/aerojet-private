'use client'
import { useState } from 'react'

const operators = [
  { name: 'VistaJet', logo: 'VJ', website: 'https://www.vistajet.com', fleet: '120+ aircraft', routes: 'Global', rating: 4.9, color: '#C41E3A', specialty: 'Ultra-long range & heavy jets', cert: 'EASA / FAA / CAAC', contact: 'charter@vistajet.com', phone: '+44 20 7868 8888', notes: 'Preferire per voli oltre 8h. Risposta entro 30min.' },
  { name: 'NetJets', logo: 'NJ', website: 'https://www.netjets.com', fleet: '750+ aircraft', routes: 'USA & Europe', rating: 4.8, color: '#1A1A2E', specialty: 'Fractional ownership programs', cert: 'FAA Part 135 / EASA', contact: 'ops@netjets.eu', phone: '+33 1 4400 9900', notes: 'Ottimo per clienti corporate. Quote entro 2h.' },
  { name: 'Air Charter Service', logo: 'AC', website: 'https://www.aircharterservice.com', fleet: '50,000+ partner jets', routes: 'Worldwide', rating: 4.7, color: '#0D3B66', specialty: 'Group charters & cargo', cert: 'IATA / ICAO', contact: 'london@aircharterservice.com', phone: '+44 20 8897 1055', notes: 'Ideale per grandi gruppi. Sempre disponibili H24.' },
  { name: 'Wheels Up', logo: 'WU', website: 'https://www.wheelsup.com', fleet: '300+ aircraft', routes: 'North America', rating: 4.6, color: '#003087', specialty: 'Membership & on-demand', cert: 'FAA Part 135', contact: 'members@wheelsup.com', phone: '+1 212 380 2500', notes: 'Solo Nord America. Buono per clienti USA.' },
  { name: 'Luxaviation', logo: 'LX', website: 'https://www.luxaviation.com', fleet: '260+ aircraft', routes: 'Europe & ME', rating: 4.8, color: '#2C3E50', specialty: 'VIP & VVIP configurations', cert: 'EASA Part-OPS', contact: 'charter@luxaviation.com', phone: '+352 26 53 97 97', notes: 'Top per VVIP. Configurazioni cabina personalizzate.' },
  { name: 'TAG Aviation', logo: 'TG', website: 'https://www.tagaviation.com', fleet: '80+ aircraft', routes: 'Europe & Asia', rating: 4.7, color: '#1B4332', specialty: 'Business jets & helicopters', cert: 'EASA / CAD Hong Kong', contact: 'charter@tagaviation.com', phone: '+41 22 710 2525', notes: 'Ginevra e Monaco base principale. Elicotteri disponibili.' },
]

export default function OperatorsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>(Object.fromEntries(operators.map(o => [o.name, o.notes])))

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>GESTIONE</div>
        <h1 style={{ fontSize: 32, fontWeight: 300 }}>Operatori Partner</h1>
        <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 8 }}>6 operatori certificati · Accesso Avinode network (4,500+ operatori)</p>
      </div>

      {/* Network banner */}
      <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', padding: '20px 28px', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Avinode Marketplace</div>
          <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.45)', fontFamily: 'Helvetica Neue, sans-serif' }}>Accesso a 4,500+ operatori in 85 paesi tramite API</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['4,500+', 'Operatori'], ['85', 'Paesi'], ['8,000+', 'Jet']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, color: '#C9A84C', fontWeight: 300 }}>{n}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>{l}</div>
            </div>
          ))}
          <a href="https://www.avinode.com/become-a-member" target="_blank" rel="noopener noreferrer"
            className="btn-outline-gold" style={{ padding: '10px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            MEMBERSHIP →
          </a>
        </div>
      </div>

      {/* Operators grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
        {operators.map((op) => {
          const isSelected = selected === op.name
          return (
            <div key={op.name}
              onClick={() => setSelected(isSelected ? null : op.name)}
              style={{ background: isSelected ? '#141728' : '#0A0C14', padding: 28, cursor: 'pointer', transition: 'all 0.2s', borderLeft: isSelected ? `3px solid ${op.color}` : '3px solid transparent' }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#0D0F1A' }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#0A0C14' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, background: op.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>
                  {op.logo}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{op.name}</div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif' }}>{op.cert}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#C9A84C' }}>★</span>
                  <span style={{ fontSize: 14, color: '#C9A84C' }}>{op.rating}</span>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.55)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>{op.specialty}</div>

              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif' }}>
                <span>✈ {op.fleet}</span>
                <span>🌐 {op.routes}</span>
              </div>
            </div>
          )
        })}

        {/* Detail panel */}
        {selected && (() => {
          const op = operators.find(o => o.name === selected)!
          return (
            <div style={{ background: '#0F1220', padding: 28, borderLeft: '1px solid rgba(201,168,76,0.15)', gridColumn: 'span 1', alignSelf: 'flex-start', position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, background: op.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Helvetica Neue, sans-serif' }}>{op.logo}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{op.name}</div>
              <div style={{ fontSize: 12, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 2, marginBottom: 24 }}>OPERATORE CERTIFICATO</div>

              {[['Email', op.contact], ['Telefono', op.phone], ['Flotta', op.fleet], ['Rotte', op.routes], ['Certificazioni', op.cert]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
                  <span style={{ fontSize: 11, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1 }}>{l}</span>
                  <span style={{ fontSize: 13, color: 'rgba(240,237,230,0.75)', fontFamily: 'Helvetica Neue, sans-serif' }}>{v}</span>
                </div>
              ))}

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 10 }}>NOTE PRIVATE</div>
                <textarea value={notes[op.name]} onChange={e => setNotes(prev => ({ ...prev, [op.name]: e.target.value }))}
                  style={{ width: '100%', background: '#0A0C14', border: '1px solid rgba(201,168,76,0.15)', color: 'rgba(240,237,230,0.7)', padding: 12, fontSize: 13, fontFamily: 'Helvetica Neue, sans-serif', outline: 'none', resize: 'vertical', minHeight: 80, lineHeight: 1.6 }} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <a href={`mailto:${op.contact}`} className="btn-gold" style={{ flex: 1, padding: '11px', textDecoration: 'none', textAlign: 'center', fontSize: 11, letterSpacing: 2 }}>CONTATTA</a>
                <a href={op.website} target="_blank" rel="noopener noreferrer" className="btn-outline-gold" style={{ flex: 1, padding: '11px', textDecoration: 'none', textAlign: 'center', fontSize: 11, letterSpacing: 2 }}>SITO WEB</a>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
