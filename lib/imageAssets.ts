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
  'VistaJet':           '/images/operator-vistajet.jpg',
  'NetJets':            '/images/operator-netjets.jpg',
  'Air Charter Service':'/images/operator-air-charter.jpg',
  'Wheels Up':          '/images/operator-wheels-up.jpg',
  'Luxaviation':        '/images/operator-luxaviation.jpg',
  'TAG Aviation':       '/images/operator-tag-aviation.jpg',
}

export const HERO_BG      = '/images/hero-bg.jpg'
export const HERO_INTERIOR = '/images/hero-interior.jpg'
