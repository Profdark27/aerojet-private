// TODO: [PERFORMANCE] File exceeds 300 lines. Consider refactoring/splitting for better maintainability.
/**
 * AEROJET PRIVATE — Autonomous Flight Dispatcher Engine
 *
 * Traccia ogni volo prenotato in tempo reale:
 * - Status: SCHEDULED → BOARDING → AIRBORNE → LANDED
 * - Alert automatici (meteo, ritardi, slot ATC)
 * - Calcolo ETAs dinamico
 * - Notifiche proattive a broker e cliente
 * - Escalation automatica se problemi rilevati
 */

export type FlightStatus =
  | 'SCHEDULED'   // prenotato, non ancora partito
  | 'PREFLIGHT'   // briefing equipaggio in corso
  | 'BOARDING'    // passeggeri a bordo
  | 'TAXIING'     // in rullaggio
  | 'AIRBORNE'    // in volo
  | 'DESCENDING'  // discesa
  | 'LANDED'      // atterrato
  | 'COMPLETE'    // completato + feedback inviato
  | 'DELAYED'     // ritardo
  | 'CANCELLED'   // cancellato

export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL'

export interface FlightAlert {
  id: string
  flightId: string
  level: AlertLevel
  type: 'WEATHER' | 'ATC_SLOT' | 'CREW' | 'AIRCRAFT' | 'PASSENGER' | 'CUSTOMS' | 'DELAY' | 'FUEL'
  message: string
  suggestion: string
  autoResolved: boolean
  createdAt: string
  resolvedAt?: string
}

export interface FlightPosition {
  lat: number
  lon: number
  altitude: number // ft
  speed: number    // knots
  heading: number  // degrees
}

export interface TrackedFlight {
  id: string
  bookingId: string
  registrazione: string      // N-XXXX
  model: string
  operator: string
  fromICAO: string
  toICAO: string
  fromCity: string
  toCity: string
  clientName: string
  clientPhone: string
  pax: number
  scheduledDep: string       // ISO
  scheduledArr: string       // ISO
  actualDep?: string
  estimatedArr?: string
  status: FlightStatus
  position?: FlightPosition
  altitude?: number
  groundspeed?: number
  heading?: number
  progress: number           // 0-100
  alerts: FlightAlert[]
  crewPic: string            // Pilot in Command
  crewSic?: string           // Second in Command
  cateringStatus: 'PENDING' | 'CONFIRMED' | 'LOADED'
  groundTransfer: 'NONE' | 'BOOKED' | 'WAITING' | 'COMPLETE'
  customsStatus: 'NA' | 'PENDING' | 'CLEARED'
  fuelState: 'PLANNED' | 'LOADED' | 'OK'
  weather: {
    dep: string
    arr: string
    enroute: string
    sigmet: boolean
  }
  notes: string[]
  lastUpdate: string
}

