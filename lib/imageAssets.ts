/**
 * AEROJET PRIVATE — Image Asset Registry
 *
 * Naming convention for /public/images/:
 *
 *   HERO
 *   hero-bg.jpg               — Homepage background (1920×1080, dark runway/sky)
 *   hero-interior.jpg         — Jet interior for secondary sections (1200×800)
 *
 *   FLEET  (one per category, landscape, jet in flight or on tarmac)
 *   fleet-turboprop.jpg       — PC-12 or King Air 350
 *   fleet-light.jpg           — Phenom 300 or CJ4
 *   fleet-midsize.jpg         — Challenger 350 or Citation XLS
 *   fleet-supermid.jpg        — Citation Latitude or Falcon 2000
 *   fleet-heavy.jpg           — Falcon 7X or Global 6000
 *   fleet-ultralong.jpg       — Global 7500 or G700
 *
 *   ROUTES  (destination aerial/landmark, landscape)
 *   route-milano.jpg
 *   route-roma.jpg
 *   route-londra.jpg
 *   route-dubai.jpg
 *   route-new-york.jpg
 *   route-venezia.jpg
 *   route-ginevra.jpg
 *   route-nizza.jpg
 *   route-mosca.jpg
 *   route-ibiza.jpg
 *
 *   OPERATORS  (logo on white or brand background, square 1:1)
 *   operator-vistajet.jpg
 *   operator-netjets.jpg
 *   operator-air-charter.jpg
 *   operator-wheels-up.jpg
 *   operator-luxaviation.jpg
 *   operator-tag-aviation.jpg
 *
 * Recommended specs:
 *   - Format: JPEG (source), next/image handles AVIF/WebP conversion
 *   - Hero: 1920×1080px, <300KB after compression
 *   - Fleet/Route: 800×500px, <150KB
 *   - Operator logo: 256×256px, <40KB
 *   - All: sRGB, no embedded ICC profile required (stripped by next/image)
 */

export const FLEET_IMAGES: Record<string, string> = {
  turboprop: '/images/fleet-turboprop.jpg',
  light:     '/images/fleet-light.jpg',
  midsize:   '/images/fleet-midsize.jpg',
  supermid:  '/images/fleet-supermid.jpg',
  heavy:     '/images/fleet-heavy.jpg',
  ultralong: '/images/fleet-ultralong.jpg',
}

export const FLEET_ALT: Record<string, string> = {
  turboprop: 'Turboprop Pilatus PC-12 su pista privata',
  light:     'Light Jet Phenom 300 in fase di crociera',
  midsize:   'Midsize Jet Challenger 350 in volo',
  supermid:  'Super Midsize Citation Latitude — cabina premium',
  heavy:     'Heavy Jet Falcon 7X — intercontinentale',
  ultralong: 'Ultra-Long Range Gulfstream G700 in decollo',
}

export const ROUTE_IMAGES: Record<string, string> = {
  'Milano':   '/images/route-milano.jpg',
  'Roma':     '/images/route-roma.jpg',
  'Londra':   '/images/route-londra.jpg',
  'Dubai':    '/images/route-dubai.jpg',
  'New York': '/images/route-new-york.jpg',
  'Venezia':  '/images/route-venezia.jpg',
  'Ginevra':  '/images/route-ginevra.jpg',
  'Nizza':    '/images/route-nizza.jpg',
  'Mosca':    '/images/route-mosca.jpg',
  'Ibiza':    '/images/route-ibiza.jpg',
}

export const OPERATOR_IMAGES: Record<string, string> = {
  'VistaJet':           '/images/operator-vistajet.svg',
  'NetJets':            '/images/operator-netjets.svg',
  'Air Charter Service':'/images/operator-air-charter.svg',
  'Wheels Up':          '/images/operator-wheels-up.svg',
  'Luxaviation':        '/images/operator-luxaviation.svg',
  'TAG Aviation':       '/images/operator-tag-aviation.svg',
}

export const HERO_BG         = '/images/hero-premium-bg.png'
export const HERO_JET_3D     = '/images/3d-jet-element.png'
export const HERO_INTERIOR   = '/images/hero-interior.jpg'
export const BG_SUNSET_CLOUDS = '/images/bg-sunset-clouds.png'
export const BG_ENGINE_GOLD   = '/images/bg-engine-gold.png'
export const BG_TERMINAL_NIGHT = '/images/bg-terminal-night.png'

export const JET_IMAGES: Record<string, string> = {
  'phenom 300': '/images/jet-phenom-300.webp',
  'citation xls': '/images/jet-citation-xls.webp',
  'challenger 350': '/images/jet-challenger-350.webp',
  'falcon 2000': '/images/jet-falcon-2000.webp',
  'falcon 7x': '/images/jet-falcon-7x.webp',
  'global 6000': '/images/jet-global-6000.webp',
  'g650': '/images/jet-gulfstream-g650.webp',
  'g700': '/images/jet-gulfstream-g700.webp',
}

export const CABIN_IMAGES = {
  wide: '/images/cabin-wide.webp',
  night: '/images/cabin-night.webp',
  dining: '/images/cabin-dining.webp',
  lounge: '/images/cabin-lounge.webp',
}

export const SERVICE_IMAGES = {
  catering: '/images/service-catering.webp',
  champagne: '/images/service-champagne.webp',
  meal: '/images/service-meal.webp',
  attendant: '/images/service-flight-attendant.webp',
}

export const TRANSFER_IMAGES = {
  blackCar: '/images/transfer-black-car.webp',
  driver: '/images/transfer-driver.webp',
  terminal: '/images/terminal-private.webp',
  boarding: '/images/boarding-luxury.webp',
}

export function getSpecificJetImage(model: string): string | null {
  if (!model) return null;
  const m = model.toLowerCase();
  for (const [key, path] of Object.entries(JET_IMAGES)) {
    if (m.includes(key)) return path;
  }
  return null;
}
