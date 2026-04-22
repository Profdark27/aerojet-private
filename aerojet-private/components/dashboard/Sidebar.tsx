'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '◈' },
  { href: '/dashboard/requests', label: 'Richieste', icon: '✉' },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: '◧' },
  { href: '/dashboard/quotes', label: 'Preventivi', icon: '◆' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '▲' },
  { href: '/dashboard/operators', label: 'Operatori', icon: '✦' },
]

export default function DashboardSidebar() {
  const path = usePathname()

  return (
    <aside style={{ width: 240, background: '#050810', borderRight: '1px solid rgba(201,168,76,0.12)', minHeight: '100vh', flexShrink: 0, display: 'flex', flexDirection: 'column', paddingTop: 80 }}>

      {/* Logo */}
      <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(201,168,76,0.1)', marginBottom: 8 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ color: '#C9A84C' }}>✦</span>
          <span style={{ fontSize: 14, letterSpacing: 4, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}>AEROJET</span>
        </Link>
        <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 4, paddingLeft: 22 }}>BROKER AREA</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px 12px', flex: 1 }}>
        {navItems.map(item => {
          const active = path === item.href
          return (
            <Link key={item.href} href={item.href}
              className={active ? 'nav-item-active' : ''}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', textDecoration: 'none', color: active ? '#C9A84C' : 'rgba(240,237,230,0.5)', fontSize: 14, fontFamily: 'Helvetica Neue, sans-serif', fontWeight: 300, transition: 'all 0.2s', marginBottom: 2, letterSpacing: 1 }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#F0EDE6' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,230,0.5)' }}>
              <span style={{ fontSize: 16, color: active ? '#C9A84C' : 'rgba(240,237,230,0.3)', width: 18 }}>{item.icon}</span>
              {item.label}
              {item.label === 'Richieste' && (
                <span style={{ marginLeft: 'auto', background: '#C9A84C', color: '#0A0C14', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>3</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '20px 28px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.3)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 4 }}>Broker Account</div>
        <div style={{ fontSize: 14, color: 'rgba(240,237,230,0.7)', fontFamily: 'Helvetica Neue, sans-serif' }}>Corrado · Aerojet</div>
        <Link href="/" style={{ fontSize: 11, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', textDecoration: 'none', display: 'block', marginTop: 12, letterSpacing: 1 }}>
          ← Torna al sito
        </Link>
      </div>
    </aside>
  )
}
