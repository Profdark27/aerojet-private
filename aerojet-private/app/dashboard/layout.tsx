import DashboardSidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MobileDashboardNav from '@/components/dashboard/MobileDashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0C14' }}>
      {/* Desktop sidebar */}
      <div className="desktop-only" style={{ display: 'flex' }}>
        <DashboardSidebar />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="desktop-only"><DashboardHeader /></div>
        <MobileDashboardNav />
        <main style={{ flex: 1, overflow: 'auto', marginTop: 64 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
