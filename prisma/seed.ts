/**
 * Aerojet Private — Demo Seed
 * Operatori + 6 inquiry + 3 booking per demo analytics completa
 *
 * npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Date helpers ──────────────────────────────────────────────────────────────
const ago = (days: number, hours = 9) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hours, 0, 0, 0)
  return d
}
const fromNow = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(10, 0, 0, 0)
  return d
}

// ── Users ───────────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Admin Broker', email: 'admin@aerojet.private', role: 'BROKER' }
]

// ── Operators ─────────────────────────────────────────────────────────────────
const OPERATORS = [
  { name: 'VistaJet',           logo: 'VJ', website: 'https://www.vistajet.com',           fleet: '120+ aircraft',       routes: 'Global',          rating: 4.9, color: '#C41E3A', certifications: 'EASA,FAA,CAAC',    specialty: 'Ultra-long range & heavy jets',   active: true },
  { name: 'NetJets',            logo: 'NJ', website: 'https://www.netjets.com',             fleet: '750+ aircraft',       routes: 'USA & Europe',    rating: 4.8, color: '#1A1A2E', certifications: 'FAA Part 135,EASA', specialty: 'Fractional ownership programs',   active: true },
  { name: 'Air Charter Service',logo: 'AC', website: 'https://www.aircharterservice.com',   fleet: '50,000+ partner jets',routes: 'Worldwide',       rating: 4.7, color: '#0D3B66', certifications: 'IATA,ICAO',         specialty: 'Group charters & cargo',          active: true },
  { name: 'Wheels Up',          logo: 'WU', website: 'https://www.wheelsup.com',            fleet: '300+ aircraft',       routes: 'North America',   rating: 4.6, color: '#003087', certifications: 'FAA Part 135',      specialty: 'Membership & on-demand',          active: true },
  { name: 'Luxaviation',        logo: 'LX', website: 'https://www.luxaviation.com',         fleet: '260+ aircraft',       routes: 'Europe & ME',     rating: 4.8, color: '#2C3E50', certifications: 'EASA Part-OPS',     specialty: 'VIP & VVIP configurations',       active: true },
  { name: 'TAG Aviation',       logo: 'TG', website: 'https://www.tagaviation.com',         fleet: '80+ aircraft',        routes: 'Europe & Asia',   rating: 4.7, color: '#1B4332', certifications: 'EASA,CAD Hong Kong',specialty: 'Business jets & helicopters',    active: true },
]

// ── Inquiries (6, tier diversi, spread 30gg) ──────────────────────────────────
const INQUIRIES = [
  {
    // VIP — Milano→Londra, heavy budget, urgente
    name: 'Alessandro Ferretti', email: 'a.ferretti@vip-client.com', phone: '+39 02 8765 4321',
    fromCity: 'Milano', toCity: 'Londra', flightDate: fromNow(2).toISOString().split('T')[0],
    pax: 8, budget: '> €100,000', message: 'Urgente, volo domani per meeting a Londra. Massima discrezione.',
    flightType: 'oneway',
    pipelineStatus: 'QUOTING',
    leadScore: 100, leadTier: 'VIP', budgetNumeric: 150000,
    urgency: true, urgencyFlag: true, sameDay: false, membershipInterest: false,
    nextAction: 'CALL_NOW', suggestedAction: 'CALL NOW — VIP, chiama entro 15 min',
    operatorCostEstimate: 133929, clientQuoteEstimate: 150500,
    marginEstimate: 16571, marginPercent: 11.0,
    suggestedQuote: 150000, optimizedQuote: 150000, optimizedMargin: 16071,
    revenuePotential: 150000,
    nextFollowUpAt: ago(0),
    createdAt: ago(2, 8),
  },
  {
    // HIGH — Roma→Dubai, heavy jet
    name: 'Giovanna Marchetti', email: 'g.marchetti@stellacorp.it', phone: '+39 06 3344 5566',
    fromCity: 'Roma', toCity: 'Dubai', flightDate: fromNow(5).toISOString().split('T')[0],
    pax: 4, budget: '€40,000 – €100,000', message: 'Viaggio d\'affari Roma–Dubai per 4 executive. Preferisco Heavy jet.',
    flightType: 'oneway',
    pipelineStatus: 'CONTACTED',
    leadScore: 70, leadTier: 'HIGH', budgetNumeric: 65000,
    urgency: false, urgencyFlag: false, sameDay: false, membershipInterest: false,
    nextAction: 'WHATSAPP_NOW', suggestedAction: 'WhatsApp entro 1h — lead HIGH',
    operatorCostEstimate: 58036, clientQuoteEstimate: 65500,
    marginEstimate: 7464, marginPercent: 11.4,
    suggestedQuote: 65000, optimizedQuote: 65000, optimizedMargin: 6964,
    revenuePotential: 65000,
    nextFollowUpAt: ago(6),
    createdAt: ago(8, 14),
  },
  {
    // HIGH urgente — Milano→Parigi, WON (depositPaid su booking corrispondente)
    name: 'Marco Bellini', email: 'marco.bellini@nexttrade.eu', phone: '+39 02 5544 8800',
    fromCity: 'Milano', toCity: 'Londra', flightDate: ago(5).toISOString().split('T')[0],
    pax: 4, budget: '€40,000 – €100,000', message: 'Prenotazione confermata. Ottima esperienza.',
    flightType: 'oneway',
    pipelineStatus: 'WON', marginRealized: 1020,
    leadScore: 100, leadTier: 'HIGH', budgetNumeric: 48000,
    urgency: true, urgencyFlag: true, sameDay: true, membershipInterest: false,
    nextAction: 'CALL_NOW', suggestedAction: 'CALL NOW — urgente, chiama entro 30 min',
    operatorCostEstimate: 42857, clientQuoteEstimate: 48500,
    marginEstimate: 5643, marginPercent: 11.6,
    suggestedQuote: 48000, optimizedQuote: 48000, optimizedMargin: 5143,
    revenuePotential: 48000,
    nextFollowUpAt: ago(15),
    createdAt: ago(15, 11),
  },
  {
    // MEDIUM — Nizza→Ibiza
    name: 'Sofia Ricci', email: 's.ricci@lifestyle.com', phone: '+39 338 7654 321',
    fromCity: 'Nizza', toCity: 'Ibiza', flightDate: fromNow(10).toISOString().split('T')[0],
    pax: 3, budget: '€15,000 – €40,000', message: 'Weekend a Ibiza con amici. Arrivo da Nizza, preferibilmente Midsize.',
    flightType: 'oneway',
    pipelineStatus: 'WON',
    leadScore: 58, leadTier: 'MEDIUM', budgetNumeric: 22000,
    urgency: false, urgencyFlag: false, sameDay: false, membershipInterest: false,
    nextAction: 'EMAIL_ONLY', suggestedAction: 'Email follow-up entro 4h — MEDIUM',
    operatorCostEstimate: 19643, clientQuoteEstimate: 22500,
    marginEstimate: 2857, marginPercent: 12.7,
    suggestedQuote: 22000, optimizedQuote: 22000, optimizedMargin: 2357,
    revenuePotential: 22000, marginRealized: 2160,
    nextFollowUpAt: ago(20),
    createdAt: ago(20, 16),
  },
  {
    // LOW — Venezia→Ginevra, no phone
    name: 'Roberto Conte', email: 'r.conte@privatmail.ch',
    fromCity: 'Venezia', toCity: 'Ginevra', flightDate: fromNow(14).toISOString().split('T')[0],
    pax: 2, budget: '€5,000 – €15,000', message: 'Volo privato Venezia–Ginevra, riunione importante.',
    flightType: 'oneway',
    pipelineStatus: 'NEW',
    leadScore: 30, leadTier: 'LOW', budgetNumeric: 9000,
    urgency: false, urgencyFlag: false, sameDay: false, membershipInterest: false,
    nextAction: 'LOW_PRIORITY', suggestedAction: 'Follow-up standard 24h — bassa priorità',
    operatorCostEstimate: 8036, clientQuoteEstimate: 9500,
    marginEstimate: 1464, marginPercent: 15.4,
    suggestedQuote: 8840, optimizedQuote: 8840, optimizedMargin: 804,
    revenuePotential: 9000,
    nextFollowUpAt: ago(27),
    createdAt: ago(27, 10),
  },
  {
    // UNQUALIFIED — richiesta generica senza budget
    name: 'Luca Esposito', email: 'l.esposito@gmail.com',
    fromCity: 'Roma', toCity: 'Londra',
    pax: 1, message: 'Ciao, vorrei informazioni sui prezzi per un volo privato Roma Londra.',
    flightType: 'oneway',
    pipelineStatus: 'NEW',
    leadScore: 7, leadTier: 'UNQUALIFIED', budgetNumeric: 0,
    urgency: false, urgencyFlag: false, sameDay: false, membershipInterest: false,
    nextAction: 'LOW_PRIORITY', suggestedAction: 'Follow-up standard 24h — bassa priorità',
    operatorCostEstimate: 0, clientQuoteEstimate: 0,
    marginEstimate: 0, marginPercent: 0,
    suggestedQuote: 0, optimizedQuote: 0, optimizedMargin: 0,
    revenuePotential: 0,
    nextFollowUpAt: ago(28),
    createdAt: ago(28, 15),
  },
]

// ── Bookings (3 — mix status e jet) ──────────────────────────────────────────
const BOOKINGS = [
  {
    // COMPLETED — Nizza→Ibiza, Midsize, depositPaid
    fromCity: 'Nizza', toCity: 'Ibiza',
    fromICAO: 'LFMN', toICAO: 'LEIB',
    departureDate: ago(8),
    pax: 3, jetCategory: 'midsize',
    status: 'COMPLETED',
    totalPrice: 18000, commission: 2160,
    depositPaid: true, depositAmount: 5400,
    depositPaidAt: ago(22),
    confirmationCode: 'AJ-DEMO03',
    notes: 'Volo completato. Cliente soddisfatto. Follow-up membership inviato.',
    createdAt: ago(22),
  },
  {
    // CONFIRMED — Milano→Londra, Light Jet, depositPaid
    fromCity: 'Milano', toCity: 'Londra',
    fromICAO: 'LIML', toICAO: 'EGLL',
    departureDate: fromNow(3),
    pax: 4, jetCategory: 'light',
    status: 'CONFIRMED',
    totalPrice: 8500, commission: 1020,
    depositPaid: true, depositAmount: 2550,
    depositPaidAt: ago(5),
    confirmationCode: 'AJ-DEMO01',
    notes: 'Deposito ricevuto. Operatore: NetJets. Attesa conferma slot.',
    createdAt: ago(5),
  },
  {
    // CONFIRMED — Roma→Dubai, Heavy Jet, saldo da ricevere
    fromCity: 'Roma', toCity: 'Dubai',
    fromICAO: 'LIRF', toICAO: 'OMDB',
    departureDate: fromNow(7),
    pax: 6, jetCategory: 'heavy',
    status: 'CONFIRMED',
    totalPrice: 42000, commission: 5040,
    depositPaid: false, depositAmount: 0,
    confirmationCode: 'AJ-DEMO02',
    notes: 'In attesa deposito 30% — link inviato via WhatsApp.',
    createdAt: ago(12),
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱  Aerojet Private — Demo Seed\n')

  // Pulisci nella giusta sequenza (foreign keys)
  await prisma.quote.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.operator.deleteMany()
  await prisma.user.deleteMany()

  console.log('  ✓ Tabelle svuotate')

  // Users
  await prisma.user.createMany({ data: USERS })
  console.log(`  ✓ ${USERS.length} utenti creati`)

  // Operatori
  await prisma.operator.createMany({ data: OPERATORS })
  console.log(`  ✓ ${OPERATORS.length} operatori`)

  // Inquiry
  for (const inq of INQUIRIES) {
    const createdInq = await prisma.inquiry.create({ data: inq as Parameters<typeof prisma.inquiry.create>[0]['data'] })
    
    // Add a pending quote for the VIP inquiry to show in demo
    if (inq.leadTier === 'VIP') {
      await prisma.quote.create({
        data: {
          inquiryId: createdInq.id,
          operatorName: 'VistaJet',
          aircraftModel: 'Global 7500',
          price: 155000,
          validUntil: fromNow(2),
          status: 'PENDING',
          sentAt: ago(0)
        }
      })
    }
  }
  console.log(`  ✓ ${INQUIRIES.length} inquiry (VIP / HIGH×2 / MEDIUM / LOW / UNQUALIFIED) e 1 preventivo PENDING`)

  // Booking
  for (const bk of BOOKINGS) {
    await prisma.booking.create({ data: bk as Parameters<typeof prisma.booking.create>[0]['data'] })
  }
  console.log(`  ✓ ${BOOKINGS.length} booking (Light / Midsize / Heavy)`)

  // Riepilogo
  const [nInq, nBk, nOp] = await Promise.all([
    prisma.inquiry.count(),
    prisma.booking.count(),
    prisma.operator.count(),
  ])
  const wonCount = await prisma.inquiry.count({ where: { pipelineStatus: 'WON' } })
  const depositPaidCount = await prisma.booking.count({ where: { depositPaid: true } })

  console.log('\n─────────────────────────────────')
  console.log(`  Inquiry totali : ${nInq}`)
  console.log(`  WON            : ${wonCount}`)
  console.log(`  Booking totali : ${nBk}`)
  console.log(`  Deposit pagati : ${depositPaidCount}`)
  console.log(`  Operatori      : ${nOp}`)
  console.log('─────────────────────────────────')
  console.log('\n✅  Seed completato. Avvia il server e testa la demo.\n')

  await prisma.$disconnect()
}

seed().catch(async (e) => {
  console.error('❌  Seed fallito:', e)
  await prisma.$disconnect()
  process.exit(1)
})
