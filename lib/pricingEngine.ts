export interface PricingInput {
  baseCostPerHour: number;
  flightHours: number;
  leadTier?: string;
  leadScore?: number;
}

export interface PricingOutput {
  suggestedPrice: number;
  margin: number;
  confidence: number;
}

export function calculateSuggestedPrice({
  baseCostPerHour,
  flightHours,
  leadTier = 'LOW',
  leadScore = 50,
}: PricingInput): PricingOutput {
  const baseCost = baseCostPerHour * flightHours;

  const scoreFactor = Math.max(0, Math.min(100, leadScore)) / 100;

  // Markup based on tier
  let minMarkup = 0.10;
  let maxMarkup = 0.12;

  if (leadTier === 'VIP') {
    minMarkup = 0.20;
    maxMarkup = 0.25;
  } else if (leadTier === 'HIGH') {
    minMarkup = 0.15;
    maxMarkup = 0.18;
  } else if (leadTier === 'MEDIUM') {
    minMarkup = 0.12;
    maxMarkup = 0.15;
  }

  // Interpolate markup
  const markupPercent = minMarkup + (maxMarkup - minMarkup) * scoreFactor;

  // Buffer 3-5% based on inverse of lead score (lower score = higher risk = more buffer)
  const bufferPercent = 0.03 + (0.02 * (1 - scoreFactor));

  const markupAmount = baseCost * markupPercent;
  const bufferAmount = baseCost * bufferPercent;

  let margin = markupAmount + bufferAmount;

  if (margin < 1500) {
    margin = 1500;
  }

  return {
    suggestedPrice: Math.round(baseCost + margin),
    margin: Math.round(margin),
    confidence: Math.round(scoreFactor * 100),
  };
}
