'use client'

import ImageWithFallback from '@/components/ImageWithFallback'

export default function PremiumExperienceSection() {
  const experiences = [
    {
      img: '/images/cabin-lounge.webp',
      title: 'COMFORT SENZA COMPROMESSI',
      desc: 'Cabine configurate per massimizzare lo spazio e il relax. Materiali pregiati e design ergonomico.'
    },
    {
      img: '/images/service-catering.webp',
      title: 'CATERING STELLATO',
      desc: 'Menu personalizzati preparati dai migliori chef. Un\'esperienza culinaria d\'alta quota.'
    },
    {
      img: '/images/transfer-black-car.webp',
      title: 'TRANSFER DEDICATO',
      desc: 'Dal vostro domicilio fin sotto bordo, con autisti professionisti e veicoli di lusso.'
    }
  ]

  return (
    <section style={{ background: '#0A0C14', padding: '120px 24px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>
            ESCLUSIVITÀ AEROJET
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 300, color: '#F0EDE6', margin: '0 0 24px', letterSpacing: 1 }}>
            Tutto il comfort di un jet privato
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {experiences.map((exp, i) => (
            <div key={i} className="group">
              <div 
                style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', marginBottom: 24, borderRadius: 2 }}
                onMouseEnter={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <ImageWithFallback
                  src={exp.img}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  objectFit="cover"
                  fallback={<div style={{ width: '100%', height: '100%', background: 'rgba(201,168,76,0.05)' }} />}
                />
              </div>
              <h3 style={{ fontSize: 14, letterSpacing: 2, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 12 }}>
                {exp.title}
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.6)', lineHeight: 1.6, fontFamily: 'Helvetica Neue, sans-serif', margin: 0 }}>
                {exp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
