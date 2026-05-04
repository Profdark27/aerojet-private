'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plane, ArrowRight } from 'lucide-react'

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
  className?: string
}

export default function CityAutocomplete({ label, value, onChange, placeholder = 'City or ICAO', className }: Props) {
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
      ).slice(0, 8)
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
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 mb-3 ml-1">
         <div className="w-1 h-1 bg-gold rounded-full" />
         <div className="text-[9px] tracking-[0.4em] text-gold uppercase font-bold opacity-60">
           {label}
         </div>
      </div>
      <div className="relative group">
        <MapPin className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-500 ${open ? 'text-gold scale-110' : 'text-white/10 group-hover:text-gold/30'}`} />
        <input
          ref={inputRef}
          className="bg-transparent border-b border-white/10 w-full py-4 pl-8 text-white font-serif text-lg outline-none focus:border-gold transition-all duration-700 placeholder:text-white/10"
          placeholder={placeholder}
          value={query}
          onChange={e => { 
            const val = e.target.value; 
            setQuery(val); 
            setOpen(true); 
            setHighlighted(0);
            onChange(val, ''); 
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKey}
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div 
            ref={listRef}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-4 glass-card bg-black/80 backdrop-blur-3xl border border-white/10 z-[200] shadow-[0_30px_60px_rgba(0,0,0,0.9)] rounded-[2rem] overflow-hidden"
          >
            {filtered.map((airport, i) => (
              <div 
                key={airport.code}
                onMouseDown={() => select(airport)}
                onMouseEnter={() => setHighlighted(i)}
                className={`px-8 py-5 cursor-pointer transition-all duration-500 flex items-center justify-between group/item ${
                  i === highlighted ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${
                    i === highlighted ? 'bg-gold text-darker shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 'bg-white/5 text-gold/30'
                  }`}>
                    <Plane size={16} />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium group-hover/item:text-gold transition-colors">{airport.city}</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">{airport.label}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${i === highlighted ? 'text-gold' : 'text-white/20'}`}>
                    {airport.code}
                  </span>
                  {i === highlighted && (
                    <motion.div 
                      layoutId="arrow"
                      className="text-[7px] text-gold/40 mt-1 flex items-center gap-1 font-black"
                    >
                      SELECT <ArrowRight size={8} />
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
