/**
 * AEROJET PRIVATE — Benefits & Membership Management
 * 
 * Tier: Explorer → Silver → Gold → Platinum → Diamond
 * Vantaggi: cashback, priorità, upgrade, servizi esclusivi
 */

export type MemberTier = 'EXPLORER' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

export interface TierConfig {
  tier: MemberTier
  label: string
  minFlights: number   // voli/anno per qualificare
  minSpend: number     // spesa annua (€)
  cashbackPct: number  // % cashback su charter
  referralBonus: number // % referral
  priorityBooking: boolean
  dedicatedBroker: boolean
  freeUpgrades: number // upgrade gratuiti/anno
  loungeAccess: boolean
  color: string
  icon: string
  perks: string[]
}

export const TIER_CONFIG: TierConfig[] = [
  {
    tier: 'EXPLORER', label: 'Explorer', minFlights: 0, minSpend: 0,
    cashbackPct: 0, referralBonus: 5, priorityBooking: false, dedicatedBroker: false,
    freeUpgrades: 0, loungeAccess: false, color: '#888', icon: '◇',
    perks: ['Accesso piattaforma base', 'Alert empty legs', 'Referral 5% cashback'],
  },
  {
    tier: 'SILVER', label: 'Silver', minFlights: 3, minSpend: 25000,
    cashbackPct: 3, referralBonus: 7, priorityBooking: false, dedicatedBroker: false,
    freeUpgrades: 1, loungeAccess: false, color: '#B0BEC5', icon: '◈',
    perks: ['3% cashback su ogni charter', '1 upgrade gratuito/anno', 'Referral 7% cashback', 'Accesso early to empty legs'],
  },
  {
    tier: 'GOLD', label: 'Gold', minFlights: 8, minSpend: 75000,
    cashbackPct: 5, referralBonus: 10, priorityBooking: true, dedicatedBroker: false,
    freeUpgrades: 3, loungeAccess: true, color: '#C9A84C', icon: '✦',
    perks: ['5% cashback su ogni charter', '3 upgrade gratuiti/anno', 'Priorità prenotazione', 'Accesso lounge aeroporti partner', 'Referral 10%', 'Catering premium incluso'],
  },
  {
    tier: 'PLATINUM', label: 'Platinum', minFlights: 20, minSpend: 200000,
    cashbackPct: 8, referralBonus: 12, priorityBooking: true, dedicatedBroker: true,
    freeUpgrades: 6, loungeAccess: true, color: '#E8F0FE', icon: '★',
    perks: ['8% cashback su ogni charter', '6 upgrade gratuiti/anno', 'Broker dedicato 24/7', 'Priorità assoluta disponibilità', 'Transfer VIP incluso', 'Referral 12%', 'Tariffa oraria fissa garantita'],
  },
  {
    tier: 'DIAMOND', label: 'Diamond', minFlights: 50, minSpend: 500000,
    cashbackPct: 12, referralBonus: 15, priorityBooking: true, dedicatedBroker: true,
    freeUpgrades: -1, loungeAccess: true, color: '#80DEEA', icon: '💎',
    perks: ['12% cashback illimitato', 'Upgrade illimitati', 'Account manager personale', 'Accesso flotta dedicata', 'Inviti eventi esclusivi', 'Referral 15%', 'Primo accesso nuove rotte', 'Fee zero su prime 10 prenotazioni/anno'],
  },
]

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  tier: MemberTier
  joinDate: string
  flightsThisYear: number
  spendThisYear: number
  cashbackBalance: number  // € accumulato
  cashbackUsed: number
  referralCode: string
  referralCount: number
  referralEarnings: number
  nextTierFlights: number  // voli mancanti al tier successivo
  nextTierSpend: number    // spesa mancante al tier successivo
  perksUsed: Record<string, number>
  transactions: BenefitTransaction[]
}

export interface BenefitTransaction {
  id: string
  date: string
  type: 'CASHBACK_EARNED' | 'CASHBACK_USED' | 'UPGRADE_USED' | 'REFERRAL_EARNED' | 'BONUS'
  amount: number   // €
  description: string
  flightId?: string
}

