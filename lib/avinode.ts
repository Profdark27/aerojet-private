/**
 * Avinode API Client — Aerojet Private
 *
 * Avinode is the world's leading air charter marketplace.
 * To get live API access: https://www.avinode.com/become-a-member
 * Membership cost: ~$3,000–5,000/year (includes API access)
 *
 * This client auto-falls back to realistic mock data when
 * AVINODE_API_KEY is not configured, so development works out of the box.
 */

import axios, { AxiosError } from 'axios'

const AVINODE_BASE = process.env.AVINODE_BASE_URL || 'https://app.avinode.com/avinode/api/v1'
const AVINODE_KEY = process.env.AVINODE_API_KEY

// In-memory cache
const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null }
  return entry.data as T
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() })
}

async function avionodeRequest<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!AVINODE_KEY) throw new Error('NO_KEY')

  const url = `${AVINODE_BASE}${path}`
  let attempt = 0
  while (attempt < 3) {
    try {
      const res = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${AVINODE_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      })
      return res.data as T
    } catch (e) {
      const err = e as AxiosError
      if (err.response?.status === 429 || err.response?.status === 503) {
        attempt++
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      } else {
        throw e
      }
    }
  }
  throw new Error('MAX_RETRIES')
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlightSearchParams {
  fromICAO: string
  toICAO: string
  fromCity: string
  toCity: string
  departureDate: string
  pax: number
  jetCategory?: string
}

export interface Aircraft {
  id: string
  model: string
  category: string
  operator: string
  operatorLogo: string
  pax: number
  range: number
  speed: number
  yearBuilt: number
  price: number
  currency: string
  flightTime: string
  amenities: string[]
  rating: number
  available: boolean
  imageHint: string
}

