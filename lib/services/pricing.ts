export type LeadTier = 'VIP' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNQUALIFIED'

// ─── Configurazione ────────────────────────────────────────
const BROKER_MARKUP_PERCENT = 12
const BROKER_FIXED_FEE = 500

// Markup ottimizzato per tier
export const TIER_MARKUP: Record<LeadTier, number> = {
  VIP: 1.35,
  HIGH: 1.25,
  MEDIUM: 1.15,
  LOW: 1.10,
  UNQUALIFIED: 1.08,
}

export interface PricingEconomics {
  operatorCostEstimate: number
  clientQuoteEstimate: number
  suggestedQuote: number
  optimizedQuote: number
  optimizedMargin: number
  marginEstimate: number
  marginPercent: number
  revenuePotential: number
}

export function calculateEconomics(budgetNumeric: number, tier: LeadTier): PricingEconomics {
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

  const suggestedQuote = budgetNumeric > 0
    ? Math.round(Math.min(budgetNumeric, operatorCostEstimate * 1.25))
    : 0

  const markup = TIER_MARKUP[tier]
  const optimizedQuote = budgetNumeric > 0
    ? Math.round(Math.min(budgetNumeric, operatorCostEstimate * markup))
    : 0
  const optimizedMargin = Math.max(0, optimizedQuote - operatorCostEstimate)

  return {
    operatorCostEstimate,
    clientQuoteEstimate,
    suggestedQuote,
    optimizedQuote,
    optimizedMargin,
    marginEstimate,
    marginPercent,
    revenuePotential: budgetNumeric,
  }
}
