import Stripe from 'stripe'

// Lazy-initialize Stripe so it doesn't throw at build time
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_00000000000000000000000000000000'
    _stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const DEPOSIT_RATE = 0.30 // 30% deposit
export const COMMISSION_RATE = 0.12 // 12% broker commission

export function calcDeposit(totalPrice: number) {
  return Math.round(totalPrice * DEPOSIT_RATE)
}

export function calcCommission(totalPrice: number) {
  return Math.round(totalPrice * COMMISSION_RATE)
}