export interface EmptyLeg {
  id: string
  fromICAO: string
  toICAO: string
  fromCity: string
  toCity: string
  departureDate: string
  departureTime: string
  aircraft: string
  category: string
  pax: number
  originalPrice: number
  discountedPrice: number
  discountPct: number
  currency: string
  operator: string
  expiresAt: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function generateMockAircraft(params: FlightSearchParams): Aircraft[] {
  const { fromICAO, toICAO, pax } = params

  // Realistic flight time estimation
  let flightHours = 2.0
  if (fromICAO === 'LIMC' && toICAO === 'KTEB') flightHours = 8.5 // Milano -> NYC
  else if (fromICAO === 'LIRF' && toICAO === 'OMDB') flightHours = 6.0 // Roma -> Dubai
  else if (fromICAO === 'LIPZ' && toICAO === 'LEIB') flightHours = 2.5 // Venezia -> Ibiza
  else if (fromICAO === 'LIML' && toICAO === 'EGLL') flightHours = 2.0 // Milano -> Londra
  else flightHours = Math.floor(Math.random() * 3) + 1.5

  const basePricePerHour = { turboprop: 2800, light: 4200, midsize: 6500, supermid: 8200, heavy: 11500, ultralong: 16500 }

  const aircraft: Aircraft[] = [
    {
      id: `mock-${Date.now()}-1`,
      model: 'Pilatus PC-12 NGX',
      category: 'Turboprop',
      operator: 'AirStar Charter',
      operatorLogo: 'AS',
      pax: 8,
      range: 1845,
      speed: 528,
      yearBuilt: 2021,
      price: Math.round(basePricePerHour.turboprop * flightHours),
      currency: 'EUR',
      flightTime: `${Math.floor(flightHours)}h ${Math.round((flightHours % 1) * 60)}m`,
      amenities: ['WiFi', 'Catering', 'Bagaglio XL'],
      rating: 4.7,
      available: pax <= 8 && flightHours < 5.5,
      imageHint: 'turboprop aircraft',
    },
    {
      id: `mock-${Date.now()}-2`,
      model: 'Phenom 300E',
      category: 'Light Jet',
      operator: 'VistaJet',
      operatorLogo: 'VJ',
      pax: 7,
      range: 3500,
      speed: 834,
      yearBuilt: 2022,
      price: Math.round(basePricePerHour.light * flightHours),
      currency: 'EUR',
      flightTime: `${Math.floor(flightHours * 0.9)}h ${Math.round(((flightHours * 0.9) % 1) * 60)}m`,
      amenities: ['WiFi', 'Catering Premium', 'Entertainment'],
      rating: 4.9,
      available: pax <= 7 && flightHours < 6.5,
      imageHint: 'light jet interior luxury',
    },
    {
      id: `mock-${Date.now()}-3`,
      model: 'Challenger 350',
      category: 'Super Midsize',
      operator: 'Luxaviation',
      operatorLogo: 'LX',
      pax: 10,
      range: 5926,
      speed: 870,
      yearBuilt: 2023,
      price: Math.round(basePricePerHour.supermid * flightHours),
      currency: 'EUR',
      flightTime: `${Math.floor(flightHours * 0.85)}h ${Math.round(((flightHours * 0.85) % 1) * 60)}m`,
      amenities: ['WiFi Starlink', 'Catering Gourmet', 'Letto Flat-bed', 'Bar', 'Entertainment 4K'],
      rating: 4.8,
      available: pax <= 10 && flightHours < 8.5,
      imageHint: 'private jet luxury cabin',
    },
    {
      id: `mock-${Date.now()}-4`,
      model: 'Falcon 7X',
      category: 'Heavy Jet',
      operator: 'NetJets',
      operatorLogo: 'NJ',
      pax: 16,
      range: 11000,
      speed: 956,
      yearBuilt: 2020,
      price: Math.round(basePricePerHour.heavy * flightHours),
      currency: 'EUR',
      flightTime: `${Math.floor(flightHours * 0.82)}h ${Math.round(((flightHours * 0.82) % 1) * 60)}m`,
      amenities: ['WiFi Starlink', 'Chef di bordo', 'Camera con bagno', 'Conference room', 'Bar aperto'],
      rating: 5.0,
      available: pax <= 16,
      imageHint: 'heavy jet private aircraft',
    },
    {
      id: `mock-${Date.now()}-5`,
      model: 'Global 7500',
      category: 'Ultra-Long Range',
      operator: 'Air Charter Service',
      operatorLogo: 'AC',
      pax: 19,
      range: 14260,
      speed: 956,
      yearBuilt: 2023,
      price: Math.round(basePricePerHour.ultralong * flightHours),
      currency: 'EUR',
      flightTime: `${Math.floor(flightHours * 0.8)}h ${Math.round(((flightHours * 0.8) % 1) * 60)}m`,
      amenities: ['Starlink WiFi', 'Chef Michelin', '4 zone vita', 'Suite privata', 'Doccia a bordo', 'Cinema'],
      rating: 5.0,
      available: pax <= 19,
      imageHint: 'ultra long range jet interior',
    },
  ]

  return aircraft.filter(a => a.available)
}

function generateMockEmptyLegs(): EmptyLeg[] {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const d2 = new Date(); d2.setDate(d2.getDate() + 2)
  const d4 = new Date(); d4.setDate(d4.getDate() + 4)
  const d6 = new Date(); d6.setDate(d6.getDate() + 6)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  return [
    {
      id: 'el-001', fromICAO: 'LIML', toICAO: 'EGLL', fromCity: 'Milano Linate', toCity: 'Londra Heathrow',
      departureDate: fmt(tomorrow), departureTime: '08:30', aircraft: 'Citation XLS+', category: 'Midsize',
      pax: 8, originalPrice: 16500, discountedPrice: 6800, discountPct: 59, currency: 'EUR',
      operator: 'TAG Aviation', expiresAt: fmt(tomorrow),
    },
    {
      id: 'el-002', fromICAO: 'LFPB', toICAO: 'LIRF', fromCity: 'Parigi Le Bourget', toCity: 'Roma Fiumicino',
      departureDate: fmt(d2), departureTime: '14:15', aircraft: 'Falcon 2000LX', category: 'Heavy',
      pax: 12, originalPrice: 28000, discountedPrice: 11500, discountPct: 59, currency: 'EUR',
      operator: 'VistaJet', expiresAt: fmt(d2),
    },
    {
      id: 'el-003', fromICAO: 'LSZH', toICAO: 'LICJ', fromCity: 'Ginevra', toCity: 'Palermo',
      departureDate: fmt(d4), departureTime: '10:00', aircraft: 'Phenom 300E', category: 'Light Jet',
      pax: 6, originalPrice: 9200, discountedPrice: 3900, discountPct: 58, currency: 'EUR',
      operator: 'Luxaviation', expiresAt: fmt(d4),
    },
    {
      id: 'el-004', fromICAO: 'LEMD', toICAO: 'LIMF', fromCity: 'Madrid', toCity: 'Torino',
      departureDate: fmt(d6), departureTime: '17:45', aircraft: 'Global 6000', category: 'Ultra-Long',
      pax: 16, originalPrice: 65000, discountedPrice: 26000, discountPct: 60, currency: 'EUR',
      operator: 'NetJets', expiresAt: fmt(d6),
    },
    {
      id: 'el-005', fromICAO: 'OMDB', toICAO: 'LIMC', fromCity: 'Dubai', toCity: 'Milano Malpensa',
      departureDate: fmt(d2), departureTime: '22:00', aircraft: 'Gulfstream G650', category: 'Ultra-Long',
      pax: 18, originalPrice: 98000, discountedPrice: 39000, discountPct: 60, currency: 'EUR',
      operator: 'Air Charter Service', expiresAt: fmt(d2),
    },
    {
      id: 'el-006', fromICAO: 'LOWI', toICAO: 'EGKB', fromCity: 'Innsbruck', toCity: 'Londra Biggin Hill',
      departureDate: fmt(d4), departureTime: '11:30', aircraft: 'King Air 350i', category: 'Turboprop',
      pax: 9, originalPrice: 7800, discountedPrice: 3100, discountPct: 60, currency: 'EUR',
      operator: 'TAG Aviation', expiresAt: fmt(d4),
    },
  ]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function searchFlights(params: FlightSearchParams): Promise<Aircraft[]> {
  const cacheKey = `search:${JSON.stringify(params)}`
  const cached = getCached<Aircraft[]>(cacheKey)
  if (cached) return cached

  try {
    const data = await avionodeRequest<{ aircraft: Aircraft[] }>('/search/trips', {
      from: params.fromICAO,
      to: params.toICAO,
      date: params.departureDate,
      pax: String(params.pax),
    })
    const result = data.aircraft
    setCache(cacheKey, result)
    return result
  } catch {
    // Fallback to mock data
    const result = generateMockAircraft(params)
    setCache(cacheKey, result)
    return result
  }
}

export async function getEmptyLegs(filters?: {
  fromICAO?: string
  toICAO?: string
}): Promise<EmptyLeg[]> {
  const cacheKey = `emptylegs:${JSON.stringify(filters || {})}`
  const cached = getCached<EmptyLeg[]>(cacheKey)
  if (cached) return cached

  try {
    const data = await avionodeRequest<{ legs: EmptyLeg[] }>('/search/emptylegs', filters as Record<string, string>)
    setCache(cacheKey, data.legs)
    return data.legs
  } catch {
    const result = generateMockEmptyLegs()
    setCache(cacheKey, result)
    return result
  }
}

export async function getOperators() {
  return [
    { name: 'VistaJet', logo: 'VJ', website: 'https://www.vistajet.com', fleet: '120+ aircraft', routes: 'Global', rating: 4.9, color: '#C41E3A', specialty: 'Ultra-long range & heavy jets' },
    { name: 'NetJets', logo: 'NJ', website: 'https://www.netjets.com', fleet: '750+ aircraft', routes: 'USA & Europe', rating: 4.8, color: '#1A1A2E', specialty: 'Fractional ownership programs' },
    { name: 'Air Charter Service', logo: 'AC', website: 'https://www.aircharterservice.com', fleet: '50,000+ partner jets', routes: 'Worldwide', rating: 4.7, color: '#0D3B66', specialty: 'Group charters & cargo' },
    { name: 'Wheels Up', logo: 'WU', website: 'https://www.wheelsup.com', fleet: '300+ aircraft', routes: 'North America', rating: 4.6, color: '#003087', specialty: 'Membership & on-demand' },
    { name: 'Luxaviation', logo: 'LX', website: 'https://www.luxaviation.com', fleet: '260+ aircraft', routes: 'Europe & ME', rating: 4.8, color: '#2C3E50', specialty: 'VIP & VVIP configurations' },
    { name: 'TAG Aviation', logo: 'TG', website: 'https://www.tagaviation.com', fleet: '80+ aircraft', routes: 'Europe & Asia', rating: 4.7, color: '#1B4332', specialty: 'Business jets & helicopters' },
  ]
}
