'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', icon: '⌂', label: 'Home' },
  { href: '/search', icon: '✦', label: 'Cerca' },
  { href: '/#emptylegs', icon: '◆', label: 'Empty Legs' },
  { href: '/dashboard', icon: '◈', label: 'Dashboard' },
]

export default function MobileBottomNav() {
  const path = usePathname()

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150,
      background: 'rgba(10,12,20,0.97)', borderTop: '1px solid rgba(201,168,76,0.2)',
      backdropFilter: 'blur(20px)', display: 'flex', height: 64, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => {
        const active = path === tab.href
        return (
          <Link key={tab.href} href={tab.href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none', color: active ? '#C9A84C' : 'rgba(240,237,230,0.35)', transition: 'color 0.2s' }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: 2, fontFamily: 'Helvetica Neue, sans-serif' }}>{tab.label.toUpperCase()}</span>
          </Link>
        )
      })}
    </nav>
  )
}