// ── In-memory flight store (Prisma in production) ─────────────────────────────
const FLIGHTS: TrackedFlight[] = [
  {
    id: 'FLT-001',
    bookingId: 'BK-004',
    registrazione: 'OE-FGS',
    model: 'Phenom 300E',
    operator: 'VistaJet',
    fromICAO: 'LIML',
    toICAO: 'EGLL',
    fromCity: 'Milano Linate',
    toCity: 'Londra Farnborough',
    clientName: 'Marco Ferretti',
    clientPhone: '+39 347 1234567',
    pax: 3,
    scheduledDep: new Date(Date.now() - 45 * 60000).toISOString(),
    scheduledArr: new Date(Date.now() + 75 * 60000).toISOString(),
    actualDep: new Date(Date.now() - 40 * 60000).toISOString(),
    estimatedArr: new Date(Date.now() + 80 * 60000).toISOString(),
    status: 'AIRBORNE',
    position: { lat: 47.2, lon: 3.8, altitude: 41000, speed: 442, heading: 298 },
    progress: 35,
    alerts: [
      {
        id: 'ALT-001', flightId: 'FLT-001', level: 'WARNING',
        type: 'WEATHER',
        message: 'SIGMET attivo Canale della Manica: turbolenza moderata FL350-FL410',
        suggestion: 'Equipaggio informato. Rotta alternativa via BIBAX considerata.',
        autoResolved: false,
        createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
    ],
    crewPic: 'Capt. A. Moretti (12,400h)',
    crewSic: 'F/O R. Bianchi (3,200h)',
    cateringStatus: 'LOADED',
    groundTransfer: 'BOOKED',
    customsStatus: 'CLEARED',
    fuelState: 'OK',
    weather: { dep: '✅ CAVOK', arr: '⚠️ BKN020 12KT', enroute: '⚠️ SIGMET CB FL350-410', sigmet: true },
    notes: ['Catering: champagne Krug + antipasti misti confermato', 'Transfer Farnborough → City: Mercedes EQS prenotata'],
    lastUpdate: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'FLT-002',
    bookingId: 'BK-005',
    registrazione: 'M-YKTS',
    model: 'Falcon 7X',
    operator: 'NetJets',
    fromICAO: 'LIRF',
    toICAO: 'OMDB',
    fromCity: 'Roma Fiumicino',
    toCity: 'Dubai International',
    clientName: 'Sofia Ricci',
    clientPhone: '+39 335 9876543',
    pax: 6,
    scheduledDep: new Date(Date.now() + 3 * 3600000).toISOString(),
    scheduledArr: new Date(Date.now() + 9 * 3600000).toISOString(),
    estimatedArr: new Date(Date.now() + 9 * 3600000).toISOString(),
    status: 'PREFLIGHT',
    progress: 0,
    alerts: [
      {
        id: 'ALT-002', flightId: 'FLT-002', level: 'INFO',
        type: 'CUSTOMS',
        message: 'Documenti doganali UAE: dichiarazione valuta > $10,000 richiesta per passeggero in business travel',
        suggestion: 'Invia modulo pre-dichiarazione ai passeggeri via WhatsApp.',
        autoResolved: false,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
    crewPic: 'Capt. L. Esposito (18,200h)',
    crewSic: 'F/O M. Klein (5,100h)',
    cateringStatus: 'CONFIRMED',
    groundTransfer: 'BOOKED',
    customsStatus: 'PENDING',
    fuelState: 'PLANNED',
    weather: { dep: '✅ CAVOK', arr: '✅ SKC 30°C', enroute: '✅ Rotta libera', sigmet: false },
    notes: ['Catering Dubai: menu halal certificato', 'Suite VIP Dubai Creek Golf Club confermata'],
    lastUpdate: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'FLT-003',
    bookingId: 'BK-006',
    registrazione: 'OY-BZB',
    model: 'Global 7500',
    operator: 'Air Charter Service',
    fromICAO: 'LIMC',
    toICAO: 'KTEB',
    fromCity: 'Milano Malpensa',
    toCity: 'New York Teterboro',
    clientName: 'Luca Bianchi',
    clientPhone: '+39 334 5556789',
    pax: 2,
    scheduledDep: new Date(Date.now() + 72 * 3600000).toISOString(),
    scheduledArr: new Date(Date.now() + 84 * 3600000).toISOString(),
    estimatedArr: new Date(Date.now() + 84 * 3600000).toISOString(),
    status: 'SCHEDULED',
    progress: 0,
    alerts: [],
    crewPic: 'Capt. G. Ferrari (22,000h)',
    crewSic: 'F/O S. Müller (6,800h)',
    cateringStatus: 'PENDING',
    groundTransfer: 'NONE',
    customsStatus: 'NA',
    fuelState: 'PLANNED',
    weather: { dep: 'N/D', arr: 'N/D', enroute: 'N/D', sigmet: false },
    notes: ['Slot EDDF confermato per via oceano', 'ETOPS 180 certificazione verificata'],
    lastUpdate: new Date(Date.now() - 7200000).toISOString(),
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
export function getFlights(): TrackedFlight[] {
  // Simulate real-time position update for airborne flights
  return FLIGHTS.map(f => {
    if (f.status !== 'AIRBORNE') return f
    const elapsed = f.actualDep ? (Date.now() - new Date(f.actualDep).getTime()) / 60000 : 0
    const total = f.estimatedArr ? (new Date(f.estimatedArr).getTime() - new Date(f.actualDep!).getTime()) / 60000 : 120
    const progress = Math.min(Math.round((elapsed / total) * 100), 99)
    return { ...f, progress, lastUpdate: new Date().toISOString() }
  })
}

export function getFlight(id: string): TrackedFlight | undefined {
  return getFlights().find(f => f.id === id)
}

export function getFlightAlerts(): FlightAlert[] {
  return FLIGHTS.flatMap(f => f.alerts).filter(a => !a.autoResolved)
}

export function resolveAlert(flightId: string, alertId: string): boolean {
  const flight = FLIGHTS.find(f => f.id === flightId)
  if (!flight) return false
  const alert = flight.alerts.find(a => a.id === alertId)
  if (!alert) return false
  alert.autoResolved = true
  alert.resolvedAt = new Date().toISOString()
  return true
}

export function updateFlightStatus(id: string, status: FlightStatus): boolean {
  const f = FLIGHTS.find(f => f.id === id)
  if (!f) return false
  f.status = status
  if (status === 'AIRBORNE' && !f.actualDep) f.actualDep = new Date().toISOString()
  if (status === 'LANDED') f.progress = 100
  f.lastUpdate = new Date().toISOString()
  return true
}

export function addNote(id: string, note: string): boolean {
  const f = FLIGHTS.find(f => f.id === id)
  if (!f) return false
  f.notes.unshift(`[${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}] ${note}`)
  return true
}

// ── Dispatcher AI logic ───────────────────────────────────────────────────────
export interface DispatcherDecision {
  flightId: string
  action: string
  reason: string
  priority: 'ROUTINE' | 'URGENT' | 'CRITICAL'
  autoExecuted: boolean
}

export async function runAutonomousCheck(): Promise<DispatcherDecision[]> {
  const decisions: DispatcherDecision[] = []
  const flights = getFlights()

  for (const f of flights) {
    // Check 1: Pre-flight catering 2h out
    if (f.status === 'PREFLIGHT' && f.cateringStatus === 'PENDING') {
      decisions.push({
        flightId: f.id,
        action: `Sollecito catering ${f.operator} per ${f.fromCity}: partenza tra meno di 3 ore`,
        reason: 'Catering non confermato a 3h dalla partenza',
        priority: 'URGENT',
        autoExecuted: true,
      })
    }

    // Check 2: Ground transfer booked?
    if (f.status === 'AIRBORNE' && f.groundTransfer === 'NONE' && f.pax > 0) {
      decisions.push({
        flightId: f.id,
        action: `Prenotare transfer a ${f.toCity} per ${f.pax} pax`,
        reason: 'Nessun transfer all\'arrivo prenotato per volo in corso',
        priority: 'URGENT',
        autoExecuted: false,
      })
    }

    // Check 3: Customs for international
    if (f.status === 'PREFLIGHT' && f.customsStatus === 'PENDING') {
      decisions.push({
        flightId: f.id,
        action: `Invia modulo doganale UAE ai ${f.pax} passeggeri via WhatsApp`,
        reason: 'Volo internazionale con dogana pendente a 3h dalla partenza',
        priority: 'URGENT',
        autoExecuted: true,
      })
    }

    // Check 4: Weather SIGMET active
    if (f.status === 'AIRBORNE' && f.weather.sigmet) {
      decisions.push({
        flightId: f.id,
        action: 'Monitoraggio SIGMET attivo. Coordinamento ATC per deviazione se necessario.',
        reason: 'SIGMET turbolenza attivo sulla rotta',
        priority: 'URGENT',
        autoExecuted: true,
      })
    }

    // Check 5: ETA update 30min before landing
    if (f.status === 'AIRBORNE' && f.progress >= 75) {
      decisions.push({
        flightId: f.id,
        action: `SMS automatico a ${f.clientName}: "Il suo volo è in fase di discesa verso ${f.toCity}. ETA ${new Date(f.estimatedArr!).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}"`,
        reason: 'Progresso volo >75% — notifica avvicinamento',
        priority: 'ROUTINE',
        autoExecuted: true,
      })
    }
  }

  return decisions
}

export function getFlightEfficiency(f: TrackedFlight): {
  onTimeScore: number
  serviceScore: number
  overallScore: number
  issues: string[]
} {
  const issues: string[] = []
  let onTimeScore = 100
  let serviceScore = 100

  if (f.alerts.some(a => a.type === 'DELAY')) { onTimeScore -= 30; issues.push('Ritardo registrato') }
  if (f.cateringStatus === 'PENDING') { serviceScore -= 20; issues.push('Catering non confermato') }
  if (f.groundTransfer === 'NONE') { serviceScore -= 15; issues.push('Transfer arrivo mancante') }
  if (f.customsStatus === 'PENDING') { serviceScore -= 10; issues.push('Dogana pendente') }
  if (f.weather.sigmet) { onTimeScore -= 10; issues.push('SIGMET sulla rotta') }

  const overall = Math.round((onTimeScore + serviceScore) / 2)
  return { onTimeScore: Math.max(0, onTimeScore), serviceScore: Math.max(0, serviceScore), overallScore: Math.max(0, overall), issues }
}
