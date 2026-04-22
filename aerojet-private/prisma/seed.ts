/**
 * Seed script — popola il database con dati iniziali
 * Esegui con: npx ts-node prisma/seed.ts
 * oppure: npx prisma db seed
 */

// Per usare questo seed, aggiungi a package.json:
// "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }

const operators = [
  {
    name: 'VistaJet',
    logo: 'VJ',
    website: 'https://www.vistajet.com',
    fleet: '120+ aircraft',
    routes: 'Global',
    rating: 4.9,
    color: '#C41E3A',
    certifications: 'EASA,FAA,CAAC',
    specialty: 'Ultra-long range & heavy jets',
    active: true,
  },
  {
    name: 'NetJets',
    logo: 'NJ',
    website: 'https://www.netjets.com',
    fleet: '750+ aircraft',
    routes: 'USA & Europe',
    rating: 4.8,
    color: '#1A1A2E',
    certifications: 'FAA Part 135,EASA',
    specialty: 'Fractional ownership programs',
    active: true,
  },
  {
    name: 'Air Charter Service',
    logo: 'AC',
    website: 'https://www.aircharterservice.com',
    fleet: '50,000+ partner jets',
    routes: 'Worldwide',
    rating: 4.7,
    color: '#0D3B66',
    certifications: 'IATA,ICAO',
    specialty: 'Group charters & cargo',
    active: true,
  },
  {
    name: 'Wheels Up',
    logo: 'WU',
    website: 'https://www.wheelsup.com',
    fleet: '300+ aircraft',
    routes: 'North America',
    rating: 4.6,
    color: '#003087',
    certifications: 'FAA Part 135',
    specialty: 'Membership & on-demand',
    active: true,
  },
  {
    name: 'Luxaviation',
    logo: 'LX',
    website: 'https://www.luxaviation.com',
    fleet: '260+ aircraft',
    routes: 'Europe & ME',
    rating: 4.8,
    color: '#2C3E50',
    certifications: 'EASA Part-OPS',
    specialty: 'VIP & VVIP configurations',
    active: true,
  },
  {
    name: 'TAG Aviation',
    logo: 'TG',
    website: 'https://www.tagaviation.com',
    fleet: '80+ aircraft',
    routes: 'Europe & Asia',
    rating: 4.7,
    color: '#1B4332',
    certifications: 'EASA,CAD Hong Kong',
    specialty: 'Business jets & helicopters',
    active: true,
  },
]

async function seed() {
  try {
    // Dynamic import per evitare errori se Prisma non è configurato
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    console.log('🌱 Seeding database...')

    for (const op of operators) {
      await prisma.operator.upsert({
        where: { name: op.name } as { name: string },
        update: op,
        create: op,
      })
      console.log(`  ✓ ${op.name}`)
    }

    console.log('\n✅ Seed completato!')
    console.log(`   ${operators.length} operatori inseriti`)

    await prisma.$disconnect()
  } catch (e) {
    console.error('❌ Seed fallito:', e)
    console.log('\nAssicurati di aver eseguito:')
    console.log('  npx prisma generate')
    console.log('  npx prisma db push')
    process.exit(1)
  }
}

seed()
