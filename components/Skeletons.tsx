'use client'

function Pulse({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.1) 50%, rgba(201,168,76,0.04) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.8s infinite',
      borderRadius: 2,
      ...style,
    }} />
  )
}

export function AircraftCardSkeleton() {
  return (
    <div style={{ background: '#0A0C14', padding: '28px 32px', borderLeft: '3px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <Pulse style={{ width: 52, height: 52, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Pulse style={{ height: 20, width: '60%' }} />
        <Pulse style={{ height: 14, width: '40%' }} />
      </div>
      <Pulse style={{ width: 60, height: 20 }} />
      <Pulse style={{ width: 80, height: 20 }} />
      <div style={{ textAlign: 'right', minWidth: 140 }}>
        <Pulse style={{ height: 28, width: 120, marginLeft: 'auto', marginBottom: 6 }} />
        <Pulse style={{ height: 12, width: 80, marginLeft: 'auto' }} />
      </div>
      <Pulse style={{ width: 100, height: 44, flexShrink: 0 }} />
    </div>
  )
}

export function EmptyLegSkeleton() {
  return (
    <div style={{ background: '#0F1220', padding: 28, position: 'relative' }}>
      <Pulse style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 22 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Pulse style={{ height: 20, width: '70%', marginBottom: 6 }} />
          <Pulse style={{ height: 12, width: '40%' }} />
        </div>
        <Pulse style={{ width: 14, height: 14, borderRadius: '50%' }} />
        <div style={{ textAlign: 'right', flex: 1 }}>
          <Pulse style={{ height: 20, width: '70%', marginLeft: 'auto', marginBottom: 6 }} />
          <Pulse style={{ height: 12, width: '40%', marginLeft: 'auto' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[1, 2, 3].map(i => <Pulse key={i} style={{ height: 14, width: 80 }} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Pulse style={{ height: 14, width: 80, marginBottom: 6 }} />
          <Pulse style={{ height: 28, width: 100 }} />
        </div>
        <Pulse style={{ width: 88, height: 38 }} />
      </div>
    </div>
  )
}

export function KPICardSkeleton() {
  return (
    <div style={{ background: '#0A0C14', padding: '28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pulse style={{ width: 28, height: 28 }} />
        <Pulse style={{ width: 48, height: 22 }} />
      </div>
      <Pulse style={{ height: 36, width: '60%', marginBottom: 8 }} />
      <Pulse style={{ height: 12, width: '80%' }} />
    </div>
  )
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.05)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '16px 20px' }}>
          <Pulse style={{ height: 16, width: i === 0 ? 60 : i === 1 ? 120 : 80 }} />
        </td>
      ))}
    </tr>
  )
}

export function OperatorCardSkeleton() {
  return (
    <div style={{ background: '#050810', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
      <Pulse style={{ width: 56, height: 56, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Pulse style={{ height: 20, width: '40%' }} />
        <Pulse style={{ height: 12, width: '25%' }} />
        <Pulse style={{ height: 12, width: '60%' }} />
      </div>
      <Pulse style={{ width: 48, height: 20 }} />
    </div>
  )
}
