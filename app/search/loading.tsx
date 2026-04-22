import { AircraftCardSkeleton } from '@/components/Skeletons'

export default function SearchLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>
      {/* Header skeleton */}
      <div style={{ background: '#0F1220', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ height: 28, width: 120, background: 'rgba(201,168,76,0.08)', borderRadius: 2 }} />
          <div style={{ height: 24, width: 24, background: 'rgba(201,168,76,0.06)', borderRadius: '50%' }} />
          <div style={{ height: 28, width: 120, background: 'rgba(201,168,76,0.08)', borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(201,168,76,0.1)' }}>
          {Array.from({ length: 4 }).map((_, i) => <AircraftCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
