'use client'
import { useState, useRef, useEffect } from 'react'

// Top 40 European + international airports for private aviation
const AIRPORTS = [
  { city: 'Milano', code: 'LIML', label: 'Milano Linate' },
  { city: 'Milano', code: 'LIMC', label: 'Milano Malpensa' },
  { city: 'Roma', code: 'LIRF', label: 'Roma Fiumicino' },
  { city: 'Roma', code: 'LIRA', label: 'Roma Ciampino' },
  { city: 'Venezia', code: 'LIPZ', label: 'Venezia Marco Polo' },
  { city: 'Torino', code: 'LIMF', label: 'Torino Caselle' },
  { city: 'Napoli', code: 'LIRN', label: 'Napoli Capodichino' },
  { city: 'Bologna', code: 'LIPE', label: 'Bologna Borgo Panigale' },
  { city: 'Firenze', code: 'LIRQ', label: 'Firenze Peretola' },
  { city: 'Palermo', code: 'LICJ', label: 'Palermo Falcone Borsellino' },
  { city: 'Londra', code: 'EGLL', label: 'Londra Heathrow' },
  { city: 'Londra', code: 'EGLF', label: 'Londra Farnborough' },
  { city: 'Londra', code: 'EGKB', label: 'Londra Biggin Hill' },
  { city: 'Parigi', code: 'LFPB', label: 'Parigi Le Bourget' },
  { city: 'Parigi', code: 'LFPO', label: 'Parigi Orly' },
  { city: 'Ginevra', code: 'LSZH', label: 'Ginevra GVA' },
  { city: 'Zurigo', code: 'LSZR', label: 'Zurigo Altenrhein' },
  { city: 'Monaco', code: 'EDDM', label: 'Monaco di Baviera' },
  { city: 'Berlino', code: 'EDDB', label: 'Berlino Brandeburgo' },
  { city: 'Vienna', code: 'LOWW', label: 'Vienna Schwechat' },
  { city: 'Barcellona', code: 'LEBL', label: 'Barcellona El Prat' },
  { city: 'Madrid', code: 'LEMD', label: 'Madrid Barajas' },
  { city: 'Lisbona', code: 'LPPT', label: 'Lisbona Humberto Delgado' },
  { city: 'Amsterdam', code: 'EHAM', label: 'Amsterdam Schiphol' },
  { city: 'Bruxelles', code: 'EBBR', label: 'Bruxelles Zaventem' },
  { city: 'Nizza', code: 'LFMN', label: 'Nizza Côte d\'Azur' },
  { city: 'Montecarlo', code: 'LNMC', label: 'Montecarlo (Eliporto)' },
  { city: 'Ibiza', code: 'LEIB', label: 'Ibiza' },
  { city: 'Mykonos', code: 'LGMK', label: 'Mykonos' },
  { city: 'Santorini', code: 'LGSR', label: 'Santorini Thira' },
  { city: 'Dubai', code: 'OMDB', label: 'Dubai International' },
  { city: 'Dubai', code: 'OMDW', label: 'Dubai Al Maktoum' },
  { city: 'Abu Dhabi', code: 'OMAA', label: 'Abu Dhabi International' },
  { city: 'New York', code: 'KTEB', label: 'New York Teterboro' },
  { city: 'New York', code: 'KJFK', label: 'New York JFK' },
  { city: 'Los Angeles', code: 'KVNY', label: 'Los Angeles Van Nuys' },
  { city: 'Miami', code: 'KOPF', label: 'Miami Opa-locka Executive' },
  { city: 'Mosca', code: 'UUDD', label: 'Mosca Domodedovo' },
  { city: 'Tokyo', code: 'RJTT', label: 'Tokyo Haneda' },
  { city: 'Singapore', code: 'WSSS', label: 'Singapore Changi' },
  { city: 'Hong Kong', code: 'VHHH', label: 'Hong Kong International' },
  { city: 'Maldive', code: 'VRMM', label: 'Maldive Malé' },
  { city: 'Aspen', code: 'KASE', label: 'Aspen Pitkin County' },
  { city: 'St. Moritz', code: 'LSZS', label: 'Samedan (St. Moritz)' },
  { city: 'Cortina', code: 'LIVT', label: 'Treviso (per Cortina)' },
]

interface Props {
  label: string
  value: string
  onChange: (city: string, icao: string) => void
  placeholder?: string
  style?: React.CSSProperties
}

export default function CityAutocomplete({ label, value, onChange, placeholder = 'Città o aeroporto', style }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = query.length >= 2
    ? AIRPORTS.filter(a =>
        a.city.toLowerCase().includes(query.toLowerCase()) ||
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  useEffect(() => { setQuery(value) }, [value])

  const select = (airport: typeof AIRPORTS[0]) => {
    setQuery(airport.city)
    onChange(airport.city, airport.code)
    setOpen(false)
    setHighlighted(0)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); select(filtered[highlighted]) }
    if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 8 }}>{label}</div>
      <input
        ref={inputRef}
        className="luxury-input"
        placeholder={placeholder}
        value={query}
        onChange={e => { 
          const val = e.target.value; 
          setQuery(val); 
          setOpen(true); 
          setHighlighted(0);
          onChange(val, ''); // Pass raw value immediately to sync parent state
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div ref={listRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0F1220', border: '1px solid rgba(201,168,76,0.25)', zIndex: 200, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', maxHeight: 260, overflowY: 'auto' }}>
          {filtered.map((airport, i) => (
            <div key={airport.code}
              onMouseDown={() => select(airport)}
              style={{ padding: '12px 16px', cursor: 'pointer', background: i === highlighted ? 'rgba(201,168,76,0.08)' : 'transparent', borderLeft: i === highlighted ? '2px solid #C9A84C' : '2px solid transparent', transition: 'all 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, color: '#F0EDE6', fontWeight: i === highlighted ? 500 : 400 }}>{airport.city}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif' }}>{airport.label}</div>
              </div>
              <span style={{ fontSize: 11, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', letterSpacing: 1, flexShrink: 0 }}>{airport.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