// ── Mock members ─────────────────────────────────────────────────────────────
export const MEMBERS: Member[] = [
  {
    id: 'M001', name: 'Marco Ferretti', email: 'marco@empresa.it', phone: '+39 347 1234567',
    tier: 'GOLD', joinDate: '2025-03-15',
    flightsThisYear: 9, spendThisYear: 87400, cashbackBalance: 4370, cashbackUsed: 2100,
    referralCode: 'MARCO2026', referralCount: 3, referralEarnings: 1200,
    nextTierFlights: 11, nextTierSpend: 112600,
    perksUsed: { upgrade: 1, lounge: 4 },
    transactions: [
      { id: 'T001', date: '2026-04-15', type: 'CASHBACK_EARNED', amount: 410, description: 'Cashback 5% su volo Milano-Londra €8,200', flightId: 'FLT-001' },
      { id: 'T002', date: '2026-04-10', type: 'REFERRAL_EARNED', amount: 580, description: 'Referral: Elena Conti - 1° prenotazione' },
      { id: 'T003', date: '2026-03-28', type: 'CASHBACK_USED', amount: -500, description: 'Cashback utilizzato su volo Roma-Dubai' },
      { id: 'T004', date: '2026-03-10', type: 'CASHBACK_EARNED', amount: 2425, description: 'Cashback 5% su volo Roma-Dubai €48,500' },
    ],
  },
  {
    id: 'M002', name: 'Sofia Ricci', email: 'sofia.ricci@gmail.com', phone: '+39 335 9876543',
    tier: 'PLATINUM', joinDate: '2024-11-20',
    flightsThisYear: 22, spendThisYear: 234500, cashbackBalance: 18760, cashbackUsed: 5200,
    referralCode: 'SOFIA2026', referralCount: 7, referralEarnings: 4680,
    nextTierFlights: 28, nextTierSpend: 265500,
    perksUsed: { upgrade: 3, lounge: 12 },
    transactions: [
      { id: 'T005', date: '2026-04-18', type: 'CASHBACK_EARNED', amount: 3880, description: 'Cashback 8% su volo Roma-Dubai €48,500' },
      { id: 'T006', date: '2026-04-05', type: 'UPGRADE_USED', amount: 0, description: 'Upgrade gratuito: Light Jet → Midsize' },
      { id: 'T007', date: '2026-03-22', type: 'REFERRAL_EARNED', amount: 960, description: 'Referral: Luca Bianchi - 1° prenotazione' },
    ],
  },
  {
    id: 'M003', name: 'Chiara Lombardi', email: 'chiara@lombardi.it', phone: '+39 347 9988776',
    tier: 'SILVER', joinDate: '2026-01-10',
    flightsThisYear: 4, spendThisYear: 38200, cashbackBalance: 1146, cashbackUsed: 0,
    referralCode: 'CHIARA2026', referralCount: 1, referralEarnings: 380,
    nextTierFlights: 4, nextTierSpend: 36800,
    perksUsed: { upgrade: 0, lounge: 0 },
    transactions: [
      { id: 'T008', date: '2026-04-01', type: 'CASHBACK_EARNED', amount: 606, description: 'Cashback 3% su volo Venezia-Ibiza €20,200' },
      { id: 'T009', date: '2026-02-14', type: 'CASHBACK_EARNED', amount: 540, description: 'Cashback 3% su volo Milano-Londra €18,000' },
    ],
  },
]

export function getMember(id: string): Member | undefined {
  return MEMBERS.find(m => m.id === id)
}

export function getTierConfig(tier: MemberTier): TierConfig {
  return TIER_CONFIG.find(t => t.tier === tier) ?? TIER_CONFIG[0]
}

export function getNextTier(tier: MemberTier): TierConfig | null {
  const tiers: MemberTier[] = ['EXPLORER', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']
  const idx = tiers.indexOf(tier)
  if (idx === tiers.length - 1) return null
  return TIER_CONFIG.find(t => t.tier === tiers[idx + 1]) ?? null
}

export function calcCashback(member: Member, charterPrice: number): number {
  const config = getTierConfig(member.tier)
  return Math.round(charterPrice * config.cashbackPct / 100)
}

export function addCashback(memberId: string, amount: number, description: string, flightId?: string): boolean {
  const m = MEMBERS.find(m => m.id === memberId)
  if (!m) return false
  m.cashbackBalance += amount
  m.transactions.unshift({ id: `T${Date.now()}`, date: new Date().toISOString().split('T')[0], type: 'CASHBACK_EARNED', amount, description, flightId })
  return true
}

export function useCashback(memberId: string, amount: number): { success: boolean; remaining: number } {
  const m = MEMBERS.find(m => m.id === memberId)
  if (!m || m.cashbackBalance < amount) return { success: false, remaining: m?.cashbackBalance ?? 0 }
  m.cashbackBalance -= amount
  m.cashbackUsed += amount
  m.transactions.unshift({ id: `T${Date.now()}`, date: new Date().toISOString().split('T')[0], type: 'CASHBACK_USED', amount: -amount, description: `Cashback utilizzato su prenotazione` })
  return { success: true, remaining: m.cashbackBalance }
}

export function checkTierUpgrade(memberId: string): { upgraded: boolean; newTier?: MemberTier } {
  const m = MEMBERS.find(m => m.id === memberId)
  if (!m) return { upgraded: false }
  const tiers: MemberTier[] = ['EXPLORER', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']
  const currentIdx = tiers.indexOf(m.tier)
  for (let i = currentIdx + 1; i < tiers.length; i++) {
    const cfg = TIER_CONFIG[i]
    if (m.flightsThisYear >= cfg.minFlights && m.spendThisYear >= cfg.minSpend) {
      m.tier = cfg.tier
      return { upgraded: true, newTier: cfg.tier }
    }
  }
  return { upgraded: false }
}
