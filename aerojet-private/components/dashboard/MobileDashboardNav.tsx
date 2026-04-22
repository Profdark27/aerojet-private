'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const tabs = [
  { href: '/dashboard', icon: '◈', label: 'Home' },
  { href: '/dashboard/requests', icon: '✉', label: 'Richieste' },
  { href: '/dashboard/quotes', icon: '◆', label: 'Preventivi' },
  { href: '/dashboard/analytics', icon: '▲', label: 'Analytics' },
]

export default function MobileDashboardNav() {
  const path = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-only" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,12,20,0.97)', borderBottom: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(16px)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ color: '#C9A84C', fontSize: 14 }}>✦</span>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4, color: '#F0EDE6', fontFamily: 'Cormorant Garamond, serif' }}>AEROJET</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {session?.user && (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0A0C14' }}>
              {session.user.name?.[0] || session.user.email?.[0] || '?'}
            </div>
          )}
          <button onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', padding: 4, fontSize: 18 }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(5,8,16,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          {[...tabs, { href: '/dashboard/operators', icon: '✦', label: 'Operatori' }, { href: '/profile', icon: '◉', label: 'Profilo' }].map(t => (
            <Link key={t.href} href={t.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: path === t.href ? '#C9A84C' : 'rgba(240,237,230,0.7)', fontSize: 24, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>
              <span style={{ color: '#C9A84C', fontSize: 18, width: 24, textAlign: 'center' }}>{t.icon}</span>
              {t.label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(240,237,230,0.4)', padding: '10px 28px', fontSize: 12, letterSpacing: 2, cursor: 'pointer', fontFamily: 'Helvetica Neue, sans-serif', marginTop: 16 }}>
            ESCI
          </button>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="mobile-only" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,12,20,0.97)', borderTop: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(16px)', display: 'flex', height: 60, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map(t => {
          const active = path === t.href
          return (
            <Link key={t.href} href={t.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', color: active ? '#C9A84C' : 'rgba(240,237,230,0.3)', transition: 'color 0.2s' }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span style={{ fontSize: 8, letterSpacing: 1, fontFamily: 'Helvetica Neue, sans-serif' }}>{t.label.toUpperCase()}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
