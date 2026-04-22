import { KPICardSkeleton, TableRowSkeleton } from '@/components/Skeletons'

export default function DashboardLoading() {
  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ height: 14, width: 120, background: 'rgba(201,168,76,0.08)', marginBottom: 12 }} />
      <div style={{ height: 36, width: 280, background: 'rgba(201,168,76,0.06)', marginBottom: 40 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.1)', marginBottom: 40 }}>
        {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', padding: 32, marginBottom: 40 }}>
        <div style={{ height: 240, background: 'rgba(201,168,76,0.04)' }} />
      </div>
      <div style={{ background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(201,168,76,0.1)', height: 48 }} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}</tbody>
        </table>
      </div>
    </div>
  )
}
