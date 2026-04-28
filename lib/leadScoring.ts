/**
 * Lead Scoring Engine V2 — Aerojet Private
 * Score 0–100 · Auto-decision · Margin optimization per tier
 */

export type LeadTier = 'VIP' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNQUALIFIED'
export type PipelineStatus = 'NEW' | 'CONTACTED' | 'QUOTING' | 'QUOTED' | 'WON' | 'LOST'
export type NextAction = 'CALL_NOW' | 'WHATSAPP_NOW' | 'EMAIL_ONLY' | 'LOW_PRIORITY'

export interface LeadInput {
  name: string
  email: string
  phone?: string
  fromCity?: string
  toCity?: string
  flightDate?: string
  pax?: number
  budget?: string
  message: string
  flightType?: string
}

export interface LeadScoringResult {
  leadScore: number
  leadTier: LeadTier
  budgetNumeric: number
  urgency: boolean
  urgencyFlag: boolean
  sameDay: boolean
  membershipInterest: boolean
  nextAction: NextAction
  operatorCostEstimate: number
  clientQuoteEstimate: number
  suggestedQuote: number     // min(budget, operatorCost × 1.25)
  optimizedQuote: number     // tier-based markup: VIP×1.35, HIGH×1.25, MEDIUM×1.15
  optimizedMargin: number
  marginEstimate: number
  marginPercent: number
  revenuePotential: number
  suggestedAction: string
}

// ─── Configurazione ────────────────────────────────────────
const BROKER_MARKUP_PERCENT = 12
const BROKER_FIXED_FEE = 500

// Markup ottimizzato per tier
const TIER_MARKUP: Record<LeadTier, number> = {
  VIP: 1.35,
  HIGH: 1.25,
  MEDIUM: 1.15,
  LOW: 1.10,
  UNQUALIFIED: 1.08,
}

// Budget display → midpoint EUR
const BUDGET_MAP: [string, number][] = [
  ['> €100,000', 150000],
  ['€40,000 – €100,000', 70000],
  ['€15,000 – €40,000', 27500],
  ['€5,000 – €15,000', 10000],
  ['< €5,000', 3000],
]

// Città italiane (rilevamento rotta internazionale)
const ITALIAN_CITIES = [
  'milano', 'roma', 'torino', 'venezia', 'firenze', 'napoli', 'bologna',
  'verona', 'genova', 'palermo', 'catania', 'bari', 'bergamo', 'brescia',
  'linate', 'malpensa', 'fiumicino', 'ciampino', 'capodichino', 'pisa',
]

// ─── Parsing ───────────────────────────────────────────────

