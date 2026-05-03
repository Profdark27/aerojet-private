'use client'
import ImageWithFallback from '@/components/ImageWithFallback'

const IMAGES = [
  { src: '/images/cabin-lounge.webp', alt: 'Interni Cabina', label: 'COMFORT ASSOLUTO' },
  { src: '/images/service-catering.webp', alt: 'Catering Premium', label: 'CATERING STELLATO' },
  { src: '/images/service-champagne.webp', alt: 'Champagne', label: 'WINE & CHAMPAGNE' },
  { src: '/images/boarding-luxury.webp', alt: 'Imbarco Veloce', label: 'VIP BOARDING' },
]

export default function GalleryGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
      {IMAGES.map((img, i) => (
        <div
          key={i}
          className="group"
          style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#0A0C14' }}
          onMouseEnter={e => {
            const image = e.currentTarget.querySelector('img')
            if (image) image.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={e => {
            const image = e.currentTarget.querySelector('img')
            if (image) image.style.transform = 'scale(1)'
          }}
        >
          <ImageWithFallback
            src={img.src}
            alt={img.alt}
            fill
            sizes="(max-width: 640px) 50vw, 320px"
            objectFit="cover"
            fallback={<div style={{ width: '100%', height: '100%', background: 'rgba(201,168,76,0.04)' }} />}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,12,20,0.9) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 9, letterSpacing: 2, color: '#F0EDE6', fontFamily: 'Helvetica Neue, sans-serif', pointerEvents: 'none' }}>
            {img.label}
          </div>
        </div>
      ))}
    </div>
  )
}
