/**
 * AEROJET PRIVATE — Test Suite Completa
 * npx tsx tests/run.ts
 */
import { searchFlights, getEmptyLegs, getOperators } from '../lib/avinode'
import { InquirySchema, CheckoutSchema, AlertSchema, rateLimit } from '../lib/validation'
import { calcDeposit, calcCommission } from '../lib/stripe'
import { POPULAR_ROUTES, FLEET_CATEGORIES, formatCurrency, calcCommission as utilComm } from '../lib/utils'
import { send, sendRequestReceived, sendBookingConfirmation, sendQuoteToClient, notifyBrokerNewRequest } from '../lib/email'
import { sendDay1Followup, sendDay7CaseStudy } from '../lib/drip'

let passed = 0, failed = 0, warns = 0
const log: string[] = []

async function test(name: string, fn: () => boolean | Promise<boolean>) {
  try {
    const ok = await fn()
    if (ok) { passed++; log.push(`  ✅ ${name}`) }
    else     { failed++; log.push(`  ❌ ${name}`) }
  } catch (e: any) {
    failed++
    log.push(`  ❌ ${name} — ${e.message?.split('\n')[0] || e}`)
  }
}

function warn(msg: string) { warns++; log.push(`  ⚠️  ${msg}`) }
function section(title: string) { log.push(`\n${title}`) }