export function parseBudgetNumeric(budget?: string): number {
  if (!budget) return 0
  for (const [key, val] of BUDGET_MAP) {
    if (budget === key) return val
  }
  // Fallback: extract number
  const cleaned = budget.replace(/[€.\s]/g, '').replace(',', '.')
  const match = cleaned.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export function tierFromBudget(budgetNumeric: number): LeadTier {
  if (budgetNumeric >= 100000) return 'VIP'   // > €100,000
  if (budgetNumeric >= 40000)  return 'HIGH'   // €40,000 – €100,000
  if (budgetNumeric >= 15000)  return 'MEDIUM' // €15,000 – €40,000
  if (budgetNumeric >= 5000)   return 'LOW'    // €5,000 – €15,000
  return 'UNQUALIFIED'                          // < €5,000
}

// ─── Detection helpers ─────────────────────────────────────

function detectUrgency(message: string, flightDate?: string): boolean {
  const keywords = [
    'urgente', 'urgent', 'oggi', 'domani', 'asap', 'subito',
    'immediato', 'entro 24', 'entro 48', 'same day', 'sameday', 'last minute',
  ]
  if (keywords.some(k => message.toLowerCase().includes(k))) return true
  if (flightDate) {
    const diff = new Date(flightDate).getTime() - Date.now()
    if (diff > 0 && diff < 48 * 60 * 60 * 1000) return true
  }
  return false
}

function detectSameDay(flightDate?: string, message?: string): boolean {
  if (flightDate) {
    if (new Date(flightDate).toDateString() === new Date().toDateString()) return true
  }
  const lowerMsg = (message || '').toLowerCase()
  return lowerMsg.includes('oggi') || lowerMsg.includes('today') || lowerMsg.includes('same day')
}

function detectMembershipInterest(message: string): boolean {
  const keywords = [
    'membership', 'abbonamento', 'programma', 'socio',
    'accesso riservato', 'piano annuale', 'sottoscrivere', 'card', 'quota',
  ]
  return keywords.some(k => message.toLowerCase().includes(k))
}

function detectInternationalRoute(from?: string, to?: string): boolean {
  if (!from || !to) return false
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  const fromItalian = ITALIAN_CITIES.some(c => fromLower.includes(c))
  const toItalian = ITALIAN_CITIES.some(c => toLower.includes(c))
  // Internazionale = almeno una città non italiana, o entrambe non italiane
  return !fromItalian || !toItalian
}

// ─── Decision engine ───────────────────────────────────────

export function decideNextAction(
  tier: LeadTier,
  score: number,
  urgencyFlag: boolean,
): NextAction {
  // Urgency override sempre CALL_NOW
  if (urgencyFlag) return 'CALL_NOW'
  if (tier === 'VIP' || score > 85) return 'CALL_NOW'
  if (tier === 'HIGH') return 'WHATSAPP_NOW'
  if (tier === 'MEDIUM') return 'EMAIL_ONLY'
  return 'LOW_PRIORITY'
}

// ─── Human-readable suggested action ──────────────────────

function suggestAction(
  tier: LeadTier,
  urgencyFlag: boolean,
  sameDay: boolean,
  nextAction: NextAction,
): string {
  if (sameDay) return 'IMMEDIATO — same-day, contatta ora'
  if (nextAction === 'CALL_NOW' && tier === 'VIP') return 'CALL NOW — VIP, chiama entro 15 min'
  if (nextAction === 'CALL_NOW') return 'CALL NOW — urgente, chiama entro 30 min'
  if (nextAction === 'WHATSAPP_NOW') return 'WhatsApp entro 1h — lead HIGH'
  if (nextAction === 'EMAIL_ONLY') return 'Email follow-up entro 4h — MEDIUM'
  return 'Follow-up standard 24h — bassa priorità'
}

// ─── Main scoring function ─────────────────────────────────

export function calculateLeadScore(input: LeadInput): LeadScoringResult {
  const budgetNumeric = parseBudgetNumeric(input.budget)
  const urgency = detectUrgency(input.message, input.flightDate)
  const sameDay = detectSameDay(input.flightDate, input.message)
  const membershipInterest = detectMembershipInterest(input.message)
  const isInternational = detectInternationalRoute(input.fromCity, input.toCity)
  const leadTier = tierFromBudget(budgetNumeric)
  const urgencyFlag = sameDay || urgency

  let score = 0

  // ── Budget (0–40 pt) — allineato ai tier ──
  if (budgetNumeric >= 100000) score += 40      // VIP
  else if (budgetNumeric >= 40000) score += 32  // HIGH
  else if (budgetNumeric >= 15000) score += 20  // MEDIUM
  else if (budgetNumeric >= 5000)  score += 10  // LOW

  // ── VIP bonus (+15 solo ≥100k) ──
  if (budgetNumeric >= 100000) score += 15

  // ── Timing / Urgenza ──
  if (urgency) score += 20
  if (sameDay) score += 20   // V2: era +10, ora +20

  // ── Contatto ──
  if (input.phone?.trim()) score += 15  // V2: era +10, ora +15
  if (input.email) score += 3

  // ── Interesse membership ──
  if (membershipInterest) score += 12

  // ── Pax (V2: >4 → +10, semplificato) ──
  const pax = input.pax || 0
  if (pax > 4) score += 10
  else if (pax >= 2) score += 3

  // ── Rotta ──
  if (input.fromCity && input.toCity) score += 4
  if (isInternational) score += 10  // V2: nuovo

  // ── Data fornita ──
  if (input.flightDate) score += 3

  score = Math.min(100, Math.max(0, score))

  // ── Economics ──
  const operatorCostEstimate = budgetNumeric > 0
    ? Math.round(budgetNumeric / (1 + BROKER_MARKUP_PERCENT / 100))
    : 0

  const clientQuoteEstimate = operatorCostEstimate > 0
    ? Math.round(operatorCostEstimate * (1 + BROKER_MARKUP_PERCENT / 100) + BROKER_FIXED_FEE)
    : 0

  const marginEstimate = Math.max(0, clientQuoteEstimate - operatorCostEstimate)
  const marginPercent = clientQuoteEstimate > 0
    ? Math.round((marginEstimate / clientQuoteEstimate) * 1000) / 10
    : 0

  // ── Suggested quote (vecchio, mantenuto per compatibilità) ──
  const suggestedQuote = budgetNumeric > 0
    ? Math.round(Math.min(budgetNumeric, operatorCostEstimate * 1.25))
    : 0

  // ── Optimized quote (V2: markup per tier) ──
  const markup = TIER_MARKUP[leadTier]
  const optimizedQuote = budgetNumeric > 0
    ? Math.round(Math.min(budgetNumeric, operatorCostEstimate * markup))
    : 0
  const optimizedMargin = Math.max(0, optimizedQuote - operatorCostEstimate)

  // ── Decision ──
  const nextAction = decideNextAction(leadTier, score, urgencyFlag)
  const suggestedActionText = suggestAction(leadTier, urgencyFlag, sameDay, nextAction)

  return {
    leadScore: score,
    leadTier,
    budgetNumeric,
    urgency,
    urgencyFlag,
    sameDay,
    membershipInterest,
    nextAction,
    operatorCostEstimate,
    clientQuoteEstimate,
    suggestedQuote,
    optimizedQuote,
    optimizedMargin,
    marginEstimate,
    marginPercent,
    revenuePotential: budgetNumeric,
    suggestedAction: suggestedActionText,
  }
}
