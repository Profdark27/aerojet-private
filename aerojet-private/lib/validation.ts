import { z } from 'zod'

export const InquirySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().optional(),
  fromCity: z.string().optional(),
  toCity: z.string().optional(),
  flightDate: z.string().optional(),
  pax: z.number().int().min(1).max(50).optional(),
  budget: z.string().optional(),
  message: z.string().min(5).max(2000).trim(),
  flightType: z.enum(['oneway', 'roundtrip', 'multistop']).default('oneway'),
})

export const SearchSchema = z.object({
  from: z.string().min(2).max(100).trim(),
  to: z.string().min(2).max(100).trim(),
  fromICAO: z.string().regex(/^[A-Z]{4}$/, 'Invalid ICAO code').optional(),
  toICAO: z.string().regex(/^[A-Z]{4}$/, 'Invalid ICAO code').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pax: z.coerce.number().int().min(1).max(50).default(2),
  category: z.enum(['turboprop','light','midsize','supermid','heavy','ultralong']).optional(),
})

export const CheckoutSchema = z.object({
  aircraft: z.object({
    model: z.string(),
    price: z.number().positive().max(500000),
    category: z.string(),
    operator: z.string(),
    operatorLogo: z.string(),
  }),
  from: z.string().min(2).max(100),
  to: z.string().min(2).max(100),
  date: z.string().optional(),
  pax: z.coerce.number().int().min(1).max(50).optional().default(2),
  customerEmail: z.string().email().optional(),
})

export const AlertSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  fromCity: z.string().optional(),
  toCity: z.string().optional(),
})

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; reset: number }>()

export function rateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.reset) {
    rateLimitStore.set(ip, { count: 1, reset: now + windowMs })
    return true // allowed
  }

  if (entry.count >= limit) return false // blocked

  entry.count++
  return true // allowed
}

export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}