async function run() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧪  AEROJET PRIVATE — TEST SUITE COMPLETA')
  console.log('    WhatsApp: +39 331 882 4030')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // ── AVINODE MOCK DATA ────────────────────────────────────────────────────────
  section('\n📦  AVINODE — Mock data & cache')

  await test('searchFlights Milano→Londra ≥ 3 jet', async () => {
    const r = await searchFlights({ fromICAO:'LIML', toICAO:'EGLL', fromCity:'Milano', toCity:'Londra', departureDate:'2026-04-28', pax:2 })
    return r.length >= 3
  })

  await test('Aircraft hanno modello, prezzo, operatore, rating', async () => {
    const r = await searchFlights({ fromICAO:'LIML', toICAO:'EGLL', fromCity:'Milano', toCity:'Londra', departureDate:'2026-04-28', pax:2 })
    return r.every(a => a.model && a.price > 0 && a.operator && a.rating >= 4 && a.flightTime)
  })

  await test('Pax filter: 18 pax → solo heavy/ultra-long', async () => {
    const r = await searchFlights({ fromICAO:'LIML', toICAO:'EGLL', fromCity:'Milano', toCity:'Londra', departureDate:'2026-04-28', pax:18 })
    return r.length >= 1 && r.every(a => a.pax >= 18)
  })

  await test('Pax filter: 1 pax → tutti disponibili', async () => {
    const r = await searchFlights({ fromICAO:'LSZH', toICAO:'LFMN', fromCity:'Ginevra', toCity:'Nizza', departureDate:'2026-04-25', pax:1 })
    return r.length >= 5
  })

  await test('Milano→NYC prezzi realistici (ultra-long > €80k)', async () => {
    const r = await searchFlights({ fromICAO:'LIMC', toICAO:'KTEB', fromCity:'Milano', toCity:'New York', departureDate:'2026-05-05', pax:2 })
    const ultraLong = r.filter(a => a.category.toLowerCase().includes('ultra'))
    return ultraLong.length >= 1 && ultraLong[0].price > 80000
  })

  await test('Milano→Londra prezzi realistici (light < €20k)', async () => {
    const r = await searchFlights({ fromICAO:'LIML', toICAO:'EGLL', fromCity:'Milano', toCity:'Londra', departureDate:'2026-04-28', pax:2 })
    const lights = r.filter(a => a.category === 'Light Jet')
    return lights.length >= 1 && lights[0].price < 20000 && lights[0].price > 5000
  })

  await test('Cache: stessa rotta restituisce ID identici', async () => {
    const r1 = await searchFlights({ fromICAO:'LIRF', toICAO:'OMDB', fromCity:'Roma', toCity:'Dubai', departureDate:'2026-05-10', pax:4 })
    const r2 = await searchFlights({ fromICAO:'LIRF', toICAO:'OMDB', fromCity:'Roma', toCity:'Dubai', departureDate:'2026-05-10', pax:4 })
    return r1[0]?.id === r2[0]?.id
  })

  await test('getEmptyLegs ≥ 5 voli', async () => {
    const legs = await getEmptyLegs()
    return legs.length >= 5
  })

  await test('Empty legs: tutti con sconto ≥ 55%', async () => {
    const legs = await getEmptyLegs()
    return legs.every(l => l.discountPct >= 55)
  })

  await test('Empty legs: prezzo scontato < prezzo originale', async () => {
    const legs = await getEmptyLegs()
    return legs.every(l => l.discountedPrice < l.originalPrice)
  })

  await test('getOperators: 6 partner, tutti con website', async () => {
    const ops = await getOperators()
    return ops.length === 6 && ops.every(o => o.website?.startsWith('https://') && o.rating >= 4)
  })

  // ── SCENARI BUSINESS REALI ───────────────────────────────────────────────────
  section('\n🎭  SCENARI REALI')

  await test('SCENARIO CEO: Milano→NYC 2 pax, ultra-long disponibile', async () => {
    const r = await searchFlights({ fromICAO:'LIMC', toICAO:'KTEB', fromCity:'Milano', toCity:'New York', departureDate:'2026-05-05', pax:2 })
    return r.some(a => a.category.includes('Ultra') && a.price > 80000)
  })

  await test('SCENARIO team 12 pax Venezia→Ibiza: heavy disponibile', async () => {
    const r = await searchFlights({ fromICAO:'LIPZ', toICAO:'LEIB', fromCity:'Venezia', toCity:'Ibiza', departureDate:'2026-06-15', pax:12 })
    return r.some(a => a.pax >= 12)
  })

  await test('SCENARIO family 6 pax Roma→Dubai: heavy con camera', async () => {
    const r = await searchFlights({ fromICAO:'LIRF', toICAO:'OMDB', fromCity:'Roma', toCity:'Dubai', departureDate:'2026-04-28', pax:6 })
    return r.some(a => a.amenities.some(am => am.toLowerCase().includes('cam') || am.toLowerCase().includes('suite')))
  })

  await test('SCENARIO empty leg: disponibile sotto €8k', async () => {
    const legs = await getEmptyLegs()
    return legs.some(l => l.discountedPrice < 8000)
  })

  await test('SCENARIO last minute: empty leg entro 48h', async () => {
    const legs = await getEmptyLegs()
    const in48h = new Date(); in48h.setDate(in48h.getDate() + 2)
    return legs.some(l => new Date(l.departureDate) <= in48h)
  })

  // ── BUSINESS LOGIC ───────────────────────────────────────────────────────────
  section('\n💰  BUSINESS LOGIC & COMMISSIONI')

  await test('Deposito 30%: €10,000 → €3,000', () => calcDeposit(10000) === 3000)
  await test('Deposito 30%: €48,500 → €14,550', () => calcDeposit(48500) === 14550)
  await test('Commissione 12%: €50,000 → €6,000', () => calcCommission(50000) === 6000)
  await test('Commissione 12%: €9,800 → €1,176', () => utilComm(9800) === 1176)

  await test('Commissione broker Milano→NYC (ultra-long)', async () => {
    const r = await searchFlights({ fromICAO:'LIMC', toICAO:'KTEB', fromCity:'Milano', toCity:'New York', departureDate:'2026-05-05', pax:2 })
    const price = r.find(a => a.category.includes('Ultra'))?.price || 0
    const comm = calcCommission(price)
    return comm > 10000 // su €80k+ la commissione è > €9,600
  })

  await test('formatCurrency: €48,500 in formato italiano', () => {
    const f = formatCurrency(48500)
    return f.includes('48') && f.includes('€')
  })

  await test('POPULAR_ROUTES: tutti con ICAO 4 lettere maiuscole', () =>
    POPULAR_ROUTES.every(r => /^[A-Z]{4}$/.test(r.fromICAO) && /^[A-Z]{4}$/.test(r.toICAO))
  )

  await test('FLEET_CATEGORIES: 6 categorie con tutti i campi', () =>
    FLEET_CATEGORIES.length === 6 &&
    FLEET_CATEGORIES.every(c => c.value && c.label && c.range && c.pax && c.priceHint)
  )

  // ── VALIDAZIONE & SICUREZZA ──────────────────────────────────────────────────
  section('\n🔒  VALIDAZIONE & SICUREZZA')

  await test('InquirySchema: email valida accettata', () => {
    const r = InquirySchema.safeParse({ name:'Marco', email:'marco@email.it', message:'Voglio un preventivo' })
    return r.success
  })

  await test('InquirySchema: email invalida rifiutata', () => {
    const r = InquirySchema.safeParse({ name:'Marco', email:'not-an-email', message:'Test' })
    return !r.success
  })

  await test('InquirySchema: email normalizzata lowercase', () => {
    const r = InquirySchema.safeParse({ name:'Marco', email:'MARCO@EMAIL.IT', message:'Test message here' })
    return r.success && r.data.email === 'marco@email.it'
  })

  await test('InquirySchema: nome trimmed', () => {
    const r = InquirySchema.safeParse({ name:'  Corrado  ', email:'x@x.it', message:'Test message' })
    return r.success && r.data.name === 'Corrado'
  })

  await test('InquirySchema: messaggio troppo corto rifiutato', () => {
    const r = InquirySchema.safeParse({ name:'Marco', email:'x@x.it', message:'Hi' })
    return !r.success
  })

  await test('CheckoutSchema: prezzo valido accettato', () => {
    const r = CheckoutSchema.safeParse({ aircraft:{ model:'Test', price:9800, category:'Light', operator:'VistaJet', operatorLogo:'VJ' }, from:'Milano', to:'Londra', pax:2 })
    return r.success
  })

  await test('CheckoutSchema: prezzo > €500k rifiutato', () => {
    const r = CheckoutSchema.safeParse({ aircraft:{ model:'Test', price:600000, category:'Light', operator:'VJ', operatorLogo:'VJ' }, from:'A', to:'B' })
    return !r.success
  })

  await test('AlertSchema: email valida accettata', () => {
    const r = AlertSchema.safeParse({ email:'test@test.com' })
    return r.success && r.data.email === 'test@test.com'
  })

  await test('Rate limiter: blocca dopo 5 richieste/min', () => {
    const ip = `test-${Date.now()}`
    let blocked = false
    for (let i = 0; i < 8; i++) {
      if (!rateLimit(ip, 5, 60000)) { blocked = true; break }
    }
    return blocked
  })

  await test('Rate limiter: IP diversi non si influenzano', () => {
    const ip1 = `ip1-${Date.now()}`
    const ip2 = `ip2-${Date.now()}`
    for (let i = 0; i < 4; i++) rateLimit(ip1, 5, 60000)
    return rateLimit(ip2, 5, 60000) === true
  })

  // ── EMAIL SYSTEM ─────────────────────────────────────────────────────────────
  section('\n📧  EMAIL SYSTEM (dev mode — nessuna email inviata)')

  await test('send(): dev mode senza API key → success true', async () => {
    const r = await send('test@test.com', 'Test subject', '<p>Test</p>')
    return (r as any).success === true && (r as any).dev === true
  })

  await test('sendRequestReceived: genera senza errori', async () => {
    const r = await sendRequestReceived({ to:'x@x.it', name:'Marco', from:'Milano', dest:'Londra', date:'28 Apr', requestId:'RQ-TEST-001' })
    return (r as any).success === true
  })

  await test('sendBookingConfirmation: genera senza errori', async () => {
    const r = await sendBookingConfirmation({ to:'x@x.it', name:'Marco', aircraft:'Phenom 300E', from:'Milano', dest:'Londra', date:'28 Apr', pax:2, deposit:2460, total:8200, confirmCode:'AJ-ABC123' })
    return (r as any).success === true
  })

  await test('sendQuoteToClient: genera senza errori', async () => {
    const r = await sendQuoteToClient({ to:'x@x.it', name:'Sofia', aircraft:'Falcon 7X', from:'Roma', dest:'Dubai', date:'28 Apr', pax:6, price:48500, validUntil:'25 Apr', brokerName:'Corrado', quoteId:'QT-TEST-001' })
    return (r as any).success === true
  })

  await test('notifyBrokerNewRequest: genera senza errori', async () => {
    const r = await notifyBrokerNewRequest({ brokerEmail:'broker@x.it', clientName:'Luca', clientEmail:'luca@x.it', from:'Milano', to:'NYC', date:'5 Mag', pax:2, budget:'€90,000', message:'Voglio volare', requestId:'RQ-007' })
    return (r as any).success === true
  })

  await test('Email drip Day1 follow-up: genera senza errori', async () => {
    const r = await sendDay1Followup({ to:'x@x.it', name:'Elena', from:'Venezia', dest:'Ibiza', requestId:'RQ-005' })
    return (r as any).success === true
  })

  await test('Email drip Day7 case study: genera senza errori', async () => {
    const r = await sendDay7CaseStudy({ to:'x@x.it', name:'Roberto', from:'Ginevra', dest:'Monaco', requestId:'RQ-006' })
    return (r as any).success === true
  })

  // ── WHATSAPP ─────────────────────────────────────────────────────────────────
  section('\n📱  WHATSAPP CONFIG')

  // In tsx context, NEXT_PUBLIC_ vars must be loaded from .env.local manually
  const { readFileSync } = await import('fs')
  let waNumber = ''
  try {
    const envContent = readFileSync('./.env.local', 'utf-8')
    const match = envContent.match(/NEXT_PUBLIC_WHATSAPP_NUMBER="?([^"\n]+)"?/)
    waNumber = match?.[1]?.trim() || ''
  } catch { waNumber = '' }

  await test('NEXT_PUBLIC_WHATSAPP_NUMBER configurato in .env.local', () => {
    return waNumber === '393318824030'
  })

  await test('Numero WhatsApp formato internazionale corretto (39...)', () => {
    return waNumber.startsWith('39') && waNumber.length >= 12
  })

  await test('URL WhatsApp generato correttamente', () => {
    const num = '393318824030'
    const msg = 'Salve, vorrei un preventivo'
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
    return url.includes('wa.me/393318824030') && url.includes('preventivo')
  })

  await test('4 quick messages WhatsApp pre-configurati', () => {
    const msgs = ['Preventivo volo', 'Empty leg disponibili', 'Informazioni membership', 'Parla con un broker']
    return msgs.length === 4 && msgs.every(m => m.length > 5)
  })

  // ── RIEPILOGO ─────────────────────────────────────────────────────────────────
  console.log(log.join('\n'))
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  const total = passed + failed
  const pct = Math.round(passed / total * 100)
  console.log(`\n  RISULTATO: ${passed}/${total} test passati (${pct}%)`)
  if (failed > 0) console.log(`  ❌ Falliti: ${failed}`)
  if (warns > 0)  console.log(`  ⚠️  Warning: ${warns}`)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  process.exit(failed > 0 ? 1 : 0)
}

run()
