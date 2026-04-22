import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function calcCommission(price: number, rate = 0.12): number {
  return Math.round(price * rate)
}

export const FLEET_CATEGORIES = [
  { value: 'turboprop', label: 'Turboprop', icon: '✦', range: 'fino a 1,500 km', pax: '6–9 pax', priceHint: 'da €2,500/h' },
  { value: 'light', label: 'Light Jet', icon: '◆', range: 'fino a 3,000 km', pax: '4–8 pax', priceHint: 'da €3,800/h' },
  { value: 'midsize', label: 'Midsize Jet', icon: '▲', range: 'fino a 5,500 km', pax: '7–9 pax', priceHint: 'da €5,500/h' },
  { value: 'supermid', label: 'Super Midsize', icon: '★', range: 'fino a 7,000 km', pax: '8–10 pax', priceHint: 'da €7,000/h' },
  { value: 'heavy', label: 'Heavy Jet', icon: '⬟', range: 'fino a 10,000 km', pax: '10–16 pax', priceHint: 'da €9,500/h' },
  { value: 'ultralong', label: 'Ultra-Long Range', icon: '♦', range: 'oltre 13,000 km', pax: '12–19 pax', priceHint: 'da €14,000/h' },
]

export const POPULAR_ROUTES = [
  { from: 'Milano', to: 'Londra', fromICAO: 'LIML', toICAO: 'EGLL', time: '2h 10m', category: 'Light Jet', price: '€8,500' },
  { from: 'Roma', to: 'Dubai', fromICAO: 'LIRF', toICAO: 'OMDB', time: '5h 45m', category: 'Heavy Jet', price: '€42,000' },
  { from: 'Ginevra', to: 'Nizza', fromICAO: 'LSZH', toICAO: 'LFMN', time: '45m', category: 'Turboprop', price: '€4,200' },
  { from: 'Milano', to: 'New York', fromICAO: 'LIML', toICAO: 'KJFK', time: '9h 30m', category: 'Ultra-Long', price: '€95,000' },
  { from: 'Venezia', to: 'Ibiza', fromICAO: 'LIPZ', toICAO: 'LEIB', time: '2h 30m', category: 'Midsize', price: '€18,000' },
  { from: 'Roma', to: 'Mosca', fromICAO: 'LIRF', toICAO: 'UUDD', time: '3h 45m', category: 'Super Mid', price: '€28,000' },
]
